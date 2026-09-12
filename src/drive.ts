import type { Presentation } from "./types";

type DriveFile = {
  id: string;
  name: string;
  mimeType: string;
  category?: string;
  modifiedTime?: string;
  webViewLink?: string;
};

type DriveListResponse = {
  files?: DriveFile[];
};

const getTitle = (name: string) => name.replace(/\.(pptx?|pdf)$/i, "").trim();

const toPresentation = (file: DriveFile): Presentation => {
  const date = file.modifiedTime || new Date().toISOString();
  const title = getTitle(file.name);

  return {
    id: file.id,
    title,
    category: file.category || "Презентации",
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
