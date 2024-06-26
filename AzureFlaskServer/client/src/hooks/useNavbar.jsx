import { accounts } from "@/data/data";
import { createContext, useContext, useMemo, useRef, useState } from "react";

const NavbarContext = createContext();

export const NavbarProvider = ({ children }) => {
  const [accountList, setAccountList] = useState(accounts);
  const [routeName, setRouteName] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(true);
  const navCollapsedSize = useRef(6);
  const defaultLayout = useRef([15, 85]);

  const value = useMemo(
    () => ({
      accountList,
      setAccountList,
      routeName,
      setRouteName,
      isCollapsed,
      setIsCollapsed,
      navCollapsedSize,
      defaultLayout,
    }),
    [accountList, routeName, isCollapsed]
  );

  return (
    <NavbarContext.Provider value={value}>{children}</NavbarContext.Provider>
  );
};

export const useNavbar = () => {
  const context = useContext(NavbarContext);
  if (!context) {
    throw new Error("useNavbar must be used within a NavbarProvider");
  }
  return context;
};
