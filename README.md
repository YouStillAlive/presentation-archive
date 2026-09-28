# Presentation Library

React + TypeScript + Vite catalog for 300+ presentations. GitHub Pages hosts the site; Google Drive hosts PPTX/PDF files.

## Local development

```bash
npm install
npm run dev
```

## GitHub Pages

1. Create a GitHub repository and push this project to `main`.
2. In repository **Settings → Pages**, select **GitHub Actions** as the source.
3. Push to `main`. The included workflow builds and deploys automatically.

The Vite `base: './'` setting makes the build work when the repository is published as a project site.
