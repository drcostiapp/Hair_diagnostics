import Foundation

@MainActor
class HistoryViewModel: ObservableObject {
    @Published var conversations: [Conversation] = []
    @Published var isLoading = false
    @Published var error: String?

    private let api = APIClient.shared

    func loadConversations() async {
        isLoading = true
        error = nil

        do {
            let response: ApiResponse<ConversationListResponse.ConversationListData> =
                try await api.get(path: "/api/conversations?page=1&pageSize=20")

            if let data = response.data {
                conversations = data.conversations
            }
        } catch {
            self.error = error.localizedDescription
        }

        isLoading = false
    }

    func loadConversation(id: String) async -> Conversation? {
        do {
            let response: ApiResponse<Conversation> =
                try await api.get(path: "/api/conversations/\(id)")
            return response.data
        } catch {
            self.error = error.localizedDescription
            return nil
        }
    }
}
