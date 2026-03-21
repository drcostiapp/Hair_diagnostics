import SwiftUI

struct HistoryView: View {
    @EnvironmentObject var healthKit: HealthKitManager
    @State private var selectedTab = 0

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                Picker("View", selection: $selectedTab) {
                    Text("Assessments").tag(0)
                    Text("Supplements").tag(1)
                }
                .pickerStyle(.segmented)
                .padding()

                if selectedTab == 0 {
                    assessmentsList
                } else {
                    supplementsList
                }
            }
            .navigationTitle("History")
        }
    }

    private var assessmentsList: some View {
        Group {
            if healthKit.hairRecords.isEmpty {
                ContentUnavailableView(
                    "No Assessments",
                    systemImage: "doc.text",
                    description: Text("Your hair health assessments will appear here.")
                )
            } else {
                List {
                    ForEach(healthKit.hairRecords) { record in
                        let score = HairHealthScore.calculate(from: record)
                        VStack(alignment: .leading, spacing: 8) {
                            HStack {
                                Text(record.date, style: .date)
                                    .font(.headline)
                                Spacer()
                                Text("\(Int(score.overallScore))")
                                    .font(.system(.title2, design: .rounded, weight: .bold))
                                    .foregroundStyle(.purple)
                            }

                            HStack(spacing: 16) {
                                Label(record.thickness.rawValue, systemImage: "line.3.horizontal")
                                Label(record.density.rawValue, systemImage: "square.grid.3x3.fill")
                                Label(record.scalpCondition.rawValue, systemImage: "head.profile.arrow.forward.and.visionpro")
                            }
                            .font(.caption)
                            .foregroundStyle(.secondary)

                            if !record.notes.isEmpty {
                                Text(record.notes)
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                                    .lineLimit(2)
                            }
                        }
                        .padding(.vertical, 4)
                    }
                    .onDelete { indexSet in
                        for index in indexSet {
                            healthKit.deleteHairRecord(healthKit.hairRecords[index])
                        }
                    }
                }
            }
        }
    }

    private var supplementsList: some View {
        Group {
            if healthKit.supplementEntries.isEmpty {
                ContentUnavailableView(
                    "No Supplements",
                    systemImage: "pills",
                    description: Text("Your supplement logs will appear here.")
                )
            } else {
                let grouped = Dictionary(grouping: healthKit.supplementEntries) { entry in
                    Calendar.current.startOfDay(for: entry.date)
                }

                List {
                    ForEach(grouped.keys.sorted(by: >), id: \.self) { date in
                        Section(date, format: .dateTime.month().day().year()) {
                            ForEach(grouped[date] ?? []) { entry in
                                HStack {
                                    Image(systemName: entry.supplement.iconName)
                                        .foregroundStyle(.green)
                                        .frame(width: 24)
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
        }
    }
}
