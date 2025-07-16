import { Auto, IPlugin, SEMVER } from "@auto-it/core";

/**
 * Auto plugin that posts a PR comment with version information when a canary build is released
 */
export default class CanaryVersion implements IPlugin {
  /** The name of the plugin */
  name = "auto-comment-plugin";

  /** Comment context */
  private context: string;

  /** Optional note to include in the comment */
  private note?: string;

  constructor(options: { context?: string; note?: string } = {}) {
    this.context = options.context || "Build Info";
    this.note = options.note;
  }

  /**
   * Format the build info message with version information
   * @param version The canary version string
   * @returns Formatted markdown message
   */
  private formatBuildInfoMessage(version: string): string {
    const currentDate = new Date().toUTCString();

    let buildInfo = "### Build Info\n\n";
    buildInfo += `Your PR was successfully deployed on \`${currentDate}\` with this version:\n\n`;
    buildInfo += "```\n";
    buildInfo += `${version}\n`;
    buildInfo += "```";

    // Add the optional note if provided
    if (this.note) {
      buildInfo += "\n\n";
      buildInfo += this.note;
    }

    return buildInfo;
  }

  /** Apply the plugin to the Auto instance */
  apply(auto: Auto) {
    auto.hooks.canary.tap(this.name, (canaryInput) => {
      // Get the version from the return value of previous plugins
      // or construct it from the canary input
      let version: string;

      // Type guard for objects with newVersion property
      interface WithNewVersion {
        newVersion: string;
      }

      // Check if canaryInput has newVersion property and it's a string
      if (
        typeof canaryInput === "object" &&
        canaryInput !== null &&
        "newVersion" in canaryInput &&
        typeof (canaryInput as WithNewVersion).newVersion === "string"
      ) {
        version = (canaryInput as WithNewVersion).newVersion;
      } else {
        // Otherwise construct it from the bump and identifier
        const { bump, canaryIdentifier } = canaryInput as {
          bump: SEMVER;
          canaryIdentifier: string;
        };
        version = `${bump}--canary.${canaryIdentifier}.0`;
      }

      const prNumber = process.env.PR_NUMBER;

      if (!prNumber) {
        auto.logger.verbose.info(
          "No PR_NUMBER environment variable found, skipping comment",
        );
        return;
      }

      // Post the comment
      auto.logger.verbose.info(
        `Posting comment to PR #${prNumber} with version ${version}`,
      );

      auto
        .comment({
          message: this.formatBuildInfoMessage(version),
          pr: Number(prNumber),
          context: this.context,
        })
        .then(() => {
          // Only log success if the comment was actually posted
          auto.logger.log(
            `Successfully posted version comment to PR #${prNumber}`,
          );
        })
        .catch((error) => {
          auto.logger.log("Failed to post comment");
          auto.logger.log(error);
        });
    });
  }
}
