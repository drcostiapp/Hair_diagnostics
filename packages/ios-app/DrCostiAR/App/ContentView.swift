import SwiftUI

struct ContentView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @State private var showDisclaimer = !MedicalDisclaimerView.hasAccepted

    var body: some View {
        ZStack {
            if authViewModel.isAuthenticated {
                NavigationStack {
                    HomeView()
                }
            } else {
                LoginView()
            }

            if showDisclaimer {
                MedicalDisclaimerView(isPresented: $showDisclaimer)
            }
        }
    }
}
