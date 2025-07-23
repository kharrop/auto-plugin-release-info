import { Auto, IPlugin } from "@auto-it/core";

/**
 * Auto plugin that posts a PR comment with version information when a release is created
 */
export default class ReleaseInfo implements IPlugin {
  /** The name of the plugin */
  name = "release-info";

  /** Comment context */
  private context: string;

  /** Optional notes for different release contexts */
  private notes: {
    canary?: string;
    next?: string;
    latest?: string;
    default?: string;
  };

  constructor(
    options: {
      context?: string;
      notes?: {
        canary?: string;
        next?: string;
        latest?: string;
        default?: string;
      };
    } = {},
  ) {
    this.context = options.context || "Release Info";
    this.notes = options.notes || {};
  }

  /**
   * Get the appropriate message based on the release context
   * @param version The version string
   * @param releaseContext The Auto release context (canary, next, latest, etc.)
   * @returns Formatted markdown message for comments
   */
  private getVersionMessage(version: string, releaseContext: string): string {
    const currentDate = new Date().toUTCString();
    let versionMessage = `### ${this.context}\n\n`;

    // Customize message based on release context
    switch (releaseContext) {
      case "canary":
        versionMessage += `Your PR was successfully deployed on \`${currentDate}\` with this canary version:\n\n`;
        break;
      case "next":
        versionMessage += `A new pre-release (next) version was published on \`${currentDate}\`:\n\n`;
        break;
      case "latest":
        versionMessage += `A new stable version was released on \`${currentDate}\`:\n\n`;
        break;
      default:
        versionMessage += `A new version was released on \`${currentDate}\`:\n\n`;
        break;
    }

    versionMessage += "```\n";
    versionMessage += `${version}\n`;
    versionMessage += "```";

    // Add the context-specific note if provided
    const note =
      this.notes[releaseContext as keyof typeof this.notes] ||
      this.notes.default;
    if (note) {
      versionMessage += "\n\n";
      versionMessage += note;
    }

    return versionMessage;
  }

  /** Apply the plugin to the Auto instance */
  apply(auto: Auto) {
    // Handle all releases through afterShipIt hook
    auto.hooks.afterShipIt.tap(this.name, async (release) => {
      const { newVersion, context: releaseContext } = release;

      if (!newVersion) {
        auto.logger.verbose.info(
          "No release version produced, skipping comment",
        );
        return;
      }

      auto.logger.verbose.info(
        `Processing ${releaseContext} release with version ${newVersion}`,
      );

      // Get the appropriate message for this release context
      const message = this.getVersionMessage(newVersion, releaseContext);

      try {
        // Check if we're in a PR context by checking if the comment function is available
        if (!auto.comment) {
          auto.logger.verbose.info(
            "Comment function not available, skipping comment posting",
          );
          return;
        }

        // Post a comment since we're in a PR context
        await auto.comment({
          message,
          context: this.context,
        });
        auto.logger.verbose.info("Successfully posted version comment");
      } catch (error) {
        auto.logger.verbose.info(
          "Could not post comment - likely not in a PR context",
        );
        if (error instanceof Error) {
          auto.logger.verbose.info(error.message);
        } else {
          auto.logger.verbose.info(String(error));
        }
      }
    });
  }
}
