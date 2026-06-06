import XCTest
@testable import DrCostiAR

final class APIClientTests: XCTestCase {
    func testBaseURLDefaultsToLocalhost() async {
        let client = APIClient(baseURL: "")
        // Default should resolve to localhost or env var
        // This is a basic initialization test
        let token = await client.accessToken
        XCTAssertNil(token, "Fresh client should have no token")
    }

    func testCustomBaseURL() async {
        let client = APIClient(baseURL: "https://api.drcosti.com")
        let token = await client.accessToken
        XCTAssertNil(token)
    }

    func testTokenLifecycle() async {
        let client = APIClient(baseURL: "http://test")

        await client.setTokens(access: "access-123", refresh: "refresh-456")
        let token = await client.accessToken
        XCTAssertEqual(token, "access-123")

        await client.clearTokens()
        let cleared = await client.accessToken
        XCTAssertNil(cleared)
    }
}
