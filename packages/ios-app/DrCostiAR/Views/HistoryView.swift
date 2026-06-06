import SwiftUI

struct HistoryView: View {
    @StateObject private var viewModel = HistoryViewModel()

    var body: some View {
        Group {
            if viewModel.isLoading {
                ProgressView("Loading...")
            } else if viewModel.conversations.isEmpty {
                VStack(spacing: 16) {
                    Image(systemName: "clock.arrow.circlepath")
                        .font(.system(size: 48))
                        .foregroundColor(.secondary)
                    Text("No consultations yet")
                        .font(.headline)
                        .foregroundColor(.secondary)
                    Text("Your conversation history will appear here")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
            } else {
                List(viewModel.conversations) { conversation in
                    NavigationLink {
                        ConversationView(messages: conversation.messages ?? [])
                    } label: {
                        VStack(alignment: .leading, spacing: 6) {
                            HStack {
                                Text(conversation.summary ?? "Consultation")
                                    .font(.headline)
                                    .lineLimit(1)
                                Spacer()
                                StatusBadge(status: conversation.status)
                            }

                            HStack {
                                if let date = conversation.startedAt {
                                    Label(formatDate(date), systemImage: "calendar")
                                        .font(.caption)
                                        .foregroundColor(.secondary)
                                }
                                Spacer()
                                if let count = conversation.messageCount {
                                    Label("\(count) messages", systemImage: "bubble.left")
                                        .font(.caption)
                                        .foregroundColor(.secondary)
                                }
                            }
                        }
                        .padding(.vertical, 4)
                    }
                }
            }
        }
        .navigationTitle("History")
        .task {
            await viewModel.loadConversations()
        }
        .refreshable {
            await viewModel.loadConversations()
        }
    }

    private func formatDate(_ iso: String) -> String {
        let formatter = ISO8601DateFormatter()
        guard let date = formatter.date(from: iso) else { return iso }
        let display = DateFormatter()
        display.dateStyle = .medium
        display.timeStyle = .short
        return display.string(from: date)
    }
}

struct StatusBadge: View {
    let status: String

    var color: Color {
        switch status {
        case "active": return .green
        case "completed": return .blue
        default: return .gray
        }
    }

    var body: some View {
        Text(status.capitalized)
            .font(.caption2.bold())
            .padding(.horizontal, 8)
            .padding(.vertical, 3)
            .background(color.opacity(0.15))
            .foregroundColor(color)
            .cornerRadius(8)
    }
}
