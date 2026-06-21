import React, { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { ChatMessage, RootStackParamList } from '../types';
import { theme, radius, spacing } from '../constants/theme';
import { useUserStore } from '../store/useUserStore';
import {
  joinEvent,
  leaveEvent,
  onNewMessage,
  sendMessage,
} from '../api/socket';

type Props = NativeStackScreenProps<RootStackParamList, 'Chat'>;

export function ChatScreen({ route, navigation }: Props) {
  const { eventId, chatId, peerName } = route.params;
  const myId = useUserStore((s) => s.user?.id);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const listRef = useRef<FlatList<ChatMessage>>(null);

  useEffect(() => {
    navigation.setOptions({ title: peerName ?? 'Chat' });
  }, [navigation, peerName]);

  useEffect(() => {
    // Chat is event-scoped and time-bound to the event room.
    joinEvent(eventId);
    const unsub = onNewMessage((msg) => {
      // Only keep messages for this chat thread.
      if (msg.chat_id && chatId && msg.chat_id !== chatId) return;
      setMessages((prev) => [...prev, msg]);
    });
    return () => {
      unsub();
      leaveEvent(eventId);
    };
  }, [eventId, chatId]);

  const onSend = () => {
    const text = draft.trim();
    if (!text) return;
    // Optimistically render the outgoing message.
    const optimistic: ChatMessage = {
      id: `local-${Date.now()}`,
      chat_id: chatId,
      event_id: eventId,
      sender_id: myId,
      text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    sendMessage({ eventId, chatId, text });
    setDraft('');
  };

  const renderItem = ({ item }: { item: ChatMessage }) => {
    const mine = !!myId && item.sender_id === myId;
    return (
      <View style={[styles.bubbleRow, mine ? styles.rowMine : styles.rowTheirs]}>
        <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
          <Text style={styles.bubbleText}>{item.text}</Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(m, i) => m.id ?? `${i}`}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        ListEmptyComponent={
          <Text style={styles.empty}>
            Say hi before the night begins — this chat lives with the event.
          </Text>
        }
      />

      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder="Message"
          placeholderTextColor={theme.subtext}
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={onSend}
          returnKeyType="send"
        />
        <Pressable
          onPress={onSend}
          style={({ pressed }) => [styles.send, pressed && styles.sendPressed]}
        >
          <Text style={styles.sendText}>Send</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
  },
  list: {
    padding: spacing.lg,
    flexGrow: 1,
  },
  empty: {
    color: theme.subtext,
    textAlign: 'center',
    marginTop: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
  bubbleRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  rowMine: {
    justifyContent: 'flex-end',
  },
  rowTheirs: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '78%',
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  bubbleMine: {
    backgroundColor: theme.accent,
    borderBottomRightRadius: radius.sm,
  },
  bubbleTheirs: {
    backgroundColor: theme.card,
    borderBottomLeftRadius: radius.sm,
  },
  bubbleText: {
    color: theme.text,
    fontSize: 15,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    backgroundColor: theme.bg,
  },
  input: {
    flex: 1,
    backgroundColor: theme.card,
    borderRadius: radius.pill,
    color: theme.text,
    paddingHorizontal: spacing.lg,
    height: 44,
    marginRight: spacing.sm,
  },
  send: {
    backgroundColor: theme.accent,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendPressed: {
    opacity: 0.85,
  },
  sendText: {
    color: theme.text,
    fontWeight: '800',
  },
});
