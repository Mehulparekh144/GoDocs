import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow, parseISO, format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatRelativeDate = (dateString: string) => {
  if (!dateString) return "";
  const safe = dateString.replace(/(\.\d{3})\d+/, "$1");
  const date = parseISO(safe);
  return formatDistanceToNow(date, { addSuffix: true });
};

export const formatDate = (dateString: string) => {
  if (!dateString) return "";
  const safe = dateString.replace(/(\.\d{3})\d+/, "$1");
  const date = parseISO(safe);
  return format(date, "MMM d, yyyy, hh:mm a");
};
