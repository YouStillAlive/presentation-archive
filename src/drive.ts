import type { Presentation } from "./types";

type DriveFile = {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  webViewLink?: string;
};

type DriveListResponse = {
  files?: DriveFile[];
};

const getTags = (title: string) =>
  Array.from(
    new Set(
      title
        .split(/[\s,;:!?()[\]{}"'«»—–-]+/)
        .map((word) => word.trim())
        .filter((word) => word.length > 2),
    ),
  ).slice(0, 6);

const getTitle = (name: string) => name.replace(/\.(pptx?|pdf)$/i, "").trim();

const getCategory = (mimeType: string) =>
  mimeType === "application/pdf"
    ? "PDF"
    : mimeType === "application/vnd.google-apps.presentation"
      ? "Google Slides"
      : "Презентации";

const toPresentation = (file: DriveFile): Presentation => {
  const date = file.modifiedTime || new Date().toISOString();
  const title = getTitle(file.name);

  return {
    id: file.id,
    title,
    category: getCategory(file.mimeType),
    tags: getTags(title),
    date,
    year: new Date(date).getFullYear(),
    description: `Файл ${file.mimeType === "application/pdf" ? "PDF" : "презентации"} из Google Drive`,
    driveUrl: file.webViewLink || `https://drive.google.com/file/d/${file.id}/view?usp=drive_link`,
  };
};

export async function loadPresentations(): Promise<Presentation[]> {
  const workerUrl = import.meta.env.VITE_DRIVE_WORKER_URL;

  if (!workerUrl) {
    throw new Error("Не указан VITE_DRIVE_WORKER_URL. Добавьте URL Cloudflare Worker в .env.");
  }

  const response = await fetch(`${workerUrl.replace(/\/$/, "")}/presentations`);

  if (!response.ok) {
    const errorText = await response.text();

    console.error("Drive Worker error:", errorText);

    throw new Error(`Drive Worker error (${response.status}): ${errorText}`);
  }

  const payload = (await response.json()) as DriveListResponse;

  return (payload.files ?? []).map(toPresentation);
}
