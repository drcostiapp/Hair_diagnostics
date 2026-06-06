import Foundation

struct Product: Codable, Identifiable {
    let id: String
    let name: String
    let brand: String
    let category: String
    let description: String
    var price: Double?
    var currency: String?
    var url: String?
    var ingredients: [String]?
    var suitableFor: [String]?
}

struct Booking: Codable, Identifiable {
    let id: String
    var treatmentId: String?
    let status: String
    let scheduledAt: String
    let location: String
    var notes: String?
    var createdAt: String?
}

struct ApiResponse<T: Codable>: Codable {
    let success: Bool
    let data: T?
    let error: ApiError?
}

struct ApiError: Codable {
    let code: String
    let message: String
}
