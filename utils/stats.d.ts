export interface ActivityEntry {
  date: Date;
  distance: number;
  duration: number;
}

export interface MonthlyStats {
  month: string;
  totalActivities: number;
  totalDistance: number;
  totalTime: number;
}

export type ActivityStatus = 'pendiente' | 'valida' | 'invalida';
export type InvalidReason = 'vehiculo' | 'no_es_usuario';

export interface EvaluationResult {
  status: ActivityStatus;
  invalidReason?: InvalidReason;
  velocidadPromedio: number;
}

export function groupByMonth(activities: ActivityEntry[]): MonthlyStats[];
export function calculateAverageSpeed(distanceKm: number, durationSec: number): number;
export function evaluateActivityStatus(distanceKm: number, durationSec: number): EvaluationResult;
