import Foundation
import HealthKit
import Combine

@MainActor
class HealthKitManager: ObservableObject {
    private let healthStore = HKHealthStore()

    @Published var isAuthorized = false
    @Published var authorizationError: String?
    @Published var recentNutrition: [SupplementType: Double] = [:]
    @Published var hairRecords: [HairHealthRecord] = []
    @Published var supplementEntries: [SupplementEntry] = []

    // HealthKit quantity types for hair-relevant nutrients
    private let nutrientTypes: [SupplementType: HKQuantityTypeIdentifier] = [
        .biotin: .dietaryBiotin,
        .iron: .dietaryIron,
        .zinc: .dietaryZinc,
        .vitaminD: .dietaryVitaminD,
        .vitaminB12: .dietaryVitaminB12,
        .folate: .dietaryFolate
    ]

    var isHealthKitAvailable: Bool {
        HKHealthStore.isHealthDataAvailable()
    }

    // MARK: - Authorization

    func requestAuthorization() async {
        guard isHealthKitAvailable else {
            authorizationError = "HealthKit is not available on this device."
            return
        }

        // Types we want to read from Health app
        var readTypes: Set<HKObjectType> = []
        // Types we want to write to Health app
        var writeTypes: Set<HKSampleType> = []

        for (_, identifier) in nutrientTypes {
            if let quantityType = HKQuantityType.quantityType(forIdentifier: identifier) {
                readTypes.insert(quantityType)
                writeTypes.insert(quantityType)
            }
        }

        // Also read activity and sleep data for correlation
        if let sleepType = HKObjectType.categoryType(forIdentifier: .sleepAnalysis) {
            readTypes.insert(sleepType)
        }
        if let stressType = HKQuantityType.quantityType(forIdentifier: .heartRateVariabilitySDNN) {
            readTypes.insert(stressType)
        }

        do {
            try await healthStore.requestAuthorization(toShare: writeTypes, read: readTypes)
            isAuthorized = true
            await fetchRecentNutrition()
        } catch {
            authorizationError = error.localizedDescription
        }
    }

    // MARK: - Read Nutrition Data from Health App

    func fetchRecentNutrition(days: Int = 30) async {
        let calendar = Calendar.current
        let endDate = Date()
        guard let startDate = calendar.date(byAdding: .day, value: -days, to: endDate) else { return }

        let predicate = HKQuery.predicateForSamples(withStart: startDate, end: endDate)

        for (supplement, identifier) in nutrientTypes {
            guard let quantityType = HKQuantityType.quantityType(forIdentifier: identifier) else { continue }

            let descriptor = HKStatisticsQueryDescriptor(
                predicate: HKSamplePredicate<HKQuantitySample>.sample(
                    type: quantityType,
                    predicate: predicate
                ),
                options: .cumulativeSum
            )

            do {
                let result = try await descriptor.result(for: healthStore)
                let unit = unitForSupplement(supplement)
                if let sum = result?.sumQuantity() {
                    recentNutrition[supplement] = sum.doubleValue(for: unit)
                }
            } catch {
                // Silently skip — user may not have authorized this specific type
            }
        }
    }

    // MARK: - Write Supplement Data to Health App

    func saveSupplement(_ entry: SupplementEntry) async throws {
        guard let identifier = nutrientTypes[entry.supplement],
              let quantityType = HKQuantityType.quantityType(forIdentifier: identifier) else {
            // For supplements without a HealthKit mapping (omega-3, collagen), store locally only
            supplementEntries.append(entry)
            saveLocalData()
            return
        }

        let unit = unitForSupplement(entry.supplement)
        let quantity = HKQuantity(unit: unit, doubleValue: entry.dosageMg)
        let sample = HKQuantitySample(
            type: quantityType,
            quantity: quantity,
            start: entry.date,
            end: entry.date
        )

        try await healthStore.save(sample)
        supplementEntries.append(entry)
        saveLocalData()
    }

    // MARK: - Hair Health Records (Local + HealthKit metadata)

    func saveHairRecord(_ record: HairHealthRecord) {
        hairRecords.append(record)
        hairRecords.sort { $0.date > $1.date }
        saveLocalData()
    }

    func deleteHairRecord(_ record: HairHealthRecord) {
        hairRecords.removeAll { $0.id == record.id }
        saveLocalData()
    }

    // MARK: - Fetch Daily Nutrition Breakdown

    func fetchDailyNutrition(for supplement: SupplementType, days: Int = 7) async -> [(date: Date, value: Double)] {
        guard let identifier = nutrientTypes[supplement],
              let quantityType = HKQuantityType.quantityType(forIdentifier: identifier) else {
            return []
        }

        let calendar = Calendar.current
        let endDate = Date()
        guard let startDate = calendar.date(byAdding: .day, value: -days, to: endDate) else { return [] }

        let predicate = HKQuery.predicateForSamples(withStart: startDate, end: endDate)
        let interval = DateComponents(day: 1)

        let descriptor = HKStatisticsCollectionQueryDescriptor(
            predicate: HKSamplePredicate<HKQuantitySample>.sample(
                type: quantityType,
                predicate: predicate
            ),
            options: .cumulativeSum,
            anchorDate: startDate,
            intervalComponents: interval
        )

        do {
            let collection = try await descriptor.result(for: healthStore)
            let unit = unitForSupplement(supplement)
            var results: [(date: Date, value: Double)] = []

            collection.enumerateStatistics(from: startDate, to: endDate) { statistics, _ in
                let value = statistics.sumQuantity()?.doubleValue(for: unit) ?? 0
                results.append((date: statistics.startDate, value: value))
            }
            return results
        } catch {
            return []
        }
    }

    // MARK: - Helpers

    private func unitForSupplement(_ supplement: SupplementType) -> HKUnit {
        switch supplement {
        case .biotin, .vitaminB12, .folate, .vitaminD:
            return .gramUnit(with: .micro)
        case .iron, .zinc, .omega3:
            return .gramUnit(with: .milli)
        case .collagen:
            return .gram()
        }
    }

    // MARK: - Local Persistence

    private var localDataURL: URL {
        FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
            .appendingPathComponent("hair_diagnostics_data.json")
    }

    private struct LocalData: Codable {
        var hairRecords: [HairHealthRecord]
        var supplementEntries: [SupplementEntry]
    }

    func loadLocalData() {
        guard let data = try? Data(contentsOf: localDataURL),
              let localData = try? JSONDecoder().decode(LocalData.self, from: data) else { return }
        hairRecords = localData.hairRecords
        supplementEntries = localData.supplementEntries
    }

    private func saveLocalData() {
        let localData = LocalData(hairRecords: hairRecords, supplementEntries: supplementEntries)
        guard let data = try? JSONEncoder().encode(localData) else { return }
        try? data.write(to: localDataURL)
    }
}
