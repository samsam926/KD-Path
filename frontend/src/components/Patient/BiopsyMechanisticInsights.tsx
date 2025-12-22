import { Card } from '@/components/ui/card'
import { useState } from 'react'
import {
  ChevronDown,
  ChevronRight,
  Info,
  Activity,
  Microscope,
  Droplet,
  Heart,
  TrendingDown,
  TrendingUp,
  FileText,
  Save,
  X
} from 'lucide-react'

interface BiopsyMechanisticInsightsProps {
  patientId: string
}

export function BiopsyMechanisticInsights({
  patientId
}: BiopsyMechanisticInsightsProps) {
  const [activeOverlays, setActiveOverlays] = useState({
    glomeruli: true,
    tubules: false,
    arteries: false,
    morphometric: false,
    molecular: false
  })

  const [expandedBurden, setExpandedBurden] = useState({
    morphometric: false,
    molecular: false,
    clinical: false
  })

  const [expandedDetails, setExpandedDetails] = useState({
    drivers: false,
    burden: false,
    modifiable: false,
    inputs: false,
    notes: false
  })

  const [comparisonMode, setComparisonMode] = useState({
    compare: false,
    showDrivers: false,
    showIntervention: false
  })

  const [showNotePanel, setShowNotePanel] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [savedNotes, setSavedNotes] = useState<
    Array<{ text: string; timestamp: string }>
  >([])

  // Mock data - in production, this would come from API based on patientId
  const hasBiopsyData = patientId === 'PT010' // Only show for demo patient

  if (!hasBiopsyData) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-healthcare-primary/10 rounded-lg">
            <Microscope className="h-6 w-6 text-healthcare-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-healthcare-primary">
              Biopsy & Mechanistic Insights
            </h2>
            <p className="text-sm text-muted-foreground">
              Derived from digital pathology, morphometrics, molecular
              signatures, and clinical burden.
            </p>
          </div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <Microscope className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-muted-foreground">
            Biopsy-derived mechanistic insights are unavailable for this
            patient.
          </p>
        </div>
      </Card>
    )
  }

  const toggleOverlay = (overlay: keyof typeof activeOverlays) => {
    setActiveOverlays((prev) => ({ ...prev, [overlay]: !prev[overlay] }))
  }

  const toggleBurden = (burden: keyof typeof expandedBurden) => {
    setExpandedBurden((prev) => ({ ...prev, [burden]: !prev[burden] }))
  }

  const toggleDetail = (key: keyof typeof expandedDetails) => {
    setExpandedDetails((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSaveNote = () => {
    if (noteText.trim()) {
      const newNote = {
        text: noteText,
        timestamp: new Date().toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      }
      setSavedNotes((prev) => [newNote, ...prev])
      setNoteText('')
      setShowNotePanel(false)
    }
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
            Biopsy & Mechanistic Insights
          </h2>
          <p className="text-sm text-muted-foreground">
            Derived from digital pathology, morphometrics, molecular signatures,
            and clinical burden.
          </p>
        </div>
      </div>

      {/* 4. Risk Model Comparison Section */}
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-healthcare-primary mb-0">
          Risk Model Comparison
        </h3>
        {/* 6. Comparison Toolbar */}
        <div className="flex gap-3">
          <button
            onClick={() =>
              setComparisonMode({
                ...comparisonMode,
                compare: !comparisonMode.compare
              })
            }
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              comparisonMode.compare
                ? 'bg-healthcare-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Compare Models {comparisonMode.compare ? 'ON' : 'OFF'}
          </button>
          <button
            onClick={() =>
              setComparisonMode({
                ...comparisonMode,
                showDrivers: !comparisonMode.showDrivers
              })
            }
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              comparisonMode.showDrivers
                ? 'bg-healthcare-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Show Mechanistic Drivers
          </button>
          <button
            onClick={() =>
              setComparisonMode({
                ...comparisonMode,
                showIntervention: !comparisonMode.showIntervention
              })
            }
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              comparisonMode.showIntervention
                ? 'bg-healthcare-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Show Intervention Impact
          </button>
        </div>
      </div>

      {/* 4.1 Score Cards */}
      <div className="grid grid-cols-3 gap-4 border-b pb-6 border-gray-200">
        {/* 5.2 Tangri Score Card */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 relative">
          <h4 className="font-semibold text-healthcare-primary mb-3">
            Tangri Score (KFRE)
          </h4>
          <div className="space-y-2 mb-3 flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-600">At 2 Years:</span>
              <div className="text-2xl font-bold text-healthcare-primary">
                12.4%
              </div>
            </div>
            <div>
              <span className="text-xs text-gray-600">At 5 Years:</span>
              <div className="text-2xl font-bold text-healthcare-primary">
                28.7%
              </div>
            </div>
          </div>
          {comparisonMode.compare && (
            <div className="mt-2 pt-2 border-t border-blue-300">
              <span className="text-xs font-semibold text-blue-700">
                Baseline Model
              </span>
            </div>
          )}
          <div className="mt-3 pt-3 border-t border-blue-300">
            <button
              className="text-xs text-healthcare-accent hover:underline flex items-center gap-1"
              title="Uses eGFR, ACR, age, sex"
            >
              <Info className="h-3 w-3" />
              Clinical parameters only
            </button>
          </div>
        </div>

        {/* 5.3 MMAI Score Card */}
        <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4 relative">
          <h4 className="font-semibold text-healthcare-primary mb-3">
            MMAI Score
          </h4>
          <div className="space-y-2 mb-3 flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-600">At 2 Years:</span>
              <div className="text-2xl font-bold text-healthcare-primary">
                18.6%
              </div>
              {comparisonMode.compare && (
                <span className="text-xs text-orange-600 font-semibold">
                  +6.2% vs Tangri
                </span>
              )}
            </div>
            <div>
              <span className="text-xs text-gray-600">At 5 Years:</span>
              <div className="text-2xl font-bold text-healthcare-primary">
                36.2%
              </div>
              {comparisonMode.compare && (
                <span className="text-xs text-orange-600 font-semibold">
                  +7.5% vs Tangri
                </span>
              )}
            </div>
          </div>
          {comparisonMode.showDrivers && (
            <div className="mt-3 pt-3 border-t border-yellow-400">
              <p className="text-xs font-semibold text-gray-700 mb-2">
                Driver Breakdown:
              </p>
              <div className="space-y-1">
                {[
                  { label: 'Diabetes', value: 24 },
                  { label: 'Hypertension', value: 18 },
                  { label: 'Immune', value: 16 },
                  { label: 'Hypoxia', value: 22 },
                  { label: 'Tubular injury', value: 20 }
                ].map((driver) => (
                  <div key={driver.label} className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-healthcare-accent h-1.5 rounded-full"
                        style={{ width: `${driver.value}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 w-24">
                      {driver.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 5.4 MMAI Post-Intervention Card */}
        <div className="bg-green-50 border-2 border-green-400 rounded-lg p-4 relative">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-healthcare-primary">
              MMAI (Post-Intervention)
            </h4>
            <div className="bg-green-200 text-green-800 text-xs font-semibold px-2 py-1 rounded inline-block">
              ↓ 7.4% reduction
            </div>
          </div>
          <div className="space-y-2 mb-3 flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-600">At 2 Years:</span>
              <div className="flex items-center gap-2">
                <span className="text-lg text-gray-400 line-through">
                  18.6%
                </span>
                <TrendingDown className="h-4 w-4 text-green-600" />
                <span className="text-2xl font-bold text-green-600">11.2%</span>
              </div>
            </div>
            <div>
              <span className="text-xs text-gray-600">At 5 Years:</span>
              <div className="flex items-center gap-2">
                <span className="text-lg text-gray-400 line-through">
                  36.2%
                </span>
                <TrendingDown className="h-4 w-4 text-green-600" />
                <span className="text-2xl font-bold text-green-600">23.8%</span>
              </div>
            </div>
          </div>
          {comparisonMode.showIntervention && (
            <div className="mt-3 pt-3 border-t border-green-400">
              <p className="text-xs font-semibold text-gray-700 mb-2">
                Simulated Interventions:
              </p>
              <ul className="space-y-1">
                {[
                  'BP optimization (<130/80)',
                  'Proteinuria reduction',
                  'Glucose control (HbA1c <7%)',
                  'Minimize med toxicity',
                  'Volume/sodium mgmt'
                ].map((intervention, idx) => (
                  <li
                    key={idx}
                    className="text-xs text-gray-700 flex items-start gap-1"
                  >
                    <span className="text-green-600 font-bold">✓</span>
                    <span dangerouslySetInnerHTML={{ __html: intervention }} />
                  </li>
                ))}
              </ul>
              <p className="text-xs text-gray-500 mt-2 italic">
                Assumes modifiable factors meet guideline targets.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 4.2 Compartment Highlight Vectors */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            title: 'Glomerular Vectors',
            icon: Droplet,
            color: 'bg-gray-100 border-gray-200',
            morphometric: [
              'Glomerular volume ↑ (142%)',
              'Mesangial expansion ↑ (168%)',
              'Podocyte density ↓ (62%)'
            ],
            omics: [
              'VEGF signaling ↑',
              'TGF-β pathway ↑',
              'Inflammatory markers ↑'
            ]
          },
          {
            title: 'Tubular Vectors',
            icon: Activity,
            color: 'bg-gray-100 border-gray-200',
            morphometric: [
              'Tubular atrophy ↑ (134%)',
              'Brush border loss ↑ (156%)',
              'Tubular diameter ↓ (78%)'
            ],
            omics: [
              'Hypoxia markers ↑',
              'Fibrosis genes ↑',
              'Metabolic stress ↑'
            ]
          },
          {
            title: 'Arteriolar Vectors',
            icon: Heart,
            color: 'bg-gray-100 border-gray-200',
            morphometric: [
              'Arterial wall thickness ↑ (124%)',
              'Lumen narrowing ↑ (112%)',
              'Arteriolar sclerosis ↑ (145%)'
            ],
            omics: [
              'Platelet activation ↑',
              'Endothelial dysfunction ↑',
              'Oxidative stress ↑'
            ]
          }
        ].map((compartment) => (
          <div
            key={compartment.title}
            className={`border rounded-lg p-4 ${compartment.color} hover:shadow-md transition-shadow`}
          >
            <div className="flex items-center gap-2 mb-3">
              <compartment.icon className="h-5 w-5 text-healthcare-primary" />
              <h4 className="font-semibold text-sm text-healthcare-primary">
                {compartment.title}
              </h4>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-1">
                  Morphometric
                </p>
                <ul className="space-y-1">
                  {compartment.morphometric.map((item, idx) => (
                    <li key={idx} className="text-xs text-gray-700">
                      • {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-1">
                  Omics Signatures
                </p>
                <ul className="space-y-1">
                  {compartment.omics.map((item, idx) => (
                    <li key={idx} className="text-xs text-gray-700">
                      • {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            {/* <button className="text-xs text-healthcare-accent hover:underline mt-2">
              View All Features →
            </button> */}
          </div>
        ))}
      </div>

      {/* 4.3 Expanded Detail Panels */}
      <div className="space-y-3">
        {/* A. Mechanistic Drivers */}
        <div className="border border-gray-200 rounded-lg">
          <button
            onClick={() => toggleDetail('drivers')}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              {expandedDetails.drivers ? (
                <ChevronDown className="h-4 w-4 text-healthcare-primary" />
              ) : (
                <ChevronRight className="h-4 w-4 text-healthcare-primary" />
              )}
              <span className="font-semibold text-healthcare-primary">
                A. Mechanistic Drivers (Detailed)
              </span>
            </div>
          </button>
          {expandedDetails.drivers && (
            <div className="px-4 pt-4 pb-2">
              <div className="space-y-4 grid grid-cols-3 gap-4">
                {[
                  {
                    category: 'Morphometric',
                    items: [
                      { label: 'Glomerular sclerosis', value: 28 },
                      { label: 'Tubular atrophy', value: 24 },
                      { label: 'Interstitial fibrosis', value: 22 },
                      { label: 'Arteriolar hyalinosis', value: 18 }
                    ]
                  },
                  {
                    category: 'Molecular',
                    items: [
                      { label: 'Inflammatory pathways', value: 26 },
                      { label: 'Fibrotic signatures', value: 24 },
                      { label: 'Hypoxia markers', value: 22 },
                      { label: 'Oxidative stress', value: 20 }
                    ]
                  },
                  {
                    category: 'Clinical',
                    items: [
                      { label: 'eGFR decline rate', value: 32 },
                      { label: 'Proteinuria severity', value: 28 },
                      { label: 'BP dysregulation', value: 24 },
                      { label: 'Glycemic control', value: 16 }
                    ]
                  }
                ].map((section) => (
                  <div key={section.category}>
                    <h5 className="text-sm font-semibold text-gray-700 mb-2">
                      {section.category} Contributions
                    </h5>
                    <div className="space-y-2">
                      {section.items.map((item) => (
                        <div key={item.label}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-600">
                              {item.label}
                            </span>
                            <span className="text-xs font-semibold text-gray-900">
                              {item.value}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                              className="h-1.5 rounded-full bg-healthcare-accent"
                              style={{ width: `${item.value}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        {/* B. Burden Analysis */}
        <div className="border border-gray-200 rounded-lg">
          <button
            onClick={() => toggleDetail('burden')}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              {expandedDetails.burden ? (
                <ChevronDown className="h-4 w-4 text-healthcare-primary" />
              ) : (
                <ChevronRight className="h-4 w-4 text-healthcare-primary" />
              )}
              <span className="font-semibold text-healthcare-primary">
                B. Burden Analysis
              </span>
            </div>
          </button>
          {expandedDetails.burden && (
            <div className="px-4 pt-4 pb-2">
              <div className="space-y-4 grid grid-cols-3 gap-4">
                {[
                  {
                    category: 'Morphometric',
                    items: [
                      { label: 'Glomerular Burden', value: 28 },
                      { label: 'Tubular Burden', value: 24 },
                      { label: 'Interstitial Burden', value: 22 },
                      { label: 'Arteriolar Burden', value: 18 }
                    ]
                  },
                  {
                    category: 'Molecular',
                    items: [
                      { label: 'Angiogenesis', value: 26 },
                      { label: 'Cellular Injury/Response', value: 24 },
                      { label: 'Hypoxia Signatures', value: 22 }
                    ]
                  },
                  {
                    category: 'Clinical',
                    items: [
                      { label: 'eGFR Burden', value: 32 },
                      { label: 'Proteinuria Burden', value: 28 },
                      { label: 'BP Burden', value: 24 }
                    ]
                  }
                ].map((section) => (
                  <div key={section.category}>
                    <h5 className="text-sm font-semibold text-gray-700 mb-2">
                      {section.category} Burden
                    </h5>
                    <div className="space-y-2">
                      {section.items.map((item) => (
                        <div key={item.label}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-600">
                              {item.label}
                            </span>
                            <span className="text-xs font-semibold text-gray-900">
                              {item.value}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div
                              className="h-1.5 rounded-full bg-healthcare-accent"
                              style={{ width: `${item.value}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* C. Modifiable Risk Factors */}
        <div className="border border-gray-200 rounded-lg">
          <button
            onClick={() => toggleDetail('modifiable')}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              {expandedDetails.modifiable ? (
                <ChevronDown className="h-4 w-4 text-healthcare-primary" />
              ) : (
                <ChevronRight className="h-4 w-4 text-healthcare-primary" />
              )}
              <span className="font-semibold text-healthcare-primary">
                C. Modifiable Risk Factors
              </span>
            </div>
          </button>
          {expandedDetails.modifiable && (
            <div className="px-4 pb-4">
              <p className="text-sm text-gray-600 mb-3">
                The following parameters can improve the MMAI score
                post-intervention:
              </p>
              <div className="grid grid-cols-3 gap-4">
                {[
                  {
                    factor: 'Systolic BP',
                    current: '148 mmHg',
                    target: '<130 mmHg',
                    impact: '↓ 2.8%'
                  },
                  {
                    factor: 'Diastolic BP',
                    current: '92 mmHg',
                    target: '<80 mmHg',
                    impact: '↓ 1.4%'
                  },
                  {
                    factor: 'HbA1c',
                    current: '8.2%',
                    target: '<7.0%',
                    impact: '↓ 2.1%'
                  },
                  {
                    factor: 'ACR',
                    current: '285 mg/g',
                    target: '<30 mg/g',
                    impact: '↓ 3.8%'
                  },
                  {
                    factor: 'BMI',
                    current: '32.4',
                    target: '<30',
                    impact: '↓ 0.9%'
                  },
                  {
                    factor: 'Na+ intake',
                    current: '4.2 g/day',
                    target: '<2.3 g/day',
                    impact: '↓ 1.2%'
                  }
                ].map((item) => (
                  <div key={item.factor} className="bg-gray-50 rounded p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-gray-700">
                        {item.factor}
                      </span>
                      <span className="text-xs font-semibold text-green-600">
                        {item.impact}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600">
                      Current:{' '}
                      <span
                        className="font-semibold"
                        dangerouslySetInnerHTML={{ __html: item.current }}
                      />
                    </div>
                    <div className="text-xs text-gray-600">
                      Target:{' '}
                      <span
                        className="font-semibold text-green-600"
                        dangerouslySetInnerHTML={{ __html: item.target }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* D. Model Input Summary */}
        <div className="border border-gray-200 rounded-lg">
          <button
            onClick={() => toggleDetail('inputs')}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              {expandedDetails.inputs ? (
                <ChevronDown className="h-4 w-4 text-healthcare-primary" />
              ) : (
                <ChevronRight className="h-4 w-4 text-healthcare-primary" />
              )}
              <span className="font-semibold text-healthcare-primary">
                D. Model Input Summary
              </span>
            </div>
          </button>
          {expandedDetails.inputs && (
            <div className="px-4 pb-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3 text-gray-700">
                      Input Parameter
                    </th>
                    <th className="text-center py-2 px-3 text-blue-700">
                      Tangri
                    </th>
                    <th className="text-center py-2 px-3 text-yellow-700">
                      MMAI
                    </th>
                    <th className="text-center py-2 px-3 text-green-700">
                      MMAI-Post
                    </th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {[
                    { param: 'eGFR', tangri: '✓', mmai: '✓', post: '✓' },
                    {
                      param: 'ACR (Proteinuria)',
                      tangri: '✓',
                      mmai: '✓',
                      post: '✓ (optimized)'
                    },
                    { param: 'Age', tangri: '✓', mmai: '✓', post: '✓' },
                    { param: 'Sex', tangri: '✓', mmai: '✓', post: '✓' },
                    {
                      param: 'Morphometric features',
                      tangri: '—',
                      mmai: '✓',
                      post: '✓'
                    },
                    {
                      param: 'Molecular signatures',
                      tangri: '—',
                      mmai: '✓',
                      post: '✓'
                    },
                    {
                      param: 'BP control',
                      tangri: '—',
                      mmai: '✓',
                      post: '✓ (optimized)'
                    },
                    {
                      param: 'Glucose control',
                      tangri: '—',
                      mmai: '✓',
                      post: '✓ (optimized)'
                    },
                    {
                      param: 'Medication toxicity',
                      tangri: '—',
                      mmai: '✓',
                      post: '✓ (minimized)'
                    },
                    {
                      param: 'Sodium/volume mgmt',
                      tangri: '—',
                      mmai: '✓',
                      post: '✓ (optimized)'
                    }
                  ].map((row, idx) => (
                    <tr key={idx} className="border-b border-gray-100">
                      <td className="py-2 px-3 text-gray-700">{row.param}</td>
                      <td className="py-2 px-3 text-center">{row.tangri}</td>
                      <td className="py-2 px-3 text-center">{row.mmai}</td>
                      <td className="py-2 px-3 text-center">{row.post}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* E. Clinical Notes */}
        <div className="border border-gray-200 rounded-lg">
          <button
            onClick={() => toggleDetail('notes')}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              {expandedDetails.notes ? (
                <ChevronDown className="h-4 w-4 text-healthcare-primary" />
              ) : (
                <ChevronRight className="h-4 w-4 text-healthcare-primary" />
              )}
              <span className="font-semibold text-healthcare-primary">
                E. Clinical Notes & Documentation
              </span>
            </div>
            {savedNotes.length > 0 && (
              <span className="text-xs font-semibold text-healthcare-accent bg-healthcare-accent/10 px-2 py-1 rounded">
                {savedNotes.length} {savedNotes.length === 1 ? 'note' : 'notes'}
              </span>
            )}
          </button>
          {expandedDetails.notes && (
            <div className="px-4 pb-4 space-y-4">
              {/* Note Input Area */}
              <div className="bg-blue-50 border border-healthcare-accent rounded-lg p-3 space-y-3">
                <h5 className="text-sm font-semibold text-healthcare-primary">
                  Add Clinical Note
                </h5>
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Document observations about biopsy findings, burden scores, risk assessments, or intervention recommendations..."
                  className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-healthcare-accent text-sm"
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">
                    Patient: {patientId} | Clinician Note |{' '}
                    {new Date().toLocaleDateString()}
                  </span>
                  <button
                    onClick={handleSaveNote}
                    disabled={!noteText.trim()}
                    className="flex items-center gap-2 px-4 py-2 text-sm bg-healthcare-primary text-white rounded-lg hover:bg-healthcare-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="h-4 w-4" />
                    Save to Record
                  </button>
                </div>
              </div>

              {/* Saved Notes History */}
              {savedNotes.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-sm font-semibold text-gray-700">
                    Recent Notes
                  </h5>
                  {savedNotes.map((note, idx) => (
                    <div
                      key={idx}
                      className="bg-white border border-gray-200 rounded-lg p-3"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-500">
                          {note.timestamp}
                        </span>
                        <span className="text-xs font-semibold text-healthcare-accent bg-healthcare-accent/10 px-2 py-1 rounded">
                          Saved to Record
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{note.text}</p>
                    </div>
                  ))}
                </div>
              )}

              {savedNotes.length === 0 && (
                <div className="text-center py-6 text-sm text-gray-500">
                  No clinical notes recorded yet. Add your first note above.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
