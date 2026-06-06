import SwiftUI
import ARKit
import SceneKit

struct ARContainerView: UIViewRepresentable {
    @ObservedObject var viewModel: ARSessionViewModel

    func makeUIView(context: Context) -> ARSCNView {
        let sceneView = ARSCNView()
        sceneView.delegate = context.coordinator
        sceneView.session.delegate = context.coordinator
        sceneView.autoenablesDefaultLighting = true
        sceneView.automaticallyUpdatesLighting = true

        let config = ARWorldTrackingConfiguration()
        config.planeDetection = [.horizontal]
        config.environmentTexturing = .automatic
        sceneView.session.run(config)

        let tapGesture = UITapGestureRecognizer(
            target: context.coordinator,
            action: #selector(Coordinator.handleTap(_:))
        )
        sceneView.addGestureRecognizer(tapGesture)

        return sceneView
    }

    func updateUIView(_ uiView: ARSCNView, context: Context) {}

    func makeCoordinator() -> Coordinator {
        Coordinator(viewModel: viewModel)
    }

    class Coordinator: NSObject, ARSCNViewDelegate, ARSessionDelegate {
        let viewModel: ARSessionViewModel
        private var avatarNode: AvatarNode?
        private var planeAnchors: [ARAnchor: SCNNode] = [:]

        init(viewModel: ARSessionViewModel) {
            self.viewModel = viewModel
        }

        @objc func handleTap(_ gestureRecognize: UITapGestureRecognizer) {
            guard let sceneView = gestureRecognize.view as? ARSCNView else { return }

            if avatarNode != nil { return }

            let location = gestureRecognize.location(in: sceneView)
            let results = sceneView.hitTest(location, types: [.existingPlaneUsingExtent])

            if let result = results.first {
                placeAvatar(at: result, in: sceneView)
            }
        }

        private func placeAvatar(at hitResult: ARHitTestResult, in sceneView: ARSCNView) {
            let avatar = AvatarNode()
            let column = hitResult.worldTransform.columns.3
            avatar.position = SCNVector3(column.x, column.y, column.z)

            sceneView.scene.rootNode.addChildNode(avatar)
            self.avatarNode = avatar
        }

        func renderer(_ renderer: SCNSceneRenderer, didAdd node: SCNNode, for anchor: ARAnchor) {
            guard let planeAnchor = anchor as? ARPlaneAnchor else { return }

            let plane = SCNPlane(
                width: CGFloat(planeAnchor.planeExtent.width),
                height: CGFloat(planeAnchor.planeExtent.height)
            )
            plane.firstMaterial?.diffuse.contents = UIColor.blue.withAlphaComponent(0.15)

            let planeNode = SCNNode(geometry: plane)
            planeNode.eulerAngles.x = -.pi / 2
            node.addChildNode(planeNode)
            planeAnchors[anchor] = planeNode
        }

        func renderer(_ renderer: SCNSceneRenderer, didUpdate node: SCNNode, for anchor: ARAnchor) {
            guard let planeAnchor = anchor as? ARPlaneAnchor,
                  let planeNode = planeAnchors[anchor],
                  let plane = planeNode.geometry as? SCNPlane else { return }

            plane.width = CGFloat(planeAnchor.planeExtent.width)
            plane.height = CGFloat(planeAnchor.planeExtent.height)
        }

        func renderer(_ renderer: SCNSceneRenderer, updateAtTime time: TimeInterval) {
            guard let sceneView = renderer as? ARSCNView,
                  let avatarNode else { return }

            // Billboard: make avatar face the camera
            if let pointOfView = sceneView.pointOfView {
                avatarNode.billboardToCamera(pointOfView: pointOfView)
            }
        }
    }
}
