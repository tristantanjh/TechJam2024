import { Outlet } from "react-router-dom";
import { AzureProvider } from "../hooks/useTranscriber";
import { NavbarProvider } from "@/hooks/useNavbar";
import { LoadingMessageProvider } from "@/hooks/useLoadingMessage";
import NavbarLayout from "./NavbarLayout";
import { CopilotProvider } from "@/hooks/useCopilot";

export default function AppLayout() {
  return (
    <AzureProvider>
      <CopilotProvider>
        <NavbarProvider>
          <LoadingMessageProvider>
            <NavbarLayout>
              <Outlet />
            </NavbarLayout>
          </LoadingMessageProvider>
        </NavbarProvider>
      </CopilotProvider>
    </AzureProvider>
  );
}
