# auto-comment-plugin

[![Auto Release](https://img.shields.io/badge/release-auto.svg?colorA=888888&colorB=9B065A&label=auto)](https://github.com/intuit/auto)

Generate a PR comment when a new canary release is available, with a convenient click to copy button. The comment is updated when new canary versions are published.

## Installation

```sh
npm i --save-dev auto-plugin-canary-version
# or
yarn add -D auto-plugin-canary-version
# or
pnpm add auto-plugin-canary-version
```

## Usage

Default:

```jsonc
{
  "plugins": [
    ["canary-version"]
    // other plugins
  ]
}
```

With options:

```jsonc
{
  "plugins": [
    [
      "canary-version",
      {
        // Defaults to "Build Info"
        "context": "Canary Build",
        "note": "Please test this canary version before merging."
      }
    ]
    // other plugins
  ]
}
```
