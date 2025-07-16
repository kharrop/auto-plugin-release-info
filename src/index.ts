import { Auto, IPlugin } from "@auto-it/core";

/**
 * Auto plugin that posts a PR comment with version information when a canary build is released
 */
export default class CanaryCommentPlugin implements IPlugin {
  /** The name of the plugin */
  name = "canary-comment-plugin";

  /** Apply the plugin to the Auto instance */
  apply(auto: Auto) {
    auto.hooks.canary.tap(this.name, (version) => {
      if (!version) {
        auto.logger.verbose.info(
          "No canary version produced, skipping comment",
        );
        return;
      }

      try {
        const prNumber = process.env.PR_NUMBER;

        if (!prNumber) {
          auto.logger.verbose.info(
            "No PR_NUMBER environment variable found, skipping comment",
          );
          return;
        }

        // Format the current date in UTC
        const currentDate = new Date().toUTCString();

        // Create the comment message
        let buildInfo = "### Build Info\n\n";
        buildInfo += `Your PR was successfully deployed on \`${currentDate}\` with this version:\n\n`;
        buildInfo += "```\n";
        buildInfo += `${version}\n`;
        buildInfo += "```";

        // Post the comment
        auto.logger.verbose.info(`Posting comment to PR #${prNumber}`);
        auto
          .comment({
            message: buildInfo,
            pr: Number(prNumber),
            context: "Build Info",
          })
          .catch((error) => {
            auto.logger.log("Failed to post comment");
            auto.logger.log(error);
          });

        auto.logger.log(
          `Successfully posted version comment to PR #${prNumber}`,
        );
      } catch (error) {
        auto.logger.log("Failed to post version comment");
        auto.logger.log(error);
      }
    });
  }
}
