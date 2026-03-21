import Foundation

// MARK: - Hair Health Assessment

struct HairHealthRecord: Identifiable, Codable {
    let id: UUID
    let date: Date
    var thickness: HairThickness
    var density: HairDensity
    var scalpCondition: ScalpCondition
    var sheddingLevel: SheddingLevel
    var notes: String
    var photoPath: String?

    init(
        id: UUID = UUID(),
        date: Date = Date(),
        thickness: HairThickness = .medium,
        density: HairDensity = .normal,
        scalpCondition: ScalpCondition = .healthy,
        sheddingLevel: SheddingLevel = .normal,
        notes: String = "",
        photoPath: String? = nil
    ) {
        self.id = id
        self.date = date
        self.thickness = thickness
        self.density = density
        self.scalpCondition = scalpCondition
        self.sheddingLevel = sheddingLevel
        self.notes = notes
        self.photoPath = photoPath
    }
}

enum HairThickness: String, Codable, CaseIterable {
    case fine = "Fine"
    case medium = "Medium"
    case thick = "Thick"

    var score: Double {
        switch self {
        case .fine: return 1.0
        case .medium: return 2.0
        case .thick: return 3.0
        }
    }
}

enum HairDensity: String, Codable, CaseIterable {
    case thin = "Thin"
    case normal = "Normal"
    case dense = "Dense"

    var score: Double {
        switch self {
        case .thin: return 1.0
        case .normal: return 2.0
        case .dense: return 3.0
        }
    }
}

enum ScalpCondition: String, Codable, CaseIterable {
    case dry = "Dry"
    case healthy = "Healthy"
    case oily = "Oily"
    case irritated = "Irritated"
    case flaky = "Flaky"

    var score: Double {
        switch self {
        case .irritated: return 1.0
        case .flaky: return 1.5
        case .dry: return 2.0
        case .oily: return 2.5
        case .healthy: return 3.0
        }
    }
}

enum SheddingLevel: String, Codable, CaseIterable {
    case minimal = "Minimal"
    case normal = "Normal"
    case moderate = "Moderate"
    case heavy = "Heavy"

    var score: Double {
        switch self {
        case .heavy: return 1.0
        case .moderate: return 2.0
        case .normal: return 3.0
        case .minimal: return 4.0
        }
    }
}

// MARK: - Supplement Log

struct SupplementEntry: Identifiable, Codable {
    let id: UUID
    let date: Date
    var supplement: SupplementType
    var dosageMg: Double

    init(id: UUID = UUID(), date: Date = Date(), supplement: SupplementType, dosageMg: Double) {
        self.id = id
        self.date = date
        self.supplement = supplement
        self.dosageMg = dosageMg
    }
}

enum SupplementType: String, Codable, CaseIterable {
    case biotin = "Biotin"
    case iron = "Iron"
    case zinc = "Zinc"
    case vitaminD = "Vitamin D"
    case vitaminB12 = "Vitamin B12"
    case omega3 = "Omega-3"
    case collagen = "Collagen"
    case folate = "Folate"

    var unit: String {
        switch self {
        case .biotin: return "mcg"
        case .omega3: return "mg"
        case .collagen: return "g"
        default: return "mg"
        }
    }

    var recommendedDaily: Double {
        switch self {
        case .biotin: return 30      // mcg
        case .iron: return 18        // mg
        case .zinc: return 11        // mg
        case .vitaminD: return 20    // mcg (800 IU)
        case .vitaminB12: return 2.4 // mcg
        case .omega3: return 250     // mg
        case .collagen: return 10    // g
        case .folate: return 400     // mcg
        }
    }

    var iconName: String {
        switch self {
        case .biotin: return "leaf.fill"
        case .iron: return "bolt.fill"
        case .zinc: return "shield.fill"
        case .vitaminD: return "sun.max.fill"
        case .vitaminB12: return "brain.fill"
        case .omega3: return "drop.fill"
        case .collagen: return "figure.stand"
        case .folate: return "sparkles"
        }
    }
}

// MARK: - Hair Health Score

struct HairHealthScore {
    let overallScore: Double // 0-100
    let thicknessScore: Double
    let densityScore: Double
    let scalpScore: Double
    let sheddingScore: Double
    let date: Date

    static func calculate(from record: HairHealthRecord) -> HairHealthScore {
        let thickness = (record.thickness.score / 3.0) * 100
        let density = (record.density.score / 3.0) * 100
        let scalp = (record.scalpCondition.score / 3.0) * 100
        let shedding = (record.sheddingLevel.score / 4.0) * 100

        let overall = (thickness * 0.25 + density * 0.25 + scalp * 0.25 + shedding * 0.25)

        return HairHealthScore(
            overallScore: overall,
            thicknessScore: thickness,
            densityScore: density,
            scalpScore: scalp,
            sheddingScore: shedding,
            date: record.date
        )
    }

    var grade: String {
        switch overallScore {
        case 80...100: return "Excellent"
        case 60..<80: return "Good"
        case 40..<60: return "Fair"
        default: return "Needs Attention"
        }
    }

    var gradeColor: String {
        switch overallScore {
        case 80...100: return "green"
        case 60..<80: return "blue"
        case 40..<60: return "orange"
        default: return "red"
        }
    }
}
