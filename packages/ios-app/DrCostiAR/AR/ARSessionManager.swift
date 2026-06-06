import ARKit

class ARSessionManager: NSObject, ObservableObject {
    @Published var isSessionRunning = false
    @Published var trackingState: ARCamera.TrackingState = .notAvailable

    private var session: ARSession?

    func startSession(_ session: ARSession) {
        self.session = session

        let config = ARWorldTrackingConfiguration()
        config.planeDetection = [.horizontal]
        config.environmentTexturing = .automatic

        if ARWorldTrackingConfiguration.supportsFrameSemantics(.personSegmentationWithDepth) {
            config.frameSemantics.insert(.personSegmentationWithDepth)
        }

        session.run(config, options: [.resetTracking, .removeExistingAnchors])
        isSessionRunning = true
    }

    func pauseSession() {
        session?.pause()
        isSessionRunning = false
    }

    func resetSession() {
        guard let session else { return }
        let config = ARWorldTrackingConfiguration()
        config.planeDetection = [.horizontal]
        session.run(config, options: [.resetTracking, .removeExistingAnchors])
    }

    static var isARSupported: Bool {
        ARWorldTrackingConfiguration.isSupported
    }
}
