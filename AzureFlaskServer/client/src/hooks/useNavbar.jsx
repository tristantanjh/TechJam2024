import { accounts } from "@/data/data";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocation } from "react-router-dom";

const NavbarContext = createContext();

export const NavbarProvider = ({ children }) => {
  const [accountList, setAccountList] = useState(accounts);
  const location = useLocation();
  const [routeName, setRouteName] = useState(
    location.pathname.split("/").slice(-1)[0]
  );
  const [isCollapsed, setIsCollapsed] = useState(true);
  const navCollapsedSize = useRef(6);
  const defaultLayout = useRef([15, 85]);
  const [routePath, setRoutePath] = useState(location.pathname.split("/"));

  useEffect(() => {
    setRouteName(location.pathname.split("/").slice(-1)[0]);
    setRoutePath(location.pathname.split("/"));
  }, [location]);

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
      routePath,
    }),
    [accountList, routeName, isCollapsed, routePath]
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
