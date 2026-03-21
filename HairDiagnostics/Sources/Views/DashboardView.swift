import SwiftUI

struct DashboardView: View {
    @EnvironmentObject var healthKit: HealthKitManager

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 20) {
                    // Hair Health Score Card
                    if let latestRecord = healthKit.hairRecords.first {
                        let score = HairHealthScore.calculate(from: latestRecord)
                        ScoreCardView(score: score)
                    } else {
                        EmptyScoreCard()
                    }

                    // Quick Stats
                    LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 16) {
                        StatCard(
                            title: "Records",
                            value: "\(healthKit.hairRecords.count)",
                            icon: "doc.text.fill",
                            color: .purple
                        )
                        StatCard(
                            title: "Supplements",
                            value: "\(healthKit.supplementEntries.count)",
                            icon: "pills.fill",
                            color: .green
                        )
                        StatCard(
                            title: "Streak",
                            value: "\(calculateStreak()) days",
                            icon: "flame.fill",
                            color: .orange
                        )
                        StatCard(
                            title: "Health Sync",
                            value: healthKit.isAuthorized ? "Active" : "Off",
                            icon: "heart.fill",
                            color: healthKit.isAuthorized ? .red : .gray
                        )
                    }
                    .padding(.horizontal)

                    // Recent Nutrition from Health App
                    if !healthKit.recentNutrition.isEmpty {
                        NutritionSummaryView(nutrition: healthKit.recentNutrition)
                    }

                    // Recent Records
                    if !healthKit.hairRecords.isEmpty {
                        RecentRecordsSection(records: Array(healthKit.hairRecords.prefix(3)))
                    }
                }
                .padding(.vertical)
            }
            .navigationTitle("Hair Health")
            .task {
                healthKit.loadLocalData()
                if healthKit.isAuthorized {
                    await healthKit.fetchRecentNutrition()
                }
            }
        }
    }

    private func calculateStreak() -> Int {
        let calendar = Calendar.current
        var streak = 0
        var checkDate = Date()

        for _ in 0..<365 {
            let hasRecord = healthKit.hairRecords.contains { record in
                calendar.isDate(record.date, inSameDayAs: checkDate)
            }
            let hasSupplement = healthKit.supplementEntries.contains { entry in
                calendar.isDate(entry.date, inSameDayAs: checkDate)
            }

            if hasRecord || hasSupplement {
                streak += 1
                checkDate = calendar.date(byAdding: .day, value: -1, to: checkDate) ?? checkDate
            } else {
                break
            }
        }
        return streak
    }
}

// MARK: - Score Card

struct ScoreCardView: View {
    let score: HairHealthScore

    var body: some View {
        VStack(spacing: 12) {
            Text("Hair Health Score")
                .font(.headline)
                .foregroundStyle(.secondary)

            ZStack {
                Circle()
                    .stroke(Color.gray.opacity(0.2), lineWidth: 12)
                    .frame(width: 120, height: 120)

                Circle()
                    .trim(from: 0, to: score.overallScore / 100)
                    .stroke(scoreColor, style: StrokeStyle(lineWidth: 12, lineCap: .round))
                    .frame(width: 120, height: 120)
                    .rotationEffect(.degrees(-90))

                VStack(spacing: 2) {
                    Text("\(Int(score.overallScore))")
                        .font(.system(size: 36, weight: .bold, design: .rounded))
                    Text(score.grade)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }

            HStack(spacing: 20) {
                MiniScore(label: "Thickness", value: score.thicknessScore)
                MiniScore(label: "Density", value: score.densityScore)
                MiniScore(label: "Scalp", value: score.scalpScore)
                MiniScore(label: "Shedding", value: score.sheddingScore)
            }
        }
        .padding()
        .background(.regularMaterial)
        .cornerRadius(16)
        .padding(.horizontal)
    }

    var scoreColor: Color {
        switch score.overallScore {
        case 80...100: return .green
        case 60..<80: return .blue
        case 40..<60: return .orange
        default: return .red
        }
    }
}

struct MiniScore: View {
    let label: String
    let value: Double

    var body: some View {
        VStack(spacing: 4) {
            Text("\(Int(value))")
                .font(.system(.body, design: .rounded, weight: .semibold))
            Text(label)
                .font(.caption2)
                .foregroundStyle(.secondary)
        }
    }
}

struct EmptyScoreCard: View {
    var body: some View {
        VStack(spacing: 12) {
            Image(systemName: "sparkles")
                .font(.largeTitle)
                .foregroundStyle(.purple)
            Text("No Hair Health Data Yet")
                .font(.headline)
            Text("Log your first hair assessment to see your score")
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
        }
        .padding(30)
        .frame(maxWidth: .infinity)
        .background(.regularMaterial)
        .cornerRadius(16)
        .padding(.horizontal)
    }
}

// MARK: - Stat Card

struct StatCard: View {
    let title: String
    let value: String
    let icon: String
    let color: Color

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Image(systemName: icon)
                .font(.title2)
                .foregroundStyle(color)
            Text(value)
                .font(.system(.title2, design: .rounded, weight: .bold))
            Text(title)
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(.regularMaterial)
        .cornerRadius(12)
    }
}

// MARK: - Nutrition Summary

struct NutritionSummaryView: View {
    let nutrition: [SupplementType: Double]

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: "heart.text.square.fill")
                    .foregroundStyle(.red)
                Text("From Health App (30 days)")
                    .font(.headline)
            }

            ForEach(nutrition.sorted(by: { $0.key.rawValue < $1.key.rawValue }), id: \.key) { supplement, value in
                HStack {
                    Image(systemName: supplement.iconName)
                        .foregroundStyle(.purple)
                        .frame(width: 24)
                    Text(supplement.rawValue)
                    Spacer()
                    Text(String(format: "%.1f %@", value, supplement.unit))
                        .foregroundStyle(.secondary)
                }
            }
        }
        .padding()
        .background(.regularMaterial)
        .cornerRadius(16)
        .padding(.horizontal)
    }
}

// MARK: - Recent Records

struct RecentRecordsSection: View {
    let records: [HairHealthRecord]

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Recent Assessments")
                .font(.headline)
                .padding(.horizontal)

            ForEach(records) { record in
                let score = HairHealthScore.calculate(from: record)
                HStack {
                    VStack(alignment: .leading, spacing: 4) {
                        Text(record.date, style: .date)
                            .font(.subheadline.weight(.medium))
                        Text("\(record.thickness.rawValue) | \(record.scalpCondition.rawValue) | \(record.sheddingLevel.rawValue)")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                    Spacer()
                    Text("\(Int(score.overallScore))")
                        .font(.system(.title3, design: .rounded, weight: .bold))
                        .foregroundStyle(.purple)
                }
                .padding()
                .background(.regularMaterial)
                .cornerRadius(12)
                .padding(.horizontal)
            }
        }
    }
}
