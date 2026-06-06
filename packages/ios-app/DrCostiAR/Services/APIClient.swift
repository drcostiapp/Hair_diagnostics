import Foundation
import KeychainAccess

enum APIError: LocalizedError {
    case invalidURL
    case unauthorized
    case serverError(String)
    case decodingError
    case networkError(Error)

    var errorDescription: String? {
        switch self {
        case .invalidURL: return "Invalid URL"
        case .unauthorized: return "Session expired. Please log in again."
        case .serverError(let msg): return msg
        case .decodingError: return "Failed to process server response"
        case .networkError(let err): return err.localizedDescription
        }
    }
}

actor APIClient {
    static let shared = APIClient()

    private let baseURL: String
    private let keychain = Keychain(service: "com.drcosti.ar-avatar")
    private let decoder: JSONDecoder = {
        let d = JSONDecoder()
        d.keyDecodingStrategy = .convertFromSnakeCase
        return d
    }()

    init(baseURL: String = "") {
        self.baseURL = baseURL.isEmpty
            ? (ProcessInfo.processInfo.environment["API_BASE_URL"] ?? "http://localhost:3001")
            : baseURL
    }

    var accessToken: String? {
        get { try? keychain.get("access_token") }
    }

    func setTokens(access: String, refresh: String) {
        try? keychain.set(access, key: "access_token")
        try? keychain.set(refresh, key: "refresh_token")
    }

    func clearTokens() {
        try? keychain.remove("access_token")
        try? keychain.remove("refresh_token")
    }

    func request<T: Codable>(
        _ method: String,
        path: String,
        body: (any Encodable)? = nil
    ) async throws -> ApiResponse<T> {
        guard let url = URL(string: "\(baseURL)\(path)") else {
            throw APIError.invalidURL
        }

        var req = URLRequest(url: url)
        req.httpMethod = method
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.timeoutInterval = 30

        if let token = accessToken {
            req.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        if let body {
            req.httpBody = try JSONEncoder().encode(body)
        }

        let (data, response) = try await URLSession.shared.data(for: req)

        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.networkError(URLError(.badServerResponse))
        }

        if httpResponse.statusCode == 401 {
            let refreshed = try await refreshToken()
            if refreshed {
                return try await request(method, path: path, body: body)
            }
            throw APIError.unauthorized
        }

        do {
            return try decoder.decode(ApiResponse<T>.self, from: data)
        } catch {
            throw APIError.decodingError
        }
    }

    func get<T: Codable>(path: String) async throws -> ApiResponse<T> {
        try await request("GET", path: path)
    }

    func post<T: Codable>(path: String, body: (any Encodable)? = nil) async throws -> ApiResponse<T> {
        try await request("POST", path: path, body: body)
    }

    func patch<T: Codable>(path: String, body: (any Encodable)? = nil) async throws -> ApiResponse<T> {
        try await request("PATCH", path: path, body: body)
    }

    private func refreshToken() async throws -> Bool {
        guard let refreshToken = try? keychain.get("refresh_token") else {
            return false
        }

        struct RefreshBody: Encodable {
            let refreshToken: String
        }

        guard let url = URL(string: "\(baseURL)/api/auth/refresh") else { return false }
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.httpBody = try JSONEncoder().encode(RefreshBody(refreshToken: refreshToken))

        let (data, _) = try await URLSession.shared.data(for: req)

        struct RefreshResponse: Codable {
            let success: Bool
            let data: TokenData?

            struct TokenData: Codable {
                let accessToken: String
                let refreshToken: String
            }
        }

        if let result = try? decoder.decode(RefreshResponse.self, from: data),
           result.success, let tokens = result.data {
            setTokens(access: tokens.accessToken, refresh: tokens.refreshToken)
            return true
        }

        clearTokens()
        return false
    }
}
