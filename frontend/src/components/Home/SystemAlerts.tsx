import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/components/ui/utils';

export interface SystemAlert {
  message: string;
  type: 'critical' | 'warning';
  time: string;
  patient: string;
}

interface SystemAlertsProps {
  alerts: SystemAlert[];
  onAlertClick: (patientId: string) => void;
}

export function SystemAlerts({ alerts, onAlertClick }: SystemAlertsProps) {
  return (
    <div className="space-y-2">
      {alerts.map((alert, idx) => (
        <div
          key={idx}
          className={cn(
            "p-3 rounded-lg border-l-4 cursor-pointer hover:bg-gray-50 transition-colors",
            alert.type === 'critical' ? 'bg-alert-high/5 border-alert-high' : 'bg-yellow-50 border-yellow-600'
          )}
          onClick={() => onAlertClick(alert.patient)}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3 flex-1">
              <AlertTriangle className={cn(
                "h-4 w-4 mt-0.5",
                alert.type === 'critical' ? 'text-alert-high' : 'text-yellow-600'
              )} />
              <div className="flex-1">
                <p className="text-sm font-medium text-healthcare-primary">{alert.message}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Click to view patient details
                </p>
              </div>
            </div>
            <Badge
              variant="outline"
              className={cn(
                "text-xs",
                alert.type === 'critical' ? 'border-alert-high text-alert-high' : 'border-yellow-600 text-yellow-600'
              )}
            >
              {alert.time}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}