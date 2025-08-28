# Issue Linking Tag Manager Example

A simple web-based UI for managing and linking issue tags, inspired by modern issue trackers. Built with custom elements and vanilla JavaScript.

## Features

- **Custom Tag Input**: Add, assign, and remove tags with types (blocked, duplicate, related, depends, required, etc).
- **Autocomplete**: Dynamic suggestions for tag IDs and types, with names shown in dropdowns.
- **Tag Tooltips**: Hover to see markdown-rendered descriptions and details.
- **Panel Layout**: Organized sections for status, priority, labels, linked issues, assignees, attachments, pull requests, and custom fields.
- **Responsive Design**: Clean, modern CSS.

## Usage

1. Open `panel.html` or `index.html` in your browser.
2. Use the "Linked issues" section to add or remove tags.
3. Hover over tags for tooltips with more info.

## How It Works

- Tags are unique and once used, are removed from the dropdown.
- Removing a tag returns it to the dropdown.
- Tag dropdown options show the tag name (not just the ID).
- Tooltips use markdown for rich descriptions.

## File Structure

- [`index.html`](index.html): Main demo page.
- [`panel.html`](panel.html): Example panel layout.
- [`script.js`](script.js): Custom element logic for tag management.
- [`styles.css`](styles.css): Main UI styles.
- [`panel.css`](panel.css): Panel-specific styles.

## Custom Elements

- `<ui-tag>`: Tag input and management.
- `<tag>`: Tag display with tooltip and remove button.

## Dependencies

- [Markdown-Tag](https://github.com/MarketingPipeline/Markdown-Tag) for markdown rendering in tooltips.

## Development

No build step required. Open the HTML files in your browser to view and interact with the demo.

---

**Author:** [32teeth](https://github.com/32teeth)
