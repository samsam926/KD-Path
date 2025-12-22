import { ViewAllPatientsView } from '@/components/Patients/AllPatientsView'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/allpatients')({
  component: RouteComponent
})

function RouteComponent() {
  return <ViewAllPatientsView />
}
