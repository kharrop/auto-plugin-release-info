import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import ReleaseInfo from "../";
import Auto from "@auto-it/core";

describe("ReleaseInfoCanaryComment", () => {
  let auto: Auto;
  let plugin: ReleaseInfo;
  // Store original environment variables
  const originalEnv = { ...process.env };

  beforeEach(() => {
    auto = new Auto({} as any);
    auto.hooks = {
      afterShipIt: {
        tap: vi.fn(),
      },
    } as any;
    auto.logger = {
      verbose: {
        info: vi.fn(),
      },
      log: vi.fn(),
    } as any;
    auto.comment = vi.fn().mockResolvedValue(undefined);

    plugin = new ReleaseInfo();
    plugin.apply(auto);
  });

  afterEach(() => {
    // Restore environment variables after each test
    process.env = { ...originalEnv };
    vi.resetAllMocks();
  });

  it("should tap into the afterShipIt hook", () => {
    expect(auto.hooks.afterShipIt.tap).toHaveBeenCalledWith(
      "release-info",
      expect.any(Function),
    );
  });

  it("should post a comment with version information when a canary build is released", async () => {
    // Get the callback that was registered with the afterShipIt hook
    const tapCallback = (auto.hooks.afterShipIt.tap as any).mock.calls[0][1];

    // Call the callback with a release object containing version and context
    await tapCallback({ newVersion: "1.0.0-canary.abc123", context: "canary" });

    // Verify the comment was posted with the correct information
    expect(auto.comment).toHaveBeenCalledWith({
      message: expect.stringContaining("1.0.0-canary.abc123"),
      context: "Release Info",
    });
  });

  it("should not post a comment when no version is provided", async () => {
    // Get the callback that was registered with the afterShipIt hook
    const tapCallback = (auto.hooks.afterShipIt.tap as any).mock.calls[0][1];

    // Call the callback with a release object with no version
    await tapCallback({ newVersion: undefined, context: "canary" });

    // Verify no comment was posted
    expect(auto.comment).not.toHaveBeenCalled();
    expect(auto.logger.verbose.info).toHaveBeenCalledWith(
      "No release version produced, skipping comment",
    );
  });

  it("should handle errors when posting comments", async () => {
    // Create an error to be thrown
    const testError = new Error("Comment failed");

    // Mock the comment method to reject with an error
    auto.comment = vi.fn().mockRejectedValue(testError);

    // Get the callback that was registered with the afterShipIt hook
    const tapCallback = (auto.hooks.afterShipIt.tap as any).mock.calls[0][1];

    // Call the callback with a release object containing version and context
    await tapCallback({ newVersion: "1.0.0-canary.abc123", context: "canary" });

    // Verify the error was logged
    expect(auto.logger.verbose.info).toHaveBeenCalledWith(
      "Could not post comment - likely not in a PR context",
    );
  });

  it("should use custom context and note when provided", async () => {
    // Create plugin with custom context and note
    const customContext = "Release Info";
    const customNote = "Please test this build thoroughly.";
    const customPlugin = new ReleaseInfo({
      context: customContext,
      notes: {
        canary: customNote,
      },
    });
    customPlugin.apply(auto);

    // Get the callback that was registered with the afterShipIt hook
    const tapCallback = (auto.hooks.afterShipIt.tap as any).mock.calls[1][1];

    // Call the callback with a release object containing version and context
    await tapCallback({ newVersion: "1.0.0-canary.abc123", context: "canary" });

    // Verify the comment was posted with both custom context and note
    expect(auto.comment).toHaveBeenCalledWith({
      message: expect.stringContaining(customNote),
      context: customContext,
    });
  });

  it("should format messages differently based on release context", async () => {
    // Get the callback that was registered with the afterShipIt hook
    const tapCallback = (auto.hooks.afterShipIt.tap as any).mock.calls[0][1];

    // Test canary release
    await tapCallback({ newVersion: "1.0.0-canary.abc123", context: "canary" });
    expect(auto.comment).toHaveBeenLastCalledWith({
      message: expect.stringContaining("Your PR was successfully deployed"),
      context: "Release Info",
    });

    // Test next release
    await tapCallback({ newVersion: "1.0.0-next.1", context: "next" });
    expect(auto.comment).toHaveBeenLastCalledWith({
      message: expect.stringContaining(
        "A new pre-release (next) version was published",
      ),
      context: "Release Info",
    });

    // Test latest release
    await tapCallback({ newVersion: "1.0.0", context: "latest" });
    expect(auto.comment).toHaveBeenLastCalledWith({
      message: expect.stringContaining("A new stable version was released"),
      context: "Release Info",
    });

    // Test default case
    await tapCallback({ newVersion: "1.0.0-beta.1", context: "beta" });
    expect(auto.comment).toHaveBeenLastCalledWith({
      message: expect.stringContaining("A new version was released"),
      context: "Release Info",
    });
  });

  it("should not fail the build when there is no PR context", async () => {
    // Mock the comment method to throw an error to simulate no PR context
    const noPrError = new Error("No PR found");
    auto.comment = vi.fn().mockRejectedValue(noPrError);

    // Get the callback that was registered with the afterShipIt hook
    const tapCallback = (auto.hooks.afterShipIt.tap as any).mock.calls[0][1];

    // Call the callback with a release object for a non-canary release (typically no PR)
    const result = await tapCallback({
      newVersion: "1.0.0",
      context: "latest",
    });

    // Verify the build didn't fail (function completed without throwing)
    expect(result).toBeUndefined();

    // Verify the error was logged appropriately
    expect(auto.logger.verbose.info).toHaveBeenCalledWith(
      "Could not post comment - likely not in a PR context",
    );

    // Verify no other errors were logged that would indicate build failure
    expect(auto.logger.log).not.toHaveBeenCalledWith(
      expect.stringMatching(/^Failed/),
      expect.any(Error),
    );
  });
});
