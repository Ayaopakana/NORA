/**
 * Режим карты: явный выбор light/dark важнее resolvedTheme (иначе до гидрации
 * resolvedTheme = системная light, а в storage — dark → белая карта в тёмной теме).
 * Для `system` используем только resolvedTheme.
 */
export function mapAppearanceScheme(
  theme: string | undefined,
  resolvedTheme: string | undefined,
): 'light' | 'dark' {
  if (theme && theme !== 'system') {
    return theme === 'light' ? 'light' : 'dark'
  }
  if (resolvedTheme === 'light' || resolvedTheme === 'dark') {
    return resolvedTheme
  }
  return 'dark'
}
