import {
  Activity,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Droplets,
  Eye,
  Heart,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/components/ui/utils"
import type { Patient } from "@/contexts/PatientContext"

interface HighAlertPatientsListProps {
  patients: Patient[]
  expandedPatients: Set<string>
  toggleExpand: (patientId: string) => void
  getAlertLevel: (status?: string) => {
    level: string
    color: string
    textColor: string
  }
  getRiskLevel: (risk?: number) => { level: string; color: string }
  onSelectPatient: (patientId: string) => void
}

export function HighAlertPatientsList({
  patients,
  expandedPatients,
  toggleExpand,
  getAlertLevel,
  getRiskLevel,
  onSelectPatient,
}: HighAlertPatientsListProps) {
  if (patients.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 bg-alert-low/10 rounded-full">
            <Heart className="h-12 w-12 text-alert-low" />
          </div>
          <div>
            <h3 className="font-semibold text-healthcare-primary mb-1">
              No High Alert Patients
            </h3>
            <p className="text-sm text-muted-foreground">
              All patients are stable. Great job!
            </p>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {patients.map((patient) => {
        const alert = getAlertLevel(patient.status)
        const twoYearRisk = getRiskLevel(patient.vitals?.twoYearRisk)
        const isExpanded = expandedPatients.has(patient.id)

        return (
          <Card
            key={patient.id}
            className={cn(
              "border-l-4 transition-all",
              isExpanded ? "shadow-lg" : "hover:shadow-md",
            )}
            style={{ borderLeftColor: alert.color.replace("bg-", "#") }}
          >
            {/* Collapsed View - Always Visible */}
            <div
              className="p-4 cursor-pointer"
              onClick={() => toggleExpand(patient.id)}
            >
              <div className="flex items-center justify-between">
                {/* Left Side - Patient Info */}
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center",
                        alert.color,
                        "bg-opacity-10",
                      )}
                    >
                      <AlertTriangle
                        className={cn("h-5 w-5", alert.textColor)}
                      />
                    </div>
                    <div>
                      <h3 className="font-bold text-healthcare-primary">
                        Patient {patient.id}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {patient.age} years • {patient.gender} • {patient.ward}
                      </p>
                    </div>
                  </div>

                  {/* Quick Vitals */}
                  <div className="hidden lg:flex items-center gap-6 ml-8">
                    <div className="flex items-center gap-2">
                      <Droplets className="h-4 w-4 text-healthcare-secondary" />
                      <div>
                        <p className="text-xs text-muted-foreground">eGFR</p>
                        <p
                          className={cn(
                            "font-semibold",
                            (patient.vitals?.eGFR || 0) < 30
                              ? "text-alert-high"
                              : (patient.vitals?.eGFR || 0) < 60
                                ? "text-yellow-600"
                                : "text-alert-low",
                          )}
                        >
                          {patient.vitals?.eGFR}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-healthcare-secondary" />
                      <div>
                        <p className="text-xs text-muted-foreground">BP</p>
                        <p className="font-semibold">
                          {patient.vitals?.bloodPressureSys}/
                          {patient.vitals?.bloodPressureDia}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4 text-healthcare-secondary" />
                      <div>
                        <p className="text-xs text-muted-foreground">HR</p>
                        <p className="font-semibold">
                          {patient.vitals?.heartRate}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side - Status & Expand */}
                <div className="flex items-center gap-3">
                  <Badge className={`${alert.color} text-white`}>
                    {alert.level}
                  </Badge>
                  <div className="text-healthcare-secondary">
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Expanded View - Additional Details */}
            {isExpanded && (
              <div className="px-4 pb-4 pt-0 border-t border-gray-200">
                <div className="pt-4 space-y-4">
                  {/* Detailed Vitals Grid */}
                  <div>
                    <h4 className="text-sm font-semibold text-healthcare-primary mb-3">
                      Current Vital Signs
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Droplets className="h-3 w-3 text-healthcare-secondary" />
                          <span className="text-xs text-muted-foreground">
                            eGFR
                          </span>
                        </div>
                        <p
                          className={cn(
                            "font-bold",
                            (patient.vitals?.eGFR || 0) < 30
                              ? "text-alert-high"
                              : (patient.vitals?.eGFR || 0) < 60
                                ? "text-yellow-600"
                                : "text-alert-low",
                          )}
                        >
                          {patient.vitals?.eGFR}{" "}
                          <span className="text-xs font-normal">mL/min</span>
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Activity className="h-3 w-3 text-healthcare-secondary" />
                          <span className="text-xs text-muted-foreground">
                            Blood Pressure
                          </span>
                        </div>
                        <p className="font-bold text-healthcare-primary">
                          {patient.vitals?.bloodPressureSys}/
                          {patient.vitals?.bloodPressureDia}
                          <span className="text-xs font-normal"> mmHg</span>
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Heart className="h-3 w-3 text-healthcare-secondary" />
                          <span className="text-xs text-muted-foreground">
                            Heart Rate
                          </span>
                        </div>
                        <p className="font-bold text-healthcare-primary">
                          {patient.vitals?.heartRate}{" "}
                          <span className="text-xs font-normal">bpm</span>
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Activity className="h-3 w-3 text-healthcare-secondary" />
                          <span className="text-xs text-muted-foreground">
                            O2 Sat
                          </span>
                        </div>
                        <p className="font-bold text-healthcare-primary">
                          {patient.vitals?.oxygenSat}{" "}
                          <span className="text-xs font-normal">%</span>
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Activity className="h-3 w-3 text-healthcare-secondary" />
                          <span className="text-xs text-muted-foreground">
                            Temperature
                          </span>
                        </div>
                        <p className="font-bold text-healthcare-primary">
                          {patient.vitals?.temperature}{" "}
                          <span className="text-xs font-normal">°F</span>
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Droplets className="h-3 w-3 text-healthcare-secondary" />
                          <span className="text-xs text-muted-foreground">
                            ACR
                          </span>
                        </div>
                        <p className="font-bold text-healthcare-primary">
                          {patient.vitals?.acr}{" "}
                          <span className="text-xs font-normal">mg/g</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Kidney Failure Risk */}
                  <div>
                    <h4 className="text-sm font-semibold text-healthcare-primary mb-3">
                      Kidney Failure Risk
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-3 bg-alert-high/5 rounded-lg border border-alert-high/20">
                        <p className="text-xs text-muted-foreground mb-1">
                          2-Year Risk
                        </p>
                        <div className="flex items-center justify-between">
                          <p className="text-2xl font-bold text-alert-high">
                            {patient.vitals?.twoYearRisk?.toFixed(1)}%
                          </p>
                          <Badge
                            className={`${twoYearRisk.color} text-white text-xs`}
                          >
                            {twoYearRisk.level}
                          </Badge>
                        </div>
                      </div>
                      <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                        <p className="text-xs text-muted-foreground mb-1">
                          5-Year Risk
                        </p>
                        <div className="flex items-center justify-between">
                          <p className="text-2xl font-bold text-orange-600">
                            {patient.vitals?.fiveYearRisk?.toFixed(1)}%
                          </p>
                          <Badge
                            className={`${getRiskLevel(patient.vitals?.fiveYearRisk).color} text-white text-xs`}
                          >
                            {getRiskLevel(patient.vitals?.fiveYearRisk).level}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Visits */}
                  {patient.visits && patient.visits.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-healthcare-primary mb-3">
                        Recent Visits
                      </h4>
                      <div className="space-y-2">
                        {patient.visits
                          .slice(-2)
                          .reverse()
                          .map((visit) => (
                            <div
                              key={visit.visitNumber}
                              className="p-3 bg-healthcare-light/10 rounded-lg"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-semibold text-healthcare-primary">
                                  Visit #{visit.visitNumber}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(
                                    visit.visitDate,
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                                <div>
                                  <span className="text-muted-foreground">
                                    eGFR:
                                  </span>
                                  <span className="font-semibold ml-1">
                                    {visit.EGFR}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">
                                    BP:
                                  </span>
                                  <span className="font-semibold ml-1">
                                    {visit.BP_SYSTOLIC}/{visit.BP_DIASTOLIC}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">
                                    HbA1c:
                                  </span>
                                  <span className="font-semibold ml-1">
                                    {visit.HBA1C}%
                                  </span>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">
                                    Hb:
                                  </span>
                                  <span className="font-semibold ml-1">
                                    {visit.HEMOGLOBIN}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation()
                        onSelectPatient(patient.id)
                      }}
                      className="flex-1 bg-healthcare-secondary hover:bg-healthcare-primary"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Full Details
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Card>
        )
      })}
    </div>
  )
}
