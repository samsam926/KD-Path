import { Activity, AlertTriangle, Heart, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { Patient } from "@/contexts/PatientContext"

interface PatientKidneyDetailsProps {
  patient: Patient
}

export function PatientKidneyDetails({ patient }: PatientKidneyDetailsProps) {
  const getRiskLevel = (
    twoYearRisk?: number,
  ): { level: string; color: string; bgColor: string } => {
    if (!twoYearRisk)
      return {
        level: "Unknown",
        color: "text-muted-foreground",
        bgColor: "bg-muted",
      }
    if (twoYearRisk >= 20)
      return {
        level: "Very High",
        color: "text-alert-high",
        bgColor: "bg-alert-high",
      }
    if (twoYearRisk >= 10)
      return {
        level: "High",
        color: "text-orange-600",
        bgColor: "bg-orange-600",
      }
    if (twoYearRisk >= 5)
      return {
        level: "Moderate",
        color: "text-amber-600",
        bgColor: "bg-amber-600",
      }
    if (twoYearRisk >= 2)
      return {
        level: "Low-Moderate",
        color: "text-yellow-600",
        bgColor: "bg-yellow-600",
      }
    return { level: "Low", color: "text-alert-low", bgColor: "bg-alert-low" }
  }

  const getACRCategory = (acr?: number): string => {
    if (!acr) return "Unknown"
    if (acr < 30) return "Normal"
    if (acr < 300) return "Moderately Increased"
    return "Severely Increased"
  }

  const getACRColor = (acr?: number): string => {
    if (!acr) return "text-muted-foreground"
    if (acr < 30) return "text-alert-low"
    if (acr < 300) return "text-amber-600"
    return "text-alert-high"
  }

  const getGFRStage = (
    gfr?: number,
  ): { stage: string; description: string } => {
    if (!gfr) return { stage: "Unknown", description: "No data" }
    if (gfr >= 90) return { stage: "G1", description: "Normal or high" }
    if (gfr >= 60) return { stage: "G2", description: "Mildly decreased" }
    if (gfr >= 45)
      return { stage: "G3a", description: "Mild to moderate decrease" }
    if (gfr >= 30)
      return { stage: "G3b", description: "Moderate to severe decrease" }
    if (gfr >= 15) return { stage: "G4", description: "Severely decreased" }
    return { stage: "G5", description: "Kidney failure" }
  }

  const riskInfo = getRiskLevel(patient.vitals?.twoYearRisk)
  const gfrStage = getGFRStage(patient.vitals?.eGFR)

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-healthcare-primary/5 to-healthcare-primary/10 border-healthcare-primary/20">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">Patient Age</p>
              <p className="text-3xl font-bold text-healthcare-primary">
                {patient.age}
              </p>
              <p className="text-xs text-muted-foreground mt-1">years old</p>
            </div>
            <Heart className="h-8 w-8 text-healthcare-primary/40" />
          </div>
        </Card>

        <Card
          className={`p-4 border-2 ${
            (patient.vitals?.eGFR || 0) >= 60
              ? "bg-green-50 border-green-200"
              : (patient.vitals?.eGFR || 0) >= 30
                ? "bg-amber-50 border-amber-200"
                : "bg-red-50 border-red-200"
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">eGFR</p>
              <p
                className={`text-3xl font-bold ${
                  (patient.vitals?.eGFR || 0) >= 60
                    ? "text-green-700"
                    : (patient.vitals?.eGFR || 0) >= 30
                      ? "text-amber-700"
                      : "text-red-700"
                }`}
              >
                {patient.vitals?.eGFR || "N/A"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                mL/min/1.73m²
              </p>
              <Badge className="mt-2 text-xs" variant="secondary">
                Stage {gfrStage.stage}
              </Badge>
            </div>
            <Activity
              className={`h-8 w-8 ${
                (patient.vitals?.eGFR || 0) >= 60
                  ? "text-green-400"
                  : (patient.vitals?.eGFR || 0) >= 30
                    ? "text-amber-400"
                    : "text-red-400"
              }`}
            />
          </div>
        </Card>

        <Card
          className={`p-4 border-2 ${
            (patient.vitals?.acr || 0) < 30
              ? "bg-green-50 border-green-200"
              : (patient.vitals?.acr || 0) < 300
                ? "bg-amber-50 border-amber-200"
                : "bg-red-50 border-red-200"
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">ACR</p>
              <p
                className={`text-3xl font-bold ${getACRColor(patient.vitals?.acr)}`}
              >
                {patient.vitals?.acr || "N/A"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">mg/g Cr</p>
              <p className="text-xs font-semibold mt-2">
                {getACRCategory(patient.vitals?.acr)}
              </p>
            </div>
            <TrendingUp
              className={`h-8 w-8 ${
                (patient.vitals?.acr || 0) < 30
                  ? "text-green-400"
                  : (patient.vitals?.acr || 0) < 300
                    ? "text-amber-400"
                    : "text-red-400"
              }`}
            />
          </div>
        </Card>

        <Card
          className={`p-4 border-2 ${
            (patient.vitals?.twoYearRisk || 0) >= 20
              ? "bg-red-50 border-red-200"
              : (patient.vitals?.twoYearRisk || 0) >= 10
                ? "bg-orange-50 border-orange-200"
                : (patient.vitals?.twoYearRisk || 0) >= 5
                  ? "bg-amber-50 border-amber-200"
                  : "bg-green-50 border-green-200"
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs text-muted-foreground mb-1">Overall Risk</p>
              <Badge className={`${riskInfo.bgColor} text-white mb-2`}>
                {riskInfo.level}
              </Badge>
              <p className="text-xs text-muted-foreground mt-2">
                Based on 2-year risk assessment
              </p>
            </div>
            <AlertTriangle
              className={`h-8 w-8 ${riskInfo.color.replace("text-", "text-").concat("/40")}`}
            />
          </div>
        </Card>
      </div>

      {/* Risk Timeline */}
      <Card className="p-6">
        <h3 className="font-semibold text-healthcare-primary mb-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Kidney Failure Risk Timeline
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-healthcare-primary">
                2-Year Risk
              </span>
              <span className={`text-2xl font-bold ${riskInfo.color}`}>
                {patient.vitals?.twoYearRisk?.toFixed(1) || "N/A"}%
              </span>
            </div>
            <Progress
              value={Math.min(patient.vitals?.twoYearRisk || 0, 100)}
              className="h-3"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Probability of kidney failure within 2 years
            </p>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-healthcare-primary">
                5-Year Risk
              </span>
              <span className={`text-2xl font-bold ${riskInfo.color}`}>
                {patient.vitals?.fiveYearRisk?.toFixed(1) || "N/A"}%
              </span>
            </div>
            <Progress
              value={Math.min(patient.vitals?.fiveYearRisk || 0, 100)}
              className="h-3"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Probability of kidney failure within 5 years
            </p>
          </div>
        </div>
      </Card>

      {/* Clinical Information */}
      <Card className="p-6">
        <h3 className="font-semibold text-healthcare-primary mb-4">
          Clinical Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* GFR Stages */}
          <div>
            <h4 className="text-sm font-semibold text-healthcare-primary mb-3">
              eGFR Stage Classification
            </h4>
            <div className="space-y-2">
              <div
                className={`p-3 rounded-lg border-l-4 ${
                  gfrStage.stage === "G1"
                    ? "bg-green-50 border-green-500"
                    : "bg-gray-50 border-gray-300"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold">G1: ≥90</span>
                  <span className="text-xs text-muted-foreground">
                    Normal or high
                  </span>
                </div>
              </div>
              <div
                className={`p-3 rounded-lg border-l-4 ${
                  gfrStage.stage === "G2"
                    ? "bg-green-50 border-green-500"
                    : "bg-gray-50 border-gray-300"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold">G2: 60-89</span>
                  <span className="text-xs text-muted-foreground">
                    Mildly decreased
                  </span>
                </div>
              </div>
              <div
                className={`p-3 rounded-lg border-l-4 ${
                  gfrStage.stage === "G3a"
                    ? "bg-amber-50 border-amber-500"
                    : "bg-gray-50 border-gray-300"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold">G3a: 45-59</span>
                  <span className="text-xs text-muted-foreground">
                    Mild-moderate decrease
                  </span>
                </div>
              </div>
              <div
                className={`p-3 rounded-lg border-l-4 ${
                  gfrStage.stage === "G3b"
                    ? "bg-amber-50 border-amber-500"
                    : "bg-gray-50 border-gray-300"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold">G3b: 30-44</span>
                  <span className="text-xs text-muted-foreground">
                    Moderate-severe decrease
                  </span>
                </div>
              </div>
              <div
                className={`p-3 rounded-lg border-l-4 ${
                  gfrStage.stage === "G4"
                    ? "bg-red-50 border-red-500"
                    : "bg-gray-50 border-gray-300"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold">G4: 15-29</span>
                  <span className="text-xs text-muted-foreground">
                    Severely decreased
                  </span>
                </div>
              </div>
              <div
                className={`p-3 rounded-lg border-l-4 ${
                  gfrStage.stage === "G5"
                    ? "bg-red-50 border-red-500"
                    : "bg-gray-50 border-gray-300"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold">G5: {"<"}15</span>
                  <span className="text-xs text-muted-foreground">
                    Kidney failure
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm">
                <span className="font-semibold text-healthcare-primary">
                  Current Stage:{" "}
                </span>
                <span className="text-healthcare-secondary">
                  {gfrStage.stage} - {gfrStage.description}
                </span>
              </p>
            </div>
          </div>

          {/* ACR Categories */}
          <div>
            <h4 className="text-sm font-semibold text-healthcare-primary mb-3">
              ACR Category Classification
            </h4>
            <div className="space-y-2">
              <div
                className={`p-3 rounded-lg border-l-4 ${
                  (patient.vitals?.acr || 0) < 30
                    ? "bg-green-50 border-green-500"
                    : "bg-gray-50 border-gray-300"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold">A1: {"<"}30</span>
                  <span className="text-xs text-muted-foreground">
                    Normal to mildly increased
                  </span>
                </div>
              </div>
              <div
                className={`p-3 rounded-lg border-l-4 ${
                  (patient.vitals?.acr || 0) >= 30 &&
                  (patient.vitals?.acr || 0) < 300
                    ? "bg-amber-50 border-amber-500"
                    : "bg-gray-50 border-gray-300"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold">A2: 30-299</span>
                  <span className="text-xs text-muted-foreground">
                    Moderately increased
                  </span>
                </div>
              </div>
              <div
                className={`p-3 rounded-lg border-l-4 ${
                  (patient.vitals?.acr || 0) >= 300
                    ? "bg-red-50 border-red-500"
                    : "bg-gray-50 border-gray-300"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold">A3: ≥300</span>
                  <span className="text-xs text-muted-foreground">
                    Severely increased
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm">
                <span className="font-semibold text-healthcare-primary">
                  Current Category:{" "}
                </span>
                <span className="text-healthcare-secondary">
                  {getACRCategory(patient.vitals?.acr)}
                </span>
              </p>
            </div>

            <div className="mt-6">
              <h4 className="text-sm font-semibold text-healthcare-primary mb-3">
                Risk Level Guide
              </h4>
              <div className="space-y-2">
                <div className="p-2 bg-green-50 rounded flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-alert-low" />
                  <span className="text-xs">Low: {"<"}2% (2-year)</span>
                </div>
                <div className="p-2 bg-yellow-50 rounded flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-600" />
                  <span className="text-xs">Low-Moderate: 2-5%</span>
                </div>
                <div className="p-2 bg-amber-50 rounded flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-600" />
                  <span className="text-xs">Moderate: 5-10%</span>
                </div>
                <div className="p-2 bg-orange-50 rounded flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-600" />
                  <span className="text-xs">High: 10-20%</span>
                </div>
                <div className="p-2 bg-red-50 rounded flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-alert-high" />
                  <span className="text-xs">Very High: ≥20%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
