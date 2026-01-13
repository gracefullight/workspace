# create-fullstack-starter

> CLI tool to quickly scaffold the Fullstack Starter template

[![npm version](https://img.shields.io/npm/v/create-fullstack-starter.svg)](https://www.npmjs.com/package/create-fullstack-starter)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[한국어](./README.md) | **English**

## Introduction

Downloads the [fullstack-starter](https://github.com/first-fluke/fullstack-starter) template from GitHub to create a new project.

A production-ready fullstack monorepo template based on Next.js 16, FastAPI, Flutter, Terraform, and mise.

For more details, see the [fullstack-starter repository](https://github.com/first-fluke/fullstack-starter) or [documentation](https://deepwiki.org/first-fluke/fullstack-starter).

## Usage

```bash
# Run with npx
npx create-fullstack-starter my-project

# Or use package manager's create command
npm create fullstack-starter my-project
yarn create fullstack-starter my-project
pnpm create fullstack-starter my-project

# Run interactively
npx create-fullstack-starter

# Create in current folder
npx create-fullstack-starter .
```

## Options

| Option | Description |
|--------|-------------|
| `[directory]` | Directory to create the project in (default: interactive prompt) |
| `-v, --version` | Show version |
| `-h, --help` | Show help |

## Next Steps After Creation

```bash
cd my-project
mise install        # Install runtimes (Node, Python, Flutter, etc.)
mise run install    # Install dependencies
mise infra:up       # Start local infrastructure (PostgreSQL, Redis, MinIO)
mise dev            # Start development servers
```

## License

MIT
