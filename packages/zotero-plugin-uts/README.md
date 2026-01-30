# UTS APA 7th Citation - Zotero Plugin

A Zotero plugin that copies bibliography in UTS APA 7th format to clipboard.

> **Citation Style Reference**: This plugin uses the citation format based on the
> [APA 7th Referencing Guide (January 2025)](https://www.lib.uts.edu.au/help/referencing/apa-referencing-guide)
> from UTS Library.

## Features

- 📋 **Context Menu**: Right-click on items → "Copy UTS APA 7th Citation"
- 🔧 **Tools Menu**: Tools → "Copy UTS APA 7th Citation"
- ⌨️ **Keyboard Shortcut**: `Ctrl+Shift+U` (Windows/Linux) or `Cmd+Shift+U` (Mac)
- 🔔 **Notifications**: Visual feedback on copy success/failure
- 🎨 **Icons**: Custom menu icons for easy identification

## Installation

1. Download the latest `.xpi` file from [Releases](https://github.com/gracefullight/pkgs/releases?q=zotero-plugin-uts&expanded=true)
2. In Zotero, go to Tools → Plugins
3. Click the gear icon (Settings) → Install Plugin From File

   ![Install Plugin From File](docs/install-plugin-from-file.png)

4. Select the downloaded `.xpi` file

## Compatibility

- Zotero 7.0+
- Zotero 8.x

## Usage

1. Select one or more items in your Zotero library
2. Use any of the following methods:
   - Right-click and select "Copy UTS APA 7th Citation"
   - Go to Tools → "Copy UTS APA 7th Citation"
   - Press `Ctrl+Shift+U` (or `Cmd+Shift+U` on Mac)
3. Paste the citation wherever you need it

## Development

```bash
# Install dependencies
bun install

# Run tests
bun run test

# Build
bun run build
```

## Sponsors

If this project helped you, please consider buying me a coffee!

<a href="https://www.buymeacoffee.com/gracefullight" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>

Or leave a star:

```bash
gh api --method PUT /user/starred/gracefullight/pkgs
```

## License

MIT License - see [LICENSE](../../LICENSE) for details.

## Author

**gracefullight** - [GitHub](https://github.com/gracefullight)
