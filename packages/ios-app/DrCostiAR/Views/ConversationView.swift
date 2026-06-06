import SwiftUI

struct ConversationView: View {
    let messages: [ConversationMessage]

    var body: some View {
        ScrollView {
            LazyVStack(spacing: 12) {
                if messages.isEmpty {
                    VStack(spacing: 16) {
                        Image(systemName: "bubble.left.and.bubble.right")
                            .font(.system(size: 48))
                            .foregroundColor(.secondary)
                        Text("No messages yet")
                            .font(.headline)
                            .foregroundColor(.secondary)
                        Text("Start an AR session to talk with Dr. Costi")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                    .padding(.top, 60)
                } else {
                    ForEach(messages) { message in
                        MessageBubble(message: message)
                    }
                }
            }
            .padding()
        }
        .navigationTitle("Conversation")
        .navigationBarTitleDisplayMode(.inline)
    }
}

struct MessageBubble: View {
    let message: ConversationMessage

    var body: some View {
        HStack {
            if message.isPatient { Spacer() }

            VStack(alignment: message.isPatient ? .trailing : .leading, spacing: 4) {
                Text(message.content)
                    .padding(.horizontal, 14)
                    .padding(.vertical, 10)
                    .background(message.isPatient
                                ? Color.blue
                                : Color(.systemGray5))
                    .foregroundColor(message.isPatient ? .white : .primary)
                    .cornerRadius(18)

                if let timestamp = message.timestamp {
                    Text(formatTimestamp(timestamp))
                        .font(.caption2)
                        .foregroundColor(.secondary)
                }
            }
            .frame(maxWidth: 280, alignment: message.isPatient ? .trailing : .leading)

            if !message.isPatient { Spacer() }
        }
    }

    private func formatTimestamp(_ iso: String) -> String {
        let formatter = ISO8601DateFormatter()
        guard let date = formatter.date(from: iso) else { return "" }
        let display = DateFormatter()
        display.timeStyle = .short
        return display.string(from: date)
    }
}
