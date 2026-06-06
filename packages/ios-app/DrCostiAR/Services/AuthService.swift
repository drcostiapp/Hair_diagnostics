import Foundation

struct AuthService {
    private let api = APIClient.shared

    func login(email: String?, phone: String?, password: String) async throws -> Patient {
        struct LoginBody: Encodable {
            var email: String?
            var phone: String?
            let password: String
        }

        let body = LoginBody(email: email, phone: phone, password: password)
        let response: ApiResponse<AuthResponse.AuthData> = try await api.post(
            path: "/api/auth/login",
            body: body
        )

        guard response.success, let data = response.data else {
            throw APIError.serverError(response.error?.message ?? "Login failed")
        }

        await api.setTokens(access: data.accessToken, refresh: data.refreshToken)
        return data.patient
    }

    func register(
        email: String?,
        phone: String?,
        password: String,
        firstName: String,
        lastName: String
    ) async throws -> Patient {
        struct RegisterBody: Encodable {
            var email: String?
            var phone: String?
            let password: String
            let firstName: String
            let lastName: String
        }

        let body = RegisterBody(
            email: email, phone: phone, password: password,
            firstName: firstName, lastName: lastName
        )
        let response: ApiResponse<AuthResponse.AuthData> = try await api.post(
            path: "/api/auth/register",
            body: body
        )

        guard response.success, let data = response.data else {
            throw APIError.serverError(response.error?.message ?? "Registration failed")
        }

        await api.setTokens(access: data.accessToken, refresh: data.refreshToken)
        return data.patient
    }

    func getProfile() async throws -> Patient {
        let response: ApiResponse<Patient> = try await api.get(path: "/api/patients/me")
        guard response.success, let patient = response.data else {
            throw APIError.serverError(response.error?.message ?? "Failed to load profile")
        }
        return patient
    }

    func logout() async {
        await api.clearTokens()
    }
}
