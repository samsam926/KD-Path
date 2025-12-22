import { Card } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { Patient } from '@/contexts/PatientContext';

interface ClinicalInsightsProps {
  avgEGFR: number;
  patientsWithDecliningEGFR: Patient[];
  activePatients: Patient[];
}

export function ClinicalInsights({ avgEGFR, patientsWithDecliningEGFR, activePatients }: ClinicalInsightsProps) {
  return (
    <Card className="p-4">
      <h3 className="font-semibold text-healthcare-primary mb-4 flex items-center gap-2">
        <TrendingUp className="h-5 w-5" />
        Clinical Insights
      </h3>
      <div className="space-y-4">
        <div className="p-3 bg-healthcare-light/10 rounded-lg">
          <p className="text-xs text-muted-foreground mb-1">Average eGFR</p>
          <p className="text-2xl font-bold text-healthcare-primary">
            {avgEGFR.toFixed(1)} <span className="text-sm font-normal">mL/min</span>
          </p>
        </div>
        <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-xs text-muted-foreground mb-1">Declining eGFR</p>
          <p className="text-2xl font-bold text-yellow-600">
            {patientsWithDecliningEGFR.length} <span className="text-sm font-normal">patients</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Showing decline in recent visits
          </p>
        </div>
        <div className="p-3 bg-alert-low/10 rounded-lg">
          <p className="text-xs text-muted-foreground mb-1">Active Patients</p>
          <p className="text-2xl font-bold text-alert-low">
            {activePatients.length} <span className="text-sm font-normal">total</span>
          </p>
        </div>
      </div>
    </Card>
  );
}