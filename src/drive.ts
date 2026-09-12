import type { Presentation } from "./types";

const FOLDER_ID = "16K1vxW6Ah36CJMo6VKmV0kax9dtbDA87";
const DRIVE_FILES_URL = "https://www.googleapis.com/drive/v3/files";
const PRESENTATION_TYPES = [
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-powerpoint",
  "application/pdf",
  "application/vnd.google-apps.presentation",
];

type DriveFile = {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  webViewLink?: string;
};

type DriveListResponse = {
  files?: DriveFile[];
  nextPageToken?: string;
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
  const apiKey = import.meta.env.VITE_GOOGLE_DRIVE_API_KEY;
  if (!apiKey) {
    throw new Error("Не указан VITE_GOOGLE_DRIVE_API_KEY. Добавьте ключ Google Drive API в файл .env.");
  }
  const query = `'${FOLDER_ID}' in parents and trashed = false and (${PRESENTATION_TYPES.map((type) => `mimeType = '${type}'`).join(" or ")})`;
  const files: DriveFile[] = [];
  let pageToken: string | undefined;

  do {
    const params = new URLSearchParams({
      key: apiKey,
      q: query,
      fields: "nextPageToken,files(id,name,mimeType,modifiedTime,webViewLink)",
      orderBy: "modifiedTime desc",
      pageSize: "1000",
      supportsAllDrives: "true",
      includeItemsFromAllDrives: "true",
    });
    if (pageToken) params.set("pageToken", pageToken);

    const response = await fetch(`${DRIVE_FILES_URL}?${params}`);
    if (!response.ok) {
      const errorText = await response.text();

      console.error("Google Drive API error:", errorText);

      throw new Error(`Google Drive API error (${response.status}): ${errorText}`);
    }

    const payload = (await response.json()) as DriveListResponse;
    files.push(...(payload.files || []));
    pageToken = payload.nextPageToken;
  } while (pageToken);

  return files.map(toPresentation);
}

export const driveFolderUrl = `https://drive.google.com/drive/folders/${FOLDER_ID}`;
