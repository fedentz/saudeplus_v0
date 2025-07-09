import { Timestamp } from 'firebase/firestore';
import type { LocalActivity } from '../services/activityService';

export type Conexion = 'wifi' | 'datos_moviles' | 'offline';
export type MetodoGuardado = 'online' | 'offline_post_sync';
export type ActivityStatus = 'pendiente' | 'valida' | 'invalida';
export type InvalidReason = 'vehiculo' | 'no_es_usuario';

export interface ActivityModelProps {
  id: string;
  userId: string;
  startTime: Date;
  endTime: Date;
  date: Date;
  duration: number;
  distance: number;
  conexion: Conexion;
  metodoGuardado: MetodoGuardado;
  status: ActivityStatus;
  invalidReason?: InvalidReason;
  velocidadPromedio: number;
  aceleracionPromedio: number;
}

export default class ActivityModel {
  id: string;
  userId: string;
  startTime: Date;
  endTime: Date;
  date: Date;
  duration: number;
  distance: number;
  conexion: Conexion;
  metodoGuardado: MetodoGuardado;
  status: ActivityStatus;
  invalidReason?: InvalidReason;
  velocidadPromedio: number;
  aceleracionPromedio: number;

  constructor(props: ActivityModelProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.startTime = props.startTime;
    this.endTime = props.endTime;
    this.date = props.date;
    this.duration = props.duration;
    this.distance = props.distance;
    this.conexion = props.conexion;
    this.metodoGuardado = props.metodoGuardado;
    this.status = props.status;
    this.invalidReason = props.invalidReason;
    this.velocidadPromedio = props.velocidadPromedio;
    this.aceleracionPromedio = props.aceleracionPromedio;
  }

  static fromLocalActivity(
    activity: LocalActivity,
    userId: string,
    aceleracionPromedio = 0,
  ): ActivityModel {
    return new ActivityModel({
      id: activity.id,
      userId,
      startTime: new Date(activity.startTime),
      endTime: new Date(activity.endTime),
      date: new Date(activity.startTime),
      duration: activity.duration,
      distance: activity.distance,
      conexion: activity.conexion,
      metodoGuardado: activity.metodoGuardado,
      status: activity.status,
      invalidReason: activity.invalidReason,
      velocidadPromedio: activity.velocidadPromedio,
      aceleracionPromedio,
    });
  }

  toFirestore() {
    return {
      userId: this.userId,
      startTime: Timestamp.fromDate(this.startTime),
      endTime: Timestamp.fromDate(this.endTime),
      date: Timestamp.fromDate(this.date),
      duration: this.duration,
      distance: this.distance,
      conexion: this.conexion,
      metodoGuardado: this.metodoGuardado,
      status: this.status,
      invalidReason: this.invalidReason,
      velocidadPromedio: this.velocidadPromedio,
      aceleracionPromedio: this.aceleracionPromedio,
    };
  }
}

