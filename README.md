# Presentation Library

React + TypeScript + Vite catalog for 300+ presentations. GitHub Pages hosts the site; Google Drive hosts PPTX/PDF files.

## Local development

```bash
npm install
npm run dev
```

## Google Drive data

The catalog loads public presentation files directly from the configured Google Drive folder. Presentation records are not hardcoded in the app.

1. Enable **Google Drive API** in a Google Cloud project.
2. Create an API key and restrict it to your deployed website origins.
3. Copy `.env.example` to `.env` and set `VITE_GOOGLE_DRIVE_API_KEY`.
4. Make sure the folder and its files are shared as **Anyone with the link / Viewer**.

The app reads `.ppt`, `.pptx`, `.pdf`, and Google Slides files. File names become titles and Drive modification dates are used for sorting.

Favorites are stored in browser `localStorage`.

## GitHub Pages

1. Create a GitHub repository and push this project to `main`.
2. In repository **Settings → Pages**, select **GitHub Actions** as the source.
3. Push to `main`. The included workflow builds and deploys automatically.

The Vite `base: './'` setting makes the build work when the repository is published as a project site.
