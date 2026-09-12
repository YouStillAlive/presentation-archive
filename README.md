# Presentation Library

React + TypeScript + Vite catalog for 300+ presentations. GitHub Pages hosts the site; Google Drive hosts PPTX/PDF files.

## Local development

```bash
npm install
npm run dev
```

## Google Drive data

The Worker needs `GOOGLE_API_KEY` and can use these variables for the folder IDs:

- `GOOGLE_DRIVE_FOLDER_ID` for `Общее пение`
- `GOOGLE_DRIVE_CHOR_FOLDER_ID` for `Хор`

Both folder IDs also have safe defaults in the Worker source. Make sure the folders and their files are shared as **Anyone with the link / Viewer**. File names become titles and Drive modification dates are used for sorting.

Favorites are stored in browser `localStorage`.

## GitHub Pages

1. Create a GitHub repository and push this project to `main`.
2. In repository **Settings → Pages**, select **GitHub Actions** as the source.
3. Push to `main`. The included workflow builds and deploys automatically.

The Vite `base: './'` setting makes the build work when the repository is published as a project site.
