import {
  Activity,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Copy,
  Droplet,
  Heart,
  Info,
  Layers,
  Microscope,
} from "lucide-react"
import { useState } from "react"
import { Card } from "@/components/ui/card"

interface DKDStructuralInsightsProps {
  patientId: string
  isActive: boolean
}

export function DKDStructuralInsights({
  patientId,
  isActive,
}: DKDStructuralInsightsProps) {
  const [showDetailedMap, setShowDetailedMap] = useState(false)
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const [activeOverlays, setActiveOverlays] = useState({
    glomeruli: true,
    tubules: false,
    vessels: false,
    fibrosis: true,
    inflammation: false,
  })

  // Mock data - would come from API
  const hasDKDData = patientId === "67475" || patientId === "67475"

  if (!isActive || !hasDKDData) {
    return null
  }

  const lesionData = [
    { label: "Chronic Fibrosis", value: 35, color: "#087F8C" },
    { label: "Segmental Glomerular Scarring", value: 28, color: "#B6E3E9" },
    { label: "Vascular Injury", value: 18, color: "#98C1B4" },
    { label: "Early Structural Change", value: 12, color: "#3F4785" },
    { label: "Other", value: 7, color: "#E5E7EB" },
  ]

  const totalValue = lesionData.reduce((sum, item) => sum + item.value, 0)

  const clinicalInterpretation =
    "The model identifies chronic periglomerular fibrosis and segmental glomerular scarring as dominant contributors to progression risk. These findings are consistent with advanced diabetic kidney disease and suggest limited reversibility."

  const structuralMap = [
    { region: "Glomerular Compartment", chronic: 72, acute: 12, normal: 16 },
    { region: "Tubular Compartment", chronic: 58, acute: 18, normal: 24 },
    { region: "Vascular Compartment", chronic: 45, acute: 8, normal: 47 },
    { region: "Interstitial Compartment", chronic: 68, acute: 14, normal: 18 },
  ]

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  const toggleOverlay = (overlay: keyof typeof activeOverlays) => {
    setActiveOverlays((prev) => ({ ...prev, [overlay]: !prev[overlay] }))
  }

  const copyInterpretation = () => {
    navigator.clipboard.writeText(clinicalInterpretation)
  }

  return (
    <Card className="p-6 space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-healthcare-primary/10 rounded-lg">
          <Microscope className="h-6 w-6 text-healthcare-primary" />
        </div>
        <div>
          <h2 className="font-semibold text-healthcare-primary">
            DKD Structural Insights
          </h2>
          <p className="text-sm text-muted-foreground">
            Pathology-informed interpretation of diabetic kidney injury patterns
          </p>
        </div>
      </div>

      {/* Biopsy Visualization Section */}
      {false && (
        <div className="border border-gray-200 rounded-lg p-4 bg-gradient-to-br from-blue-50/30 to-purple-50/30">
          <h3 className="font-semibold text-healthcare-primary mb-4 flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Digital Pathology Biopsy Visualization
          </h3>

          <div className="grid grid-cols-3 gap-6">
            {/* WSI Thumbnail with Interactive Elements */}
            <div className="col-span-1">
              <div className="relative">
                <div className="w-full aspect-square bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100 rounded-lg border-2 border-gray-300 relative overflow-hidden cursor-pointer hover:border-healthcare-accent transition-all hover:shadow-lg group">
                  {/* Simulated tissue pattern with overlays */}
                  <div className="absolute inset-0 opacity-60">
                    {/* Glomeruli - shown when overlay active */}
                    {activeOverlays.glomeruli && (
                      <>
                        <div className="absolute w-12 h-12 rounded-full bg-healthcare-primary/40 top-8 left-12 border-2 border-healthcare-primary/60 animate-pulse" />
                        <div className="absolute w-10 h-10 rounded-full bg-healthcare-primary/40 top-20 left-32 border-2 border-healthcare-primary/60" />
                        <div className="absolute w-11 h-11 rounded-full bg-healthcare-primary/30 top-36 left-20 border-2 border-healthcare-primary/50" />
                        <div className="absolute w-9 h-9 rounded-full bg-healthcare-primary/35 top-32 left-40 border-2 border-healthcare-primary/55" />
                      </>
                    )}

                    {/* Tubules - shown when overlay active */}
                    {activeOverlays.tubules && (
                      <>
                        <div className="absolute w-16 h-3 bg-purple-400/50 top-16 left-8 rotate-12 rounded" />
                        <div className="absolute w-20 h-3 bg-purple-400/40 top-28 left-24 -rotate-6 rounded" />
                        <div className="absolute w-14 h-3 bg-purple-400/45 top-40 left-36 rotate-3 rounded" />
                      </>
                    )}

                    {/* Blood Vessels - shown when overlay active */}
                    {activeOverlays.vessels && (
                      <>
                        <div className="absolute w-24 h-2 bg-red-500/60 top-12 left-4 rotate-45 rounded-full" />
                        <div className="absolute w-20 h-2 bg-red-500/50 top-36 left-16 -rotate-12 rounded-full" />
                      </>
                    )}

                    {/* Fibrosis markers - shown when overlay active */}
                    {activeOverlays.fibrosis && (
                      <>
                        <div className="absolute w-8 h-8 bg-orange-500/40 top-24 left-44 rounded" />
                        <div className="absolute w-10 h-6 bg-orange-500/35 top-44 left-28 rounded" />
                        <div className="absolute w-6 h-10 bg-orange-500/30 top-12 left-36 rounded" />
                      </>
                    )}

                    {/* Inflammation - shown when overlay active */}
                    {activeOverlays.inflammation && (
                      <>
                        <div className="absolute w-4 h-4 bg-yellow-400/60 top-18 left-24 rounded-full" />
                        <div className="absolute w-3 h-3 bg-yellow-400/60 top-30 left-38 rounded-full" />
                        <div className="absolute w-3 h-3 bg-yellow-400/60 top-42 left-16 rounded-full" />
                      </>
                    )}
                  </div>

                  {/* Hover overlay */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/0 group-hover:bg-black/10 transition-all">
                    <Microscope className="h-8 w-8 text-healthcare-primary opacity-0 group-hover:opacity-100 transition-opacity mb-1" />
                    <span className="text-xs text-healthcare-primary font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                      Click to view full WSI
                    </span>
                  </div>
                </div>

                <div className="mt-2 text-center">
                  <p className="text-xs font-semibold text-gray-700">
                    Digital Pathology Slide
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Biopsy Date: Jan 15, 2024
                  </p>
                </div>
              </div>
            </div>

            {/* Overlay Controls */}
            <div className="col-span-2 space-y-4">
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3">
                  Interactive Tissue Overlays
                </p>
                <p className="text-xs text-muted-foreground mb-3">
                  Toggle overlays to visualize different kidney compartments and
                  injury patterns
                </p>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      key: "glomeruli" as const,
                      label: "Glomeruli",
                      desc: "Filtering units - showing sclerotic changes",
                      icon: Droplet,
                      color: "text-healthcare-primary",
                    },
                    {
                      key: "tubules" as const,
                      label: "Tubular Structures",
                      desc: "Reabsorption tubules with atrophy",
                      icon: Activity,
                      color: "text-purple-600",
                    },
                    {
                      key: "vessels" as const,
                      label: "Blood Vessels",
                      desc: "Arterial and arteriolar structures",
                      icon: Heart,
                      color: "text-red-600",
                    },
                    {
                      key: "fibrosis" as const,
                      label: "Fibrotic Regions",
                      desc: "Areas of chronic structural damage",
                      icon: Layers,
                      color: "text-orange-600",
                    },
                    {
                      key: "inflammation" as const,
                      label: "Inflammatory Infiltrates",
                      desc: "Acute inflammatory cell presence",
                      icon: AlertTriangle,
                      color: "text-yellow-600",
                    },
                  ].map((overlay) => (
                    <label
                      key={overlay.key}
                      className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        activeOverlays[overlay.key]
                          ? "bg-healthcare-primary/5 border-healthcare-primary shadow-sm"
                          : "bg-white border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={activeOverlays[overlay.key]}
                        onChange={() => toggleOverlay(overlay.key)}
                        className="w-4 h-4 mt-0.5 text-healthcare-primary border-gray-300 rounded focus:ring-healthcare-accent"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <overlay.icon
                            className={`h-4 w-4 ${overlay.color}`}
                          />
                          <span className="text-sm font-semibold text-gray-700">
                            {overlay.label}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">{overlay.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <p className="text-xs font-semibold text-gray-700 mb-2">
                  Biopsy Quantification
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Total Glomeruli
                    </p>
                    <p className="font-semibold text-healthcare-primary">48</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Sclerotic</p>
                    <p className="font-semibold text-orange-600">34%</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Fibrosis Score
                    </p>
                    <p className="font-semibold text-orange-600">High (3/4)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lesion Importance Summary */}
      <div className="grid grid-cols-2 gap-6">
        {/* Donut Chart */}
        <div className="flex flex-col items-center justify-center">
          <div className="relative w-64 h-64">
            <svg
              viewBox="0 0 200 200"
              className="transform -rotate-90"
              title="DKD Structural Injury Distribution"
            >
              {lesionData.map((item, index) => {
                const prevSum = lesionData
                  .slice(0, index)
                  .reduce((sum, d) => sum + d.value, 0)
                const startAngle = (prevSum / totalValue) * 360
                const sweepAngle = (item.value / totalValue) * 360
                const startRad = (startAngle * Math.PI) / 180
                const endRad = ((startAngle + sweepAngle) * Math.PI) / 180

                const innerRadius = 50
                const outerRadius = 90

                const x1 = 100 + innerRadius * Math.cos(startRad)
                const y1 = 100 + innerRadius * Math.sin(startRad)
                const x2 = 100 + outerRadius * Math.cos(startRad)
                const y2 = 100 + outerRadius * Math.sin(startRad)
                const x3 = 100 + outerRadius * Math.cos(endRad)
                const y3 = 100 + outerRadius * Math.sin(endRad)
                const x4 = 100 + innerRadius * Math.cos(endRad)
                const y4 = 100 + innerRadius * Math.sin(endRad)

                const largeArcFlag = sweepAngle > 180 ? 1 : 0

                const pathData = [
                  `M ${x1} ${y1}`,
                  `L ${x2} ${y2}`,
                  `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x3} ${y3}`,
                  `L ${x4} ${y4}`,
                  `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x1} ${y1}`,
                ].join(" ")

                return (
                  <path
                    key={item.label}
                    d={pathData}
                    fill={item.color}
                    stroke="white"
                    strokeWidth="2"
                  />
                )
              })}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl font-bold text-healthcare-primary">
                  DKD
                </div>
                <div className="text-sm text-muted-foreground">Pattern</div>
              </div>
            </div>
          </div>
        </div>

        {/* Legend and Details */}
        <div className="space-y-3">
          <h3 className="font-semibold text-healthcare-primary mb-3">
            Structural Injury Distribution
          </h3>
          {lesionData.map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-gray-700">{item.label}</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {Math.round((item.value / totalValue) * 100)}%
              </span>
            </div>
          ))}

          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-yellow-800">
                  High Structural Risk
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  Elevated risk driven by chronic structural pathology rather
                  than acute lab changes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Auto-Generated Clinical Interpretation */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-healthcare-primary">
            Clinical Interpretation
          </h3>
          <button
            type="button"
            onClick={copyInterpretation}
            className="flex items-center gap-1 text-xs text-healthcare-accent hover:underline"
          >
            <Copy className="h-3 w-3" />
            Copy
          </button>
        </div>
        <p className="text-sm text-gray-700 leading-relaxed">
          {clinicalInterpretation}
        </p>
      </div>

      {/* Additional Insights (Expandable Sections) */}
      <div className="space-y-3">
        {/* Structural Injury Map (Expandable) */}
        <div className="border border-gray-200 rounded-lg">
          <button
            type="button"
            onClick={() => setShowDetailedMap(!showDetailedMap)}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              {showDetailedMap ? (
                <ChevronDown className="h-4 w-4 text-healthcare-primary" />
              ) : (
                <ChevronRight className="h-4 w-4 text-healthcare-primary" />
              )}
              <span className="font-semibold text-healthcare-primary">
                Detailed Structural Map
              </span>
            </div>
            <span className="text-xs text-gray-500">
              Aggregated compartment view
            </span>
          </button>

          {showDetailedMap && (
            <div className="px-4 pb-4 space-y-4">
              <p className="text-sm text-gray-600">
                Visual pattern recognition of chronic vs. acute injury across
                kidney compartments
              </p>

              {structuralMap.map((compartment) => (
                <div key={compartment.region} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700">
                      {compartment.region}
                    </span>
                    <button
                      className="text-xs text-healthcare-accent hover:underline flex items-center gap-1"
                      type="button"
                    >
                      <Info className="h-3 w-3" />
                      Details
                    </button>
                  </div>

                  <div className="flex h-6 rounded-lg overflow-hidden border border-gray-200">
                    <div
                      className="bg-orange-500 flex items-center justify-center text-white text-xs font-semibold"
                      style={{ width: `${compartment.chronic}%` }}
                    >
                      {compartment.chronic > 15 && `${compartment.chronic}%`}
                    </div>
                    <div
                      className="bg-yellow-400 flex items-center justify-center text-gray-700 text-xs font-semibold"
                      style={{ width: `${compartment.acute}%` }}
                    >
                      {compartment.acute > 8 && `${compartment.acute}%`}
                    </div>
                    <div
                      className="bg-green-200 flex items-center justify-center text-gray-700 text-xs font-semibold"
                      style={{ width: `${compartment.normal}%` }}
                    >
                      {compartment.normal > 15 && `${compartment.normal}%`}
                    </div>
                  </div>

                  <div className="flex gap-4 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-orange-500 rounded" />
                      Chronic damage
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-yellow-400 rounded" />
                      Acute injury
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-green-200 rounded" />
                      Normal tissue
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Progression Drivers */}
        <div className="border border-gray-200 rounded-lg">
          <button
            type="button"
            onClick={() => toggleSection("drivers")}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              {expandedSection === "drivers" ? (
                <ChevronDown className="h-4 w-4 text-healthcare-primary" />
              ) : (
                <ChevronRight className="h-4 w-4 text-healthcare-primary" />
              )}
              <span className="font-semibold text-healthcare-primary">
                DKD Progression Drivers
              </span>
            </div>
          </button>

          {expandedSection === "drivers" && (
            <div className="px-4 pb-4 space-y-3">
              {[
                {
                  driver: "Chronic fibrosis burden",
                  contribution: 35,
                  trend: "Progressive",
                },
                {
                  driver: "Glomerular scarring pattern",
                  contribution: 28,
                  trend: "Stable",
                },
                {
                  driver: "Vascular injury severity",
                  contribution: 18,
                  trend: "Progressive",
                },
                {
                  driver: "Tubular atrophy extent",
                  contribution: 12,
                  trend: "Moderate",
                },
                {
                  driver: "Inflammatory markers",
                  contribution: 7,
                  trend: "Low",
                },
              ].map((item) => (
                <div key={item.driver}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-700">{item.driver}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        {item.trend}
                      </span>
                      <span className="text-sm font-semibold text-gray-900">
                        {item.contribution}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-healthcare-accent"
                      style={{ width: `${item.contribution}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reversibility Assessment */}
        <div className="border border-gray-200 rounded-lg">
          <button
            type="button"
            onClick={() => toggleSection("reversibility")}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              {expandedSection === "reversibility" ? (
                <ChevronDown className="h-4 w-4 text-healthcare-primary" />
              ) : (
                <ChevronRight className="h-4 w-4 text-healthcare-primary" />
              )}
              <span className="font-semibold text-healthcare-primary">
                Reversibility Assessment
              </span>
            </div>
            <span className="text-sm font-semibold text-orange-600">
              Limited
            </span>
          </button>

          {expandedSection === "reversibility" && (
            <div className="px-4 pb-4 space-y-3">
              <p className="text-sm text-gray-600">
                Assessment of potentially modifiable vs. irreversible structural
                changes
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <div className="text-sm font-semibold text-orange-800 mb-2">
                    Irreversible (68%)
                  </div>
                  <ul className="space-y-1 text-xs text-gray-700">
                    <li>• Chronic periglomerular fibrosis</li>
                    <li>• Segmental glomerulosclerosis</li>
                    <li>• Tubular atrophy</li>
                    <li>• Arteriolar hyalinosis</li>
                  </ul>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="text-sm font-semibold text-green-800 mb-2">
                    Potentially Modifiable (32%)
                  </div>
                  <ul className="space-y-1 text-xs text-gray-700">
                    <li>• Inflammatory infiltration</li>
                    <li>• Acute tubular injury</li>
                    <li>• Endothelial dysfunction</li>
                    <li>• Early structural changes</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
