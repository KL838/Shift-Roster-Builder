# Shift Roster Builder
Run by: npm install && npm run dev

My thought:
1. Initialize the project & README and also the git.
2. Think of the data structures - employee, shift, conflict.
3. Build a simple UI for editing.
4. Add logic functions to detect those conflicts.
5. Make it reponsive and polish the UI.
6. Add management interactively.
7. Add bonus requirements and test again.
8. Finailze the README.

1. Initialize:
    - Vite React + TS setup completed.

2. Data structures:
    - Defined `Employee`, `Shift`, and `Conflict` interfaces in `src/types/index.ts`.

3. UI layout:
    - Added CSS and a simple placeholder layout for `App.tsx` containing the employees panel, summary panel, and weekly roster layout grid.

4. Conflict detection:
        - Implemented core conflict detection utilities in `src/utils/conflicts.ts`:
            - `detectOverlappingShifts(shifts)` — flags overlapping shifts for the same employee on the same day.
            - `detectTooManyConsecutiveDays(shifts, maxConsecutive = 5)` — flags employees scheduled for more than 5 consecutive days.

5. Responsive UI & conflict visuals:
        - Implemented a responsive roster grid in `src/App.tsx` and `src/App.css`.
        - Conflicting shift cells are visually flagged (red background) in the roster grid.

6. Employee & shift management (interactive):
        - Added simple forms in `src/App.tsx` to:
            - Add, edit and remove employees (name + comma-separated roles).
            - Create and remove shifts (select employee, role, day, start/end time).
        - Conflicts are recalculated automatically when shifts change and are shown in the roster grid.
        - Display the total hours assigned per employee for the week.

7. Persistence:
    - Employee and shift data are persisted to browser *localStorage* (keys: `roster.employees` and `roster.shifts`) so data remains after a page refresh.

8. Drag-and-drop to reassign a shift:
    - You can drag a shift tile and drop it onto another employee's day cell to move the shift to that employee and/or day.
    - This was implemented using HTML5 drag-and-drop.

9. Allow Employee availability preferences (e.g. “Alex cannot work Mondays”) that pre-validate assignments
    - You cannot assign employees to their Unavailable Days.
    - An pop-up alert will be triggered when you try so.

10. Print-friendly or CSV export of the weekly roster:
    - Click **Export PNG** in the Summary panel to download a PNG image of the timetable (remove buttons hidden during capture).
    - Click **Export CSV** in the Summary panel to download a CSV list of shifts (columns: Employee, Day, Role, Start, End, DurationMinutes).

11. Mobile-responsive layout:
    - The app stacks the panels on small screens, keeps the weekly roster horizontally scrollable, and makes form controls fill the available width on mobile.
    - Can test in browser by cmd+f12 and cmd+shift+m.