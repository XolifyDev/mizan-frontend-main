import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function getLinkStatus(url: string) {
  try {
    const response = await fetch(url, {
      method: "HEAD",
      mode: "no-cors",
    });
    return response.status;
  } catch (error) {
    return null;
  }
}