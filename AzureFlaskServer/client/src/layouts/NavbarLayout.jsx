import {
  SquareKanban,
  BotMessageSquare,
  Workflow,
  Settings,
  Users2,
  MessagesSquare,
  House,
  Share2Icon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/Components/ui/tooltip";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/Components/ui/resizable";
import { AccountSwitcher } from "../CustomComponents/account-switcher";
import { Nav } from "../CustomComponents/nav";
import { Separator } from "@/Components/ui/separator";
import { useNavbar } from "@/hooks/useNavbar";

export default function NavbarLayout({ children }) {
  const {
    accountList,
    defaultLayout,
    navCollapsedSize,
    isCollapsed,
    setIsCollapsed,
    routeName,
    routePath,
  } = useNavbar();

  return (
    <>
      <div className="h-screen w-screen flex justify-center items-center text-center md:hidden">
        Currently only supported on desktop devices
      </div>
      <div className="h-[100vh] hidden flex-col md:flex">
        <TooltipProvider delayDuration={0}>
          <ResizablePanelGroup direction="horizontal" className=" ">
            <ResizablePanel
              defaultSize={defaultLayout.current[0]}
              collapsedSize={navCollapsedSize.current}
              collapsible={true}
              minSize={10}
              maxSize={15}
              onResize={(size, prevSize) => {
                if (size === navCollapsedSize.current) {
                  setIsCollapsed(true);
                } else {
                  setIsCollapsed(false);
                }
              }}
              className={cn(
                isCollapsed &&
                  "min-w-[50px] transition-all duration-300 ease-in-out"
              )}
            >
              <div
                className={cn(
                  "flex h-[52px] items-center justify-center",
                  isCollapsed ? "h-[52px]" : "px-2"
                )}
              >
                <AccountSwitcher
                  isCollapsed={isCollapsed}
                  accounts={accountList}
                />
              </div>
              <Separator />
              <Nav
                isCollapsed={isCollapsed}
                links={[
                  {
                    title: "Home",
                    label: "",
                    icon: House,
                    variant: routeName === "app" ? "default" : "ghost",
                    to: "",
                  },
                  {
                    title: "Transcriber",
                    label: "",
                    icon: MessagesSquare,
                    variant: routeName === "transcriber" ? "default" : "ghost",
                    to: "transcriber",
                  },
                  {
                    title: "Copilot",
                    label: "",
                    icon: BotMessageSquare,
                    variant: routeName === "copilot" ? "default" : "ghost",
                    to: "copilot",
                  },
                  {
                    title: "Integrations",
                    label: "",
                    icon: Share2Icon,
                    variant: routePath.includes("integrations")
                      ? "default"
                      : "ghost",
                    to: "integrations",
                  },
                  {
                    title: "Actions",
                    label: "",
                    icon: Workflow,
                    variant: routeName === "actions" ? "default" : "ghost",
                    to: "actions",
                  },
                ]}
              />
              <Separator />
              <Nav
                isCollapsed={isCollapsed}
                links={[
                  {
                    title: "Account",
                    label: "",
                    icon: Users2,
                    variant: routeName === "account" ? "default" : "ghost",
                    to: "account",
                  },
                  {
                    title: "Settings",
                    label: "",
                    icon: Settings,
                    variant: routeName === "settings" ? "default" : "ghost",
                    to: "settings",
                  },
                ]}
              />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={defaultLayout.current[1]} minSize={30}>
              {children}
            </ResizablePanel>
          </ResizablePanelGroup>
        </TooltipProvider>
      </div>
    </>
  );
}
