# Get Started | md-verify

> Verify markdown with rules.

<!-- Generate demo with svg-term-cli -->

![example usage](/assets/example.svg)

![Code Style: Prettier](https://img.shields.io/badge/code_style-prettier-14cc21.svg)
[![Github Actions: Build Passing](https://img.shields.io/badge/github_actions-build_passing-14cc21.svg)](https://github.com/fuadop/md-verify/actions)
![TypeScript: Strict](https://img.shields.io/badge/typescript-strict-14cc21.svg)

## Table of contents

- [What is md-verify?](#what-is-md-verify)
  - [Benefits / Usage of md-verify](#benefits--usage-of-md-verify)
- [Installation](#installation)
- [CLI](#cli)
- [API](#api)
- [Contributing](#contributing)
- [Issues](#issues)

## What is md-verify?

md-verify matches a markdown input against defined rules. Fun fact: Rules are written in markdown.

### Benefits / Usage of md-verify

You can verify pull request bodies if they match the defined template in your PULL_REQUEST_TEMPLATE.md file, etc.

## Installation

For cli usage

```bash
npm install -g md-verify
```

For nodejs/browser usage.

```bash
npm install --save md-verify
```

## CLI

The source is expected to be piped into the md-verify command.

- From a file

  ```bash
    cat /path/to/file.md | npx md-verify@latest \
    --rule="# Heading" \
    -- rule="## H2 Heading" \
    -- rule="- List item"
  ```

- From a string

  ```bash
    echo '# md file content...' | npx md-verify@latest \
    --rule="# Heading" \
    -- rule="## H2 Heading" \
    -- rule="- List item"
  ```

## API

```typescript
import fs from "fs";
import mdVerify, { VerifyError } from "md-verify";

try {
  let source = fs.readFileSync("/path/to/md/file").toString("binary");
  let rules = [
    "## PR Checklist",
    "# Get Started",
    "## Overview",
    "- Fish",
    "- [CONTRIBUTING.md](/link/to/contributing.md)",
  ];

  mdVerify(source, rules);
  // if no error - means the markdown matches the rules.
} catch (e: any) {
  console.log((e as VerifyError).errors);
}
```

## Contributing

PRs are greatly appreciated.

1. Create a fork
2. Create your feature branch: git checkout -b my-feature
3. Commit your changes: git commit -am 'Add some feature'
4. Push to the branch: git push origin my-new-feature
5. Submit a pull request 🚀

## Issues

If you find a bug, please file an issue on [the issue tracker](https://github.com/fuadop/md-verify/issues).
