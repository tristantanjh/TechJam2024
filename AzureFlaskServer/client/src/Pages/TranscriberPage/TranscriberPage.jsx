import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/Components/ui/resizable";
import "./TranscriberPage.css";

export default function TranscriberPage() {
  return (
    <>
      <ResizablePanelGroup direction="horizontal" className="h-full">
        <ResizablePanel defaultSize={50} minSize={30} maxSize={70}>
          Add component here!
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={50} minSize={30} maxSize={70}>
          Add component here!
        </ResizablePanel>
      </ResizablePanelGroup>
    </>
  );
}
