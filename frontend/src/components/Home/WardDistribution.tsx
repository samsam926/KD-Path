import { Building2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import type { Patient } from "@/contexts/PatientContext"

interface WardDistributionProps {
  topWards: [string, number][]
  activePatients: Patient[]
}

export function WardDistribution({
  topWards,
  activePatients,
}: WardDistributionProps) {
  return (
    <Card className="p-4">
      <h3 className="font-semibold text-healthcare-primary mb-4 flex items-center gap-2">
        <Building2 className="h-5 w-5" />
        Ward Distribution
      </h3>
      <div className="space-y-3">
        {topWards.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No active patients
          </p>
        ) : (
          topWards.map(([ward, count]) => (
            <div key={ward} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-healthcare-primary">
                  {ward}
                </span>
                <span className="text-muted-foreground">{count} patients</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-healthcare-secondary h-2 rounded-full transition-all"
                  style={{ width: `${(count / activePatients.length) * 100}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  )
}
