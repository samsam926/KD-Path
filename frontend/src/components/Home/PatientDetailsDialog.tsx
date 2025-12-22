import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User, Activity, TrendingDown, Calendar } from 'lucide-react';
import { Patient } from '@/contexts/PatientContext';
import { cn } from '@/components/ui/utils';

interface PatientDetailsDialogProps {
  patient: Patient | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  getAlertLevel: (status?: string) => { level: string; color: string; textColor: string };
  getRiskLevel: (risk?: number) => { level: string; color: string };
}

export function PatientDetailsDialog({ 
  patient, 
  open, 
  onOpenChange, 
  getAlertLevel, 
  getRiskLevel 
}: PatientDetailsDialogProps) {
  if (!patient) return null;

  const alert = getAlertLevel(patient.status);
  const twoYearRisk = getRiskLevel(patient.vitals?.twoYearRisk);
  const fiveYearRisk = getRiskLevel(patient.vitals?.fiveYearRisk);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-2xl text-healthcare-primary">
                Patient {patient.id}
              </DialogTitle>
              <DialogDescription>
                Comprehensive patient information and clinical status
              </DialogDescription>
            </div>
            <Badge className={`${alert.color} text-white`}>
              {alert.level}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Demographics */}
          <Card className="p-4 bg-healthcare-light/10">
            <h3 className="font-semibold text-healthcare-primary mb-3 flex items-center gap-2">
              <User className="h-4 w-4" />
              Demographics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Patient ID</p>
                <p className="font-semibold">{patient.id}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Age</p>
                <p className="font-semibold">{patient.age} years</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Gender</p>
                <p className="font-semibold">{patient.gender}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Race</p>
                <p className="font-semibold">{patient.race}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Ward</p>
                <p className="font-semibold">{patient.ward}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Status</p>
                <Badge className={`${alert.color} text-white`}>
                  {patient.status}
                </Badge>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-muted-foreground mb-1">Total Visits</p>
                <p className="font-semibold">{patient.visits?.length || 0} clinical visits</p>
              </div>
            </div>
          </Card>

          {/* Current Vitals */}
          <Card className="p-4">
            <h3 className="font-semibold text-healthcare-primary mb-3 flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Current Vital Signs
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Heart Rate</p>
                <p className="text-xl font-bold text-healthcare-primary">
                  {patient.vitals?.heartRate} <span className="text-sm font-normal">bpm</span>
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Blood Pressure</p>
                <p className="text-xl font-bold text-healthcare-primary">
                  {patient.vitals?.bloodPressureSys}/{patient.vitals?.bloodPressureDia}
                  <span className="text-sm font-normal"> mmHg</span>
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Temperature</p>
                <p className="text-xl font-bold text-healthcare-primary">
                  {patient.vitals?.temperature} <span className="text-sm font-normal">°F</span>
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Oxygen Saturation</p>
                <p className="text-xl font-bold text-healthcare-primary">
                  {patient.vitals?.oxygenSat} <span className="text-sm font-normal">%</span>
                </p>
              </div>
              <div className={cn(
                "p-3 rounded-lg",
                (patient.vitals?.eGFR || 0) < 30 ? 'bg-alert-high/10' :
                (patient.vitals?.eGFR || 0) < 60 ? 'bg-yellow-50' :
                'bg-alert-low/10'
              )}>
                <p className="text-xs text-muted-foreground mb-1">eGFR</p>
                <p className={cn(
                  "text-xl font-bold",
                  (patient.vitals?.eGFR || 0) < 30 ? 'text-alert-high' :
                  (patient.vitals?.eGFR || 0) < 60 ? 'text-yellow-600' :
                  'text-alert-low'
                )}>
                  {patient.vitals?.eGFR} <span className="text-sm font-normal">mL/min</span>
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">ACR</p>
                <p className="text-xl font-bold text-healthcare-primary">
                  {patient.vitals?.acr} <span className="text-sm font-normal">mg/g</span>
                </p>
              </div>
            </div>
          </Card>

          {/* Kidney Failure Risk */}
          <Card className="p-4 bg-alert-high/5 border-alert-high">
            <h3 className="font-semibold text-healthcare-primary mb-3 flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              Kidney Failure Risk Assessment
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <p className="text-sm text-muted-foreground mb-2">2-Year Risk</p>
                <div className="flex items-center justify-between">
                  <p className="text-3xl font-bold text-alert-high">
                    {patient.vitals?.twoYearRisk?.toFixed(1)}%
                  </p>
                  <Badge className={`${twoYearRisk.color} text-white`}>
                    {twoYearRisk.level}
                  </Badge>
                </div>
              </div>
              <div className="p-4 bg-white rounded-lg border border-gray-200">
                <p className="text-sm text-muted-foreground mb-2">5-Year Risk</p>
                <div className="flex items-center justify-between">
                  <p className="text-3xl font-bold text-orange-600">
                    {patient.vitals?.fiveYearRisk?.toFixed(1)}%
                  </p>
                  <Badge className={`${fiveYearRisk.color} text-white`}>
                    {fiveYearRisk.level}
                  </Badge>
                </div>
              </div>
            </div>
          </Card>

          {/* Recent Visit History */}
          {patient.visits && patient.visits.length > 0 && (
            <Card className="p-4">
              <h3 className="font-semibold text-healthcare-primary mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Recent Visit History
              </h3>
              <div className="space-y-3">
                {patient.visits.slice(-3).reverse().map((visit) => (
                  <div key={visit.visitNumber} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-healthcare-primary">
                        Visit #{visit.visitNumber}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(visit.visitDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">eGFR:</span>
                        <span className="font-semibold ml-1">{visit.EGFR}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">BP:</span>
                        <span className="font-semibold ml-1">
                          {visit.BP_SYSTOLIC}/{visit.BP_DIASTOLIC}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">HbA1c:</span>
                        <span className="font-semibold ml-1">{visit.HBA1C}%</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Hb:</span>
                        <span className="font-semibold ml-1">{visit.HEMOGLOBIN}</span>
                      </div>
                    </div>
                    {visit.notes && (
                      <p className="text-sm text-muted-foreground mt-2 italic">
                        "{visit.notes}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              className="flex-1 bg-healthcare-secondary hover:bg-healthcare-primary"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}