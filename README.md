# DBT Column Description Generator

A web-based tool for viewing and editing column descriptions in dbt manifest.json files.

## Features

- Load and parse dbt manifest.json files
- View a list of all models in the manifest
- Search for specific models
- View model details including SQL code
- Edit column descriptions
- Export updated manifest with new descriptions

## Project Structure

```
dbt-column-description-generator/
├── index.html           # Main HTML file
├── css/
│   └── styles.css       # Custom styles
├── js/
│   ├── app.js           # Main application logic
│   ├── models.js        # Data management
│   ├── ui.js            # UI rendering
│   └── export.js        # Export functionality
└── README.md            # This file
```

## Usage

1. Open `index.html` in your web browser
2. Click "Load manifest.json" and select your dbt manifest file
3. Browse models in the sidebar or search for specific models
4. Click on a model to view its details
5. Edit column descriptions and click "Save" for each change
6. When finished, click "Export" to download the updated manifest file

## Development

This is a client-side only application that requires no build steps. To make changes:

1. Edit the HTML, CSS, or JavaScript files as needed
2. Refresh your browser to see changes

## Dependencies

- [Tailwind CSS](https://tailwindcss.com/) (loaded via CDN)
