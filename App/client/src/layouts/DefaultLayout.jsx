import { Outlet } from "react-router-dom";
import { AzureProvider } from "../hooks/useTranscriber";

export default function DefaultLayout() {
  return (
    <AzureProvider>
      <Outlet />
    </AzureProvider>
  );
}
