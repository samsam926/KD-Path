import { useState } from 'react';
import { usePatients } from '../../contexts/PatientContext';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Bell, AlertCircle } from 'lucide-react';
import { QuickMetrics } from '@/components/Patients/QuickMetrics';
import { SystemAlerts, SystemAlert } from '@/components/Home/SystemAlerts';
import { RecentActivity } from '@/components/Home/RecentActivity';
import { ClinicalInsights } from '@/components/Home/ClinicalInsights';
import { WardDistribution } from '@/components/Home/WardDistribution';
import { HighAlertPatientsList } from '@/components/Home/HighAlertPatientsList';
import { PatientDetailsDialog } from '@/components/Home/PatientDetailsDialog';

export function HomeView() {
  const { patients } = usePatients();
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [expandedPatients, setExpandedPatients] = useState<Set<string>>(new Set());

  // Filter high alert patients (CKD, Fast Progression CKD)
  const highAlertPatients = patients.filter(
    patient => 
      patient.status === 'CKD' || 
      patient.status === 'Fast Progression CKD' ||
      patient.status === 'CKD uncertainty' ||
      patient.status === 'FastCKD uncertainty'
  );

  const currentPatient = selectedPatient ? patients.find(p => p.id === selectedPatient) : null;

  const toggleExpand = (patientId: string) => {
    setExpandedPatients(prev => {
      const newSet = new Set(prev);
      if (newSet.has(patientId)) {
        newSet.delete(patientId);
      } else {
        newSet.add(patientId);
      }
      return newSet;
    });
  };

  const getAlertLevel = (status?: string) => {
    if (status === 'CKD' || status === 'Fast Progression CKD') {
      return { level: 'Critical', color: 'bg-alert-high', textColor: 'text-alert-high' };
    }
    if (status === 'CKD uncertainty' || status === 'FastCKD uncertainty') {
      return { level: 'Warning', color: 'bg-yellow-600', textColor: 'text-yellow-600' };
    }
    return { level: 'Normal', color: 'bg-alert-low', textColor: 'text-alert-low' };
  };

  const getRiskLevel = (risk?: number) => {
    if (!risk) return { level: 'Unknown', color: 'bg-gray-500' };
    if (risk >= 10) return { level: 'Very High', color: 'bg-alert-high' };
    if (risk >= 5) return { level: 'High', color: 'bg-orange-600' };
    if (risk >= 2) return { level: 'Moderate', color: 'bg-yellow-600' };
    return { level: 'Low', color: 'bg-alert-low' };
  };

  // Calculate additional stats
  const activePatients = patients.filter(p => !p.status?.includes('discharged'));
  const wardDistribution = activePatients.reduce((acc, patient) => {
    acc[patient.ward] = (acc[patient.ward] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topWards = Object.entries(wardDistribution)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  // Calculate patients with declining eGFR
  const patientsWithDecliningEGFR = activePatients.filter(patient => {
    if (!patient.visits || patient.visits.length < 2) return false;
    const recentVisits = patient.visits.slice(-2);
    return recentVisits[1].EGFR < recentVisits[0].EGFR;
  });

  // Calculate average eGFR
  const avgEGFR = activePatients.reduce((sum, p) => sum + (p.vitals?.eGFR || 0), 0) / activePatients.length || 0;

  // Recent activity (sort by creation/update date)
  const recentActivity = [...patients]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  // Generate system alerts
  const systemAlerts: SystemAlert[] = [
    ...patientsWithDecliningEGFR.slice(0, 3).map(p => ({
      type: 'warning' as const,
      message: `Patient ${p.id} showing declining eGFR trend`,
      patient: p.id,
      time: 'Recent'
    })),
    ...highAlertPatients.filter(p => (p.vitals?.twoYearRisk || 0) >= 10).slice(0, 2).map(p => ({
      type: 'critical' as const,
      message: `Patient ${p.id} has very high kidney failure risk (${p.vitals?.twoYearRisk?.toFixed(1)}%)`,
      patient: p.id,
      time: 'Urgent'
    })),
    ...activePatients.filter(p => (p.vitals?.oxygenSat || 100) < 90).map(p => ({
      type: 'critical' as const,
      message: `Patient ${p.id} has low oxygen saturation (${p.vitals?.oxygenSat}%)`,
      patient: p.id,
      time: 'Critical'
    }))
  ].slice(0, 6);

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-healthcare-primary">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Real-time patient monitoring and alerts</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Last updated</p>
          <p className="font-medium text-healthcare-primary">{new Date().toLocaleString()}</p>
        </div>
      </div>

      {/* Quick Metrics */}
      <QuickMetrics />

      {/* Two Column Layout: Alerts & Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - System Alerts & Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* System Alerts */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-healthcare-primary flex items-center gap-2">
                <Bell className="h-5 w-5" />
                System Alerts & Warnings
              </h3>
              <Badge className="bg-alert-high text-white">{systemAlerts.length}</Badge>
            </div>
            {systemAlerts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No active alerts</p>
              </div>
            ) : (
              <SystemAlerts alerts={systemAlerts} onAlertClick={setSelectedPatient} />
            )}
          </Card>

          {/* Recent Activity */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-healthcare-primary flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Activity
              </h3>
            </div>
            <RecentActivity 
              patients={recentActivity} 
              onPatientClick={setSelectedPatient}
              getAlertLevel={getAlertLevel}
            />
          </Card>
        </div>

        {/* Right Column - Quick Stats & Ward Distribution */}
        <div className="space-y-6">
          {/* Clinical Insights */}
          <ClinicalInsights 
            avgEGFR={avgEGFR} 
            patientsWithDecliningEGFR={patientsWithDecliningEGFR}
            activePatients={activePatients}
          />

          {/* Ward Distribution */}
          <WardDistribution 
            topWards={topWards}
            activePatients={activePatients}
          />
        </div>
      </div>

      {/* High Alert Patients Grid */}
      <div>
        <h2 className="text-lg font-semibold text-healthcare-primary mb-4">High Alert Patients</h2>

        <HighAlertPatientsList
          patients={highAlertPatients}
          expandedPatients={expandedPatients}
          toggleExpand={toggleExpand}
          getAlertLevel={getAlertLevel}
          getRiskLevel={getRiskLevel}
          onSelectPatient={setSelectedPatient}
        />
      </div>

      {/* Patient Details Dialog */}
      <PatientDetailsDialog
        open={!!selectedPatient}
        onOpenChange={() => setSelectedPatient(null)}
        patient={currentPatient}
        getAlertLevel={getAlertLevel}
        getRiskLevel={getRiskLevel}
      />
    </div>
  );
}