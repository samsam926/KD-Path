import { Activity, Check, ChevronsUpDown } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { type ClinicalVisit, usePatients } from "@/contexts/PatientContext"
import { cn } from "@/lib/utils"
import { SinglePatientKidneyRisk } from "./SinglePatientKidneyRisk"

const clinicalParameters = [
  {
    key: "EGFR",
    label: "eGFR",
    unit: "mL/min/1.73m²",
    color: "#095256",
    normalRange: { min: 60, max: 120 },
  },
  {
    key: "BP_SYSTOLIC",
    label: "BP Systolic",
    unit: "mmHg",
    color: "#087F8C",
    normalRange: { min: 90, max: 140 },
  },
  {
    key: "BP_DIASTOLIC",
    label: "BP Diastolic",
    unit: "mmHg",
    color: "#3F4785",
    normalRange: { min: 60, max: 90 },
  },
  {
    key: "HBA1C",
    label: "HbA1c",
    unit: "%",
    color: "#98C1B4",
    normalRange: { min: 4, max: 5.7 },
  },
  {
    key: "HEMOGLOBIN",
    label: "Hemoglobin",
    unit: "g/dL",
    color: "#B6E3E9",
    normalRange: { min: 12, max: 17 },
  },
  {
    key: "ALKALINE_PHOSPHATASE",
    label: "Alkaline Phosphatase",
    unit: "U/L",
    color: "#095256",
    normalRange: { min: 30, max: 120 },
  },
  {
    key: "ALT_SGPT",
    label: "ALT (SGPT)",
    unit: "U/L",
    color: "#087F8C",
    normalRange: { min: 7, max: 56 },
  },
  {
    key: "AST_SGOT",
    label: "AST (SGOT)",
    unit: "U/L",
    color: "#3F4785",
    normalRange: { min: 10, max: 40 },
  },
  {
    key: "CHOLESTEROL",
    label: "Total Cholesterol",
    unit: "mg/dL",
    color: "#98C1B4",
    normalRange: { min: 125, max: 200 },
  },
  {
    key: "LDL",
    label: "LDL Cholesterol",
    unit: "mg/dL",
    color: "#B6E3E9",
    normalRange: { min: 0, max: 100 },
  },
  {
    key: "HDL",
    label: "HDL Cholesterol",
    unit: "mg/dL",
    color: "#095256",
    normalRange: { min: 40, max: 60 },
  },
  {
    key: "TRIGLYCERIDES",
    label: "Triglycerides",
    unit: "mg/dL",
    color: "#087F8C",
    normalRange: { min: 0, max: 150 },
  },
  {
    key: "INR",
    label: "INR",
    unit: "",
    color: "#3F4785",
    normalRange: { min: 0.8, max: 1.2 },
  },
  {
    key: "TBIL",
    label: "Total Bilirubin",
    unit: "mg/dL",
    color: "#98C1B4",
    normalRange: { min: 0.1, max: 1.2 },
  },
  {
    key: "WT",
    label: "Weight",
    unit: "kg",
    color: "#B6E3E9",
    normalRange: { min: 50, max: 100 },
  },
  {
    key: "CREATINE_KINASE",
    label: "Creatine Kinase",
    unit: "U/L",
    color: "#095256",
    normalRange: { min: 22, max: 198 },
  },
  {
    key: "TROPONIN",
    label: "Troponin",
    unit: "ng/L",
    color: "#087F8C",
    normalRange: { min: 0, max: 14 },
  },
]

interface PatientVisitTrackingProps {
  onPatientSelect?: (patientId: string) => void
}

export function PatientVisitTracking({
  onPatientSelect,
}: PatientVisitTrackingProps = {}) {
  const { patients, getPatient, addVisit } = usePatients()
  const [selectedPatientId, setSelectedPatientId] = useState<string>("")
  const [searchInput, _setSearchInput] = useState<string>("")
  const [_selectedParameters, setSelectedParameters] = useState<string[]>([
    "EGFR",
    "BP_SYSTOLIC",
    "HBA1C",
  ])
  const [_showAddVisitDialog, setShowAddVisitDialog] = useState(false)
  const [newVisitData, setNewVisitData] = useState<Record<string, string>>({})
  const [open, setOpen] = useState(false)

  // Get patients with visit history
  const patientsWithVisits = patients.filter(
    (p) => p.visits && p.visits.length > 0,
  )

  // Default to first patient with visits
  const currentPatientId = selectedPatientId || patientsWithVisits[0]?.id || ""
  const currentPatient = patients.find((p) => p.id === currentPatientId)
  const visits = currentPatient?.visits || []

  // Notify parent component when patient changes
  useEffect(() => {
    if (currentPatientId && onPatientSelect) {
      onPatientSelect(currentPatientId)
    }
  }, [currentPatientId, onPatientSelect])

  // Handle search from Patient Vitals Monitor
  const _handleSearch = () => {
    const upperCaseInput = searchInput.toUpperCase()
    const patient = getPatient(upperCaseInput)
    if (patient) {
      setSelectedPatientId(upperCaseInput)
      if (patient.vitals) {
        toast.success(`Patient ${patient.name} loaded`)
      }
    } else {
      toast.error("Patient not found")
    }
  }

  // Get last visit date
  const getLastVisitDate = () => {
    if (visits.length > 0) {
      return new Date(visits[visits.length - 1].visitDate).toLocaleDateString(
        "en-US",
        {
          year: "numeric",
          month: "short",
          day: "numeric",
        },
      )
    }
    return "No visits recorded"
  }

  // Mock vitals history data for the vitals chart (simulating time-series data)
  const generateVitalsHistory = (vitals: any) => {
    if (!vitals) return []

    return [
      {
        time: "00:00",
        ...vitals,
        heartRate: vitals.heartRate - 3,
        oxygenSat: vitals.oxygenSat - 1,
      },
      {
        time: "04:00",
        ...vitals,
        heartRate: vitals.heartRate - 5,
        oxygenSat: vitals.oxygenSat - 2,
      },
      {
        time: "08:00",
        ...vitals,
        heartRate: vitals.heartRate + 1,
        oxygenSat: vitals.oxygenSat,
      },
      {
        time: "12:00",
        ...vitals,
        heartRate: vitals.heartRate + 3,
        oxygenSat: vitals.oxygenSat + 1,
      },
      {
        time: "16:00",
        ...vitals,
        heartRate: vitals.heartRate,
        oxygenSat: vitals.oxygenSat,
      },
      {
        time: "20:00",
        ...vitals,
        heartRate: vitals.heartRate - 2,
        oxygenSat: vitals.oxygenSat - 1,
      },
    ]
  }

  const _vitalsData = currentPatient?.vitals
    ? generateVitalsHistory(currentPatient.vitals)
    : []

  // Prepare chart data
  const _chartData = visits.map((visit) => {
    // Calculate patient age at visit time
    const visitDate = new Date(visit.visitDate)
    const today = new Date()
    const daysSinceVisit = Math.floor(
      (today.getTime() - visitDate.getTime()) / (1000 * 60 * 60 * 24),
    )
    const yearsSinceVisit = daysSinceVisit / 365.25
    const ageAtVisit = Math.floor((currentPatient?.age || 0) - yearsSinceVisit)

    const dataPoint: any = {
      visitNumber: `V${visit.visitNumber}`,
      date: new Date(visit.visitDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      ageAtVisit: ageAtVisit,
    }

    clinicalParameters.forEach((param) => {
      dataPoint[param.key] = visit[param.key as keyof ClinicalVisit]
    })

    return dataPoint
  })

  const _toggleParameter = (paramKey: string) => {
    setSelectedParameters((prev) =>
      prev.includes(paramKey)
        ? prev.filter((p) => p !== paramKey)
        : [...prev, paramKey],
    )
  }

  const _getTrend = (paramKey: string) => {
    if (visits.length < 2) return null
    const lastVisit = visits[visits.length - 1]
    const previousVisit = visits[visits.length - 2]
    const current = lastVisit[paramKey as keyof ClinicalVisit] as number
    const previous = previousVisit[paramKey as keyof ClinicalVisit] as number
    const change = ((current - previous) / previous) * 100

    return {
      direction: change > 0 ? "up" : "down",
      percentage: Math.abs(change).toFixed(1),
    }
  }

  const _handleAddVisit = () => {
    if (!currentPatientId) return

    const visitData: Omit<ClinicalVisit, "visitNumber"> = {
      visitDate: new Date(newVisitData.visitDate || new Date()),
      EGFR: parseFloat(newVisitData.EGFR || "0"),
      BP_SYSTOLIC: parseFloat(newVisitData.BP_SYSTOLIC || "0"),
      BP_DIASTOLIC: parseFloat(newVisitData.BP_DIASTOLIC || "0"),
      HBA1C: parseFloat(newVisitData.HBA1C || "0"),
      HEMOGLOBIN: parseFloat(newVisitData.HEMOGLOBIN || "0"),
      ALKALINE_PHOSPHATASE: parseFloat(
        newVisitData.ALKALINE_PHOSPHATASE || "0",
      ),
      ALT_SGPT: parseFloat(newVisitData.ALT_SGPT || "0"),
      AST_SGOT: parseFloat(newVisitData.AST_SGOT || "0"),
      CHOLESTEROL: parseFloat(newVisitData.CHOLESTEROL || "0"),
      LDL: parseFloat(newVisitData.LDL || "0"),
      HDL: parseFloat(newVisitData.HDL || "0"),
      TRIGLYCERIDES: parseFloat(newVisitData.TRIGLYCERIDES || "0"),
      INR: parseFloat(newVisitData.INR || "0"),
      TBIL: parseFloat(newVisitData.TBIL || "0"),
      WT: parseFloat(newVisitData.WT || "0"),
      CREATINE_KINASE: parseFloat(newVisitData.CREATINE_KINASE || "0"),
      TROPONIN: parseFloat(newVisitData.TROPONIN || "0"),
      notes: newVisitData.notes || "",
    }

    addVisit(currentPatientId, visitData)
    setShowAddVisitDialog(false)
    setNewVisitData({})
    toast.success("Visit added successfully")
  }

  if (patientsWithVisits.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="font-semibold text-healthcare-primary mb-4">
          Patient Visit Tracking
        </h3>
        <div className="text-center py-12 text-muted-foreground">
          <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No patients with visit history available</p>
          <p className="text-sm mt-2">
            Add visits to patients to track clinical trends
          </p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="flex items-center mb-6">
        <div className="p-2 bg-healthcare-primary/10 rounded-lg">
          <Activity className="h-6 w-6 text-healthcare-primary" />
        </div>
        <div className="ml-2">
          <h3 className="font-semibold text-healthcare-primary">
            Patient Visit Tracking & Vitals Monitor
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Search patient to view vitals and clinical visit history
          </p>
        </div>
      </div>

      {/* Patient Search Section */}
      <div className="mb-6">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between border-healthcare-light focus:border-healthcare-secondary hover:border-healthcare-secondary"
            >
              {currentPatientId
                ? patients.find((patient) => patient.id === currentPatientId)
                    ?.id
                : "Search or select patient..."}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <Command>
              <CommandInput placeholder="Search patient ID (e.g., PT001, PT002, PT003)..." />
              <CommandList>
                <CommandEmpty>No patient found.</CommandEmpty>
                <CommandGroup>
                  {patients.map((patient) => (
                    <CommandItem
                      key={patient.id}
                      value={patient.id}
                      onSelect={(value) => {
                        const selectedId = value.toUpperCase()
                        setSelectedPatientId(selectedId)
                        setOpen(false)
                        const selectedPatient = getPatient(selectedId)
                        if (selectedPatient?.vitals) {
                          toast.success(
                            `Patient ${selectedPatient.name} loaded`,
                          )
                        }
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          currentPatientId === patient.id
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                      />
                      {patient.id}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {currentPatient ? (
        <>
          {/* Full Width Patient Demographics Banner */}
          <div className="mb-6 p-5 bg-gradient-to-r from-healthcare-primary/10 to-healthcare-light/20 rounded-lg border border-healthcare-primary/30">
            <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Patient ID</p>
                <p className="font-semibold text-healthcare-primary text-lg">
                  {currentPatient.id}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Age</p>
                <p className="font-semibold">{currentPatient.age} years</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Gender</p>
                <p className="font-semibold">{currentPatient.gender}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Race</p>
                <p className="font-semibold">{currentPatient.race}</p>
              </div>
              {/* <div>
                <p className="text-xs text-muted-foreground mb-1">Ward</p>
                <p className="font-semibold">{currentPatient.ward}</p>
              </div> */}
              <div>
                <p className="text-xs text-muted-foreground mb-1">Last Visit</p>
                <p className="font-semibold">{getLastVisitDate()}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Status</p>
                <Badge
                  className={`
                  ${
                    currentPatient.status === "CKD" ||
                    currentPatient.status === "Fast Progression CKD"
                      ? "bg-alert-high"
                      : currentPatient.status === "Healthy"
                        ? "bg-alert-low"
                        : "bg-yellow-600"
                  } text-white
                `}
                >
                  {currentPatient.status || "Unknown"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Kidney Failure Risk Assessment - Full Width */}
          <SinglePatientKidneyRisk patientId={currentPatient.id} />
        </>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <Activity className="h-16 w-16 mx-auto mb-4 opacity-30" />
          <p className="font-semibold mb-2">No Patient Selected</p>
          <p className="text-sm">
            Search or select a patient to view vitals and visit history
          </p>
        </div>
      )}
    </Card>
  )
}
