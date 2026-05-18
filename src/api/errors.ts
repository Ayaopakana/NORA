import { translateKey } from '@/i18n/locale-storage'

const CODE_TO_I18N: Record<string, string> = {
  INVALID_CREDENTIALS: 'authErrors.invalidCredentials',
  EMAIL_EXISTS: 'authErrors.emailExists',
  NICK_TOO_SHORT: 'authErrors.nickTooShort',
  PASSWORD_TOO_SHORT: 'authErrors.passwordTooShort',
  UNAUTHORIZED: 'authErrors.loginRequired',
  NOT_FOUND: 'authErrors.accountNotFound',
  WRONG_PASSWORD: 'authErrors.wrongPassword',
}

export async function readApiError(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { code?: string; message?: string }
    if (data.code && CODE_TO_I18N[data.code]) {
      return translateKey(CODE_TO_I18N[data.code])
    }
    if (typeof data.message === 'string' && data.message.length > 0) {
      return data.message
    }
  } catch {
    /* not json */
  }
  return translateKey('authErrors.userDataError')
}
