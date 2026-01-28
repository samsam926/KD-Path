import { createFileRoute } from "@tanstack/react-router"
import { ViewAllPatientsView } from "@/components/Patients/AllPatientsView"

export const Route = createFileRoute("/_layout/allpatients")({
  component: RouteComponent,
})

function RouteComponent() {
  return <ViewAllPatientsView />
}
