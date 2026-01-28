import {
  Activity,
  Calendar,
  Filter,
  Plus,
  Search,
  TrendingDown,
  Users,
  X,
} from "lucide-react"
import { useEffect, useState } from "react"
import {
  Area,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { usePatients } from "@/contexts/PatientContext"

interface PatientEGFRTrajectoryProps {
  primaryPatientId?: string
}

// Scenario decline rates (mL/min/year)
const SCENARIO_DECLINE_RATES = {
  ckd: -2.5, // Standard CKD progression
  fastCkd: -5.0, // Rapid CKD progression
  healthyAging: -0.75, // Normal age-related decline
}

// Scenario colors
const SCENARIO_COLORS = {
  ckd: "#1C7ED6", // Blue
  fastCkd: "#F59F00", // Orange
  healthyAging: "#37A27F", // Green
}

export function PatientEGFRTrajectory({
  primaryPatientId,
}: PatientEGFRTrajectoryProps) {
  const { patients } = usePatients()
  const [selectedPatientIds, setSelectedPatientIds] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [dateRange, setDateRange] = useState<
    "all" | "3months" | "6months" | "1year" | "custom"
  >("all")
  const [customStartDate, setCustomStartDate] = useState<string>("")
  const [customEndDate, setCustomEndDate] = useState<string>("")

  // New states for prediction and scenario management
  const [showPredictions, setShowPredictions] = useState(true)
  const [predictionYears, setPredictionYears] = useState(10)
  const [showScenarios, setShowScenarios] = useState(false)
  const [selectedScenarios, setSelectedScenarios] = useState<
    ("ckd" | "fastCkd" | "healthyAging")[]
  >(["ckd"])

  // Initialize with primary patient if provided
  useEffect(() => {
    if (primaryPatientId) {
      setSelectedPatientIds((prev) => {
        // Only add if not already in the list
        if (!prev.includes(primaryPatientId)) {
          return [primaryPatientId]
        }
        return prev
      })
    }
  }, [primaryPatientId])

  // Filter patients with visit data
  const patientsWithVisits = patients.filter(
    (p) => p.visits && p.visits.length > 0,
  )

  // Searched patients for selector
  const searchedPatients = patientsWithVisits.filter((patient) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      patient.name.toLowerCase().includes(query) ||
      patient.id.toLowerCase().includes(query)
    )
  })

  // Get selected patients
  const selectedPatients = patients.filter((p) =>
    selectedPatientIds.includes(p.id),
  )

  // Toggle patient selection
  const togglePatientSelection = (patientId: string) => {
    setSelectedPatientIds((prev) =>
      prev.includes(patientId)
        ? prev.filter((id) => id !== patientId)
        : [...prev, patientId],
    )
  }

  // Remove patient
  const removePatient = (patientId: string) => {
    setSelectedPatientIds((prev) => prev.filter((id) => id !== patientId))
  }

  // Toggle scenario
  const toggleScenario = (scenario: "ckd" | "fastCkd" | "healthyAging") => {
    setSelectedScenarios((prev) =>
      prev.includes(scenario)
        ? prev.filter((s) => s !== scenario)
        : [...prev, scenario],
    )
  }

  // Calculate date range boundaries
  const getDateRangeBoundaries = () => {
    const now = new Date()
    let startDate: Date | null = null
    let endDate: Date = now

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
      case "custom":
        if (customStartDate) startDate = new Date(customStartDate)
        if (customEndDate) endDate = new Date(customEndDate)
        break
      default:
        startDate = null
        break
    }

    return { startDate, endDate }
  }

  const { startDate, endDate } = getDateRangeBoundaries()

  // Filter visits based on date range
  const isVisitInDateRange = (visitDate: Date) => {
    if (!startDate) return true // 'all' selected
    return visitDate >= startDate && visitDate <= endDate
  }

  // Patient colors for chart
  const patientColors = [
    "#087F8C", // healthcare-secondary
    "#3F4785", // purple
    "#e11d48", // rose-600
    "#ea580c", // orange-600
    "#16a34a", // green-600
    "#9333ea", // purple-600
    "#0891b2", // cyan-600
    "#dc2626", // red-600
  ]

  // Generate prediction data for a patient
  const generatePredictions = (
    lastObservedAge: number,
    lastObservedEGFR: number,
    declineRate: number,
    years: number,
  ) => {
    const predictions = []

    // Start from i = 0 to include the current age as the first prediction point
    for (let i = 0; i <= years; i++) {
      const futureAge = lastObservedAge + i
      const predictedEGFR = Math.max(5, lastObservedEGFR + declineRate * i)

      // Calculate expanding uncertainty bounds
      // Uncertainty increases with time (year 0: ±3%, year 10: ±25%)
      const uncertaintyPercent = i === 0 ? 0.03 : 0.05 + (i / years) * 0.2
      const uncertaintyLower = Math.max(
        0,
        predictedEGFR * (1 - uncertaintyPercent),
      )
      const uncertaintyUpper = Math.min(
        180,
        predictedEGFR * (1 + uncertaintyPercent),
      )

      predictions.push({
        age: futureAge,
        eGFR: predictedEGFR,
        uncertaintyLower,
        uncertaintyUpper,
        isPredicted: true,
      })
    }

    return predictions
  }

  // Prepare chart data
  const chartData: any[] = []

  selectedPatients.forEach((patient, patientIndex) => {
    if (!patient.visits) return

    // Sort visits by date
    const sortedVisits = [...patient.visits].sort(
      (a, b) =>
        new Date(a.visitDate).getTime() - new Date(b.visitDate).getTime(),
    )

    patient.visits.forEach((visit) => {
      if (!visit.EGFR) return

      // Calculate age at visit based on visit date
      const visitDate = new Date(visit.visitDate)

      // Apply date range filter
      if (!isVisitInDateRange(visitDate)) return

      const now = new Date()
      const patientBirthYear = now.getFullYear() - patient.age
      const ageAtVisit = visitDate.getFullYear() - patientBirthYear

      // Observed data has minimal uncertainty
      const eGFRValue = visit.EGFR
      const uncertaintyPercent = 0.03 // 3% measurement uncertainty
      const uncertaintyLower = Math.max(0, eGFRValue * (1 - uncertaintyPercent))
      const uncertaintyUpper = Math.min(
        180,
        eGFRValue * (1 + uncertaintyPercent),
      )

      chartData.push({
        patientId: patient.id,
        patientName: patient.name,
        age: ageAtVisit,
        eGFR: eGFRValue,
        visitDate: visitDate,
        uncertaintyLower,
        uncertaintyUpper,
        date: new Date(visit.visitDate).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        color: patientColors[patientIndex % patientColors.length],
        isPredicted: false,
        isObserved: true,
      })
    })

    // Generate predictions if enabled
    if (showPredictions && sortedVisits.length > 0) {
      const lastVisit = sortedVisits[sortedVisits.length - 1]
      if (!lastVisit.EGFR) return

      // Use patient's actual current age for starting scenarios
      const now = new Date()
      const patientBirthYear = now.getFullYear() - patient.age
      const currentAge = now.getFullYear() - patientBirthYear

      if (showScenarios) {
        // Generate predictions for each scenario starting from current age
        selectedScenarios.forEach((scenario) => {
          const declineRate = SCENARIO_DECLINE_RATES[scenario]
          const predictions = generatePredictions(
            currentAge,
            lastVisit.EGFR,
            declineRate,
            predictionYears,
          )

          predictions.forEach((pred) => {
            chartData.push({
              patientId: `${patient.id}_${scenario}`,
              patientName: patient.name,
              scenario,
              scenarioName:
                scenario === "ckd"
                  ? "CKD"
                  : scenario === "fastCkd"
                    ? "Fast CKD"
                    : "Healthy Aging",
              age: pred.age,
              eGFR: pred.eGFR,
              uncertaintyLower: pred.uncertaintyLower,
              uncertaintyUpper: pred.uncertaintyUpper,
              color: SCENARIO_COLORS[scenario],
              isPredicted: true,
              isObserved: false,
            })
          })
        })
      } else {
        // Generate single prediction using CKD decline rate starting from current age
        const predictions = generatePredictions(
          currentAge,
          lastVisit.EGFR,
          SCENARIO_DECLINE_RATES.ckd,
          predictionYears,
        )

        predictions.forEach((pred) => {
          chartData.push({
            patientId: patient.id,
            patientName: patient.name,
            age: pred.age,
            eGFR: pred.eGFR,
            uncertaintyLower: pred.uncertaintyLower,
            uncertaintyUpper: pred.uncertaintyUpper,
            color: patientColors[patientIndex % patientColors.length],
            isPredicted: true,
            isObserved: false,
          })
        })
      }
    }
  })

  // Sort by age for better line rendering
  chartData.sort((a, b) => a.age - b.age)

  // Group data by patient/scenario for proper line rendering
  const patientDataMap = new Map<string, any[]>()
  chartData.forEach((point) => {
    const key = point.scenario ? point.patientId : point.patientId
    if (!patientDataMap.has(key)) {
      patientDataMap.set(key, [])
    }
    patientDataMap.get(key)!.push(point)
  })

  // Create merged data points for all ages with standard age labels
  const allAges = [...new Set(chartData.map((d) => d.age))].sort(
    (a, b) => a - b,
  )

  // Generate age range for X-axis (standard labels: 37, 40, 45, 50, 55, 60, 65, 70)
  const minAge = Math.min(...allAges)
  const maxAge = Math.max(...allAges)
  const standardAges = [37, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90].filter(
    (age) => age >= minAge - 5 && age <= maxAge + 5,
  )

  // Combine all ages (actual data points + standard labels)
  const combinedAges = [...new Set([...allAges, ...standardAges])].sort(
    (a, b) => a - b,
  )

  const mergedChartData = combinedAges.map((age) => {
    const dataPoint: any = { age }

    // For scenario mode
    if (showScenarios) {
      selectedPatients.forEach((patient) => {
        // Get observed data for this patient
        const observedData = chartData.filter(
          (d) => d.patientId === patient.id && d.isObserved && d.age === age,
        )

        if (observedData.length > 0) {
          const observed = observedData[0]
          dataPoint[`${patient.id}_observed`] = observed.eGFR
          dataPoint[`${patient.id}_observed_lower`] = observed.uncertaintyLower
          dataPoint[`${patient.id}_observed_upper`] = observed.uncertaintyUpper
        }

        // Get scenario predictions (only from lastObservedAge forward)
        selectedScenarios.forEach((scenario) => {
          const scenarioKey = `${patient.id}_${scenario}`
          const scenarioData = patientDataMap.get(scenarioKey) || []
          const ageData = scenarioData.find((d) => d.age === age)

          // Only show scenario data from present age forward
          const lastObserved = Math.max(
            ...chartData
              .filter((d) => d.isObserved && d.patientId === patient.id)
              .map((d) => d.age),
          )

          if (ageData && age >= lastObserved) {
            dataPoint[scenarioKey] = ageData.eGFR
            dataPoint[`${scenarioKey}_lower`] = ageData.uncertaintyLower
            dataPoint[`${scenarioKey}_upper`] = ageData.uncertaintyUpper
          }
        })
      })
    } else {
      // Regular mode - single patient trajectories
      selectedPatients.forEach((patient) => {
        const patientData = patientDataMap.get(patient.id) || []
        const ageData = patientData.find((d) => d.age === age)
        if (ageData) {
          dataPoint[patient.id] = ageData.eGFR
          dataPoint[`${patient.id}_date`] = ageData.date
          dataPoint[`${patient.id}_lower`] = ageData.uncertaintyLower
          dataPoint[`${patient.id}_upper`] = ageData.uncertaintyUpper
          dataPoint[`${patient.id}_isPredicted`] = ageData.isPredicted
        }
      })
    }

    return dataPoint
  })

  // Calculate current age for "Present" reference line
  // Use the actual current age of the patient, not the last visit age
  const getCurrentAge = (patient: any) => {
    const now = new Date()
    const patientBirthYear = now.getFullYear() - patient.age
    return now.getFullYear() - patientBirthYear
  }

  // Find the current age (present) - use the first selected patient's current age
  const lastObservedAge =
    selectedPatients.length > 0
      ? getCurrentAge(selectedPatients[0])
      : Math.max(...chartData.filter((d) => d.isObserved).map((d) => d.age))

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-healthcare-secondary/10 rounded-lg">
            <TrendingDown className="h-6 w-6 text-healthcare-secondary" />
          </div>
          <div>
            <h3 className="font-semibold text-healthcare-primary">
              Kidney Failure Risk Assessment
            </h3>
            <p className="text-sm text-muted-foreground">
              Visualize kidney function decline with AI-powered future
              projections
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          {/* Prediction Settings */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
                <Activity className="h-4 w-4 mr-2" />
                Predictions
                {showPredictions && (
                  <Badge className="ml-2 bg-green-600 text-white">On</Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96 p-0" align="end">
              <div className="p-4 border-b bg-healthcare-secondary/5">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-healthcare-secondary" />
                  <div>
                    <p className="font-semibold text-sm text-healthcare-primary">
                      Prediction Settings
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Configure AI trajectory forecasting
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 space-y-4">
                {/* Enable Predictions Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-healthcare-primary">
                      Enable Predictions
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Show future trajectory forecasts
                    </p>
                  </div>
                  <Switch
                    checked={showPredictions}
                    onCheckedChange={setShowPredictions}
                  />
                </div>

                {showPredictions && (
                  <>
                    {/* Prediction Years */}
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground block mb-2">
                        Prediction Horizon: {predictionYears} years
                      </label>
                      <input
                        type="range"
                        min="5"
                        max="20"
                        step="5"
                        value={predictionYears}
                        onChange={(e) =>
                          setPredictionYears(Number(e.target.value))
                        }
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>5 years</span>
                        <span>20 years</span>
                      </div>
                    </div>

                    {/* Scenario Mode Toggle */}
                    <div className="pt-3 border-t">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-sm font-semibold text-healthcare-primary">
                            Scenario Comparison
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Compare different progression rates
                          </p>
                        </div>
                        <Switch
                          checked={showScenarios}
                          onCheckedChange={setShowScenarios}
                        />
                      </div>

                      {showScenarios && (
                        <div className="space-y-2 mt-3 p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs font-semibold text-muted-foreground mb-2">
                            Select Scenarios:
                          </p>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded"
                                style={{
                                  backgroundColor: SCENARIO_COLORS.ckd,
                                }}
                              />
                              <label className="text-sm">
                                CKD (-2.5 mL/min/yr)
                              </label>
                            </div>
                            <Checkbox
                              checked={selectedScenarios.includes("ckd")}
                              onCheckedChange={() => toggleScenario("ckd")}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded"
                                style={{
                                  backgroundColor: SCENARIO_COLORS.fastCkd,
                                }}
                              />
                              <label className="text-sm">
                                Fast CKD (-5.0 mL/min/yr)
                              </label>
                            </div>
                            <Checkbox
                              checked={selectedScenarios.includes("fastCkd")}
                              onCheckedChange={() => toggleScenario("fastCkd")}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded"
                                style={{
                                  backgroundColor: SCENARIO_COLORS.healthyAging,
                                }}
                              />
                              <label className="text-sm">
                                Healthy Aging (-0.75 mL/min/yr)
                              </label>
                            </div>
                            <Checkbox
                              checked={selectedScenarios.includes(
                                "healthyAging",
                              )}
                              onCheckedChange={() =>
                                toggleScenario("healthyAging")
                              }
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </PopoverContent>
          </Popover>

          {/* Date Range Filter Button */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
                <Filter className="h-4 w-4 mr-2" />
                Date Range
                {dateRange !== "all" && (
                  <Badge className="ml-2 bg-healthcare-secondary text-white">
                    {dateRange === "custom"
                      ? "Custom"
                      : dateRange === "3months"
                        ? "3M"
                        : dateRange === "6months"
                          ? "6M"
                          : "1Y"}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96 p-0" align="end">
              <div className="p-4 border-b bg-healthcare-secondary/5">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-healthcare-secondary" />
                  <div>
                    <p className="font-semibold text-sm text-healthcare-primary">
                      Filter by Date Range
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Select time period for visit analysis
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4">
                {/* Preset Buttons */}
                <div className="flex flex-col gap-2">
                  <Button
                    variant={dateRange === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setDateRange("all")}
                    className={`justify-start ${dateRange === "all" ? "bg-healthcare-secondary hover:bg-healthcare-secondary/90" : ""}`}
                  >
                    All Time
                  </Button>
                  <Button
                    variant={dateRange === "3months" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setDateRange("3months")}
                    className={`justify-start ${dateRange === "3months" ? "bg-healthcare-secondary hover:bg-healthcare-secondary/90" : ""}`}
                  >
                    Last 3 Months
                  </Button>
                  <Button
                    variant={dateRange === "6months" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setDateRange("6months")}
                    className={`justify-start ${dateRange === "6months" ? "bg-healthcare-secondary hover:bg-healthcare-secondary/90" : ""}`}
                  >
                    Last 6 Months
                  </Button>
                  <Button
                    variant={dateRange === "1year" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setDateRange("1year")}
                    className={`justify-start ${dateRange === "1year" ? "bg-healthcare-secondary hover:bg-healthcare-secondary/90" : ""}`}
                  >
                    Last Year
                  </Button>
                  <Button
                    variant={dateRange === "custom" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setDateRange("custom")}
                    className={`justify-start ${dateRange === "custom" ? "bg-healthcare-secondary hover:bg-healthcare-secondary/90" : ""}`}
                  >
                    Custom Range
                  </Button>
                </div>

                {/* Custom Date Inputs */}
                {dateRange === "custom" && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground block mb-1">
                          Start Date
                        </label>
                        <Input
                          type="date"
                          value={customStartDate}
                          onChange={(e) => setCustomStartDate(e.target.value)}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground block mb-1">
                          End Date
                        </label>
                        <Input
                          type="date"
                          value={customEndDate}
                          onChange={(e) => setCustomEndDate(e.target.value)}
                          className="h-8 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Active Filter Display */}
                {dateRange !== "all" && (
                  <div className="mt-4 pt-3 border-t">
                    <div className="text-xs text-muted-foreground">
                      <span className="font-semibold">Active Filter:</span>
                      <div className="mt-1 flex items-center gap-2">
                        <Badge variant="outline" className="bg-white">
                          {dateRange === "custom" &&
                          customStartDate &&
                          customEndDate
                            ? `${new Date(customStartDate).toLocaleDateString()} - ${new Date(customEndDate).toLocaleDateString()}`
                            : startDate
                              ? `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
                              : "Select dates"}
                        </Badge>
                      </div>
                      <p className="mt-2 italic">
                        Showing {chartData.filter((d) => d.isObserved).length}{" "}
                        visit(s) in selected range
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>

          {/* Add Patient Button */}
          {false && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-9">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Patients
                  {selectedPatientIds.length > 0 && (
                    <Badge className="ml-2 bg-healthcare-secondary text-white">
                      {selectedPatientIds.length}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <div className="p-4 border-b bg-healthcare-secondary/5">
                  <p className="font-semibold text-sm text-healthcare-primary">
                    Select Patients to Compare
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Add patients with visit history
                  </p>

                  {/* Search Input */}
                  <div className="mt-3 relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search patients..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 h-8 text-sm"
                    />
                  </div>
                </div>

                {/* Patient List */}
                <div className="max-h-80 overflow-y-auto p-3">
                  {searchedPatients.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Search className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">No patients found</p>
                      <p className="text-xs mt-1">
                        Try a different search term
                      </p>
                    </div>
                  ) : (
                    searchedPatients.map((patient, index) => (
                      <div
                        key={patient.id}
                        className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded"
                      >
                        <Checkbox
                          id={`trajectory-patient-${patient.id}`}
                          checked={selectedPatientIds.includes(patient.id)}
                          onCheckedChange={() =>
                            togglePatientSelection(patient.id)
                          }
                        />
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{
                            backgroundColor:
                              patientColors[index % patientColors.length],
                          }}
                        />
                        <label
                          htmlFor={`trajectory-patient-${patient.id}`}
                          className="flex-1 text-sm cursor-pointer"
                        >
                          <p className="font-semibold text-healthcare-primary">
                            Patient {patient.id}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {patient.visits?.length || 0} visits
                          </p>
                        </label>
                      </div>
                    ))
                  )}
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>

      {/* Selected Patients Pills */}
      {false && selectedPatients.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {selectedPatients.map((patient, index) => (
            <div
              key={patient.id}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full"
            >
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{
                  backgroundColor: patientColors[index % patientColors.length],
                }}
              />
              <span className="text-sm font-semibold text-healthcare-primary">
                Patient {patient.id}
              </span>
              <span className="text-xs text-muted-foreground">
                ({patient.visits?.length || 0} visits)
              </span>
              <button
                onClick={() => removePatient(patient.id)}
                className="ml-1 hover:bg-gray-200 rounded-full p-0.5 transition-colors"
              >
                <X className="h-3 w-3 text-muted-foreground" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Chart */}
      {selectedPatients.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Users className="h-16 w-16 mx-auto mb-4 opacity-30" />
          <p className="font-semibold">No Patients Selected</p>
          <p className="text-sm mt-2">
            {primaryPatientId
              ? "Patient from Visit Tracking will appear here automatically"
              : "Click 'Add Patients' to select patients for eGFR trajectory comparison"}
          </p>
        </div>
      ) : selectedPatients.every((p) => !p.visits || p.visits.length === 0) ? (
        <div className="text-center py-20 text-muted-foreground">
          <TrendingDown className="h-16 w-16 mx-auto mb-4 opacity-30" />
          <p className="font-semibold">No Visit Data Available</p>
          <p className="text-sm mt-2">
            Selected patients don't have visit history with eGFR measurements
          </p>
        </div>
      ) : (
        <div>
          {/* Chart Legend Helper */}
          <div className="mb-4 p-3 bg-healthcare-light/10 rounded-lg border border-healthcare-light/30">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-4 text-xs flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500/20 border border-green-500/40 rounded" />
                  <span className="text-muted-foreground">
                    Normal (≥60 mL/min)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-amber-500/20 border border-amber-500/40 rounded" />
                  <span className="text-muted-foreground">
                    Mild-Moderate (30-59)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500/20 border border-red-500/40 rounded" />
                  <span className="text-muted-foreground">Severe (&lt;30)</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full bg-healthcare-primary" />
                <span className="text-muted-foreground">Observed</span>
                <div className="w-8 h-0.5 border-t-2 border-dashed border-healthcare-primary ml-2" />
                <span className="text-muted-foreground">Predicted</span>
                <div className="w-8 h-3 bg-healthcare-secondary/15 rounded ml-2" />
                <span className="text-muted-foreground italic">
                  Uncertainty
                </span>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="h-[500px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={mergedChartData}
                margin={{
                  top: 20,
                  right: 40,
                  left: 20,
                  bottom: 60,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#B6E3E9" />

                {/* Reference zones for eGFR ranges - updated to 0-180 range */}
                <ReferenceArea
                  y1={60}
                  y2={180}
                  fill="#22c55e"
                  fillOpacity={0.08}
                  stroke="#22c55e"
                  strokeOpacity={0.25}
                  strokeDasharray="3 3"
                />
                <ReferenceArea
                  y1={30}
                  y2={60}
                  fill="#f59e0b"
                  fillOpacity={0.08}
                  stroke="#f59e0b"
                  strokeOpacity={0.25}
                  strokeDasharray="3 3"
                />
                <ReferenceArea
                  y1={0}
                  y2={30}
                  fill="#ef4444"
                  fillOpacity={0.08}
                  stroke="#ef4444"
                  strokeOpacity={0.25}
                  strokeDasharray="3 3"
                />

                {/* Vertical line separating observed from predicted */}
                {showPredictions && !Number.isNaN(lastObservedAge) && (
                  <ReferenceLine
                    x={lastObservedAge}
                    stroke="#095256"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    label={{
                      value: "Present",
                      position: "top",
                      fill: "#095256",
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  />
                )}

                <XAxis
                  dataKey="age"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#095256", fontSize: 11 }}
                  label={{
                    value: "Age (years)",
                    position: "insideBottom",
                    offset: -10,
                    fill: "#095256",
                    fontSize: 12,
                  }}
                  ticks={standardAges}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#095256", fontSize: 11 }}
                  label={{
                    value: "eGFR (mL/min/1.73m²)",
                    angle: -90,
                    position: "insideLeft",
                    fill: "#095256",
                    fontSize: 12,
                  }}
                  domain={[0, 180]}
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
                    if (typeof value !== "number") return null

                    // Filter out uncertainty band data keys
                    if (
                      name.includes("_upper") ||
                      name.includes("_lower") ||
                      name.includes("_isPredicted") ||
                      name.includes("_date")
                    ) {
                      return null
                    }

                    // Handle scenario names
                    if (name.includes("_")) {
                      const parts = name.split("_")
                      const scenario = parts[parts.length - 1]
                      if (scenario === "ckd")
                        return [`${value.toFixed(1)} mL/min`, "CKD Scenario"]
                      if (scenario === "fastCkd")
                        return [
                          `${value.toFixed(1)} mL/min`,
                          "Fast CKD Scenario",
                        ]
                      if (scenario === "healthyAging")
                        return [`${value.toFixed(1)} mL/min`, "Healthy Aging"]
                    }

                    return [`${value.toFixed(1)} mL/min`, `Patient ${name}`]
                  }}
                  labelFormatter={(label) => `Age: ${label} years`}
                />
                <Legend
                  wrapperStyle={{
                    fontSize: "11px",
                    paddingTop: "15px",
                  }}
                  formatter={(value: string) => {
                    if (value.includes("_")) {
                      const parts = value.split("_")
                      const patientId = parts[0]
                      const scenario = parts[parts.length - 1]
                      if (scenario === "ckd")
                        return `Patient ${patientId} - CKD`
                      if (scenario === "fastCkd")
                        return `Patient ${patientId} - Fast CKD`
                      if (scenario === "healthyAging")
                        return `Patient ${patientId} - Healthy`
                      if (scenario === "observed")
                        return `Patient ${patientId} - Observed`
                    }
                    return `Patient ${value}`
                  }}
                />

                {/* Render uncertainty bands and lines based on mode */}
                {showScenarios ? (
                  // SCENARIO MODE: Render observed + scenario predictions (scenarios start from present)
                  <>
                    {/* Uncertainty bands for scenarios - only from present forward */}
                    {selectedPatients.map((patient, _patientIndex) =>
                      selectedScenarios.map((scenario) => {
                        const scenarioKey = `${patient.id}_${scenario}`
                        return (
                          <React.Fragment key={`area-${scenarioKey}`}>
                            <Area
                              type="monotone"
                              dataKey={`${scenarioKey}_upper`}
                              stroke="none"
                              fill={SCENARIO_COLORS[scenario]}
                              fillOpacity={0.2}
                              connectNulls
                              stackId={scenarioKey}
                              legendType="none"
                            />
                            <Area
                              type="monotone"
                              dataKey={`${scenarioKey}_lower`}
                              stroke="none"
                              fill="white"
                              fillOpacity={1}
                              connectNulls
                              stackId={scenarioKey}
                              legendType="none"
                            />
                          </React.Fragment>
                        )
                      }),
                    )}

                    {/* Uncertainty bands for observed data */}
                    {selectedPatients.map((patient, patientIndex) => (
                      <React.Fragment key={`area-observed-${patient.id}`}>
                        <Area
                          type="monotone"
                          dataKey={`${patient.id}_observed_upper`}
                          stroke="none"
                          fill={
                            patientColors[patientIndex % patientColors.length]
                          }
                          fillOpacity={0.1}
                          connectNulls
                          stackId={`${patient.id}_observed`}
                          legendType="none"
                        />
                        <Area
                          type="monotone"
                          dataKey={`${patient.id}_observed_lower`}
                          stroke="none"
                          fill="white"
                          fillOpacity={1}
                          connectNulls
                          stackId={`${patient.id}_observed`}
                          legendType="none"
                        />
                      </React.Fragment>
                    ))}

                    {/* Scenario prediction lines (dashed) - only from present forward */}
                    {selectedPatients.map((patient, _patientIndex) =>
                      selectedScenarios.map((scenario) => {
                        const scenarioKey = `${patient.id}_${scenario}`
                        return (
                          <Line
                            key={scenarioKey}
                            type="monotone"
                            dataKey={scenarioKey}
                            name={scenarioKey}
                            stroke={SCENARIO_COLORS[scenario]}
                            strokeWidth={2.5}
                            strokeDasharray="5 5"
                            dot={false}
                            activeDot={{ r: 6 }}
                            connectNulls
                          />
                        )
                      }),
                    )}

                    {/* Observed data lines (solid) */}
                    {selectedPatients.map((patient, patientIndex) => (
                      <Line
                        key={`${patient.id}_observed`}
                        type="monotone"
                        dataKey={`${patient.id}_observed`}
                        name={`${patient.id}_observed`}
                        stroke={
                          patientColors[patientIndex % patientColors.length]
                        }
                        strokeWidth={3}
                        dot={{
                          fill: patientColors[
                            patientIndex % patientColors.length
                          ],
                          r: 5,
                        }}
                        activeDot={{ r: 7 }}
                        connectNulls
                      />
                    ))}
                  </>
                ) : (
                  // REGULAR MODE: Single trajectory per patient
                  <>
                    {/* Uncertainty bands */}
                    {selectedPatients.map((patient, index) => (
                      <React.Fragment key={`area-${patient.id}`}>
                        <Area
                          type="monotone"
                          dataKey={`${patient.id}_upper`}
                          stroke="none"
                          fill={patientColors[index % patientColors.length]}
                          fillOpacity={0.2}
                          connectNulls
                          stackId={patient.id}
                          legendType="none"
                        />
                        <Area
                          type="monotone"
                          dataKey={`${patient.id}_lower`}
                          stroke="none"
                          fill="white"
                          fillOpacity={1}
                          connectNulls
                          stackId={patient.id}
                          legendType="none"
                        />
                      </React.Fragment>
                    ))}

                    {/* Lines */}
                    {selectedPatients.map((patient, index) => {
                      // Split into observed and predicted segments for styling
                      const _observedData = mergedChartData.filter(
                        (d) =>
                          d[patient.id] !== undefined &&
                          !d[`${patient.id}_isPredicted`],
                      )
                      const predictedData = mergedChartData.filter(
                        (d) =>
                          d[patient.id] !== undefined &&
                          d[`${patient.id}_isPredicted`],
                      )

                      return (
                        <React.Fragment key={patient.id}>
                          {/* Main line - observed (solid) and predicted (dashed) combined */}
                          <Line
                            type="monotone"
                            dataKey={patient.id}
                            name={patient.id}
                            stroke={patientColors[index % patientColors.length]}
                            strokeWidth={3}
                            strokeDasharray={
                              showPredictions ? undefined : undefined
                            } // Will be overridden by segments
                            dot={(props: any) => {
                              // Show dots only for observed data
                              const isPredicted =
                                mergedChartData[props.index]?.[
                                  `${patient.id}_isPredicted`
                                ]
                              if (isPredicted) return null
                              return (
                                <circle
                                  cx={props.cx}
                                  cy={props.cy}
                                  r={5}
                                  fill={
                                    patientColors[index % patientColors.length]
                                  }
                                  stroke="white"
                                  strokeWidth={2}
                                />
                              )
                            }}
                            activeDot={{ r: 7 }}
                            connectNulls
                          />

                          {/* Predicted segment overlay (dashed) */}
                          {showPredictions && predictedData.length > 0 && (
                            <Line
                              type="monotone"
                              dataKey={patient.id}
                              stroke={
                                patientColors[index % patientColors.length]
                              }
                              strokeWidth={3}
                              strokeDasharray="5 5"
                              dot={false}
                              connectNulls
                              data={predictedData}
                            />
                          )}
                        </React.Fragment>
                      )
                    })}
                  </>
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Clinical Notes */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-sm text-healthcare-primary mb-2 flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Clinical Interpretation:
            </h4>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside ml-4">
              <li>eGFR ≥60: Normal or mildly reduced kidney function</li>
              <li>
                eGFR 30-59: Moderate kidney function decline (Stage 3 CKD)
              </li>
              <li>eGFR 15-29: Severe kidney function decline (Stage 4 CKD)</li>
              <li>eGFR &lt;15: Kidney failure (Stage 5 CKD)</li>
              <li>
                Shaded uncertainty bands widen over time, reflecting increased
                prediction uncertainty
              </li>
              {showScenarios && (
                <>
                  <li className="mt-2 font-semibold">Scenario Comparison:</li>
                  <li className="ml-4">
                    • CKD: Standard chronic kidney disease progression (-2.5
                    mL/min/year)
                  </li>
                  <li className="ml-4">
                    • Fast CKD: Accelerated decline requiring urgent
                    intervention (-5.0 mL/min/year)
                  </li>
                  <li className="ml-4">
                    • Healthy Aging: Normal age-related kidney function decline
                    (-0.75 mL/min/year)
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      )}
    </Card>
  )
}

// Add React import for Fragment
import React from "react"
