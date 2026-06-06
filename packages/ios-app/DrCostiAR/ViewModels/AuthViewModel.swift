import Foundation

@MainActor
class AuthViewModel: ObservableObject {
    @Published var isAuthenticated = false
    @Published var patient: Patient?
    @Published var isLoading = false
    @Published var error: String?

    private let authService = AuthService()

    init() {
        Task {
            if let _ = await APIClient.shared.accessToken {
                await loadProfile()
            }
        }
    }

    func login(email: String?, phone: String?, password: String) async {
        isLoading = true
        error = nil

        do {
            let patient = try await authService.login(email: email, phone: phone, password: password)
            self.patient = patient
            self.isAuthenticated = true
        } catch {
            self.error = error.localizedDescription
        }

        isLoading = false
    }

    func register(
        email: String?,
        phone: String?,
        password: String,
        firstName: String,
        lastName: String
    ) async {
        isLoading = true
        error = nil

        do {
            let patient = try await authService.register(
                email: email, phone: phone, password: password,
                firstName: firstName, lastName: lastName
            )
            self.patient = patient
            self.isAuthenticated = true
        } catch {
            self.error = error.localizedDescription
        }

        isLoading = false
    }

    func logout() async {
        await authService.logout()
        patient = nil
        isAuthenticated = false
    }

    func loadProfile() async {
        do {
            patient = try await authService.getProfile()
            isAuthenticated = true
        } catch {
            await logout()
        }
    }
}
