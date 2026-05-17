import { redirect } from 'next/navigation'

/** Планер открывается на карте справа. */
export default function PlannerPage() {
  redirect('/?planner=open')
}
