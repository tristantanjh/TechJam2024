import React, { useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useTranscriber } from "@/hooks/useTranscriber";

const tangentialQuestions = [
  ["What is your favorite color?", "I like the color blue."],
  ["What is your favorite food?", "I like pizza."],
  ["What is your favorite movie?", "I like action movies."],
];

const exampleQuestion = [
  "Tell me more about the TikTok Manual Payment billing option.",
  "Tell me more about the TikTok Automatic Payment billing option.",
  "Tell me more about the TikTok Monthly Invoicing billing option.",
];

export default function TangentialInfo({ socketInstance }) {
  const { GetSessionId } = useTranscriber();

  const handleClick = (idx) => {
    console.log("Clicked", idx);
    if (socketInstance) {
      const data = {
        sessionId: GetSessionId(),
        question: exampleQuestion[idx],
      };

      socketInstance.emit("selected-question", data);
    }
  };

  useEffect(() => {
    if (socketInstance) {
      socketInstance.on("tangential-questions", (data) => {
        console.log("Tangential Questions", data);
      });
    }
  }, [socketInstance]);

  return (
    <div>
      <div className="flex justify-around items-center border-t border-b">
        <h3 className="p-3 scroll-m-20 text-2xl font-semibold tracking-tight">
          Tangential Questions
        </h3>
      </div>
      <div>
        <div
          style={{
            height: "75vh",
            overflowY: "auto",
            backgroundColor:
              tangentialQuestions.length === 0 ? "#a1a1a1" : "inherit",
          }}
        >
          {tangentialQuestions.length === 0 ? (
            <h4 className="mt-40 flex justify-center items-center text-xl font-semibold tracking-tight">
              No tangential questions
            </h4>
          ) : (
            <Accordion type="multiple" collapsible className="w-full">
              {exampleQuestion.map((item, idx) => (
                <AccordionItem key={idx} value={idx.toString()} className="p-2">
                  <AccordionTrigger
                    className="p-2"
                    onClick={() => handleClick(idx)}
                  >
                    {item[0]}
                  </AccordionTrigger>
                  <AccordionContent className="p-2">{item[1]}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>
      </div>
    </div>
  );
}
