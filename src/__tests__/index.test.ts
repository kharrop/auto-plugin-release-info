import { describe, it, expect, vi, beforeEach } from "vitest";
import CanaryCommentPlugin from "../index";
import Auto from "@auto-it/core";

describe("CanaryCommentPlugin", () => {
  let auto: Auto;
  let plugin: CanaryCommentPlugin;
  let tapCallback: (version?: string) => Promise<void>;

  beforeEach(() => {
    // Create a new Auto instance with mocked methods
    auto = {
      logger: {
        verbose: {
          info: vi.fn(),
        },
        log: vi.fn(),
      },
      hooks: {
        canary: {
          tap: vi.fn((name, callback) => {
            // Store the callback for testing
            tapCallback = callback;
          }),
        },
      },
      comment: vi.fn().mockResolvedValue(undefined),
    } as unknown as Auto;

    plugin = new CanaryCommentPlugin();
    plugin.apply(auto);
  });

  it("should tap into the canary hook", () => {
    expect(auto.hooks.canary.tap).toHaveBeenCalledWith(
      "canary-comment-plugin",
      expect.any(Function),
    );
  });

  it("should post a comment with version information when a canary build is released", async () => {
    // Store the original env var
    const originalPrNumber = process.env.PR_NUMBER;

    // Set up test environment
    process.env.PR_NUMBER = "123";

    // Call the callback with a version
    await tapCallback("1.0.0-canary.abc123");

    // Verify the comment was posted with the correct information
    expect(auto.comment).toHaveBeenCalledWith({
      message: expect.stringContaining("1.0.0-canary.abc123"),
      pr: 123,
      context: "Build Info",
    });

    // Restore the original env var
    process.env.PR_NUMBER = originalPrNumber;
  });

  it("should not post a comment when no version is provided", async () => {
    // Call the callback with no version
    await tapCallback(undefined);

    // Verify no comment was posted
    expect(auto.comment).not.toHaveBeenCalled();
    expect(auto.logger.verbose.info).toHaveBeenCalledWith(
      "No canary version produced, skipping comment",
    );
  });

  it("should not post a comment when PR_NUMBER is not set", async () => {
    // Store the original env var
    const originalPrNumber = process.env.PR_NUMBER;

    // Remove PR_NUMBER from environment
    delete process.env.PR_NUMBER;

    // Call the callback with a version
    await tapCallback("1.0.0-canary.abc123");

    // Verify no comment was posted
    expect(auto.comment).not.toHaveBeenCalled();
    expect(auto.logger.verbose.info).toHaveBeenCalledWith(
      "No PR_NUMBER environment variable found, skipping comment",
    );

    // Restore the original env var
    process.env.PR_NUMBER = originalPrNumber;
  });

  it("should handle errors when posting comments", async () => {
    // Store the original env var
    const originalPrNumber = process.env.PR_NUMBER;

    // Set up test environment
    process.env.PR_NUMBER = "123";

    // Mock the comment method to throw an error
    auto.comment = vi.fn().mockRejectedValue(new Error("Comment failed"));

    // Call the callback with a version
    await tapCallback("1.0.0-canary.abc123");

    // Verify error was logged
    expect(auto.logger.log).toHaveBeenCalledWith("Failed to post comment");

    // Restore the original env var
    process.env.PR_NUMBER = originalPrNumber;
  });
});
