import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import CanaryVersion from "../canary-version";
import Auto from "@auto-it/core";

describe("CanaryVersion", () => {
  let auto: Auto;
  let plugin: CanaryVersion;
  // Store original environment variables
  const originalEnv = { ...process.env };

  beforeEach(() => {
    auto = new Auto({} as any);
    auto.hooks = {
      afterRelease: {
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

    plugin = new CanaryVersion();
    plugin.apply(auto);
  });

  afterEach(() => {
    // Restore environment variables after each test
    process.env = { ...originalEnv };
    vi.resetAllMocks();
  });

  it("should tap into the afterRelease hook", () => {
    expect(auto.hooks.afterRelease.tap).toHaveBeenCalledWith(
      "auto-plugin-canary-version",
      expect.any(Function),
    );
  });

  it("should post a comment with version information when a canary build is released", async () => {
    // Get the callback that was registered with the afterRelease hook
    const tapCallback = (auto.hooks.afterRelease.tap as any).mock.calls[0][1];

    // Call the callback with a version
    await tapCallback("1.0.0-canary.abc123");

    // Verify the comment was posted with the correct information
    expect(auto.comment).toHaveBeenCalledWith({
      message: expect.stringContaining("1.0.0-canary.abc123"),
      context: "Build Info",
    });
  });

  it("should not post a comment when no version is provided", async () => {
    // Get the callback that was registered with the afterRelease hook
    const tapCallback = (auto.hooks.afterRelease.tap as any).mock.calls[0][1];

    // Call the callback with no version
    await tapCallback(undefined);

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

    // Get the callback that was registered with the afterRelease hook
    const tapCallback = (auto.hooks.afterRelease.tap as any).mock.calls[0][1];

    // Call the callback with a version and use flushPromises to ensure all promises are resolved
    await tapCallback("1.0.0-canary.abc123");

    // Use vi.waitFor to wait for the asynchronous error handling to complete
    await vi.waitFor(() => {
      expect(auto.logger.log).toHaveBeenCalledWith("Failed to post comment");
      expect(auto.logger.log).toHaveBeenCalledWith(testError);
    });
  });

  it("should use custom context and note when provided", async () => {
    // Create plugin with custom context and note
    const customContext = "Release Info";
    const customNote = "Please test this build thoroughly.";
    const customPlugin = new CanaryVersion({
      context: customContext,
      note: customNote,
    });
    customPlugin.apply(auto);

    // Get the callback that was registered with the afterRelease hook
    const tapCallback = (auto.hooks.afterRelease.tap as any).mock.calls[1][1];

    // Call the callback with a version
    await tapCallback("1.0.0-canary.abc123");

    // Verify the comment was posted with both custom context and note
    expect(auto.comment).toHaveBeenCalledWith({
      message: expect.stringContaining(customNote),
      context: customContext,
    });
  });
});
