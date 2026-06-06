// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "DrCostiAR",
    platforms: [
        .iOS(.v17)
    ],
    dependencies: [
        .package(url: "https://github.com/nicklama/webrtc-spm", from: "125.0.0"),
        .package(url: "https://github.com/kishikawakatsumi/KeychainAccess", from: "4.2.2")
    ],
    targets: [
        .executableTarget(
            name: "DrCostiAR",
            dependencies: [
                .product(name: "WebRTC", package: "webrtc-spm"),
                "KeychainAccess"
            ],
            path: "DrCostiAR"
        ),
        .testTarget(
            name: "DrCostiARTests",
            dependencies: ["DrCostiAR"],
            path: "DrCostiARTests"
        )
    ]
)
