import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import AppShell from "@/components/layout/AppShell";
import DashboardPage from "@/pages/DashboardPage";
import DevelopersPage from "@/pages/DevelopersPage";
import SkillMatrixPage from "@/pages/SkillMatrixPage";
import SchedulerPage from "@/pages/SchedulerPage";
import TeamSimulatorPage from "@/pages/TeamSimulatorPage";
import ProjectsPage from "@/pages/ProjectsPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: "dashboard", element: <DashboardPage /> },
      { path: "developers", element: <DevelopersPage /> },
      { path: "skills", element: <SkillMatrixPage /> },
      { path: "scheduler", element: <SchedulerPage /> },
      { path: "simulator", element: <TeamSimulatorPage /> },
      { path: "projects", element: <ProjectsPage /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
