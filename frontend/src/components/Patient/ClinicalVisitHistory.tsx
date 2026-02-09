import { Label } from "@radix-ui/react-label"
import { Activity, Filter, TrendingDown, TrendingUp } from "lucide-react"
import { useEffect, useState } from "react"
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { toast } from "sonner"
import { Card } from "@/components/ui/card"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { type ClinicalVisit, usePatients } from "@/contexts/PatientContext"
import { Button } from "../ui/button"
import { Input } from "../ui/input"

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
  patientId: string
}

export function ClinicalVisitHistory({ patientId }: PatientVisitTrackingProps) {
  const { patients, getPatient } = usePatients()
  const [selectedPatientId, setSelectedPatientId] = useState<string>("")
  const [searchInput, _setSearchInput] = useState<string>("")
  const [selectedParameters, setSelectedParameters] = useState<string[]>([
    "EGFR",
    "BP_SYSTOLIC",
    "HBA1C",
  ])
  const [_showAddVisitDialog, _setShowAddVisitDialog] = useState(false)
  const [_newVisitData, _setNewVisitData] = useState<Record<string, string>>({})
  const [_open, _setOpen] = useState(false)

  // Date range filtration state
  const [dateRange, setDateRange] = useState<
    "3months" | "6months" | "1year" | "all" | "custom"
  >("all")
  const [customStartDate, setCustomStartDate] = useState<string>("")
  const [customEndDate, setCustomEndDate] = useState<string>("")
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false)

  // View all visits dialog state
  const [_showAllVisitsDialog, _setShowAllVisitsDialog] = useState(false)

  // Pagination state
  const [_currentPage, _setCurrentPage] = useState(1)
  const _visitsPerPage = 5

  // Get patients with visit history
  const patientsWithVisits = patients.filter(
    (p) => p.visits && p.visits.length > 0,
  )

  // Default to first patient with visits
  const currentPatientId =
    patientId || selectedPatientId || patientsWithVisits[0]?.id || ""
  const currentPatient = patients.find((p) => p.id === currentPatientId)
  const visits = currentPatient?.visits || []

  // Notify parent component when patient changes
  useEffect(() => {}, [])

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
  const _getLastVisitDate = () => {
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

  // Filter visits based on date range
  const getFilteredVisits = () => {
    if (dateRange === "all") return visits

    const now = new Date()
    let startDate: Date

    switch (dateRange) {
      case "3months":
        startDate = new Date(
          now.getFullYear(),
          now.getMonth() - 3,
          now.getDate(),
        )
        break
      case "6months":
        startDate = new Date(
          now.getFullYear(),
          now.getMonth() - 6,
          now.getDate(),
        )
        break
      case "1year":
        startDate = new Date(
          now.getFullYear() - 1,
          now.getMonth(),
          now.getDate(),
        )
        break
      case "custom": {
        if (!customStartDate) return visits
        startDate = new Date(customStartDate)
        const endDate = customEndDate ? new Date(customEndDate) : now
        return visits.filter((visit) => {
          const visitDate = new Date(visit.visitDate)
          return visitDate >= startDate && visitDate <= endDate
        })
      }
      default:
        return visits
    }

    return visits.filter((visit) => new Date(visit.visitDate) >= startDate)
  }

  const filteredVisits = getFilteredVisits()

  // Prepare chart data
  const chartData = filteredVisits.map((visit) => {
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

  const toggleParameter = (paramKey: string) => {
    setSelectedParameters((prev) =>
      prev.includes(paramKey)
        ? prev.filter((p) => p !== paramKey)
        : [...prev, paramKey],
    )
  }

  const getTrend = (paramKey: string) => {
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

  if (!currentPatient) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-semibold text-healthcare-primary">
              Clinical Visit History & Trends Chart
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Select a patient to view clinical parameter trends over time
            </p>
          </div>
        </div>
        <div className="text-center py-16 text-muted-foreground">
          <Activity className="h-16 w-16 mx-auto mb-4 opacity-30" />
          <p className="font-semibold mb-2">No Patient Selected</p>
          <p className="text-sm">
            Search or select a patient from the Patient Visit Tracking section
            above
          </p>
        </div>
      </Card>
    )
  }

  if (visits.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-semibold text-healthcare-primary">
              Clinical Visit History & Trends Chart
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Patient: {currentPatient.id}
            </p>
          </div>
        </div>
        <div className="text-center py-12 text-muted-foreground border rounded-lg bg-gray-50">
          <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="font-semibold mb-2">No Clinical Visit History</p>
          <p className="text-sm">This patient has no recorded visits yet.</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center justify-between">
          {/* ICON + HEADER TITLE */}
          <div className="p-2 bg-healthcare-primary/10 rounded-lg">
            <Activity className="h-6 w-6 text-healthcare-primary" />
          </div>
          <div className="ml-2">
            <h3 className="font-semibold text-healthcare-primary">
              Clinical Visit History & Trends Chart
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Patient: {currentPatient.id} - Tracking {visits.length} clinical
              visits
            </p>
          </div>
        </div>
        {/* <Button
          onClick={() => setShowAddVisitDialog(true)}
          size="sm"
          disabled={!currentPatient}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Visit
        </Button> */}
      </div>

      {/* Clinical Visit History & Trends Chart */}
      {visits.length > 0 && (
        <div className="mb-6 border rounded-lg bg-white overflow-hidden shadow-sm">
          {/* Visit Summary Stats Header */}
          <div className="bg-healthcare-primary/5 p-4 border-b">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-healthcare-primary">
                Clinical Visit History & Parameter Trends
              </h4>

              {/* Date Range Filter Popover */}
              <Popover
                open={filterPopoverOpen}
                onOpenChange={setFilterPopoverOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-healthcare-primary/30 hover:bg-healthcare-primary/5 text-xs"
                  >
                    <Filter className="h-3.5 w-3.5 mr-1.5" />
                    {dateRange === "all"
                      ? "All Time"
                      : dateRange === "3months"
                        ? "3 Months"
                        : dateRange === "6months"
                          ? "6 Months"
                          : dateRange === "1year"
                            ? "1 Year"
                            : "Custom"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4" align="end">
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-sm text-healthcare-primary mb-2">
                        Date Range Filter
                      </h4>
                      <p className="text-xs text-muted-foreground mb-3">
                        Filter visits by time period
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setDateRange("3months")
                          setFilterPopoverOpen(false)
                        }}
                        className={`px-3 py-2 rounded-md text-xs transition-all ${
                          dateRange === "3months"
                            ? "bg-healthcare-primary text-white"
                            : "bg-gray-100 hover:bg-gray-200 text-healthcare-primary"
                        }`}
                      >
                        3 Months
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDateRange("6months")
                          setFilterPopoverOpen(false)
                        }}
                        className={`px-3 py-2 rounded-md text-xs transition-all ${
                          dateRange === "6months"
                            ? "bg-healthcare-primary text-white"
                            : "bg-gray-100 hover:bg-gray-200 text-healthcare-primary"
                        }`}
                      >
                        6 Months
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDateRange("1year")
                          setFilterPopoverOpen(false)
                        }}
                        className={`px-3 py-2 rounded-md text-xs transition-all ${
                          dateRange === "1year"
                            ? "bg-healthcare-primary text-white"
                            : "bg-gray-100 hover:bg-gray-200 text-healthcare-primary"
                        }`}
                      >
                        1 Year
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setDateRange("all")
                          setFilterPopoverOpen(false)
                        }}
                        className={`px-3 py-2 rounded-md text-xs transition-all ${
                          dateRange === "all"
                            ? "bg-healthcare-primary text-white"
                            : "bg-gray-100 hover:bg-gray-200 text-healthcare-primary"
                        }`}
                      >
                        All Time
                      </button>
                    </div>

                    <div className="pt-2 border-t">
                      <button
                        type="button"
                        onClick={() => setDateRange("custom")}
                        className={`w-full px-3 py-2 rounded-md text-xs transition-all mb-2 ${
                          dateRange === "custom"
                            ? "bg-healthcare-primary text-white"
                            : "bg-gray-100 hover:bg-gray-200 text-healthcare-primary"
                        }`}
                      >
                        Custom Range
                      </button>

                      {dateRange === "custom" && (
                        <div className="space-y-2">
                          <div>
                            <Label
                              htmlFor="popoverCustomStart"
                              className="text-xs"
                            >
                              Start Date
                            </Label>
                            <Input
                              id="popoverCustomStart"
                              type="date"
                              value={customStartDate}
                              onChange={(e) =>
                                setCustomStartDate(e.target.value)
                              }
                              className="text-xs h-8 mt-1"
                            />
                          </div>
                          <div>
                            <Label
                              htmlFor="popoverCustomEnd"
                              className="text-xs"
                            >
                              End Date
                            </Label>
                            <Input
                              id="popoverCustomEnd"
                              type="date"
                              value={customEndDate}
                              onChange={(e) => setCustomEndDate(e.target.value)}
                              className="text-xs h-8 mt-1"
                            />
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            className="w-full text-xs"
                            onClick={() => setFilterPopoverOpen(false)}
                          >
                            Apply Filter
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid grid-cols-4 gap-3">
              <div className="text-center bg-white rounded-lg py-2 px-3">
                <p className="text-xs text-muted-foreground mb-1">
                  Total Visits
                </p>
                <p className="font-semibold text-xl text-healthcare-primary">
                  {filteredVisits.length}
                </p>
              </div>
              <div className="text-center bg-white rounded-lg py-2 px-3">
                <p className="text-xs text-muted-foreground mb-1">
                  First Visit
                </p>
                <p className="font-semibold text-xs">
                  {filteredVisits.length > 0
                    ? new Date(filteredVisits[0].visitDate).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        },
                      )
                    : "N/A"}
                </p>
              </div>
              <div className="text-center bg-white rounded-lg py-2 px-3">
                <p className="text-xs text-muted-foreground mb-1">
                  Latest Visit
                </p>
                <p className="font-semibold text-xs">
                  {filteredVisits.length > 0
                    ? new Date(
                        filteredVisits[filteredVisits.length - 1].visitDate,
                      ).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "N/A"}
                </p>
              </div>
              <div className="text-center bg-white rounded-lg py-2 px-3">
                <p className="text-xs text-muted-foreground mb-1">
                  Tracking Period
                </p>
                <p className="font-semibold text-xs">
                  {filteredVisits.length > 0
                    ? `${Math.ceil(
                        (new Date(
                          filteredVisits[filteredVisits.length - 1].visitDate,
                        ).getTime() -
                          new Date(filteredVisits[0].visitDate).getTime()) /
                          (1000 * 60 * 60 * 24),
                      )} days`
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Parameter Selection */}
          <div className="p-4 bg-healthcare-light/10 border-b">
            <p className="text-xs font-semibold text-healthcare-primary mb-2">
              Select Clinical Parameters to Track:
            </p>
            <div className="flex flex-wrap gap-1">
              {clinicalParameters.map((param) => {
                const trend = getTrend(param.key)
                const isSelected = selectedParameters.includes(param.key)
                return (
                  <button
                    type="button"
                    key={param.key}
                    onClick={() => toggleParameter(param.key)}
                    className={`
                          px-2 py-1 rounded-lg border text-xs transition-all
                          ${
                            isSelected
                              ? "bg-healthcare-primary text-white border-healthcare-primary"
                              : "bg-white border-gray-200 hover:border-healthcare-primary"
                          }
                        `}
                  >
                    <div className="flex items-center gap-1">
                      <span>{param.label}</span>
                      {trend && isSelected && (
                        <span className="flex items-center gap-0.5">
                          {trend.direction === "up" ? (
                            <TrendingUp className="h-2.5 w-2.5" />
                          ) : (
                            <TrendingDown className="h-2.5 w-2.5" />
                          )}
                          <span className="text-[10px]">
                            {trend.percentage}%
                          </span>
                        </span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Chart Section */}
          {selectedParameters.length > 0 && (
            <div className="p-6">
              <div className="mb-3 flex flex-wrap gap-2 text-xs hidden">
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 bg-green-500/20 border border-green-500/40 rounded" />
                  <span className="text-muted-foreground">Normal Range</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-4 h-4 bg-red-500/20 border border-red-500/40 rounded" />
                  <span className="text-muted-foreground">Out of Range</span>
                </div>
              </div>
              <div className="h-[500px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 20, right: 40, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#B6E3E9" />

                    {/* Add reference zones for normal ranges */}
                    {selectedParameters.length === 1 &&
                      (() => {
                        const param = clinicalParameters.find(
                          (p) => p.key === selectedParameters[0],
                        )
                        if (!param) return null

                        // Calculate chart Y-axis range
                        const values = chartData
                          .map((d) => d[param.key])
                          .filter((v) => v != null)
                        const minValue = Math.min(...values)
                        const maxValue = Math.max(...values)
                        const chartMin =
                          Math.min(minValue, param.normalRange.min) - 5
                        const chartMax =
                          Math.max(maxValue, param.normalRange.max) + 5

                        return (
                          <>
                            {/* Below Normal Zone (Red) */}
                            {chartMin < param.normalRange.min && (
                              <ReferenceArea
                                y1={chartMin}
                                y2={param.normalRange.min}
                                fill="#ef4444"
                                fillOpacity={0.1}
                                stroke="#ef4444"
                                strokeOpacity={0.3}
                                strokeDasharray="3 3"
                              />
                            )}

                            {/* Normal Zone (Green) */}
                            <ReferenceArea
                              y1={param.normalRange.min}
                              y2={param.normalRange.max}
                              fill="#22c55e"
                              fillOpacity={0.1}
                              stroke="#22c55e"
                              strokeOpacity={0.3}
                              strokeDasharray="3 3"
                            />

                            {/* Above Normal Zone (Red) */}
                            {chartMax > param.normalRange.max && (
                              <ReferenceArea
                                y1={param.normalRange.max}
                                y2={chartMax}
                                fill="#ef4444"
                                fillOpacity={0.1}
                                stroke="#ef4444"
                                strokeOpacity={0.3}
                                strokeDasharray="3 3"
                              />
                            )}
                          </>
                        )
                      })()}

                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#095256", fontSize: 11 }}
                      label={{
                        value: "Visit Date",
                        position: "insideBottom",
                        offset: -10,
                        fill: "#095256",
                        fontSize: 12,
                      }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#095256", fontSize: 11 }}
                      domain={
                        selectedParameters.length === 1
                          ? ["auto", "auto"]
                          : undefined
                      }
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #B6E3E9",
                        borderRadius: "8px",
                        fontSize: "11px",
                        padding: "12px",
                      }}
                      formatter={(value: number, name: string) => {
                        const param = clinicalParameters.find(
                          (p) => p.key === name,
                        )
                        const isNormal =
                          param &&
                          value >= param.normalRange.min &&
                          value <= param.normalRange.max
                        const status = isNormal ? "✓ Normal" : "⚠ Out of Range"
                        return [
                          `${value} ${param?.unit || ""} ${status}`,
                          param?.label || name,
                        ]
                      }}
                      labelFormatter={(label, payload) => {
                        if (payload && payload.length > 0) {
                          const ageAtVisit = payload[0].payload.ageAtVisit
                          return `Date: ${label} | Age: ${ageAtVisit} years`
                        }
                        return `Date: ${label}`
                      }}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: "11px", paddingTop: "15px" }}
                      formatter={(value: string) => {
                        const param = clinicalParameters.find(
                          (p) => p.key === value,
                        )
                        return `${param?.label} (${param?.unit})`
                      }}
                    />
                    {selectedParameters.map((paramKey) => {
                      const param = clinicalParameters.find(
                        (p) => p.key === paramKey,
                      )
                      return (
                        <Line
                          key={paramKey}
                          type="monotone"
                          dataKey={paramKey}
                          stroke={param?.color}
                          strokeWidth={3}
                          dot={{ fill: param?.color, r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      )
                    })}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Visit Records Table - Separate Section */}
      {visits.length > 0 && (
        <div className="border rounded-lg overflow-hidden shadow-sm">
          <div className="bg-healthcare-primary/5 px-4 py-3 border-b">
            <h4 className="font-semibold text-healthcare-primary">
              Visit Records
            </h4>
            <p className="text-xs text-muted-foreground mt-1">
              Detailed visit history with clinical measurements
            </p>
          </div>
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="bg-healthcare-primary/5 sticky top-0">
                <tr>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-healthcare-primary">
                    Visit #
                  </th>
                  <th className="text-left py-2 px-3 text-xs font-semibold text-healthcare-primary">
                    Date
                  </th>
                  <th className="text-center py-2 px-2 text-xs font-semibold text-healthcare-primary">
                    Age
                  </th>
                  {selectedParameters.slice(0, 3).map((paramKey) => {
                    const param = clinicalParameters.find(
                      (p) => p.key === paramKey,
                    )
                    return (
                      <th
                        key={paramKey}
                        className="text-center py-2 px-2 text-xs font-semibold text-healthcare-primary"
                      >
                        {param?.label}
                        <br />
                        <span className="font-normal text-muted-foreground text-[10px]">
                          ({param?.unit})
                        </span>
                      </th>
                    )
                  })}
                </tr>
              </thead>
              <tbody>
                {visits.map((visit, _index) => {
                  // Calculate patient age at visit time
                  const visitDate = new Date(visit.visitDate)
                  const today = new Date()
                  const daysSinceVisit = Math.floor(
                    (today.getTime() - visitDate.getTime()) /
                      (1000 * 60 * 60 * 24),
                  )
                  const yearsSinceVisit = daysSinceVisit / 365.25
                  const ageAtVisit = Math.floor(
                    (currentPatient?.age || 0) - yearsSinceVisit,
                  )

                  return (
                    <tr
                      key={visit.visitNumber}
                      className="border-t hover:bg-gray-50"
                    >
                      <td className="py-2 px-3 font-semibold">
                        {visit.visitNumber}
                      </td>
                      <td className="py-2 px-3 text-[10px]">
                        {new Date(visit.visitDate).toLocaleDateString("en-US", {
                          year: "2-digit",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="py-2 px-2 text-center text-[10px] text-muted-foreground">
                        {ageAtVisit} yrs
                      </td>
                      {selectedParameters.slice(0, 3).map((paramKey) => {
                        const param = clinicalParameters.find(
                          (p) => p.key === paramKey,
                        )
                        const value = visit[
                          paramKey as keyof ClinicalVisit
                        ] as number
                        const isNormal =
                          param &&
                          value >= param.normalRange.min &&
                          value <= param.normalRange.max
                        return (
                          <td
                            key={paramKey}
                            className={`py-2 px-2 text-center font-semibold ${
                              isNormal ? "text-alert-low" : "text-alert-high"
                            }`}
                          >
                            {value}
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Visit Dialog */}
      {/* {showAddVisitDialog && (
        <AddVisitDialog
          currentPatient={currentPatient}
          clinicalParameters={clinicalParameters}
          handleAddVisit={handleAddVisit}
        />
      )} */}
    </Card>
  )
}
