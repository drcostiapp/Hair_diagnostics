import Foundation

@MainActor
class ARSessionViewModel: ObservableObject {
    @Published var messages: [ConversationMessage] = []
    @Published var isSessionActive = false
    @Published var isProcessing = false
    @Published var error: String?

    let heyGenService = HeyGenService()
    let audioRecorder = AudioRecorder()

    private var conversationId: String?
    private let api = APIClient.shared

    func startSession(language: String = "en") async {
        isSessionActive = true
        messages = []

        await heyGenService.startSession(config: AvatarSessionConfig(
            avatarId: "default",
            voiceId: "default",
            language: language
        ))
    }

    func sendTextMessage(_ text: String) async {
        guard isSessionActive else { return }

        let patientMessage = ConversationMessage(
            id: UUID().uuidString,
            role: "patient",
            content: text,
            contentType: "text",
            timestamp: ISO8601DateFormatter().string(from: Date())
        )
        messages.append(patientMessage)
        isProcessing = true

        await heyGenService.sendMessage(text)
        isProcessing = false
    }

    func toggleRecording() async {
        if audioRecorder.isRecording {
            if let url = audioRecorder.stopRecording() {
                // In full implementation, send audio to HeyGen via data channel
                let _ = url
            }
        } else {
            let granted = await AudioRecorder.requestPermission()
            if granted {
                audioRecorder.startRecording()
            } else {
                error = "Microphone access is required for voice input"
            }
        }
    }

    func endSession() async {
        await heyGenService.endSession()
        isSessionActive = false
        isProcessing = false
    }
}
