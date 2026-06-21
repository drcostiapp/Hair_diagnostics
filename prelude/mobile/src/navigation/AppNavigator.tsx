import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types';
import { theme } from '../constants/theme';

import { SplashScreen } from '../screens/SplashScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { EventsScreen } from '../screens/EventsScreen';
import { EventDetailScreen } from '../screens/EventDetailScreen';
import { TicketScreen } from '../screens/TicketScreen';
import { SwipeScreen } from '../screens/SwipeScreen';
import { MatchesScreen } from '../screens/MatchesScreen';
import { ChatScreen } from '../screens/ChatScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: theme.bg,
    card: theme.bg,
    text: theme.text,
    border: 'transparent',
    primary: theme.accent,
  },
};

export function AppNavigator() {
  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerStyle: { backgroundColor: theme.bg },
          headerTintColor: theme.text,
          headerTitleStyle: { fontWeight: '800' },
          contentStyle: { backgroundColor: theme.bg },
          headerShadowVisible: false,
        }}
      >
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Events"
          component={EventsScreen}
          options={{ title: 'Prelude', headerShown: false }}
        />
        <Stack.Screen
          name="EventDetail"
          component={EventDetailScreen}
          options={{ title: 'Event' }}
        />
        <Stack.Screen name="Ticket" component={TicketScreen} options={{ title: 'Ticket' }} />
        <Stack.Screen name="Swipe" component={SwipeScreen} options={{ title: 'Discover' }} />
        <Stack.Screen
          name="Matches"
          component={MatchesScreen}
          options={{ title: 'Matches' }}
        />
        <Stack.Screen name="Chat" component={ChatScreen} options={{ title: 'Chat' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
