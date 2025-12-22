import { Card } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import { Patient } from '@/contexts/PatientContext';
import { cn } from '@/components/ui/utils';

interface RecentActivityProps {
  patients: Patient[];
  onPatientClick: (patientId: string) => void;
  getAlertLevel: (status?: string) => { level: string; color: string; textColor: string };
}

export function RecentActivity({ patients, onPatientClick, getAlertLevel }: RecentActivityProps) {
  return (
    <div className="space-y-3">
      {patients.map((patient) => {
        const alert = getAlertLevel(patient.status);
        const timeSince = Math.floor((Date.now() - new Date(patient.updatedAt).getTime()) / (1000 * 60 * 60));
        const timeText = timeSince < 1 ? 'Just now' : timeSince < 24 ? `${timeSince}h ago` : `${Math.floor(timeSince / 24)}d ago`;

        return (
          <div
            key={patient.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            onClick={() => onPatientClick(patient.id)}
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-2 h-2 rounded-full",
                patient.status?.includes('discharged') ? 'bg-gray-400' : alert.color
              )} />
              <div>
                <p className="text-sm font-medium text-healthcare-primary">
                  Patient {patient.id}
                </p>
                <p className="text-xs text-muted-foreground">
                  {patient.status?.includes('discharged') ? 'Discharged' : `Updated status: ${patient.status}`}
                </p>
              </div>
            </div>
            <span className="text-xs text-muted-foreground">{timeText}</span>
          </div>
        );
      })}
    </div>
  );
}