import Foundation
import AVFoundation

struct AvatarSessionConfig {
    let avatarId: String
    let voiceId: String
    let language: String
}

@MainActor
class HeyGenService: ObservableObject {
    @Published var isConnected = false
    @Published var isAvatarSpeaking = false
    @Published var error: String?

    private var sessionId: String?
    private let api = APIClient.shared

    func startSession(config: AvatarSessionConfig) async {
        struct SessionBody: Encodable {
            let avatarId: String
            let voiceId: String
            let language: String
        }

        do {
            struct SessionData: Codable {
                let sessionId: String
                let conversationId: String
            }

            let response: ApiResponse<SessionData> = try await api.post(
                path: "/api/avatar/session",
                body: SessionBody(
                    avatarId: config.avatarId,
                    voiceId: config.voiceId,
                    language: config.language
                )
            )

            guard response.success, let data = response.data else {
                error = response.error?.message ?? "Failed to create session"
                return
            }

            sessionId = data.sessionId
            isConnected = true
            // WebRTC peer connection setup would go here
            // Requires HeyGen streaming API credentials for full implementation
        } catch {
            self.error = error.localizedDescription
        }
    }

    func sendMessage(_ text: String) async {
        guard let sessionId, isConnected else { return }

        struct MessageBody: Encodable {
            let role: String
            let content: String
        }

        do {
            struct EmptyData: Codable {}
            let _: ApiResponse<EmptyData> = try await api.post(
                path: "/api/conversations/\(sessionId)/messages",
                body: MessageBody(role: "patient", content: text)
            )
            isAvatarSpeaking = true
        } catch {
            self.error = error.localizedDescription
        }
    }

    func endSession() async {
        guard let sessionId else { return }

        do {
            struct EmptyData: Codable {}
            let _: ApiResponse<EmptyData> = try await api.post(
                path: "/api/avatar/session/\(sessionId)/end"
            )
        } catch {
            // Best effort
        }

        self.sessionId = nil
        isConnected = false
        isAvatarSpeaking = false
    }
}
