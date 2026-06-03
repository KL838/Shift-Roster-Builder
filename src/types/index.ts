export const PREDEFINED_ROLES = ['Cashier', 'Supervisor', 'Cook', 'Floor'] as const;
export type Role = typeof PREDEFINED_ROLES[number] | (string & {});

export interface Employee {
  id: string;
  name: string;
  roles: Role[];
  // Days this employee is NOT available to work (e.g. ['Monday'])
  unavailableDays?: DayOfWeek[];
}

export const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
] as const;

export type DayOfWeek = typeof DAYS_OF_WEEK[number];

export interface Shift {
  id: string;
  employeeId: string;
  role: Role;
  day: DayOfWeek;
  startTime: string; // Format: "HH:mm" e.g., "09:00"
  endTime: string;   // Format: "HH:mm" e.g., "17:00"
}

export type ConflictType = 'OVERLAPPING_SHIFTS' | 'TOO_MANY_CONSECUTIVE_DAYS' | 'UNAVAILABLE_DAY';

export interface Conflict {
  id: string;
  employeeId: string;
  type: ConflictType;
  message: string;
  shiftIds?: string[]; // The shifts involved in this conflict, if applicable
}
