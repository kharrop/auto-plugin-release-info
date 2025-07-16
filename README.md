# auto-comment-plugin

[![Auto Release](https://img.shields.io/badge/release-auto.svg?colorA=888888&colorB=9B065A&label=auto)](https://github.com/intuit/auto)

Generate a PR comment when a new canary release is available, with a convenient click to copy button. The comment is updated when new canary versions are published.

## Installation

```sh
npm i --save-dev auto-comment-plugin
# or
yarn add -D auto-comment-plugin
# or
pnpm add auto-comment-plugin
```

## Usage

Default:

```jsonc
{
  "plugins": [
    ["auto-comment-plugin"]
    // other plugins
  ]
}
```

With options:

```jsonc
{
  "plugins": [
    [
      "auto-comment-plugin",
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
