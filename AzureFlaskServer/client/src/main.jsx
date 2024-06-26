import React from "react";
import {
  createBrowserRouter,
  createHashRouter,
  RouterProvider,
} from "react-router-dom";
import ReactDOM from "react-dom/client";
import ErrorPage from "./Pages/ErrorPage/ErrorPage";
import CallerPage from "./CallerPage/CallerPage";
import WebsocketPage from "./Pages/websocketPage/websocketPage";
import CallerPageNew from "./Pages/CallerPageNew/CallerPageNew";
import DefaultLayout from "./layouts/DefaultLayout";
import MainPage from "./Pages/MainPage/MainPage";
import "./index.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <CallerPage />,
    errorElement: <ErrorPage />,
  },
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
    path: "/main",
    element: <MainPage />,
    errorElement: <ErrorPage />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
