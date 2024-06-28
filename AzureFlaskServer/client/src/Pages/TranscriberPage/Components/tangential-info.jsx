import React, { useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowBigLeft, ArrowBigRight } from "lucide-react";
import { useTranscriber } from "@/hooks/useTranscriber";

const exampleQuestion = [
  [
    "Tell me more about the TikTok Manual Payment billing option.",
    "Tell me more about the TikTok Automatic Payment billing option.",
    "Tell me more about the TikTok Monthly Invoicing billing option.",
  ],
  ["1", "2", "3"],
  ["4", "5", "6"],
];

export default function TangentialInfo({ socketInstance, height }) {
  const { GetSessionId } = useTranscriber();
  const [page, setPage] = useState(0);
  const [hoveredLeft, setHoveredLeft] = useState(false);
  const [hoveredRight, setHoveredRight] = useState(false);
  const [tangentialQuestions, setTangentialQuestions] = useState([]);
  const [llmOutput, setLlmOutput] = useState([]);
  const [openItems, setOpenItems] = useState([]);

  // append 1 empty array to llmOutput everytime tangentialQuestions is updated
  // useEffect(() => {
  //   if (tangentialQuestions.length > 0) {
  //     setLlmOutput((prevLlmOutput) => [
  //       ...prevLlmOutput,
  //       new Array(3).fill(undefined),
  //     ]);
  //   }
  // }, [tangentialQuestions]);

  // this is for testing on exampleQuestion
  useEffect(() => {
    if (exampleQuestion.length > 0) {
      const initialLlmOutput = exampleQuestion.map(() => []);
      setLlmOutput(initialLlmOutput);
    }
  }, [exampleQuestion]);

  const goToPreviousPage = () => {
    if (page === 0) return;
    setPage((prev) => prev - 1);
    setOpenItems([]);
  };

  const goToNextPage = () => {
    if (exampleQuestion.length === 0) return;
    if (page < exampleQuestion.length - 1) {
      setPage(page + 1);
      setOpenItems([]);
    }
  };

  const handleClick = (idx) => {
    console.log("Clicked", idx);
    const currentItem = idx.toString();
    if (openItems.includes(currentItem)) {
      setOpenItems(openItems.filter((item) => item !== currentItem));
    } else {
      setOpenItems([...openItems, currentItem]);
    }

    if (socketInstance && llmOutput[page][idx] === undefined) {
      const data = {
        sessionId: GetSessionId(),
        selectedQuestion: exampleQuestion[page][idx],
        idx: idx,
        page: page,
      };

      socketInstance.emit("selected-question", data);
    }
  };

  useEffect(() => {
    if (socketInstance) {
      socketInstance.on("tangential-questions-response", (data) => {
        const updatedLlmOutput = [...llmOutput];
        updatedLlmOutput[data.page][data.idx] = data.response;
        setLlmOutput(updatedLlmOutput);
      });

      // TODO: get tangential questions from server and update state
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
              exampleQuestion.length === 0 ||
              page === exampleQuestion.length - 1
                ? "#ccc"
                : "black",
            cursor:
              exampleQuestion.length === 0 ||
              page === exampleQuestion.length - 1
                ? "default"
                : "pointer",
            fill:
              exampleQuestion.length === 0 ||
              page === exampleQuestion.length - 1
                ? "#ccc"
                : hoveredRight
                ? "black"
                : "none",
          }}
          onMouseEnter={() => setHoveredRight(true)}
          onMouseLeave={() => setHoveredRight(false)}
          disabled={
            exampleQuestion.length === 0 || page === exampleQuestion.length - 1
          }
        />
      </div>
      <div
        style={{
          height: `${height * 0.67}vh`,
          overflowY: "auto",
        }}
      >
        <div
          style={{
            backgroundColor:
              exampleQuestion.length === 0 ? "#a1a1a1" : "inherit",
          }}
        >
          {exampleQuestion.length === 0 ? (
            <h4 className="mt-40 flex justify-center items-center text-xl font-semibold tracking-tight">
              No related information
            </h4>
          ) : (
            <Accordion
              type="multiple"
              collapsible
              className="w-full"
              value={openItems}
            >
              {exampleQuestion[page].map((item, idx) => (
                <AccordionItem key={idx} value={idx.toString()} className="p-2">
                  <AccordionTrigger
                    className="p-2"
                    onClick={() => handleClick(idx)}
                  >
                    {item}
                  </AccordionTrigger>
                  <AccordionContent className="p-2">
                    {llmOutput[page]?.[idx] !== undefined ? (
                      <p>{llmOutput[page]?.[idx]}</p>
                    ) : (
                      <p>Loading...</p>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>
      </div>
    </div>
  );
}
