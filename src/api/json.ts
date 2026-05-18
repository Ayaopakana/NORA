import { readApiError } from '@/api/errors'

export async function parseJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    throw new Error(await readApiError(res))
  }
  return res.json() as Promise<T>
}
