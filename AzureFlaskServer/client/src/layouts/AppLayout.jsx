import { Outlet } from "react-router-dom";
import { AzureProvider } from "../hooks/useTranscriber";
import { NavbarProvider } from "@/hooks/useNavbar";
import { LoadingMessageProvider } from "@/hooks/useLoadingMessage";
import NavbarLayout from "./NavbarLayout";

export default function AppLayout() {
  return (
    <AzureProvider>
      <NavbarProvider>
        <LoadingMessageProvider>
          <NavbarLayout>
            <Outlet />
          </NavbarLayout>
        </LoadingMessageProvider>
      </NavbarProvider>
    </AzureProvider>
  );
}
