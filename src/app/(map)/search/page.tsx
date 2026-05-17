import { redirect } from 'next/navigation'

/** Поиск людей открывается на карте. */
export default function SearchPage() {
  redirect('/?search=open')
}
