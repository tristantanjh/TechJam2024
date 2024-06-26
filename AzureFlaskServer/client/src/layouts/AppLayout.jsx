import { Outlet } from "react-router-dom";
import { AzureProvider } from "../hooks/useTranscriber";
import { NavbarProvider } from "@/hooks/useNavbar";
import NavbarLayout from "./NavbarLayout";

export default function AppLayout() {
  return (
    <AzureProvider>
      <NavbarProvider>
        <NavbarLayout>
          <Outlet />
        </NavbarLayout>
      </NavbarProvider>
    </AzureProvider>
  );
}
