import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/Components/ui/resizable";
import "./TranscriberPage.css";
import Transcriber from "./Components/transcriber";
import TangentualInfo from "./Components/tangentual-info";
import FollowUpQuestion from "./Components/follow-up-question";
import LLMOutput from "./Components/llm-output";

export default function TranscriberPage() {
  return (
    <>
      <div className="flex flex-col h-full">
        <div className="h-[15vh] p-10">
          <h1 className="text-4xl font-bold text-primary">Transcriber</h1>
        </div>
        <ResizablePanelGroup direction="horizontal" className="h-full">
          <ResizablePanel defaultSize={35} minSize={25} maxSize={55}>
            <Transcriber />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={65} minSize={45} maxSize={85}>
            <ResizablePanelGroup direction="horizontal" className="h-full">
              <ResizablePanel defaultSize={50} minSize={30} maxSize={70}>
                <LLMOutput />
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={50} minSize={30} maxSize={70}>
                <ResizablePanelGroup direction="vertical" className="h-full">
                  <ResizablePanel defaultSize={50} minSize={30} maxSize={70}>
                    <FollowUpQuestion />
                  </ResizablePanel>
                  <ResizableHandle withHandle />
                  <ResizablePanel defaultSize={50} minSize={30} maxSize={70}>
                    <TangentualInfo />
                  </ResizablePanel>
                </ResizablePanelGroup>
              </ResizablePanel>
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </>
  );
}
