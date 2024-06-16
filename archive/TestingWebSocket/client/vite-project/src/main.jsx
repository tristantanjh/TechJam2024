import React from "react";
import {
  createBrowserRouter,
  createHashRouter,
  RouterProvider,
} from "react-router-dom";
import ReactDOM from "react-dom/client";
import HomeScreen from "./HomePage/HomePage";
import ErrorPage from "./ErrorPage/ErrorPage";
import CallPage from "./CallPage/CallPage";
import CallerPage from "./CallerPage/CallerPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomeScreen />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/call/:username/:room",
    element: <CallPage />,
    errorElement: <ErrorPage />,
  },
  {
    path: "/caller",
    element: <CallerPage />,
    errorElement: <ErrorPage />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
