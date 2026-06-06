import SwiftUI

struct MedicalDisclaimerView: View {
    @Binding var isPresented: Bool

    private static let acceptedKey = "dr-costi-disclaimer-accepted"

    static var hasAccepted: Bool {
        UserDefaults.standard.bool(forKey: acceptedKey)
    }

    var body: some View {
        ZStack {
            Color.black.opacity(0.6)
                .ignoresSafeArea()

            VStack(spacing: 20) {
                Image(systemName: "info.circle.fill")
                    .font(.system(size: 44))
                    .foregroundColor(.blue)

                Text("Medical Disclaimer")
                    .font(.title2.bold())

                VStack(alignment: .leading, spacing: 12) {
                    Text("This AI-powered avatar provides general medical information for educational purposes only. It is **not a substitute** for professional medical advice, diagnosis, or treatment.")

                    Text("Always consult with Dr. Costi or a qualified healthcare provider before making decisions about your health or aesthetic treatments.")

                    Text("By continuing, you acknowledge that:")
                        .fontWeight(.medium)

                    VStack(alignment: .leading, spacing: 6) {
                        BulletPoint("This is an AI assistant, not a live doctor")
                        BulletPoint("Responses are informational, not medical prescriptions")
                        BulletPoint("You will seek in-person consultation for treatment decisions")
                        BulletPoint("Your conversation data will be stored securely for medical records")
                    }
                }
                .font(.footnote)
                .foregroundColor(.secondary)

                Button {
                    UserDefaults.standard.set(true, forKey: Self.acceptedKey)
                    isPresented = false
                } label: {
                    Text("I Understand & Accept")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.borderedProminent)
                .controlSize(.large)
            }
            .padding(24)
            .background(Color(.systemBackground))
            .cornerRadius(20)
            .shadow(radius: 20)
            .padding(24)
        }
    }
}

struct BulletPoint: View {
    let text: String

    init(_ text: String) {
        self.text = text
    }

    var body: some View {
        HStack(alignment: .top, spacing: 8) {
            Text("•")
            Text(text)
        }
    }
}
