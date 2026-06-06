import Foundation

struct Treatment: Codable, Identifiable {
    let id: String
    let name: String
    let category: String
    let description: String
    var duration: String?
    var recovery: String?
    var priceRange: String?
    var suitableFor: [String]?
    var risks: [String]?
    var aftercare: [String]?
}

struct FAQ: Codable, Identifiable {
    let id: String
    let question: String
    let answer: String
    let category: String
    var tags: [String]?
}
