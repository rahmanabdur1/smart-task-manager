# Smart Task Manager with AI Assistance for birthday celebration

This is a comprehensive task management application built with **Next.js 15+ (App Router)**, **TypeScript**, and **Tailwind CSS**. It features intelligent **AI-powered subtask suggestions** using the **Google Gemini API**, robust **state management with Redux Toolkit**, and efficient data handling via **Next.js Server Actions**. This version also includes **client-side and server-side form validation** using Zod and React Hook Form, and **data revalidation** using Next.js caching mechanisms.

## 🚀 Features

* **Add, Edit, Delete Tasks:** Full CRUD operations for task management.
* **Task Fields:** Each task includes a Title, Description, Status (Pending/Completed), and an optional Due Date.
* **Mark as Complete:** Easily toggle the status of tasks.
* **AI-Powered Subtask Suggestions:** A "Suggest Subtasks (AI)" button on each task leverages the Google #Gemini AI to break down complex tasks into 3-5 smaller, actionable steps, enhancing productivity.
* **Centralized State Management:** Utilizes **Redux Toolkit** for a predictable, scalable, and maintainable client-side state. No `localStorage` is used for task data directly; Redux manages the client's view, which is synced with successful server action calls.
* **Server Actions:** All data mutations (adding, updating, deleting tasks, toggling status) and AI calls are performed using Next.js Server Actions, providing a streamlined and type-safe way to interact with server-side logic directly from client components.
* **Form Validation:**
    * **Client-side:** Implemented using **React Hook Form** with **ZodResolver** for immediate user feedback.
    * **Server-side:** Robust validation using **Zod** within Server Actions to ensure data integrity before persistence.
* **Data Revalidation:** Employs Next.js's `revalidatePath` in Server Actions to ensure that cached data is invalidated and the UI displays the most up-to-date information after mutations.
* **Performance Optimizations:** Implements React's `useCallback` and `useMemo` hooks, along with `memo` for components, to minimize unnecessary component re-renders and re-computations, leading to a smoother user experience.
* **Responsive Design:** Styled with Tailwind CSS to ensure a clean and functional interface that adapts well to various screen sizes (mobile, tablet, desktop).

## 🛠️ Technologies Used

* **Framework:** [Next.js 15+](https://nextjs.org/) (with App Router and Server Actions)
* **Language:** [TypeScript](https://www.typescriptlang.org/)
* **State Management:** [Redux Toolkit](https://redux-toolkit.js.org/) & [React-Redux](https://react-redux.js.org/)
* **Form Management & Validation:** [React Hook Form](https://react-hook-form.com/), [Zod](https://zod.dev/), [@hookform/resolvers](https://www.npmjs.com/package/@hookform/resolvers)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **AI Integration:** [Google Gemini API](https://ai.google.dev/) via `@google/generative-ai` SDK
* **Unique IDs:** [uuid](https://www.npmjs.com/package/uuid)
* **Package Manager:** [pnpm](https://pnpm.io/)

## ⚙️ Setup and Installation

Follow these steps to get the project running locally on your machine.

### Prerequisites

* **Node.js:** Latest LTS version recommended.
* **pnpm:** Or your preferred Node.js package manager (npm/yarn), but `pnpm` commands are used in this guide. Install globally: `npm install -g pnpm`.

### 1. Clone the repository

```bash
git clone my repo :https://github.com/rahmanabdur1/smart-task-manager
cd smart-task-manager
pnpm install
setup :GOOGLE_GEMINI_API_KEY=''
pnpm dev
