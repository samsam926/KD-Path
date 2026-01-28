import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { usePatients } from '@/contexts/PatientContext'
import { Activity, AlertTriangle, TrendingUp, Edit, Heart } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { PatientKidneyDetails } from './PatientKidneyDetails'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

interface SinglePatientKidneyRiskProps {
  patientId?: string
}

export function SinglePatientKidneyRisk({
  patientId
}: SinglePatientKidneyRiskProps) {
  const { patients, updatePatient } = usePatients()

  // Get the specific patient
  const patient = patientId ? patients.find((p) => p.id === patientId) : null

  const getRiskLevel = (
    twoYearRisk?: number
  ): { level: string; color: string; bgColor: string } => {
    if (!twoYearRisk)
      return {
        level: 'Unknown',
        color: 'text-muted-foreground',
        bgColor: 'bg-muted'
      }
    if (twoYearRisk >= 20)
      return {
        level: 'Very High',
        color: 'text-alert-high',
        bgColor: 'bg-alert-high'
      }
    if (twoYearRisk >= 10)
      return {
        level: 'High',
        color: 'text-orange-600',
        bgColor: 'bg-orange-600'
      }
    if (twoYearRisk >= 5)
      return {
        level: 'Moderate',
        color: 'text-amber-600',
        bgColor: 'bg-amber-600'
      }
    if (twoYearRisk >= 2)
      return {
        level: 'Low-Moderate',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-600'
      }
    return {
      level: 'Low',
      color: 'text-alert-low',
      bgColor: 'bg-alert-low'
    }
  }

  const getACRCategory = (acr?: number): string => {
    if (!acr) return 'Unknown'
    if (acr < 30) return 'Normal'
    if (acr < 300) return 'Moderately Increased'
    return 'Severely Increased'
  }

  const getACRColor = (acr?: number): string => {
    if (!acr) return 'text-muted-foreground'
    if (acr < 30) return 'text-alert-low'
    if (acr < 300) return 'text-amber-600'
    return 'text-alert-high'
  }

  const [showEditDialog, setShowEditDialog] = useState(false)
  const [neweGFR, setNeweGFR] = useState('')
  const [newACR, setNewACR] = useState('')
  const [newTwoYearRisk, setNewTwoYearRisk] = useState('')
  const [newFiveYearRisk, setNewFiveYearRisk] = useState('')
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)

  const handleEdit = () => {
    if (patient) {
      setNeweGFR(patient.vitals?.eGFR?.toString() || '')
      setNewACR(patient.vitals?.acr?.toString() || '')
      setNewTwoYearRisk(patient.vitals?.twoYearRisk?.toString() || '')
      setNewFiveYearRisk(patient.vitals?.fiveYearRisk?.toString() || '')
      setShowEditDialog(true)
    }
  }

  const handleSave = () => {
    if (patient) {
      patient.vitals = {
        ...patient.vitals,
        eGFR: neweGFR ? parseFloat(neweGFR) : null,
        acr: newACR ? parseFloat(newACR) : null,
        twoYearRisk: newTwoYearRisk ? parseFloat(newTwoYearRisk) : null,
        fiveYearRisk: newFiveYearRisk ? parseFloat(newFiveYearRisk) : null
      }
      updatePatient(patient)
      toast.success('Patient data updated successfully')
      setShowEditDialog(false)
    }
  }

  const handleCancel = () => {
    setShowEditDialog(false)
  }

  const handleShowDetails = () => {
    setShowDetailsDialog(true)
  }

  if (!patient) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Activity className="h-12 w-12 mx-auto mb-3 opacity-30" />
        <p>No patient selected</p>
        <p className="text-sm mt-2">Please provide a valid patient ID</p>
      </div>
    )
  }

  if (!patient.vitals?.eGFR) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Activity className="h-12 w-12 mx-auto mb-3 opacity-30" />
        <p>No kidney data available for this patient</p>
        <p className="text-sm mt-2">Click Edit to add kidney health metrics</p>
        <Button onClick={handleEdit} className="mt-4" size="sm">
          <Edit className="h-4 w-4 mr-2" />
          Add Data
        </Button>
      </div>
    )
  }

  const riskInfo = getRiskLevel(patient.vitals?.twoYearRisk)

  return (
    <div>
      {/* <Button
        className="hidden"
        size="sm"
        variant="outline"
        onClick={handleShowDetails}
      >
        <Activity className="h-4 w-4 mr-2" />
        Full Details
      </Button>
      <Button size="sm" variant="outline" onClick={handleEdit}>
        <Edit className="h-4 w-4 mr-2" />
        Edit
      </Button> */}

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* eGFR */}
        <Card className="p-4 bg-gradient-to-br from-healthcare-primary/5 to-healthcare-light/10 border-healthcare-primary/20">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-healthcare-primary">
              eGFR
            </p>
            <Heart className="h-4 w-4 text-healthcare-primary" />
          </div>
          <p
            className={`text-3xl font-bold mb-1 ${
              (patient.vitals?.eGFR || 0) >= 60
                ? 'text-alert-low'
                : (patient.vitals?.eGFR || 0) >= 30
                  ? 'text-amber-600'
                  : 'text-alert-high'
            }`}
          >
            {patient.vitals?.eGFR || 'N/A'}
          </p>
          <p className="text-xs text-muted-foreground">mL/min/1.73m²</p>
          <div className="mt-3">
            <Progress
              value={Math.min(((patient.vitals?.eGFR || 0) / 120) * 100, 100)}
              className="h-2"
            />
          </div>
        </Card>

        {/* ACR */}
        <Card className="p-4 bg-gradient-to-br from-healthcare-secondary/5 to-healthcare-accent/10 border-healthcare-secondary/20">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-healthcare-primary">ACR</p>
            <Activity className="h-4 w-4 text-healthcare-secondary" />
          </div>
          <p
            className={`text-3xl font-bold mb-1 ${getACRColor(patient.vitals?.acr)}`}
          >
            {patient.vitals?.acr || 'N/A'}
          </p>
          <p className="text-xs text-muted-foreground">mg/g Cr</p>
          <div className="mt-3">
            <Badge
              className={`text-xs ${
                (patient.vitals?.acr || 0) < 30
                  ? 'bg-alert-low'
                  : (patient.vitals?.acr || 0) < 300
                    ? 'bg-amber-600'
                    : 'bg-alert-high'
              } text-white`}
            >
              {getACRCategory(patient.vitals?.acr)}
            </Badge>
          </div>
        </Card>

        {/* 2-Year Risk */}
        <Card className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-healthcare-primary">
              2-Year Risk (MMAI Score)
            </p>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </div>
          <p className={`text-3xl font-bold mb-1 ${riskInfo.color}`}>
            {patient.vitals?.twoYearRisk?.toFixed(1) || 'N/A'}%
          </p>
          <p className="text-xs text-muted-foreground">Kidney Failure</p>
          <div className="mt-3">
            <Progress
              value={Math.min(patient.vitals?.twoYearRisk || 0, 100)}
              className="h-2"
            />
          </div>
        </Card>

        {/* 5-Year Risk */}
        <Card className="p-4 bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-healthcare-primary">
              5-Year Risk (MMAI Score)
            </p>
            <AlertTriangle className="h-4 w-4 text-alert-high" />
          </div>
          <p className={`text-3xl font-bold mb-1 ${riskInfo.color}`}>
            {patient.vitals?.fiveYearRisk?.toFixed(1) || 'N/A'}%
          </p>
          <p className="text-xs text-muted-foreground">Kidney Failure</p>
          <div className="mt-3">
            <Progress
              value={Math.min(patient.vitals?.fiveYearRisk || 0, 100)}
              className="h-2"
            />
          </div>
        </Card>
      </div>

      {/* Risk Level Badge */}
      <div className="flex items-center justify-center gap-3 p-4 bg-healthcare-light/10 rounded-lg border border-healthcare-light/30 mb-6">
        <p className="text-sm font-semibold text-healthcare-primary">
          Overall Risk Level:
        </p>
        <Badge className={`${riskInfo.bgColor} text-white px-4 py-2 text-base`}>
          {riskInfo.level}
        </Badge>
      </div>

      {/* Risk Level Reference Guide */}
      <div className="pt-6 border-t border-gray-200">
        <h4 className="font-semibold text-healthcare-primary mb-4 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          Risk Level Reference
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="p-3 bg-alert-low/10 rounded-lg border border-alert-low/20">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full bg-alert-low"></div>
              <span className="text-xs font-semibold">Low</span>
            </div>
            <p className="text-xs text-muted-foreground">{'<'}2% (2-year)</p>
          </div>
          <div className="p-3 bg-yellow-100 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full bg-yellow-600"></div>
              <span className="text-xs font-semibold">Low-Moderate</span>
            </div>
            <p className="text-xs text-muted-foreground">2-5% (2-year)</p>
          </div>
          <div className="p-3 bg-amber-100 rounded-lg border border-amber-200">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full bg-amber-600"></div>
              <span className="text-xs font-semibold">Moderate</span>
            </div>
            <p className="text-xs text-muted-foreground">5-10% (2-year)</p>
          </div>
          <div className="p-3 bg-orange-100 rounded-lg border border-orange-200">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full bg-orange-600"></div>
              <span className="text-xs font-semibold">High</span>
            </div>
            <p className="text-xs text-muted-foreground">10-20% (2-year)</p>
          </div>
          <div className="p-3 bg-alert-high/10 rounded-lg border border-alert-high/20">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full bg-alert-high"></div>
              <span className="text-xs font-semibold">Very High</span>
            </div>
            <p className="text-xs text-muted-foreground">≥20% (2-year)</p>
          </div>
        </div>

        {/* ACR Categories */}
        <div className="mt-4">
          <h4 className="font-semibold text-healthcare-primary mb-3 text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            ACR Categories (Albumin-to-Creatinine Ratio)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm font-semibold text-green-700 mb-1">
                Normal
              </p>
              <p className="text-xs text-muted-foreground">{'<'}30 mg/g Cr</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
              <p className="text-sm font-semibold text-amber-700 mb-1">
                Moderately Increased
              </p>
              <p className="text-xs text-muted-foreground">30-299 mg/g Cr</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg border border-red-200">
              <p className="text-sm font-semibold text-red-700 mb-1">
                Severely Increased
              </p>
              <p className="text-xs text-muted-foreground">≥300 mg/g Cr</p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Patient {patient.id} Kidney Data</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="eGFR">eGFR (mL/min)</Label>
              <Input
                id="eGFR"
                type="number"
                value={neweGFR}
                onChange={(e) => setNeweGFR(e.target.value)}
                placeholder="Enter eGFR"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="acr">ACR (mg/g Cr)</Label>
              <Input
                id="acr"
                type="number"
                value={newACR}
                onChange={(e) => setNewACR(e.target.value)}
                placeholder="Enter ACR"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="twoYearRisk">2-Year Risk (%)</Label>
              <Input
                id="twoYearRisk"
                type="number"
                value={newTwoYearRisk}
                onChange={(e) => setNewTwoYearRisk(e.target.value)}
                placeholder="Enter 2-Year Risk"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fiveYearRisk">5-Year Risk (%)</Label>
              <Input
                id="fiveYearRisk"
                type="number"
                value={newFiveYearRisk}
                onChange={(e) => setNewFiveYearRisk(e.target.value)}
                placeholder="Enter 5-Year Risk"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="button" className="ml-2" onClick={handleSave}>
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-healthcare-primary">
              {patient.name} - Comprehensive Kidney Health Assessment
            </DialogTitle>
          </DialogHeader>
          <PatientKidneyDetails patient={patient} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
