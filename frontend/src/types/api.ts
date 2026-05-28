export type Client = {
  id: number;
  name: string;
  color: string;
  hourly_rate: string | null;
  created_at: string;
};

export type Shift = {
  id: number;
  client_id: number;
  start_time: string;
  end_time: string;
  break_minutes: number;
  driving_extra: string;
  notes: string | null;
  created_at: string;
  worked_hours: string;
  estimated_pay: string | null;
  client: Client;
};

export type PeriodSummary = {
  hours: string;
  estimated_money: string;
  driving_extras: string;
};

export type DashboardSummary = {
  today: PeriodSummary;
  week: PeriodSummary;
  month: PeriodSummary;
  recent_shifts: Shift[];
};

export type ClientInput = {
  name: string;
  color: string;
  hourly_rate?: number | null;
};

export type ShiftInput = {
  client_id: number;
  start_time: string;
  end_time: string;
  break_minutes?: number;
  driving_extra?: number;
  notes?: string | null;
};
