import {
  SquareKanban,
  BotMessageSquare,
  Workflow,
  Settings,
  Users2,
  MessagesSquare,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useState } from "react";
import { TooltipProvider } from "@/Components/ui/tooltip";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/Components/ui/resizable";
import { AccountSwitcher } from "./account-switcher";
import { Nav } from "./nav";
import { Separator } from "@/Components/ui/separator";

export function Mail({
  accounts,
  defaultLayout = [15, 30, 30],
  navCollapsedSize,
}) {
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <TooltipProvider delayDuration={0}>
      <ResizablePanelGroup direction="horizontal" className=" ">
        <ResizablePanel
          defaultSize={defaultLayout[0]}
          collapsedSize={navCollapsedSize}
          collapsible={true}
          minSize={10}
          maxSize={15}
          onResize={(size, prevSize) => {
            if (size === navCollapsedSize) {
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
            <AccountSwitcher isCollapsed={isCollapsed} accounts={accounts} />
          </div>
          <Separator />
          <Nav
            isCollapsed={isCollapsed}
            links={[
              {
                title: "Transcriber",
                label: "",
                icon: MessagesSquare,
                variant: "default",
                to: "transcriber",
              },
              {
                title: "Copilot",
                label: "",
                icon: BotMessageSquare,
                variant: "ghost",
                to: "copilot",
              },
              {
                title: "Jira",
                label: "",
                icon: SquareKanban,
                variant: "ghost",
                to: "jira",
              },
              {
                title: "Actions",
                label: "",
                icon: Workflow,
                variant: "ghost",
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
                variant: "ghost",
                to: "account",
              },
              {
                title: "Settings",
                label: "",
                icon: Settings,
                variant: "ghost",
                to: "settings",
              },
            ]}
          />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={defaultLayout[1]} minSize={30}>
          test
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={defaultLayout[2]} minSize={20}>
          test
        </ResizablePanel>
      </ResizablePanelGroup>
    </TooltipProvider>
  );
}
