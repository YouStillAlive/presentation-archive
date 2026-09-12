import type { Category, Presentation } from "./types";
export const categories: Category[] = [
  { name: "Все", icon: "▦" },
  { name: "Избранное", icon: "★" },
  { name: "Проповедь", icon: "📖" },
  { name: "Воскресное служение", icon: "⛪" },
  { name: "Песни", icon: "🎵" },
  { name: "Молодёжное", icon: "👥" },
  { name: "Праздники", icon: "🎉" },
  { name: "Детское", icon: "🧒" },
];
// Replace/add records here. Google Drive stores the actual PPTX/PDF files.
export const presentations: Presentation[] = [
  {
    id: "demo-1",
    title: "Бог любит нас",
    category: "Проповедь",
    tags: ["Бог", "Любовь", "Вера"],
    date: "2026-09-12",
    year: 2026,
    description: "Пример записи — замените ссылку на свой файл.",
    driveUrl: "https://drive.google.com/",
  },
  {
    id: "demo-2",
    title: "Сила молитвы",
    category: "Проповедь",
    tags: ["Молитва", "Вера", "Надежда"],
    date: "2026-09-05",
    year: 2026,
    driveUrl: "https://drive.google.com/",
  },
  {
    id: "demo-3",
    title: "Мой дом на небесах",
    category: "Песни",
    tags: ["Песни", "Небеса", "Надежда"],
    date: "2026-08-30",
    year: 2026,
    driveUrl: "https://drive.google.com/",
  },
  {
    id: "demo-4",
    title: "Жить верой",
    category: "Воскресное служение",
    tags: ["Вера", "Доверие", "Бог"],
    date: "2026-08-23",
    year: 2026,
    driveUrl: "https://drive.google.com/",
  },
];
