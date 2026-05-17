import { redirect } from 'next/navigation'

/** Планер открывается на карте слева сверху. */
export default function PlannerPage() {
  redirect('/?planner=open')
}
