# reposcore-ts

A CLI for scoring student participation in an open-source class repo, implemented in TypeScript using GraphQL.

## Usage

Install dependencies:

```bash
bun install
```

Run the CLI with one or more repositories:

```bash
bun run index.ts <owner/repo> [<owner/repo> ...] [options]
```

Example (multi-repo):

```bash
bun run index.ts oss2026hnu/reposcore-ts owner/repo2 --format csv
```

If you do not pass a token with `--token`, set the `GITHUB_TOKEN` environment variable before running the CLI.

## Synopsis

```text
reposcore-ts

Usage:
  $ reposcore-ts [...repos]

Commands:
  [...repos]  대상 저장소 목록 (예: owner/repo1 owner/repo2)

For more info, run any command with the `--help` flag:
  $ reposcore-ts --help

Options:
  --token <token>    GitHub Personal Access Token (default: $GITHUB_TOKEN)
  --format <format>  출력 형식 (csv, txt) (default: csv)
  -h, --help         Display this message
```
