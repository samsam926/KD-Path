import { BiopsyMechanisticInsights } from '@/components/Patient/BiopsyMechanisticInsights'
import { ClinicalVisitHistory } from '@/components/Patient/ClinicalVisitHistory'
import { DKDStructuralInsights } from '@/components/Patient/DKDStructuralInsights'
import { PatientEGFRTrajectory } from '@/components/Patient/PatientEGFRTrajectory'
import { PatientVisitTracking } from '@/components/Patient/PatientVisitTracking'
import { SinglePatientKidneyRisk } from '@/components/Patient/SinglePatientKidneyRisk'
import { QuickMetrics } from '@/components/Patients/QuickMetrics'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { ReactNode, useState } from 'react'

export const Route = createFileRoute('/_layout/trajectory')({
  component: Trajectory,
  head: () => ({
    meta: [
      {
        title: 'Patient Trajectory - CKD Path'
      }
    ]
  })
})

export function Trajectory(): ReactNode {
  const [trajectoryPatientId, setTrajectoryPatientId] = useState<
    string | undefined
  >(undefined)
  return (
    <main className="flex-1 overflow-auto bg-background">
      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-healthcare-primary">
              Patient Trajectory Overview
            </h1>
            <p className="text-muted-foreground mt-1">
              Comprehensive kidney function tracking and predictive analytics
              for CKD patients.
            </p>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            <div>
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
            <div className="font-semibold text-healthcare-primary">
              {new Date().toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        </div>

        {/* Quick Metrics */}
        <QuickMetrics />

        {/* Patient Visit Tracking - Full Width */}
        <PatientVisitTracking onPatientSelect={setTrajectoryPatientId} />

        {/* Clinical Visit History & Trends Chart - Full Width */}
        <ClinicalVisitHistory patientId={trajectoryPatientId} />

        {/* Patient eGFR Trajectory by Age - Full Width */}
        <PatientEGFRTrajectory primaryPatientId={trajectoryPatientId} />

        {/* Biopsy & Mechanistic Insights - Full Width */}
        <BiopsyMechanisticInsights patientId={trajectoryPatientId || 'PT010'} />

        {/* Critical Patients Management */}
        {/* <CriticalPatientsSection /> */}

        {/* DKD Structural Insights - Full Width */}
        <DKDStructuralInsights
          patientId={trajectoryPatientId || 'PT010'}
          isActive={!!trajectoryPatientId}
        />
      </div>
    </main>
  )
}
