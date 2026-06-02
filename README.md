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
