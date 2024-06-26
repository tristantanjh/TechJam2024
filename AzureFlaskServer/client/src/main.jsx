import React from "react";
import {
  createBrowserRouter,
  createHashRouter,
  RouterProvider,
} from "react-router-dom";
import ReactDOM from "react-dom/client";
import ErrorPage from "./Pages/ErrorPage/ErrorPage";
import WebsocketPage from "./Pages/websocketPage/websocketPage";
import CallerPageNew from "./Pages/CallerPageNew/CallerPageNew";
import DefaultLayout from "./layouts/DefaultLayout";
import AppLayout from "./layouts/AppLayout";
import TranscriberPage from "./Pages/TranscriberPage/TranscriberPage";
import "./index.css";
import DashboardPage from "./Pages/DashboardPage/DashboardPage";

const router = createBrowserRouter([
  {
    path: "/websocket",
    element: <WebsocketPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/new",
    element: <DefaultLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <CallerPageNew />,
      },
    ],
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
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
