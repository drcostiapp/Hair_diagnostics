import SwiftUI

struct HomeView: View {
    @EnvironmentObject var authViewModel: AuthViewModel

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Header
                HStack {
                    VStack(alignment: .leading) {
                        Text("Welcome back,")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                        Text(authViewModel.patient?.firstName ?? "Patient")
                            .font(.title2.bold())
                    }
                    Spacer()
                    Button {
                        Task { await authViewModel.logout() }
                    } label: {
                        Image(systemName: "rectangle.portrait.and.arrow.right")
                    }
                }
                .padding(.horizontal)

                // AR Session card
                NavigationLink(destination: ARSessionView()) {
                    HStack(spacing: 16) {
                        Image(systemName: "arkit")
                            .font(.system(size: 36))
                            .foregroundStyle(.linearGradient(
                                colors: [.blue, .purple],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            ))

                        VStack(alignment: .leading, spacing: 4) {
                            Text("Start AR Consultation")
                                .font(.headline)
                            Text("Speak with Dr. Costi's avatar in augmented reality")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }

                        Spacer()
                        Image(systemName: "chevron.right")
                            .foregroundColor(.secondary)
                    }
                    .padding()
                    .background(Color(.systemBackground))
                    .cornerRadius(16)
                    .shadow(color: .black.opacity(0.08), radius: 8, y: 4)
                }
                .buttonStyle(.plain)
                .padding(.horizontal)

                // Quick actions
                LazyVGrid(columns: [
                    GridItem(.flexible()),
                    GridItem(.flexible())
                ], spacing: 16) {
                    NavigationLink(destination: HistoryView()) {
                        QuickActionCard(
                            icon: "clock.arrow.circlepath",
                            title: "History",
                            color: .green
                        )
                    }

                    NavigationLink(destination: ConversationView(messages: [])) {
                        QuickActionCard(
                            icon: "bubble.left.and.bubble.right",
                            title: "Chat",
                            color: .orange
                        )
                    }
                }
                .padding(.horizontal)
            }
            .padding(.vertical)
        }
        .background(Color(.systemGroupedBackground))
        .navigationTitle("Dr. Costi AR")
        .navigationBarTitleDisplayMode(.inline)
    }
}

struct QuickActionCard: View {
    let icon: String
    let title: String
    let color: Color

    var body: some View {
        VStack(spacing: 12) {
            Image(systemName: icon)
                .font(.system(size: 28))
                .foregroundColor(color)
            Text(title)
                .font(.subheadline.bold())
                .foregroundColor(.primary)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 20)
        .background(Color(.systemBackground))
        .cornerRadius(16)
        .shadow(color: .black.opacity(0.05), radius: 4, y: 2)
    }
}
