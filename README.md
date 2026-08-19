# Class Harmony

Build a Complete SIH Prototype: Smart Classroom & Timetable Scheduler

1. PROJECT OBJECTIVE

Build a modern, responsive, working web application for a Smart India Hackathon (SIH) problem statement:

"Smart Classroom and Timetable Scheduler"

The system should help colleges automatically create optimized, conflict-free academic timetables by considering:

Faculty availability

Classroom capacity

Classroom availability

Laboratory requirements

Student sections

Subject requirements

Number of classes required per week

Faculty workload

Working days and periods

Hard constraints

Soft constraints

This must NOT be just a static timetable UI.

The timetable generation, conflict detection, classroom allocation and rescheduling logic must actually work using realistic demo data.

2. MAIN USERS

Implement three roles:

ADMIN

Controls the complete scheduling system.

FACULTY

Can view timetable, set availability and request rescheduling.

STUDENT

Can view their section timetable and classroom information.

3. TECHNOLOGY

Use a practical modern stack suitable for an SIH prototype.

Preferred:

React

TypeScript

Tailwind CSS

Modern component library where useful

Local storage or a simple mock data/database layer for the prototype

Do NOT introduce unnecessary backend complexity if it prevents the core scheduling system from working.

Keep the architecture clean so a real backend/database can be connected later.

4. DESIGN REQUIREMENTS

Create a professional college-management SaaS style interface.

The design should be:

Modern

Clean

Responsive

Professional

Easy to understand

Suitable for an SIH demonstration

Use:

Sidebar navigation

Top navigation/header

Cards

Tables

Modals

Forms

Tabs

Status badges

Charts where useful

Calendar/timetable grids

Avoid excessive animations.

The UI should look like a serious product, not a student template.

Make it fully responsive for desktop, tablet and mobile.

5. LANDING PAGE

Create a public landing page.

Navbar

Include:

Logo

Home

Features

How It Works

About

Login

Get Started

Hero

Heading:

"Smart Scheduling for Smarter Campuses"

Subheading explaining that the system automatically creates optimized academic schedules while avoiding faculty, classroom and section conflicts.

Buttons:

Get Started

Navigate to Login.

View Demo

Open a demo/sample dashboard.

Feature cards

Show:

Smart Timetable Generation

Conflict Detection

Smart Classroom Allocation

Faculty Availability

Lab Scheduling

Intelligent Rescheduling

How It Works

Show:

Data → Constraints → Smart Scheduler → Conflict Check → Optimization → Final Timetable

Footer

Include project name and SIH prototype information.

6. LOGIN SYSTEM

Create a working demo login.

Fields:

Email

Password

Role

Roles:

Admin

Faculty

Student

For demo purposes provide clearly visible demo credentials or a "Use Demo Account" option.

After login:

Admin → Admin Dashboard

Faculty → Faculty Dashboard

Student → Student Dashboard

7. ADMIN DASHBOARD

Create a powerful dashboard.

Sidebar:

Dashboard

Faculty

Sections

Subjects

Classrooms

Labs

Availability

Constraints

Smart Scheduler

Timetable

Conflicts

Rescheduling

Analytics

Settings

Logout

Dashboard cards:

Total Faculty

Total Sections

Total Classrooms

Total Labs

Current Conflicts

Available Rooms

Also show:

Today's Classes

Upcoming Classes

Room Utilization

Recent Activities

Add a prominent:

Generate Smart Timetable

button.

8. FACULTY MANAGEMENT

Create faculty CRUD functionality.

Fields:

Faculty Name

Faculty ID

Department

Email

Subjects

Maximum Classes Per Day

Availability

Actions:

Add Faculty

Edit

Delete

View

Use realistic demo faculty.

9. SECTION MANAGEMENT

Manage student sections.

Example:

CSE-A

CSE-B

CSE-C

ECE-A

Fields:

Section Name

Course

Semester

Student Count

Subjects

Actions:

Add

Edit

Delete

View

10. SUBJECT MANAGEMENT

Fields:

Subject Name

Subject Code

Credits

Theory/Lab

Classes Per Week

Faculty

Required Room/Lab

Duration

Example subjects:

Data Structures

Database Management Systems

Operating Systems

Computer Networks

Mathematics

Python Programming

Include both theory and lab subjects.

Lab subjects may require 2 consecutive periods.

11. CLASSROOM MANAGEMENT

Fields:

Room Number

Building

Floor

Capacity

Type

Projector

Smart Board

Computer Availability

Status

Room types:

Classroom

Seminar Hall

Lab

The scheduler must NEVER assign a room whose capacity is lower than the section's student count.

12. LAB MANAGEMENT

Create separate lab management.

Fields:

Lab Name

Capacity

Computers

Equipment

Software

Availability

Example:

Programming Lab:

Capacity: 40

Computers: 40

Internet: Yes

Required for programming lab subjects.

13. FACULTY AVAILABILITY

Create a weekly availability grid.

Example:

TimeMonTueWedThuFri9-10AvailableAvailableUnavailableAvailableAvailable10-11AvailableAvailableUnavailableAvailableAvailable

Faculty/admin can change availability.

Save the availability.

The scheduler must use this data.

14. CONSTRAINT MANAGEMENT

Create two categories.

HARD CONSTRAINTS

These MUST never be violated.

A faculty member cannot teach two classes at the same time.

A classroom cannot contain two classes at the same time.

A section cannot attend two classes at the same time.

Room capacity must be >= section size.

Lab subjects must be assigned to suitable labs.

Faculty unavailable slots cannot be used.

A subject cannot be assigned more than once to the same section in the same time slot.

Required weekly classes must be satisfied.

SOFT CONSTRAINTS

Try to satisfy these when possible.

Avoid excessive consecutive classes for faculty.

Avoid excessive consecutive classes for students.

Spread the same subject across different days.

Balance faculty workload.

Avoid unnecessary room wastage.

Prefer suitable classroom sizes.

Avoid very early/late periods where possible.

Allow the admin to enable/disable soft constraints.

15. SMART TIMETABLE SCHEDULER

This is the CORE feature.

Create a dedicated Smart Scheduler page.

Show:

Department

Semester

Sections

Working Days

Period Timings

Number of Subjects

Faculty

Classrooms

Labs

Before generation, show a summary:

Example:

Faculty: 24

Sections: 12

Subjects: 32

Classrooms: 18

Labs: 5

Time Slots: 30

Button:

GENERATE SMART TIMETABLE

When clicked, show a realistic processing interface:

Loading academic data

Checking faculty availability

Checking classroom capacity

Allocating labs

Applying hard constraints

Generating schedule

Detecting conflicts

Optimizing soft constraints

Finalizing timetable

Then display results.

16. SCHEDULING ALGORITHM

Do NOT randomly generate a timetable.

Implement a constraint-based scheduling approach.

The scheduler should:

Generate all available time slots.

Identify required classes.

Remove unavailable faculty slots.

Remove occupied room slots.

Check section conflicts.

Check room capacity.

Check lab requirements.

Prefer consecutive slots for labs.

Assign classes to valid slots.

Evaluate soft constraints.

Calculate a schedule score.

Return the best valid schedule found.

If a perfect schedule cannot be generated, clearly show:

"Unable to satisfy all constraints."

Then identify the conflicting requirements and suggest changes.

Do NOT silently create an invalid timetable.

17. TIMETABLE RESULT PAGE

Display timetable in a clean weekly grid.

Example:

TimeCSE-ACSE-BCSE-C9-10DBMSMathsOS10-11MathsDBMSPython11-12PythonOSDBMS

Each timetable cell should display:

Subject

Faculty

Room

Section

Allow filtering by:

Section

Faculty

Room

Day

Actions:

Save Timetable

Save generated schedule.

Regenerate

Generate another optimized schedule.

Edit

Open manual timetable editor.

Export PDF

Create printable timetable.

Export Excel

Export timetable data.

Publish

Make timetable visible to faculty and students.

18. CONFLICT DETECTION

Create a dedicated Conflict page.

Automatically check:

Faculty clash

Room clash

Section clash

Capacity violation

Lab mismatch

Availability violation

Show:

"No conflicts found"

when schedule is valid.

Otherwise:

"3 conflicts found"

Each conflict should show:

Type

Description

Date

Time

Faculty

Section

Room

Actions:

Auto Fix

System searches for another valid slot/room and fixes the conflict.

Manual Fix

Admin manually chooses another slot.

19. SMART CLASSROOM ALLOCATION

The scheduler must intelligently assign classrooms.

Example:

Section size = 55

Rooms:

Room 101 = 30 ❌

Room 102 = 40 ❌

Room 103 = 60 ✅

Room 104 = 120 ✅

Prefer Room 103 because it is the smallest suitable available room.

This prevents unnecessary large-room usage.

Show classroom utilization percentage.

20. INTELLIGENT RESCHEDULING

Create a dedicated Rescheduling page.

Scenario:

A faculty member becomes unavailable.

Admin selects:

Faculty

Date

Reason

Then click:

FIND ALTERNATIVES

System identifies affected classes.

Example:

DBMS

CSE-A

Wednesday 11 AM

Room 204

Then suggest alternative slots:

Option 1:

Thursday 10 AM

Room 204

Conflict Free ✓

Option 2:

Friday 12 PM

Room 205

Conflict Free ✓

For each option show:

Conflict status

Room

Faculty availability

Section availability

Button:

APPLY CHANGE

After clicking:

Update timetable

Update classroom allocation

Notify affected faculty

Notify students

21. FACULTY DASHBOARD

Faculty sidebar:

Dashboard

My Timetable

My Availability

My Classes

Reschedule Request

Notifications

Profile

Logout

Dashboard cards:

Today's Classes

Next Class

Weekly Classes

Free Slots

Faculty can:

View timetable

Set availability

Submit rescheduling request

View notifications

22. STUDENT DASHBOARD

Student sidebar:

Dashboard

My Timetable

Today's Classes

Classroom Information

Notifications

Profile

Logout

Dashboard:

Show next class.

Example:

DBMS

10:00 AM

Room 204

Faculty: Dr. Sharma

Also show today's complete schedule.

23. ANALYTICS

Create Admin Analytics page.

Show:

Classroom utilization

Faculty workload

Number of scheduled classes

Number of free rooms

Conflicts resolved

Schedule efficiency score

Charts:

Classroom utilization by room

Faculty workload

Classes by day

Room occupancy by time

Create a clear:

Schedule Efficiency Score

Example:

92%

Breakdown:

Hard Constraints: 100%

Room Utilization: 88%

Faculty Balance: 91%

Student Distribution: 90%

The score must be based on actual generated data, not a fake static number.

24. NOTIFICATIONS

Create notifications.

Examples:

Admin:

"3 timetable conflicts detected."

Faculty:

"Your DBMS class has been moved to Room 205."

Student:

"Your Friday Python class has been rescheduled."

Click notification → open relevant page.

25. SETTINGS

Admin can configure:

College Name

Academic Year

Working Days

Period Timings

Break Times

Maximum Classes Per Day

Default Room Preferences

Save settings.

26. DEMO DATA

Preload realistic demo data so the application is immediately usable.

Include:

At least 10 faculty members

At least 4 sections

At least 15 subjects

At least 8 classrooms

At least 3 labs

Multiple availability restrictions

Different classroom capacities

Theory and lab subjects

The demo data should be designed so that the scheduler visibly has to solve real constraints.

27. IMPORTANT DEMO SCENARIO

Create a "Demo Mode" or make the default data ready for this flow:

Login as Admin.

Open Smart Scheduler.

Show available resources.

Generate timetable.

Show scheduling process.

Display final timetable.

Show "0 hard conflicts".

Open Analytics.

Show classroom utilization.

Simulate faculty becoming unavailable.

Open Rescheduling.

Find alternative slots.

Apply one alternative.

Show updated timetable.

Login as Faculty.

Show updated schedule.

Login as Student.

Show updated class schedule.

The entire demo should be possible without manually entering huge amounts of data.

28. DATA VALIDATION

Every form must validate input.

Examples:

Capacity cannot be negative.

Required classes/week cannot be zero.

Email must be valid.

Duplicate room numbers should be prevented.

Duplicate faculty IDs should be prevented.

Student count must be valid.

Lab capacity must be sufficient.

Show clear error messages.

29. EMPTY / LOADING / ERROR STATES

Do not leave blank screens.

Every major page should have:

Loading state

Empty state

Error state

Success notification

Use toast notifications for actions such as:

"Faculty added successfully."

"Timetable generated successfully."

"Conflict resolved successfully."

30. RESPONSIVE DESIGN

Desktop is the primary SIH demo platform.

But also make the application responsive.

On mobile:

Sidebar becomes mobile menu.

Tables become horizontally scrollable.

Timetable remains readable.

Cards stack vertically.

31. ACCESS CONTROL

Users must only see relevant pages.

Admin:

Full access.

Faculty:

Only faculty-related features.

Student:

Only student-related features.

Do not show admin controls to students.

32. PROJECT STRUCTURE

Keep the code modular.

Suggested structure:

src/

components/

pages/

layouts/

data/

services/

utils/

scheduler/

types/

hooks/

assets/

The scheduling algorithm should be separated from UI components.

For example:

scheduler/

generateSchedule

validateConstraints

detectConflicts

calculateScore

findAlternativeSlots

allocateClassroom

Do not put the entire application in one huge component.

33. TESTING

Create basic automated/manual tests for the most important logic.

Test:

Faculty clash detection

Room clash detection

Section clash detection

Capacity validation

Lab allocation

Faculty availability

Weekly subject requirement

Rescheduling

Classroom allocation

Schedule score calculation

Create a visible or documented test report.

Target:

All critical scheduling tests should pass.

34. README

Create a professional README containing:

Project name

Problem statement

Problem overview

Proposed solution

Key features

System architecture

Scheduling algorithm

Tech stack

Installation instructions

Demo credentials

Screenshots section

Future scope

Team information

35. SIH-FOCUSED DIFFERENTIATION

The application should clearly communicate these unique points:

1. Constraint-Aware Scheduling

Not simple timetable generation.

2. Smart Classroom Utilization

Assign the smallest suitable available classroom.

3. Faculty Availability

Respect real availability.

4. Conflict Detection

Automatically identify scheduling problems.

5. Intelligent Rescheduling

When something changes, find alternative schedules instead of rebuilding everything manually.

6. Optimization Score

Measure schedule quality.

7. Centralized College Scheduling

Admin, faculty and students use the same synchronized timetable.

36. IMPORTANT IMPLEMENTATION RULES

DO NOT:

Create fake buttons that do nothing.

Create static timetable screenshots.

Use random timetable generation.

Claim AI functionality without implementing logic.

Make every feature a placeholder.

Overcomplicate the backend.

Prioritize animations over functionality.

DO:

Make core buttons functional.

Use realistic demo data.

Make the scheduler actually work.

Make conflicts actually detectable.

Make classroom allocation actually consider capacity.

Make rescheduling actually update the timetable.

Keep the code readable and modular.

Make the complete demo flow reliable.

37. FINAL ACCEPTANCE CRITERIA

Before considering the project complete, verify:

[ ] Landing page works

[ ] Login works

[ ] Role-based dashboards work

[ ] Admin can manage faculty

[ ] Admin can manage sections

[ ] Admin can manage subjects

[ ] Admin can manage classrooms

[ ] Admin can manage labs

[ ] Faculty availability works

[ ] Constraints work

[ ] Smart timetable generation works

[ ] Hard conflicts are prevented/detected

[ ] Classroom capacity is respected

[ ] Lab allocation works

[ ] Timetable can be edited

[ ] Timetable can be regenerated

[ ] Conflict resolution works

[ ] Rescheduling works

[ ] Faculty dashboard works

[ ] Student dashboard works

[ ] Analytics work with real generated data

[ ] Notifications work

[ ] Demo data is available

[ ] Responsive design works

[ ] Critical tests pass

[ ] README is complete

[ ] No major console errors

[ ] No major broken buttons or routes

FINAL PRIORITY

If development time becomes limited, prioritize in this exact order:

Smart Timetable Generator

Hard Constraint Validation

Classroom/Lab Allocation

Conflict Detection

Intelligent Rescheduling

Admin Dashboard

Faculty Dashboard

Student Dashboard

Analytics

Visual polish

Build the application as a working SIH prototype, not merely a UI mockup.

Before finishing, run through the complete demo scenario from Admin login → timetable generation → conflict checking → rescheduling → Faculty view → Student view and fix any broken flow.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/b1b764b3-2f09-46b1-8101-1dbf295ffc79).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
