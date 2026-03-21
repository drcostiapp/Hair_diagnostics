import SwiftUI

struct HairLogView: View {
    @EnvironmentObject var healthKit: HealthKitManager
    @State private var showingHairAssessment = false
    @State private var showingSupplementLog = false

    var body: some View {
        NavigationStack {
            List {
                Section {
                    Button {
                        showingHairAssessment = true
                    } label: {
                        Label("New Hair Assessment", systemImage: "checkmark.circle.fill")
                            .foregroundStyle(.purple)
                    }

                    Button {
                        showingSupplementLog = true
                    } label: {
                        Label("Log Supplement", systemImage: "pills.fill")
                            .foregroundStyle(.green)
                    }
                }

                if !healthKit.supplementEntries.isEmpty {
                    Section("Today's Supplements") {
                        let todayEntries = healthKit.supplementEntries.filter {
                            Calendar.current.isDateInToday($0.date)
                        }

                        if todayEntries.isEmpty {
                            Text("No supplements logged today")
                                .foregroundStyle(.secondary)
                        } else {
                            ForEach(todayEntries) { entry in
                                HStack {
                                    Image(systemName: entry.supplement.iconName)
                                        .foregroundStyle(.green)
                                    Text(entry.supplement.rawValue)
                                    Spacer()
                                    Text("\(String(format: "%.0f", entry.dosageMg)) \(entry.supplement.unit)")
                                        .foregroundStyle(.secondary)
                                }
                            }
                        }
                    }
                }
            }
            .navigationTitle("Log")
            .sheet(isPresented: $showingHairAssessment) {
                HairAssessmentSheet()
            }
            .sheet(isPresented: $showingSupplementLog) {
                SupplementLogSheet()
            }
        }
    }
}

// MARK: - Hair Assessment Sheet

struct HairAssessmentSheet: View {
    @EnvironmentObject var healthKit: HealthKitManager
    @Environment(\.dismiss) var dismiss

    @State private var thickness: HairThickness = .medium
    @State private var density: HairDensity = .normal
    @State private var scalpCondition: ScalpCondition = .healthy
    @State private var sheddingLevel: SheddingLevel = .normal
    @State private var notes = ""

    var body: some View {
        NavigationStack {
            Form {
                Section("Hair Thickness") {
                    Picker("Thickness", selection: $thickness) {
                        ForEach(HairThickness.allCases, id: \.self) { level in
                            Text(level.rawValue).tag(level)
                        }
                    }
                    .pickerStyle(.segmented)
                }

                Section("Hair Density") {
                    Picker("Density", selection: $density) {
                        ForEach(HairDensity.allCases, id: \.self) { level in
                            Text(level.rawValue).tag(level)
                        }
                    }
                    .pickerStyle(.segmented)
                }

                Section("Scalp Condition") {
                    Picker("Condition", selection: $scalpCondition) {
                        ForEach(ScalpCondition.allCases, id: \.self) { condition in
                            Text(condition.rawValue).tag(condition)
                        }
                    }
                }

                Section("Hair Shedding") {
                    Picker("Shedding", selection: $sheddingLevel) {
                        ForEach(SheddingLevel.allCases, id: \.self) { level in
                            Text(level.rawValue).tag(level)
                        }
                    }
                    .pickerStyle(.segmented)
                }

                Section("Notes") {
                    TextField("How does your hair feel today?", text: $notes, axis: .vertical)
                        .lineLimit(3...6)
                }

                // Preview Score
                Section("Preview Score") {
                    let record = HairHealthRecord(
                        thickness: thickness,
                        density: density,
                        scalpCondition: scalpCondition,
                        sheddingLevel: sheddingLevel,
                        notes: notes
                    )
                    let score = HairHealthScore.calculate(from: record)
                    HStack {
                        Text("Hair Health Score")
                        Spacer()
                        Text("\(Int(score.overallScore)) - \(score.grade)")
                            .fontWeight(.semibold)
                            .foregroundStyle(.purple)
                    }
                }
            }
            .navigationTitle("Hair Assessment")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        let record = HairHealthRecord(
                            thickness: thickness,
                            density: density,
                            scalpCondition: scalpCondition,
                            sheddingLevel: sheddingLevel,
                            notes: notes
                        )
                        healthKit.saveHairRecord(record)
                        dismiss()
                    }
                }
            }
        }
    }
}

// MARK: - Supplement Log Sheet

struct SupplementLogSheet: View {
    @EnvironmentObject var healthKit: HealthKitManager
    @Environment(\.dismiss) var dismiss

    @State private var selectedSupplement: SupplementType = .biotin
    @State private var dosage: String = ""
    @State private var isSaving = false
    @State private var errorMessage: String?

    var body: some View {
        NavigationStack {
            Form {
                Section("Supplement") {
                    Picker("Type", selection: $selectedSupplement) {
                        ForEach(SupplementType.allCases, id: \.self) { type in
                            Label(type.rawValue, systemImage: type.iconName).tag(type)
                        }
                    }
                }

                Section("Dosage (\(selectedSupplement.unit))") {
                    TextField("Amount", text: $dosage)
                        .keyboardType(.decimalPad)

                    HStack {
                        Text("Recommended daily")
                            .foregroundStyle(.secondary)
                        Spacer()
                        Text("\(String(format: "%.0f", selectedSupplement.recommendedDaily)) \(selectedSupplement.unit)")
                            .foregroundStyle(.secondary)
                    }
                    .font(.caption)
                }

                if let error = errorMessage {
                    Section {
                        Text(error)
                            .foregroundStyle(.red)
                    }
                }
            }
            .navigationTitle("Log Supplement")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        saveEntry()
                    }
                    .disabled(dosage.isEmpty || isSaving)
                }
            }
        }
    }

    private func saveEntry() {
        guard let dosageValue = Double(dosage), dosageValue > 0 else {
            errorMessage = "Please enter a valid dosage."
            return
        }

        isSaving = true
        let entry = SupplementEntry(supplement: selectedSupplement, dosageMg: dosageValue)

        Task {
            do {
                try await healthKit.saveSupplement(entry)
                dismiss()
            } catch {
                errorMessage = "Failed to save to Health: \(error.localizedDescription)"
                isSaving = false
            }
        }
    }
}
