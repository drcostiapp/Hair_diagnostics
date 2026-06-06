import Foundation

struct Patient: Codable, Identifiable {
    let id: String
    var email: String?
    var phone: String?
    var firstName: String?
    var lastName: String?
    var dateOfBirth: String?
    var gender: String?
    var language: String?
    var city: String?
    var country: String?
    var clinic: String?

    var fullName: String {
        [firstName, lastName].compactMap { $0 }.joined(separator: " ")
    }
}

struct AuthCredentials: Codable {
    var email: String?
    var phone: String?
    let password: String
}

struct AuthResponse: Codable {
    let success: Bool
    let data: AuthData?

    struct AuthData: Codable {
        let accessToken: String
        let refreshToken: String
        let expiresIn: Int
        let patient: Patient
    }
}
