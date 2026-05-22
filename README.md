# PlateMate — Client

PlateMate is the Next.js & React frontend client for the PlateMate application, designed to simplify pantry management, meal planning, recipe discovery, cooking, and grocery shopping for shared households and families.

---

## 📖 Introduction
This repository contains the mobile-friendly web interface for PlateMate. It provides household members with a responsive and collaborative dashboard to:
- Coordinate meals dynamically.
- View and update the shared pantry in real-time.
- Check items off the joint shopping list while shopping.
- Scan physical, handwritten grocery lists and instantly digitize them.

---

## 🛠️ Technologies Used
- **Framework**: Next.js (App Router)
- **UI Library**: React, Ant Design (component framework)
- **Styling**: TailwindCSS (responsive layouts), Vanilla CSS
- **Programming Language**: TypeScript
- **Quality & Linting**: ESLint, Prettier
- **Network Client**: Fetch API with custom request wrappers

---

## 🧩 High-Level Components
The client interface is structured around several modular pages and components:

1. **[Dashboard-Shell](app/components/dashboard-shell.tsx)**:
   The primary layout wrapper. It acts as the navigation hub, displaying the sidebar menu and tracking the current active route to highlight chosen menu options across different pages.

2. **[Pantry Page](app/pantry/page.tsx)**:
   Allows users to view, add, and update food items in their pantry. It includes autocomplete suggestions powered by the backend ingredients API, automatic inventory deductions, and triggers image detection to parse handwritten grocery lists using OCR.

3. **[Dashboard Page](app/dashboard/page.tsx)**:
   The central landing hub for users, displaying today's scheduled meals and a summary of items currently on the shopping list.

4. **[Required Group Components](app/components/group-required.tsx) & [Hook](app/hooks/useGroupMembership.ts)**:
   Restricts page access for users who haven't joined or created a household group. The custom `useGroupMembership` hook checks the group state, prompting the user to create or join a household before letting them access pantry, list, or meal planning functionalities.

5. **[Meal Plan Page](app/meal-plan/page.tsx)**:
   Displays a calendar view where household members can schedule recipes. It shows the calculated missing ingredients for the planned meals and allows syncing them to the group's shopping list.

---

## 🚀 Launch & Development
To run the PlateMate client application locally:

### 1. Installation
Install the project dependencies using npm:
```bash
npm install
```

### 2. Configuration
Create a `.env.local` file in the root directory (if required) to set the backend base URL. (By default, the client points to the local backend port `8080` or the configured production gateway).

### 3. Local Development Commands
- **Run the Dev Server** (starts on `http://localhost:3000`):
  ```bash
  npm run dev
  ```
- **Build for Production**:
  ```bash
  npm run build
  ```
- **Start Production Server**:
  ```bash
  npm start
  ```
- **Lint Code**:
  ```bash
  npm run lint
  ```

---

## 📱 Illustrations: Core User Flows
1. **Household Onboarding**: Upon first login, users are greeted with the `GroupRequired` screen. They can input a group token to join a flat/family space, or generate a new group to invite members.
2. **Pantry Scan & Management**: Users scan physical lists using their phone camera. The scanned list is parsed, and detected items are previewed for confirmation before being saved to the pantry.
3. **Meal Planning to Shopping List Sync**: Members schedule meals on the calendar. If ingredients are missing, they appear in the "Outstanding Ingredients" sidebar. Clicking "Add to Shopping List" appends them to the shopping list.
4. **Real-Time Group Shopping**: Users check off items at the grocery store. The checked-off items disappear from the shopping list and are instantly added to the pantry. Polling updates this in real-time for all household members.

---

## 🗺️ Roadmap
- **Real-Time Meal Voting**: A voting system in the planning page to let group members vote on what they want to eat.
- **AI Pantry Recipe Suggestions**: Recommend recipes to prepare based on what is close to expiring in the pantry.
- **Expense tracker**: Integrate split-bill functionality to track grocery shopping expenses across roommates.

---

## 👥 Authors & Acknowledgments
- **Marc Honegger** & **Karina Litvinova**
- Former Teammates: *Dan Zolotov, Ceyda B. Dag & Kishore Sivapathasundaram*

---

## 📄 License
This project is licensed under the MIT License. See [LICENSE](LICENSE) for more details.

Copyright (c) 2026 Marc Honegger & Karina Litvinova
