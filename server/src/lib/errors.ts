export function apiError(
  statusCode: number,
  code: string,
  message: string,
) {
  return { statusCode, code, message }
}

export const ERR = {
  invalidCredentials: () =>
    apiError(401, 'INVALID_CREDENTIALS', 'Invalid email or password'),
  emailExists: () => apiError(409, 'EMAIL_EXISTS', 'Email already registered'),
  nickTooShort: () =>
    apiError(400, 'NICK_TOO_SHORT', 'Nickname must be at least 2 characters'),
  passwordTooShort: () =>
    apiError(400, 'PASSWORD_TOO_SHORT', 'Password must be at least 4 characters'),
  unauthorized: () => apiError(401, 'UNAUTHORIZED', 'Authentication required'),
  notFound: () => apiError(404, 'NOT_FOUND', 'User not found'),
  wrongPassword: () => apiError(400, 'WRONG_PASSWORD', 'Current password is wrong'),
} as const
