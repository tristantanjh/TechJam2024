import React, { useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowBigLeft, ArrowBigRight } from "lucide-react";
import { useTranscriber } from "@/hooks/useTranscriber";

export default function TangentialInfo({
  socketInstance,
  height,
  refreshTangential,
  setRefreshTangential,
}) {
  const { GetSessionId } = useTranscriber();
  const [page, setPage] = useState(0);
  const [hoveredLeft, setHoveredLeft] = useState(false);
  const [hoveredRight, setHoveredRight] = useState(false);
  const [llmOutput, setLlmOutput] = useState([]);
  const [openItems, setOpenItems] = useState([]);
  const [tangentialData, setTangentialData] = useState({
    headerText: [],
    questions: [],
    answers: [],
  });

  const goToPreviousPage = () => {
    if (page === 0) return;
    setPage((prev) => prev - 1);
    setOpenItems([]);
  };

  const goToNextPage = () => {
    if (tangentialData.questions.length === 0) return;
    if (page < tangentialData.questions.length - 1) {
      setPage(page + 1);
      setOpenItems([]);
    }
  };

  const handleClick = (idx) => {
    const currentItem = idx.toString();
    if (openItems.includes(currentItem)) {
      setOpenItems(openItems.filter((item) => item !== currentItem));
    } else {
      setOpenItems([...openItems, currentItem]);
    }

    if (socketInstance && !tangentialData.answers[page][idx]) {
      const data = {
        sessionId: GetSessionId(),
        selectedQuestion: tangentialData.questions[page][idx],
        idx: idx,
        page: page,
      };

      socketInstance.emit("selected-question", data);
    }
  };

  useEffect(() => {
    if (refreshTangential) {
      setTangentialData({
        questions: [],
        answers: [],
        headerText: [],
      });
      setPage(0);
      setOpenItems([]);
      setRefreshTangential(false);
    }
  }, [refreshTangential]);

  useEffect(() => {
    if (socketInstance) {
      socketInstance.on("tangential-questions", (data) => {
        if (data) {
          const parsedTangentialQuestions = JSON.parse(
            data["tangentialQuestions"]
          );
          
          setTangentialData((prevData) => {
            console.log(prevData)
            console.log(prevData.headerText)
            console.log(data["headerText"])
            console.log(Array.isArray(prevData.headerText))
            return {
              headerText: [...prevData.headerText, data["headerText"]],
              questions: [...prevData.questions, parsedTangentialQuestions],
              answers: [...prevData.answers, ["", "", ""]],
            }
          }
            );
        }
      });

      // TODO: get tangential questions from server and update state
      socketInstance.on(
        "tangential-questions-response",
        ({ response, idx, page }) => {
          if (response) {
            console.log("Changing response FE");
            console.log(response)

            setTangentialData((prevData) => {
              const tmp = prevData.answers;
              tmp[page][idx] = response;
              return {
                ...prevData,
                answers: tmp,
              };
            });
          }
        }
      );
    }
  }, [socketInstance]);

  return (
    <div>
      <h3 className="p-3 flex justify-start border-t text-lg font-bold text-slate-700 antialiased tracking-normal">
        Related Information
      </h3>
      <div className="flex justify-around items-center ">
        <ArrowBigLeft
          className="arrow-icon"
          onClick={goToPreviousPage}
          style={{
            stroke: page === 0 ? "#ccc" : "black",
            cursor: page === 0 ? "default" : "pointer",
            fill: page === 0 ? "#ccc" : hoveredLeft ? "black" : "none",
          }}
          onMouseEnter={() => setHoveredLeft(true)}
          onMouseLeave={() => setHoveredLeft(false)}
          disabled={page === 0}
        />

        <ArrowBigRight
          className="arrow-icon"
          onClick={goToNextPage}
          style={{
            stroke:
              tangentialData.questions.length === 0 ||
              page === tangentialData.questions.length - 1
                ? "#ccc"
                : "black",
            cursor:
              tangentialData.questions.length === 0 ||
              page === tangentialData.questions.length - 1
                ? "default"
                : "pointer",
            fill:
              tangentialData.questions.length === 0 ||
              page === tangentialData.questions.length - 1
                ? "#ccc"
                : hoveredRight
                ? "black"
                : "none",
          }}
          onMouseEnter={() => setHoveredRight(true)}
          onMouseLeave={() => setHoveredRight(false)}
          disabled={
            tangentialData.questions.length === 0 ||
            page === tangentialData.questions.length - 1
          }
        />
      </div>
      <div
        style={{
          height: `${height * 0.67}vh`,
          overflowY: "auto",
        }}
      >
        <div>
          {tangentialData.questions.length === 0 ? (
            <h4 className="mt-40 flex justify-center items-center text-xl font-semibold tracking-tight">
              No related information...
            </h4>
          ) : <>
            <p className="p-2 font-bold text-blue-950 ml-4 mt-2 mb-3">
                {tangentialData.headerText[page]}
            </p>
            <Accordion
              type="multiple"
              collapsible="true"
              className="w-full"
              value={openItems}
            >
              {tangentialData.questions[page].map((item, idx) => (
                <AccordionItem key={idx} value={idx.toString()} className="p-2">
                  <AccordionTrigger
                    className="p-2"
                    onClick={() => handleClick(idx)}
                  >
                    {item}
                  </AccordionTrigger>
                  <AccordionContent className="p-2">
                    {tangentialData.answers[page]?.[idx] ? (
                      <p className="p-3 text-base">
                        {tangentialData.answers[page]?.[idx]}
                      </p>
                    ) : (
                      <div className="p-3 h-10 flex justify-center items-end">
                        <div className="loader-custom">
                          <li className="ball-custom"></li>
                          <li className="ball-custom"></li>
                          <li className="ball-custom"></li>
                        </div>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            </>
          }
        </div>
      </div>
    </div>
  );
}
