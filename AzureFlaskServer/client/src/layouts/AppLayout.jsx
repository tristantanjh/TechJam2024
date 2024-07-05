import { Outlet } from "react-router-dom";
import { AzureProvider } from "../hooks/useTranscriber";
import { NavbarProvider } from "@/hooks/useNavbar";
import { ActionsProvider } from "@/hooks/useActions";
import { LoadingMessageProvider } from "@/hooks/useLoadingMessage";
import NavbarLayout from "./NavbarLayout";

export default function AppLayout() {
  return (
    <AzureProvider>
      <NavbarProvider>
        <ActionsProvider>
          <LoadingMessageProvider>
            <NavbarLayout>
              <Outlet />
            </NavbarLayout>
          </LoadingMessageProvider>
        </ActionsProvider>
      </NavbarProvider>
    </AzureProvider>
  );
}
