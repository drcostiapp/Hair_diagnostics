import SwiftUI

struct ContentView: View {
    @EnvironmentObject var healthKitManager: HealthKitManager

    var body: some View {
        TabView {
            DashboardView()
                .tabItem {
                    Label("Dashboard", systemImage: "chart.bar.fill")
                }

            HairLogView()
                .tabItem {
                    Label("Log", systemImage: "plus.circle.fill")
                }

            HealthSyncView()
                .tabItem {
                    Label("Health", systemImage: "heart.fill")
                }

            HistoryView()
                .tabItem {
                    Label("History", systemImage: "clock.fill")
                }
        }
        .tint(.purple)
    }
}
