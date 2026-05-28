import type { Client } from "../types/api";
import { fromDatetimeLocalValue } from "./time";

export type ShiftFieldErrors = {
  client?: string;
  start?: string;
  end?: string;
  break?: string;
};

export function validateShiftFields(
  clientId: number | "",
  startLocal: string,
  endLocal: string,
  breakMinutes: number,
): ShiftFieldErrors {
  const errors: ShiftFieldErrors = {};
  if (!clientId) {
    errors.client = "Selecciona un cliente o lugar";
  }
  if (!startLocal || !endLocal) {
    return errors;
  }

  const start = new Date(fromDatetimeLocalValue(startLocal));
  const end = new Date(fromDatetimeLocalValue(endLocal));

  if (end <= start) {
    errors.end = "La hora de fin debe ser posterior al inicio";
  }

  const durationMinutes = (end.getTime() - start.getTime()) / 60_000;
  if (breakMinutes < 0) {
    errors.break = "El descanso no puede ser negativo";
  } else if (durationMinutes > 0 && breakMinutes >= durationMinutes) {
    errors.break = "El descanso debe ser menor que la duración de la jornada";
  }

  return errors;
}

export function previewShift(
  client: Client | undefined,
  startLocal: string,
  endLocal: string,
  breakMinutes: number,
  drivingExtra: number,
): { hours: number; pay: number | null } | null {
  if (!startLocal || !endLocal) return null;
  const start = new Date(fromDatetimeLocalValue(startLocal));
  const end = new Date(fromDatetimeLocalValue(endLocal));
  if (end <= start) return null;

  const netMinutes = Math.max(0, (end.getTime() - start.getTime()) / 60_000 - breakMinutes);
  const hours = Math.round((netMinutes / 60) * 100) / 100;

  const rate = client?.hourly_rate ? Number(client.hourly_rate) : null;
  let pay: number | null = null;
  if (rate !== null && !Number.isNaN(rate)) {
    pay = Math.round((hours * rate + drivingExtra) * 100) / 100;
  } else if (drivingExtra > 0) {
    pay = drivingExtra;
  }

  return { hours, pay };
}
