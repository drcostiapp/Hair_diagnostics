import SwiftUI

struct HealthSyncView: View {
    @EnvironmentObject var healthKit: HealthKitManager
    @State private var isRequesting = false

    var body: some View {
        NavigationStack {
            List {
                // Connection Status
                Section {
                    HStack(spacing: 16) {
                        Image(systemName: "heart.fill")
                            .font(.largeTitle)
                            .foregroundStyle(.red)

                        VStack(alignment: .leading, spacing: 4) {
                            Text("Apple Health")
                                .font(.headline)
                            Text(healthKit.isAuthorized ? "Connected" : "Not connected")
                                .font(.subheadline)
                                .foregroundStyle(healthKit.isAuthorized ? .green : .secondary)
                        }

                        Spacer()

                        if !healthKit.isAuthorized {
                            Button("Connect") {
                                connectHealth()
                            }
                            .buttonStyle(.borderedProminent)
                            .tint(.red)
                            .disabled(isRequesting)
                        } else {
                            Image(systemName: "checkmark.circle.fill")
                                .foregroundStyle(.green)
                                .font(.title2)
                        }
                    }
                    .padding(.vertical, 8)
                }

                if let error = healthKit.authorizationError {
                    Section {
                        Label(error, systemImage: "exclamationmark.triangle.fill")
                            .foregroundStyle(.orange)
                    }
                }

                // What We Read
                Section("Data We Read from Health") {
                    HealthDataRow(icon: "leaf.fill", title: "Biotin", subtitle: "Dietary biotin intake")
                    HealthDataRow(icon: "bolt.fill", title: "Iron", subtitle: "Dietary iron intake")
                    HealthDataRow(icon: "shield.fill", title: "Zinc", subtitle: "Dietary zinc intake")
                    HealthDataRow(icon: "sun.max.fill", title: "Vitamin D", subtitle: "Dietary vitamin D")
                    HealthDataRow(icon: "brain.fill", title: "Vitamin B12", subtitle: "Dietary B12 intake")
                    HealthDataRow(icon: "sparkles", title: "Folate", subtitle: "Dietary folate intake")
                    HealthDataRow(icon: "moon.fill", title: "Sleep", subtitle: "Sleep analysis data")
                    HealthDataRow(icon: "waveform.path.ecg", title: "HRV", subtitle: "Stress indicator")
                }

                // What We Write
                Section("Data We Write to Health") {
                    HealthDataRow(icon: "pills.fill", title: "Supplement Logs", subtitle: "Your supplement intake records")
                }

                // Privacy
                Section {
                    VStack(alignment: .leading, spacing: 8) {
                        Label("Your Privacy", systemImage: "lock.shield.fill")
                            .font(.headline)
                        Text("Hair Diagnostics only accesses the health data types listed above. Your data stays on your device and is never uploaded to external servers. You can revoke access at any time in Settings > Health > Hair Diagnostics.")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                    .padding(.vertical, 4)
                }

                // Manage
                if healthKit.isAuthorized {
                    Section("Manage") {
                        Button {
                            Task { await healthKit.fetchRecentNutrition() }
                        } label: {
                            Label("Refresh Health Data", systemImage: "arrow.clockwise")
                        }

                        Link(destination: URL(string: "x-apple-health://")!) {
                            Label("Open Health App", systemImage: "heart.text.square")
                        }
                    }
                }
            }
            .navigationTitle("Health Integration")
        }
    }

    private func connectHealth() {
        isRequesting = true
        Task {
            await healthKit.requestAuthorization()
            isRequesting = false
        }
    }
}

struct HealthDataRow: View {
    let icon: String
    let title: String
    let subtitle: String

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .foregroundStyle(.purple)
                .frame(width: 24)
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.subheadline)
                Text(subtitle)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
        }
    }
}
