import { Outlet } from "react-router-dom";
import { AzureProvider } from "../hooks/useTranscriber";
import { NavbarProvider } from "@/hooks/useNavbar";
import { ActionsProvider } from "@/hooks/useActions";
import { LoadingMessageProvider } from "@/hooks/useLoadingMessage";
import NavbarLayout from "./NavbarLayout";
import { CopilotProvider } from "@/hooks/useCopilot";

export default function AppLayout() {
  return (
    <AzureProvider>
      <LoadingMessageProvider>
        <CopilotProvider>
          <NavbarProvider>
            <ActionsProvider>
              <NavbarLayout>
                <Outlet />
              </NavbarLayout>
            </ActionsProvider>
          </NavbarProvider>
        </CopilotProvider>
      </LoadingMessageProvider>
    </AzureProvider>
  );
}
