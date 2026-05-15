import { redirect } from 'next/navigation'

/** FAQ перенесён в настройки. */
export default function FaqRedirectPage() {
  redirect('/settings#faq')
}
