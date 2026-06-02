import React, { useEffect, useState } from 'react';
import type { Employee, Shift, Conflict } from './types';
import { detectConflicts } from './utils/conflicts';
import './App.css';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;

const uid = () => Math.random().toString(36).slice(2, 9);

function App() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [conflicts, setConflicts] = useState<Conflict[]>([]);

  // Employee form state
  const [name, setName] = useState('');
  const [rolesInput, setRolesInput] = useState('');
  const [editingEmployeeId, setEditingEmployeeId] = useState<string | null>(null);

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

  const addOrUpdateEmployee = (e?: React.FormEvent) => {
    e?.preventDefault();
    const roles = rolesInput.split(',').map(r => r.trim()).filter(Boolean);
    if (!name.trim() || roles.length === 0) {
      alert('Provide a name and at least one role (comma-separated)');
      return;
    }

    if (editingEmployeeId) {
      setEmployees(prev => prev.map(emp => emp.id === editingEmployeeId ? { ...emp, name: name.trim(), roles } : emp));
      setEditingEmployeeId(null);
    } else {
      const newEmp: Employee = { id: uid(), name: name.trim(), roles };
      setEmployees(prev => [...prev, newEmp]);
    }

    setName('');
    setRolesInput('');
  };

  const startEditEmployee = (emp: Employee) => {
    setEditingEmployeeId(emp.id);
    setName(emp.name);
    setRolesInput(emp.roles.join(', '));
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

  const conflictShiftIds = new Set<string>();
  conflicts.forEach(c => c.shiftIds?.forEach(id => conflictShiftIds.add(id)));

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
                      <span>{emp.name} — <small style={{ color: '#555' }}>{emp.roles.join(', ')}</small></span>
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
            <p>Assigned hours and simple stats will go here.</p>
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
            <button type="button" onClick={() => { setEmployees([]); setShifts([]); setConflicts([]); }} style={{ marginLeft: 6 }}>Clear</button>
          </form>

          <div className="grid-scroll">
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
                      const cellShifts = shifts.filter(s => s.employeeId === emp.id && s.day === day);
                      const cellHasConflict = cellShifts.some(s => conflictShiftIds.has(s.id));
                      return (
                        <td key={day} className={cellHasConflict ? 'cell-conflict' : ''}>
                          {cellShifts.length === 0 ? <div className="empty-cell">—</div> : (
                            cellShifts.map(s => (
                              <div key={s.id} className={`shift-item ${conflictShiftIds.has(s.id) ? 'conflict' : ''}`}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
                                  <div>
                                    <div className="shift-time">{s.startTime}–{s.endTime}</div>
                                    <div className="shift-role">{s.role}</div>
                                  </div>
                                  <div>
                                    <button className="btn-small" onClick={() => removeShift(s.id)}>Remove</button>
                                  </div>
                                </div>
                              </div>
                            ))
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
