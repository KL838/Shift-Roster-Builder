export type Role = 'Cashier' | 'Supervisor' | 'Cook' | 'Floor' | (string & {});

export interface Employee {
  id: string;
  name: string;
  roles: Role[];
}

export type DayOfWeek = 
  | 'Monday' 
  | 'Tuesday' 
  | 'Wednesday' 
  | 'Thursday' 
  | 'Friday' 
  | 'Saturday' 
  | 'Sunday';

export interface Shift {
  id: string;
  employeeId: string;
  role: Role;
  day: DayOfWeek;
  startTime: string; // Format: "HH:mm" e.g., "09:00"
  endTime: string;   // Format: "HH:mm" e.g., "17:00"
}

export type ConflictType = 'OVERLAPPING_SHIFTS' | 'TOO_MANY_CONSECUTIVE_DAYS';

export interface Conflict {
  id: string;
  employeeId: string;
  type: ConflictType;
  message: string;
  shiftIds?: string[]; // The shifts involved in this conflict, if applicable
}
