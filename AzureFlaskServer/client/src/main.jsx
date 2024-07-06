import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ReactDOM from "react-dom/client";
import ErrorPage from "./Pages/ErrorPage/ErrorPage";
import WebsocketPage from "./Pages/websocketPage/websocketPage";
import AppLayout from "./layouts/AppLayout";
import TranscriberPage from "./Pages/TranscriberPage/TranscriberPage";
import "./index.css";
import DashboardPage from "./Pages/DashboardPage/DashboardPage";
import SettingsPage from "./Pages/SettingsPage/SettingsPage";
import ActionsPage from "./Pages/ActionsPage/ActionsPage";
import CopilotPage from "./Pages/CopilotPage/CopilotPage";
import IntegrationsPage from "./Pages/IntegrationsPage/IntegrationsPage";
import JiraPage from "./Pages/IntegrationsPage/pages/JiraPage";
import IndexPage from "./Pages/IntegrationsPage/pages/IndexPage";

const router = createBrowserRouter([
  {
    path: "/websocket",
    element: <WebsocketPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/app",
    element: <AppLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: "transcriber",
        element: <TranscriberPage />,
      },
      {
        path: "settings",
        element: <SettingsPage />,
      },
      {
        path: "actions",
        element: <ActionsPage />,
      },
      {
        path: "copilot",
        element: <CopilotPage />,
      },
      {
        path: "integrations",
        element: <IntegrationsPage />,
        children: [
          {
            index: true,
            element: <IndexPage />,
          },
          {
            path: "jira",
            element: <JiraPage />,
          },
        ],
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
