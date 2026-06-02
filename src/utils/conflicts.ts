import type { Shift, Conflict } from '../types';

const DAY_ORDER = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'] as const;

function timeToMinutes(time: string): number {
  const [h = '0', m = '0'] = time.split(':');
  const hh = Number(h);
  const mm = Number(m);
  return hh * 60 + mm;
}

function shiftsOverlap(a: Shift, b: Shift): boolean {
  if (a.day !== b.day) return false;
  const aStart = timeToMinutes(a.startTime);
  const aEnd = timeToMinutes(a.endTime);
  const bStart = timeToMinutes(b.startTime);
  const bEnd = timeToMinutes(b.endTime);
  return aStart < bEnd && bStart < aEnd;
}

export function detectOverlappingShifts(shifts: Shift[]): Conflict[] {
  const conflicts: Conflict[] = [];
  let counter = 1;

  // Group shifts by employee
  const byEmp = new Map<string, Shift[]>();
  for (const s of shifts) {
    const arr = byEmp.get(s.employeeId) ?? [];
    arr.push(s);
    byEmp.set(s.employeeId, arr);
  }

  for (const [employeeId, arr] of byEmp.entries()) {
    // check all pairs for overlapping on the same day
    for (let i = 0; i < arr.length; i++) {
      for (let j = i + 1; j < arr.length; j++) {
        if (arr[i].day !== arr[j].day) continue;
        if (shiftsOverlap(arr[i], arr[j])) {
          conflicts.push({
            id: `conf-overlap-${Date.now()}-${counter++}`,
            employeeId,
            type: 'OVERLAPPING_SHIFTS',
            message: `Employee ${employeeId} has overlapping shifts on ${arr[i].day}: ${arr[i].startTime}-${arr[i].endTime} and ${arr[j].startTime}-${arr[j].endTime}`,
            shiftIds: [arr[i].id, arr[j].id],
          });
        }
      }
    }
  }

  return conflicts;
}

function dayIndex(day: string): number {
  return DAY_ORDER.indexOf(day as (typeof DAY_ORDER)[number]);
}

export function detectTooManyConsecutiveDays(shifts: Shift[], maxConsecutive = 5): Conflict[] {
  const conflicts: Conflict[] = [];
  let counter = 1;

  const byEmp = new Map<string, Set<number>>();
  const shiftsByEmp = new Map<string, Shift[]>();

  for (const s of shifts) {
    const set = byEmp.get(s.employeeId) ?? new Set<number>();
    set.add(dayIndex(s.day));
    byEmp.set(s.employeeId, set);

    const list = shiftsByEmp.get(s.employeeId) ?? [];
    list.push(s);
    shiftsByEmp.set(s.employeeId, list);
  }

  for (const [employeeId, daySet] of byEmp.entries()) {
    const indices = Array.from(daySet).filter(i => i >= 0).sort((a, b) => a - b);
    if (indices.length === 0) continue;

    // compute longest consecutive streak
    let longest = 1;
    let current = 1;
    for (let i = 1; i < indices.length; i++) {
      if (indices[i] === indices[i - 1] + 1) {
        current += 1;
      } else {
        if (current > longest) longest = current;
        current = 1;
      }
    }
    if (current > longest) longest = current;

    if (longest > maxConsecutive) {
      // collect related shift ids for the employee
      const empShifts = shiftsByEmp.get(employeeId) ?? [];
      const shiftIds = empShifts.map(s => s.id);
      conflicts.push({
        id: `conf-consec-${Date.now()}-${counter++}`,
        employeeId,
        type: 'TOO_MANY_CONSECUTIVE_DAYS',
        message: `Employee ${employeeId} is scheduled for ${longest} consecutive days (limit ${maxConsecutive}).`,
        shiftIds,
      });
    }
  }

  return conflicts;
}

export function detectConflicts(shifts: Shift[], maxConsecutive = 5): Conflict[] {
  const a = detectOverlappingShifts(shifts);
  const b = detectTooManyConsecutiveDays(shifts, maxConsecutive);
  return [...a, ...b];
}
