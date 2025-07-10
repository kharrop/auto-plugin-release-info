# auto-canary-comment

Generate a PR comment when a new canary release is available, with a convenient click to copy button. The comment is displayed in addition to the PR body update.

## Installation

```sh
npm i --save-dev auto-canary-comment
# or
yarn add -D auto-canary-comment
# or
pnpm add auto-canary-comment
```

## Usage

```jsonc
{
  "plugins": [
    [
      "auto-canary-comment"
    ]
    // other plugins
  ]
}
```
