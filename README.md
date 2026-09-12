# Presentation Library

React + TypeScript + Vite catalog for 300+ presentations. GitHub Pages hosts the site; Google Drive hosts PPTX/PDF files.

## Local development

```bash
npm install
npm run dev
```

## Add presentations

Edit `src/data.ts` and add records to `presentations`:

```ts
{
  id: '2026-001',
  title: 'Бог любит нас',
  category: 'Проповедь',
  tags: ['Бог', 'Любовь', 'Вера'],
  date: '2026-09-12',
  year: 2026,
  description: 'Краткое описание',
  driveUrl: 'https://drive.google.com/...',
  pdfUrl: 'https://drive.google.com/...'
}
```

Favorites are stored in browser `localStorage`.

## GitHub Pages

1. Create a GitHub repository and push this project to `main`.
2. In repository **Settings → Pages**, select **GitHub Actions** as the source.
3. Push to `main`. The included workflow builds and deploys automatically.

The Vite `base: './'` setting makes the build work when the repository is published as a project site.
