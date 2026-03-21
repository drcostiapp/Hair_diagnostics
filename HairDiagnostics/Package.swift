// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "HairDiagnostics",
    platforms: [.iOS(.v17)],
    products: [
        .library(name: "HairDiagnostics", targets: ["HairDiagnostics"])
    ],
    targets: [
        .target(
            name: "HairDiagnostics",
            path: "Sources"
        )
    ]
)
