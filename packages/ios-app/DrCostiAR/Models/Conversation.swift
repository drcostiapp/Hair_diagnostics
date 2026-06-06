import Foundation

struct Conversation: Codable, Identifiable {
    let id: String
    var status: String
    var language: String?
    var summary: String?
    var topics: [String]?
    var startedAt: String?
    var endedAt: String?
    var messageCount: Int?
    var messages: [ConversationMessage]?
}

struct ConversationMessage: Codable, Identifiable {
    let id: String
    let role: String
    let content: String
    var contentType: String?
    var timestamp: String?

    var isPatient: Bool { role == "patient" }
}

struct ConversationListResponse: Codable {
    let success: Bool
    let data: ConversationListData?

    struct ConversationListData: Codable {
        let conversations: [Conversation]
        let total: Int
    }
}
