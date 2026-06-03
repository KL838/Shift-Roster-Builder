# Shift Roster Builder
This is a web application that allows a manager to create and manage a weekly staff schedule. It was built as a take-home assignment.

## Setup and Running
```bash
npm install && npm run dev
```

## Features
*   **Employee Management**: Add, edit, and remove employees. Each employee has a name, roles, and unavailable days.
*   **Shift Assignment**: Assign employees to shifts for a 7-day week, specifying a role and time.
*   **Weekly Roster Grid**: A clear grid view of the week's schedule, with employees as rows and days as columns.
*   **Conflict Detection**: Automatically detects and visually flags two types of conflicts:
    1.  An employee assigned to two overlapping shifts.
    2.  An employee scheduled for more than 5 consecutive days.
*   **Summary Panel**: Shows the total hours assigned per employee for the week.
*   **Drag & Drop**: Reassign shifts by dragging them to a different employee or day.
*   **Employee Availability**: Prevents assigning shifts on an employee's specified unavailable days.
*   **Export**: Export the roster to PNG or CSV.
*   **Persistence**: All data is saved to `localStorage`, so your work is not lost on refresh.
*   **Responsive Design**: The layout is optimized for both desktop and mobile devices.

## Data Model Reasoning
*   **`Employee`**: An employee is defined by a unique `id`, a `name`, an array of `roles` they can perform, and an array of `unavailableDays`. This structure is straightforward and contains all necessary information about an employee.
*   **`Shift`**: A shift connects an `employeeId` to a time slot. It includes the `day`, `startTime`, `endTime`, and the specific `role` for that shift. Using an `employeeId` (a foreign key) instead of embedding the whole employee object makes the data normalized and easier to manage, preventing data duplication and inconsistencies.
*   **`Conflict`**: This is a derived data structure, not stored state. It's calculated on-the-fly whenever shifts change. It contains a `type` (e.g., 'overlap') and the `shiftIds` involved. This is an efficient approach, as it's all the UI needs to highlight the conflicting shifts without storing redundant state.

## Architecture & Design Decisions
*   **Framework (React + Vite)**:
    *   **React** was chosen for its component-based architecture and efficient state management, which is ideal for building an interactive UI like this roster.
    *   **Vite** provides a fast development server with Hot Module Replacement (HMR) and a simple setup, which accelerates the development process.

*   **State Management (`useState`, `useEffect`)**:
    *   All application state is managed within the central `App` component using React's built-in `useState` and `useEffect` hooks.
    *   This approach was sufficient for the application's complexity and avoided the boilerplate of a larger state management library like Redux. State is passed down to child components via props.

*   **Persistence (`localStorage`)**:
    *   To meet the requirement of persisting data without a backend, `localStorage` was used. The `employees` and `shifts` arrays are serialized to JSON and saved, then rehydrated when the app loads.

*   **Styling (CSS + Inline Styles)**:
    *   A hybrid approach was used. A global stylesheet (`App.css`) handles the main layout, typography, and base component styles.
    *   Dynamic inline styles are used for state-dependent UI changes, such as highlighting conflicting shifts or indicating unavailable days. This is a pragmatic choice for styles that are tightly coupled to the application's state.

*   **Feature Implementation Details**:
    *   **Conflict Detection**: The core logic resides in `src/utils/conflicts.ts`. It is triggered by a `useEffect` hook in `App.tsx` that re-calculates conflicts whenever the `shifts` array is modified.
    *   **Drag-and-Drop**: Implemented using the native HTML5 Drag and Drop API to allow reassigning shifts. This provides a rich user experience without adding heavy third-party libraries.
    *   **PNG Export**: The `html2canvas` library is used to capture the roster grid as an image. A challenge encountered was that CSS gradients (used for the unavailable pattern) were not supported. This was solved by using an embedded SVG data URI as a `backgroundImage`, which `html2canvas` can render correctly.

### My thought:
1. Initialize the project & README and also the git.
2. Think of the data structures - employee, shift, conflict.
3. Build a simple UI for editing.
4. Add logic functions to detect those conflicts.
5. Make it reponsive and polish the UI.
6. Add management interactively.
7. Add bonus requirements and test again.
8. Finailze the README.


### Step:
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

Screenshot:
![Project Logo](demo_work/Screenshot%202026-06-03%20at%2014.00.06.png)