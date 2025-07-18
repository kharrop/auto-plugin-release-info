# auto-plugin-release-info

[![Auto Release](https://img.shields.io/badge/release-auto.svg?colorA=888888&colorB=9B065A&label=auto)](https://github.com/intuit/auto)

Generate a PR comment when a new release is available, with a convenient click to copy button. The comment is updated when new versions are published.

Each comment has a custom message based on the type of release, using the [afterShipIt hook](https://intuit.github.io/auto/docs/plugins/release-lifecycle-hooks#aftershipit).

## Installation

```sh
npm i --save-dev auto-plugin-release-info
# or
yarn add -D auto-plugin-release-info
# or
pnpm add auto-plugin-release-info
```

## Features

- Automatically adds release information as comments to PRs
- Updates comments when new versions are published
- Customizable messages based on release type (major, minor, patch, canary)
- Convenient copy-to-clipboard button for version information
- Integrates seamlessly with the Auto release workflow
-

## Usage

Default:

```jsonc
{
  "plugins": [
    "release-info"
    // other plugins
  ]
}
```

With options:

```jsonc
{
  "plugins": [
    [
      "release-info",
      {
        // Defaults to "Release Info"
        "context": "Build Info",
        "notes": {
          "canary": "Please test this version before merging."
        }
      }
    ]
    // other plugins
  ]
}
```

## Example PR Comment

When a new canary release is published, a comment like this will be added to the PR:

### Release Info

Your PR was successfully deployed on `Fri, 18 Jul 2025 12:34:56 GMT` with this canary version:

```text
1.2.3-canary.123.0
```
