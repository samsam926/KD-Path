import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Users, AlertTriangle, Activity } from 'lucide-react';
import { cn } from '@/components/ui/utils';
import { usePatients } from '@/contexts/PatientContext';

export function QuickMetrics() {
  const { patients } = usePatients();
  
  // Calculate metrics
  const totalPatients = patients.length;
  const criticalPatients = patients.filter(p => 
    p.status === 'CKD' || 
    p.status === 'Fast Progression CKD' || 
    p.status === 'FastCKD uncertainty'
  ).length;
  
  // Active patients are those not discharged
  const activePatients = patients.filter(p => !p.dischargedAt).length;
  
  // Calculate gender distribution
  const genderDistribution = patients.reduce((acc, patient) => {
    const gender = patient.gender || 'Unknown';
    acc[gender] = (acc[gender] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Calculate race distribution
  const raceDistribution = patients.reduce((acc, patient) => {
    const race = patient.race || 'Unknown';
    acc[race] = (acc[race] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Get top 3 races
  const topRaces = Object.entries(raceDistribution)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);
  
  // Calculate status distribution
  const healthyCount = patients.filter(p => p.status === 'Healthy').length;
  const ckdCount = patients.filter(p => p.status === 'CKD').length;
  const fastCkdCount = patients.filter(p => p.status === 'Fast Progression CKD').length;
  const uncertainCount = patients.filter(p => p.status === 'FastCKD uncertainty').length;
  
  const healthyPercent = totalPatients > 0 ? Math.round((healthyCount / totalPatients) * 100) : 0;
  const ckdPercent = totalPatients > 0 ? Math.round((ckdCount / totalPatients) * 100) : 0;
  const fastCkdPercent = totalPatients > 0 ? Math.round((fastCkdCount / totalPatients) * 100) : 0;
  
  const metrics = [
    {
      title: 'Total Patients',
      value: totalPatients.toString(),
      change: '+' + Math.floor(totalPatients * 0.12),
      trend: 'up',
      icon: Users,
      color: 'healthcare-secondary',
      subtitle: `${genderDistribution['Male'] || 0} Male, ${genderDistribution['Female'] || 0} Female`
    },
    {
      title: 'Active Patients',
      value: activePatients.toString(),
      change: '+' + Math.floor(activePatients * 0.05),
      trend: 'up',
      icon: Users,
      color: 'healthcare-accent',
      subtitle: topRaces.map(([race, count]) => `${count} ${race}`).join(', ')
    },
    {
      title: 'Critical Alerts',
      value: criticalPatients.toString(),
      change: criticalPatients > 0 ? '+' + criticalPatients : '0',
      trend: criticalPatients > 0 ? 'up' : 'down',
      icon: AlertTriangle,
      color: 'alert-high',
      subtitle: `${Math.round((criticalPatients / totalPatients) * 100)}% of total patients`
    },
    {
      title: 'Patient Status',
      value: `${healthyPercent}%`,
      change: `${healthyCount} Healthy`,
      trend: 'up',
      icon: Activity,
      color: 'healthcare-primary',
      subtitle: `${ckdCount} CKD (${ckdPercent}%), ${fastCkdCount} Fast Prog (${fastCkdPercent}%)`
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        const isPositive = metric.trend === 'up';
        const TrendIcon = isPositive ? TrendingUp : TrendingDown;
        
        return (
          <Card key={metric.title} className="p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={cn(
                "p-3 rounded-lg",
                `bg-${metric.color}/10`
              )}>
                <Icon className={cn("h-6 w-6", `text-${metric.color}`)} />
              </div>
              <div className={cn(
                "flex items-center gap-1 text-sm px-2 py-1 rounded-full",
                isPositive && metric.color !== 'alert-high' 
                  ? "text-alert-low bg-alert-low/10" 
                  : metric.color === 'alert-high'
                  ? "text-alert-high bg-alert-high/10"
                  : "text-alert-low bg-alert-low/10"
              )}>
                <TrendIcon className="h-3 w-3" />
                <span>{metric.change}</span>
              </div>
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-healthcare-primary mb-1">
                {metric.value}
              </h3>
              <p className="text-muted-foreground text-sm mb-2">{metric.title}</p>
              <p className="text-xs text-muted-foreground/80">{metric.subtitle}</p>
            </div>
          </Card>
        );
      })}
    </div>
  );
}