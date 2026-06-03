import React, { useEffect, useState, useRef } from 'react';
import type { Employee, Shift, Conflict, DayOfWeek, Role } from './types';
import { PREDEFINED_ROLES } from './types';
import { detectConflicts, timeToMinutes } from './utils/conflicts';
import './App.css';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;

const uid = () => Math.random().toString(36).slice(2, 9);

function App() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [draggingShiftId, setDraggingShiftId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const timetableRef = useRef<HTMLDivElement | null>(null);

  // Employee form state
  const [name, setName] = useState('');
  const [rolesInput, setRolesInput] = useState('');
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null);
  const [unavailableDaysSelection, setUnavailableDaysSelection] = useState<DayOfWeek[]>([]);

  const currentRoleToken = rolesInput.split(',').pop()?.trim() ?? '';
  const currentRoleValues = rolesInput.split(',').map(r => r.trim()).filter(Boolean);
  const roleSuggestions = currentRoleToken.length > 0
    ? PREDEFINED_ROLES.filter(role => role.toLowerCase().includes(currentRoleToken.toLowerCase()) && !currentRoleValues.includes(role))
    : [];

  const chooseRoleSuggestion = (role: Role) => {
    const segments = rolesInput.split(',');
    segments[segments.length - 1] = ` ${role}`;
    setRolesInput(segments.join(',').replace(/^\s+/, '').replace(/,\s*,/g, ',').replace(/\s+$/, '') + ', ');
  };

  const toggleUnavailableDay = (d: DayOfWeek) => {
    setUnavailableDaysSelection(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]);
  };

  // Shift form state
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [shiftDay, setShiftDay] = useState<string>(DAYS[0]);
  const [shiftStart, setShiftStart] = useState('09:00');
  const [shiftEnd, setShiftEnd] = useState('17:00');
  const [shiftRole, setShiftRole] = useState('');

  useEffect(() => {
    setConflicts(detectConflicts(shifts));
  }, [shifts]);

  useEffect(() => {
    const emp = employees.find(e => e.id === selectedEmployeeId);
    setShiftRole(emp?.roles?.[0] ?? '');
  }, [selectedEmployeeId, employees]);

  // LocalStorage persistence
  const STORAGE_KEYS = { employees: 'roster.employees', shifts: 'roster.shifts' } as const;

  // Hydrate state from localStorage on mount
  useEffect(() => {
    try {
      const rawEmp = localStorage.getItem(STORAGE_KEYS.employees);
      if (rawEmp) setEmployees(JSON.parse(rawEmp));
      const rawShifts = localStorage.getItem(STORAGE_KEYS.shifts);
      if (rawShifts) setShifts(JSON.parse(rawShifts));
    } catch (err) {
      // ignore malformed data
      // eslint-disable-next-line no-console
      console.warn('Failed to hydrate roster from localStorage', err);
    }
  }, []);

  // Save employees
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.employees, JSON.stringify(employees));
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('Failed to save employees to localStorage', err);
    }
  }, [employees]);

  // Save shifts
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.shifts, JSON.stringify(shifts));
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('Failed to save shifts to localStorage', err);
    }
  }, [shifts]);

  const addOrUpdateEmployee = (e?: React.FormEvent) => {
    e?.preventDefault();
    const roles = rolesInput.split(',').map(r => r.trim()).filter(Boolean);
    if (!name.trim() || roles.length === 0) {
      alert('Provide a name and at least one role (comma-separated)');
      return;
    }

    if (editingEmployeeId) {
      setEmployees(prev => prev.map(emp => emp.id === editingEmployeeId ? { ...emp, name: name.trim(), roles, unavailableDays: unavailableDaysSelection } : emp));
      setEditingEmployeeId(null);
    } else {
      const newEmp: Employee = { id: uid(), name: name.trim(), roles, unavailableDays: unavailableDaysSelection };
      setEmployees(prev => [...prev, newEmp]);
    }

    setName('');
    setRolesInput('');
    setUnavailableDaysSelection([]);
  };

  const startEditEmployee = (emp: Employee) => {
    setEditingEmployeeId(emp.id);
    setName(emp.name);
    setRolesInput(emp.roles.join(', '));
    setUnavailableDaysSelection(emp.unavailableDays ?? []);
  };

  const removeEmployee = (id: string) => {
    if (!confirm('Remove this employee and all their shifts?')) return;
    setEmployees(prev => prev.filter(e => e.id !== id));
    setShifts(prev => prev.filter(s => s.employeeId !== id));
  };

  const addShift = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!selectedEmployeeId) { alert('Select an employee'); return; }
    if (!shiftRole) { alert('Select a role for the shift'); return; }
    const emp = employees.find(x => x.id === selectedEmployeeId);
    if (emp?.unavailableDays?.includes(shiftDay as DayOfWeek)) { alert(`${emp.name} is unavailable on ${shiftDay}`); return; }
    const newShift: Shift = {
      id: uid(),
      employeeId: selectedEmployeeId,
      role: shiftRole as any,
      day: shiftDay as any,
      startTime: shiftStart,
      endTime: shiftEnd,
    };
    setShifts(prev => [...prev, newShift]);
  };

  const removeShift = (id: string) => {
    setShifts(prev => prev.filter(s => s.id !== id));
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggingShiftId(id);
  };

  const handleDragEnd = () => {
    setDraggingShiftId(null);
    setDropTarget(null);
  };

  const exportCsv = () => {
    // Rows: Employee, Day, Role, Start, End, Duration (minutes)
    const rows: string[] = [];
    rows.push(['Employee', 'Day', 'Role', 'Start', 'End', 'DurationMinutes'].join(','));
    shifts.forEach(s => {
      const emp = employees.find(e => e.id === s.employeeId);
      const duration = Math.max(0, timeToMinutes(s.endTime) - timeToMinutes(s.startTime));
      rows.push([`"${emp?.name ?? s.employeeId}"`, s.day, s.role, s.startTime, s.endTime, String(duration)].join(','));
    });
    const csv = rows.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'roster.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPng = async () => {
    const el = timetableRef.current;
    if (!el) { alert('Roster area not found'); return; }
    // Add class to hide remove buttons during capture
    el.classList.add('exporting');
    try {
      // dynamic import to avoid requiring dependency at build-time if not installed
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mod = await import('html2canvas');
      const html2canvas = (mod as any).default ?? mod;
      const canvas = await html2canvas(el as HTMLElement, { backgroundColor: '#ffffff', scale: 2 });
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = 'roster.png';
      a.click();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Export PNG failed', err);
      alert('Export PNG failed — check console for details.');
    } finally {
      el.classList.remove('exporting');
    }
  };

  const conflictShiftIds = new Set<string>();
  conflicts.forEach(c => c.shiftIds?.forEach(id => conflictShiftIds.add(id)));

  const draggingShift = shifts.find(s => s.id === draggingShiftId) ?? null;

  return (
    <div className="app-container">
      <header>
        <h1>Shift Roster Builder</h1>
        <p className="subtitle">Add employees and assign shifts — conflicts are highlighted automatically.</p>
      </header>

      <main className="main-content">
        <aside>
          <section className="employees-panel">
            <h2>Employees</h2>
            <form onSubmit={addOrUpdateEmployee}>
              <div className="form-row">
                <input placeholder="Name" value={name} onChange={ev => setName(ev.target.value)} />
              </div>
              <div className="form-row">
                <input placeholder="Roles (comma-separated)" value={rolesInput} onChange={ev => setRolesInput(ev.target.value)} />
                {roleSuggestions.length > 0 && (
                  <div className="suggestions-list">
                    {roleSuggestions.map(role => (
                      <button key={role} type="button" className="suggestion-item" onMouseDown={() => chooseRoleSuggestion(role)}>
                        {role}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="form-row">
                <label style={{ display: 'block', marginTop: 6, fontSize: 12 }}>Unavailable days:</label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
                  {DAYS.map(d => (
                    <label key={d} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <input type="checkbox" checked={unavailableDaysSelection.includes(d as DayOfWeek)} onChange={() => toggleUnavailableDay(d as DayOfWeek)} />
                      <span style={{ fontSize: 13 }}>{d.slice(0,3)}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div style={{ marginTop: 8 }}>
                <button type="submit">{editingEmployeeId ? 'Save Employee' : 'Add Employee'}</button>
                {editingEmployeeId && <button type="button" onClick={() => { setEditingEmployeeId(null); setName(''); setRolesInput(''); }} style={{ marginLeft: 8 }}>Cancel</button>}
              </div>
            </form>

            <div style={{ marginTop: 12 }}>
              {employees.length === 0 ? <p>No employees yet.</p> : (
                <ul>
                  {employees.map(emp => (
                    <li key={emp.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
                      <span>
                        {emp.name} — <small style={{ color: '#555' }}>{emp.roles.join(', ')}</small>
                        {emp.unavailableDays && emp.unavailableDays.length > 0 && (
                          <div style={{ fontSize: 11, color: '#FF6E6E', marginTop: 4 }}>Unavailable: {emp.unavailableDays.join(', ')}</div>
                        )}
                      </span>
                      <span>
                        <button onClick={() => startEditEmployee(emp)} className="btn-small">Edit</button>
                        <button onClick={() => removeEmployee(emp.id)} className="btn-small" style={{ marginLeft: 6 }}>Delete</button>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          <section className="summary-panel" style={{ marginTop: 12 }}>
            <h2>Summary</h2>
              {employees.length === 0 ? (
                <p>Assigned hours of each employee will go here.</p>
              ) : (
                <div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {employees.map(emp => {
                      const mins = shifts
                        .filter(s => s.employeeId === emp.id)
                        .reduce((sum, s) => sum + Math.max(0, timeToMinutes(s.endTime) - timeToMinutes(s.startTime)), 0);
                      const hrs = Math.floor(mins / 60);
                      const rem = mins % 60;
                      return (
                        <li key={emp.id} style={{ padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                          <strong>{emp.name}</strong>: {hrs}h {rem}m
                        </li>
                      );
                    })}
                  </ul>
                  <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                    <button onClick={exportPng} className="btn-small">Export PNG</button>
                    <button onClick={exportCsv} className="btn-small">Export CSV</button>
                  </div>
                </div>
              )}
          </section>
        </aside>

        <section className="roster-grid">
          <h2>Weekly Roster</h2>

          <form onSubmit={addShift} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
            <select value={selectedEmployeeId} onChange={e => setSelectedEmployeeId(e.target.value)}>
              <option value="">Select employee</option>
              {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
            </select>
            <select value={shiftRole} onChange={e => setShiftRole(e.target.value)}>
              <option value="">Role</option>
              {employees.find(e => e.id === selectedEmployeeId)?.roles.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <select value={shiftDay} onChange={e => setShiftDay(e.target.value)}>
              {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <input type="time" value={shiftStart} onChange={e => setShiftStart(e.target.value)} />
            <input type="time" value={shiftEnd} onChange={e => setShiftEnd(e.target.value)} />
            <button type="submit">Add Shift</button>
            <button type="button" onClick={() => { setEmployees([]); setShifts([]); setConflicts([]); }} style={{ marginLeft: 'auto' }}>Clear All</button>
          </form>

          <div className="grid-scroll" ref={timetableRef}>
            <table className="roster-table">
              <thead>
                <tr>
                  <th className="name-col">Employee</th>
                  {DAYS.map(day => <th key={day}>{day}</th>)}
                </tr>
              </thead>
              <tbody>
                {employees.map(emp => (
                  <tr key={emp.id}>
                    <td className="name-col">{emp.name}</td>
                    {DAYS.map(day => {
                      const isUnavailable = emp.unavailableDays?.includes(day as DayOfWeek);
                      const cellShifts = shifts.filter(s => s.employeeId === emp.id && s.day === day);
                      const cellHasConflict = cellShifts.some(s => conflictShiftIds.has(s.id));
                      const targetKey = `${emp.id}::${day}`;
                      const isDropTarget = dropTarget === targetKey;
                      const overlayId = (`stripe-${emp.id}-${day}`).replace(/\s+/g, '');
                      return (
                        <td key={day}
                          className={`${cellHasConflict ? 'cell-conflict' : ''} ${isDropTarget ? 'cell-drop-target' : ''} ${isUnavailable ? 'cell-unavailable' : ''}`}
                          onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDropTarget(targetKey); }}
                          onDragEnter={() => setDropTarget(targetKey)}
                          onDragLeave={() => setDropTarget(null)}
                          onDrop={e => {
                            e.preventDefault();
                            const id = e.dataTransfer.getData('text/plain');
                            if (!id) return;
                            if (isUnavailable) {
                              alert(`${emp.name} is unavailable on ${day}`);
                              setDropTarget(null);
                              setDraggingShiftId(null);
                              return;
                            }
                            setShifts(prev => prev.map(s => s.id === id ? { ...s, employeeId: emp.id, day } : s));
                            setDropTarget(null);
                            setDraggingShiftId(null);
                          }}
                        >
                          {isUnavailable && (
                            <svg className="unavailable-overlay" aria-hidden="true" viewBox="0 0 12 12" preserveAspectRatio="none">
                              <defs>
                                    <pattern id={overlayId} patternUnits="userSpaceOnUse" width="8" height="8" patternTransform="rotate(45)">
                                      <rect x="0" y="0" width="2" height="8" fill="#b10000" />
                                      <rect x="2" y="0" width="2" height="8" fill="#cc0000" />
                                      <rect x="4" y="0" width="2" height="8" fill="#b10000" />
                                      <rect x="6" y="0" width="2" height="8" fill="#cc0000" />
                                    </pattern>
                              </defs>
                              <rect width="100%" height="100%" fill={`url(#${overlayId})`} />
                            </svg>
                          )}
                          {cellShifts.length === 0 ? (
                            // show preview if dragging and target is different
                            isDropTarget && draggingShift && (draggingShift.employeeId !== emp.id || draggingShift.day !== day) ? (
                              <div className="shift-preview">
                                <div className="shift-time">{draggingShift.startTime}–{draggingShift.endTime}</div>
                                <div className="shift-role">{draggingShift.role}</div>
                              </div>
                            ) : (
                              <div className="empty-cell">—</div>
                            )
                          ) : (
                            <>
                              {cellShifts.map(s => (
                                <div key={s.id}
                                  draggable
                                  onDragStart={ev => handleDragStart(ev, s.id)}
                                  onDragEnd={handleDragEnd}
                                  className={`shift-item ${conflictShiftIds.has(s.id) ? 'conflict' : ''} ${draggingShiftId === s.id ? 'dragging' : ''}`}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
                                    <div>
                                      <div className="shift-time">{s.startTime}–{s.endTime}</div>
                                      <div className="shift-role">{s.role}</div>
                                    </div>
                                    <div>
                                      <button className="btn-small btn-cross" onClick={() => removeShift(s.id)} aria-label="Remove shift">✕</button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                              {isDropTarget && draggingShift && (draggingShift.employeeId !== emp.id || draggingShift.day !== day) && (
                                <div className="shift-preview">
                                  <div className="shift-time">{draggingShift.startTime}–{draggingShift.endTime}</div>
                                  <div className="shift-role">{draggingShift.role}</div>
                                </div>
                              )}
                            </>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
