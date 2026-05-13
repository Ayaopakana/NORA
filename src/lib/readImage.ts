const MAX_AVATAR_BYTES = 2 * 1024 * 1024

export function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

export function validateAvatarFile(file: File): string | null {
  if (!file.type.startsWith('image/')) {
    return 'Нужен файл изображения'
  }
  if (file.size > MAX_AVATAR_BYTES) {
    return 'Размер не больше 2 МБ'
  }
  return null
}
