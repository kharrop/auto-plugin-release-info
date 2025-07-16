# auto-canary-comment

[![Auto Release](https://img.shields.io/badge/release-auto.svg?colorA=888888&colorB=9B065A&label=auto)](https://github.com/intuit/auto)

Generate a PR comment when a new canary release is available, with a convenient click to copy button. The comment is updated when new canary versions are published.

## Installation

```sh
npm i --save-dev auto-canary-comment
# or
yarn add -D auto-canary-comment
# or
pnpm add auto-canary-comment
```

## Usage

Default:

```jsonc
{
  "plugins": [
    ["auto-canary-comment"]
    // other plugins
  ]
}
```

With options:

```jsonc
{
  "plugins": [
    [
      "auto-canary-comment",
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
