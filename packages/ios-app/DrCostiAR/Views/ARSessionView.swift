import SwiftUI

struct ARSessionView: View {
    @StateObject private var viewModel = ARSessionViewModel()
    @State private var textInput = ""
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        ZStack {
            // AR Camera view
            ARContainerView(viewModel: viewModel)
                .ignoresSafeArea()

            // UI overlay
            VStack {
                // Top bar
                HStack {
                    Button {
                        Task {
                            await viewModel.endSession()
                            dismiss()
                        }
                    } label: {
                        Image(systemName: "xmark.circle.fill")
                            .font(.title2)
                            .foregroundColor(.white)
                            .shadow(radius: 2)
                    }

                    Spacer()

                    if viewModel.isSessionActive {
                        HStack(spacing: 6) {
                            Circle()
                                .fill(.green)
                                .frame(width: 8, height: 8)
                            Text("Connected")
                                .font(.caption.bold())
                                .foregroundColor(.white)
                        }
                        .padding(.horizontal, 12)
                        .padding(.vertical, 6)
                        .background(.ultraThinMaterial)
                        .cornerRadius(20)
                    }
                }
                .padding()

                Spacer()

                // Bottom controls
                VStack(spacing: 12) {
                    // Audio level indicator
                    if viewModel.audioRecorder.isRecording {
                        HStack(spacing: 4) {
                            ForEach(0..<20, id: \.self) { i in
                                RoundedRectangle(cornerRadius: 2)
                                    .fill(Color.red)
                                    .frame(width: 4, height: CGFloat.random(in: 4...20) * CGFloat(viewModel.audioRecorder.audioLevel + 0.2))
                            }
                        }
                        .frame(height: 24)

                        Text("Recording...")
                            .font(.caption)
                            .foregroundColor(.red)
                    }

                    // Voice button
                    Button {
                        Task { await viewModel.toggleRecording() }
                    } label: {
                        ZStack {
                            Circle()
                                .fill(viewModel.audioRecorder.isRecording
                                      ? Color.red
                                      : Color.blue.gradient)
                                .frame(width: 72, height: 72)
                                .shadow(radius: 4)

                            Image(systemName: viewModel.audioRecorder.isRecording
                                  ? "stop.fill"
                                  : "mic.fill")
                                .font(.title)
                                .foregroundColor(.white)
                        }
                    }
                    .disabled(viewModel.isProcessing)

                    // Text input
                    HStack {
                        TextField("Type a question...", text: $textInput)
                            .textFieldStyle(.roundedBorder)

                        Button {
                            guard !textInput.trimmingCharacters(in: .whitespaces).isEmpty else { return }
                            Task {
                                await viewModel.sendTextMessage(textInput)
                                textInput = ""
                            }
                        } label: {
                            Image(systemName: "arrow.up.circle.fill")
                                .font(.title2)
                                .foregroundColor(.blue)
                        }
                        .disabled(textInput.trimmingCharacters(in: .whitespaces).isEmpty || viewModel.isProcessing)
                    }
                    .padding(.horizontal)
                }
                .padding()
                .background(.ultraThinMaterial)
                .cornerRadius(20, antialiased: true)
            }
        }
        .navigationBarHidden(true)
        .task {
            await viewModel.startSession()
        }
        .alert("Error", isPresented: .init(
            get: { viewModel.error != nil },
            set: { if !$0 { viewModel.error = nil } }
        )) {
            Button("OK") { viewModel.error = nil }
        } message: {
            Text(viewModel.error ?? "")
        }
    }
}
