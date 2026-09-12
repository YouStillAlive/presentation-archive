export type Presentation = {
  id: string;
  title: string;
  category: string;
  date: string;
  year: number;
  description?: string;
  driveUrl: string;
  pdfUrl?: string;
};
import type { LucideIcon } from "lucide-react";

export type Category = {
  name: string;
  icon: LucideIcon;
};