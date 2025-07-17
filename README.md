# auto-plugin-release-info

[![Auto Release](https://img.shields.io/badge/release-auto.svg?colorA=888888&colorB=9B065A&label=auto)](https://github.com/intuit/auto)

Generate a PR comment when a new canary release is available, with a convenient click to copy button. The comment is updated when new canary versions are published.

## Installation

```sh
npm i --save-dev auto-plugin-release-info
# or
yarn add -D auto-plugin-release-info
# or
pnpm add auto-plugin-release-info
```

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
        "context": "Canary Build",
        "note": "Please test this canary version before merging."
      }
    ]
    // other plugins
  ]
}
```
