/** Бэкенд включён, если задан NEXT_PUBLIC_API_URL (например http://localhost:3001). */
export function isApiEnabled(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_API_URL?.trim())
}
