import React, { useEffect, useState } from "react";
import { ArrowBigLeft, ArrowBigRight } from "lucide-react";

const exampleHeader = [
  "Follow Up Questions 1",
  "Follow Up Questions 2",
  "Follow Up Questions 3",
];
const exampleQuestions = [
  [
    "What is your favorite color?",
    "What is your favorite food?",
    "What is your favorite movie?",
  ],
  [
    "What is your favorite animal?",
    "What is your favorite book?",
    "What is your favorite song?",
  ],
  [
    "What is your favorite hobby?",
    "What is your favorite sport?",
    "What is your favorite place?",
  ],
];

export default function FollowUpQuestion({ followUpData }) {
  const [page, setPage] = useState(0);
  const [hoveredLeft, setHoveredLeft] = useState(false);
  const [hoveredRight, setHoveredRight] = useState(false);

  const goToPreviousPage = () => {
    if (page === 0) return;
    setPage((prev) => prev - 1);
  };

  console.log(followUpData.followUpQuestions.length);

  const goToNextPage = () => {
    if (followUpData.followUpQuestions.length === 0) return;

    if (page < followUpData.followUpQuestions.length - 1) {
      setPage(page + 1);
    }
  };

  return (
    <div>
      <div className="flex justify-around items-center border-t border-b">
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
        <h3 className="p-3 scroll-m-20 text-2xl font-semibold tracking-tight">
          Follow Up Questions
        </h3>
        <ArrowBigRight
          className="arrow-icon"
          onClick={goToNextPage}
          style={{
            stroke:
              followUpData.followUpQuestions.length === 0 || page === followUpData.headerText.length - 1
                ? "#ccc"
                : "black",
            cursor:
            followUpData.followUpQuestions.length === 0 || page === followUpData.headerText.length - 1
                ? "default"
                : "pointer",
            fill:
            followUpData.followUpQuestions.length === 0 || page === followUpData.headerText.length - 1
                ? "#ccc"
                : hoveredRight
                ? "black"
                : "none",
          }}
          onMouseEnter={() => setHoveredRight(true)}
          onMouseLeave={() => setHoveredRight(false)}
          disabled={followUpData.followUpQuestions.length === 0 || page === followUpData.headerText.length - 1}
        />
      </div>
      <div>
        <div
          style={{
            height: "75vh",
            overflowY: "auto",
            backgroundColor:
              followUpData.headerText.length === 0 ? "#a1a1a1" : "inherit",
          }}
        >
          {followUpData.headerText.length === 0 ? (
            <h4 className="mt-40 flex justify-center items-center text-xl font-semibold tracking-tight">
              No follow up questions
            </h4>
          ) : (
            <>
              <p className="p-2 font-bold text-blue-950 ml-4 mt-2">
                {followUpData.headerText[page]}
              </p>
              {followUpData.followUpQuestions[page].map((item, idx) => (
                <p
                  key={idx}
                  className="p-2 mb-2 rounded-lg border border-gray-300 mx-4"
                >
                  {item}
                </p>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
