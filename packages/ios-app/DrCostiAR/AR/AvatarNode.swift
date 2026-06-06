import SceneKit
import AVFoundation

class AvatarNode: SCNNode {
    private let avatarPlane: SCNPlane
    private var videoPlayer: AVPlayer?

    override init() {
        avatarPlane = SCNPlane(width: 0.5, height: 0.7)
        super.init()
        setup()
    }

    required init?(coder: NSCoder) {
        avatarPlane = SCNPlane(width: 0.5, height: 0.7)
        super.init(coder: coder)
        setup()
    }

    private func setup() {
        avatarPlane.cornerRadius = 0.02

        // Placeholder material until video stream is connected
        let material = SCNMaterial()
        material.diffuse.contents = UIColor.darkGray
        material.isDoubleSided = true
        avatarPlane.materials = [material]

        let planeNode = SCNNode(geometry: avatarPlane)
        // Offset upward so the avatar stands on the surface
        planeNode.position = SCNVector3(0, Float(avatarPlane.height) / 2, 0)
        addChildNode(planeNode)

        // Loading indicator
        let loadingText = SCNText(string: "Connecting...", extrusionDepth: 0)
        loadingText.font = UIFont.systemFont(ofSize: 0.5)
        loadingText.firstMaterial?.diffuse.contents = UIColor.white
        let textNode = SCNNode(geometry: loadingText)
        textNode.scale = SCNVector3(0.05, 0.05, 0.05)
        textNode.position = SCNVector3(-0.12, 0.05, 0.01)
        planeNode.addChildNode(textNode)
    }

    func setVideoStream(player: AVPlayer) {
        self.videoPlayer = player
        let material = SCNMaterial()
        material.diffuse.contents = player
        material.isDoubleSided = true
        avatarPlane.materials = [material]
        player.play()
    }

    func billboardToCamera(pointOfView: SCNNode) {
        let cameraPosition = pointOfView.worldPosition
        let nodePosition = self.worldPosition

        let dx = cameraPosition.x - nodePosition.x
        let dz = cameraPosition.z - nodePosition.z
        let angle = atan2(dx, dz)

        self.eulerAngles.y = angle
    }
}
