# Zotero Plugin UTS

This is a Zotero plugin that adds a "Copy UTS APA 7th Citation" option to the item context menu.

## Features

- Copies the bibliography of selected items in APA 7th edition format (UTS standard).
- Supports Zotero 7+.

## Development

### Build

```bash
bun install
bun run build
```

The built addon files are located in `addon/`.

### Installation

1. Build the project.
2. Zip the contents of the `addon` directory (not the directory itself, just the files inside).
   ```bash
   cd addon && zip -r ../zotero-plugin-uts.xpi *
   ```
3. Open Zotero -> Tools -> Add-ons.
4. Click the gear icon -> Install Add-on From File...
5. Select the `.xpi` file.

## Structure

- `addon/`: Contains the plugin manifest, bootstrap loader, and built assets.
- `src/`: TypeScript source code.
- `tsup.config.ts`: Bundler configuration.
