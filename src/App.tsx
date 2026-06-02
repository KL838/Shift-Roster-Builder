import React, { useState } from 'react';
import type { Employee, Shift } from './types';
import { detectConflicts } from './utils/conflicts';
import './App.css';

function App() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);

  // Simple UI placeholder
  return (
    <div className="app-container" style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <header>
        <h1>Shift Roster Builder</h1>
      </header>

      <main className="main-content" style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '20px', marginTop: '20px' }}>
        <aside>
          <section className="employees-panel" style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
            <h2>Employees</h2>
            <div className="employee-list">
              {employees.length === 0 ? <p>No employees added yet.</p> : (
                <ul>
                  {employees.map(emp => (
                    <li key={emp.id}>{emp.name} ({emp.roles.join(', ')})</li>
                  ))}
                </ul>
              )}
            </div>
            <button style={{ marginTop: '10px' }}>Add Employee</button>
          </section>

          <section className="summary-panel" style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
            <h2>Summary</h2>
            <p>Total hours assigned per employee will be shown here.</p>
          </section>
        </aside>

        <section className="roster-grid" style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px' }}>
          <h2>Weekly Roster</h2>
          <div className="grid-container" style={{ minHeight: '300px', backgroundColor: '#f9f9f9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '15px' }}>
            <p style={{ color: '#666' }}>Roster grid will be displayed here...</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button>Add Shift</button>
            <button onClick={() => {
              const sampleShifts: Shift[] = [
                { id: 's1', employeeId: 'e1', role: 'Cashier', day: 'Monday', startTime: '09:00', endTime: '13:00' },
                { id: 's2', employeeId: 'e1', role: 'Cashier', day: 'Monday', startTime: '12:00', endTime: '16:00' },
                { id: 's3', employeeId: 'e1', role: 'Cashier', day: 'Tuesday', startTime: '09:00', endTime: '17:00' },
                { id: 's4', employeeId: 'e1', role: 'Cashier', day: 'Wednesday', startTime: '09:00', endTime: '17:00' },
                { id: 's5', employeeId: 'e1', role: 'Cashier', day: 'Thursday', startTime: '09:00', endTime: '17:00' },
                { id: 's6', employeeId: 'e1', role: 'Cashier', day: 'Friday', startTime: '09:00', endTime: '17:00' },
                { id: 's7', employeeId: 'e1', role: 'Cashier', day: 'Saturday', startTime: '09:00', endTime: '17:00' },
                { id: 's8', employeeId: 'e2', role: 'Cook', day: 'Monday', startTime: '08:00', endTime: '12:00' },
              ];
              const conflicts = detectConflicts(sampleShifts);
              // log to browser console (open DevTools to inspect)
              // eslint-disable-next-line no-console
              console.log('Demo conflicts', conflicts);
              alert(`Found ${conflicts.length} conflict(s) — see console for details.`);
            }}>Run Conflict Demo</button>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
