export type Client = {
  id: number;
  name: string;
  color: string;
  hourly_rate: string | null;
  archived_at?: string | null;
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

export type ClientPeriodSummary = {
  client_id: number;
  client_name: string;
  client_color: string;
  hourly_rate: string | null;
  hours: string;
  estimated_money: string;
  driving_extras: string;
  shift_count: number;
};

export type DashboardSummary = {
  today: PeriodSummary;
  week: PeriodSummary;
  month: PeriodSummary;
  by_client_week: ClientPeriodSummary[];
  by_client_month: ClientPeriodSummary[];
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

export type ActiveTimer = {
  id: number;
  client_id: number;
  started_at: string;
  notes: string | null;
  created_at: string;
  client: Client;
  elapsed_seconds: number;
};

export type TimerStopDraft = {
  client_id: number;
  start_time: string;
  end_time: string;
  break_minutes: number;
  driving_extra: number;
  notes: string | null;
  client: Client;
};
