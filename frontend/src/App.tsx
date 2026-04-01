import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import AppShell from "@/components/layout/AppShell";
import DashboardPage from "@/pages/DashboardPage";
import DevelopersPage from "@/pages/DevelopersPage";
import DeveloperProfilePage from "@/pages/DeveloperProfilePage";
import SkillMatrixPage from "@/pages/SkillMatrixPage";
import SchedulerPage from "@/pages/SchedulerPage";
import TeamSimulatorPage from "@/pages/TeamSimulatorPage";
import ProjectsPage from "@/pages/ProjectsPage";
import ProjectDetailPage from "@/pages/ProjectDetailPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: "dashboard", element: <DashboardPage /> },
      { path: "developers", element: <DevelopersPage /> },
      { path: "developers/:id", element: <DeveloperProfilePage /> },
      { path: "skills", element: <SkillMatrixPage /> },
      { path: "scheduler", element: <SchedulerPage /> },
      { path: "simulator", element: <TeamSimulatorPage /> },
      { path: "projects", element: <ProjectsPage /> },
      { path: "projects/:id", element: <ProjectDetailPage /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
