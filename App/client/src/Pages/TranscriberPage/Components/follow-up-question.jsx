import React, { useEffect, useState } from "react";
import { ArrowBigLeft, ArrowBigRight } from "lucide-react";

export default function FollowUpQuestion({ followUpData, height }) {
  const [page, setPage] = useState(0);
  const [hoveredLeft, setHoveredLeft] = useState(false);
  const [hoveredRight, setHoveredRight] = useState(false);

  const goToPreviousPage = () => {
    if (page === 0) return;
    setPage((prev) => prev - 1);
  };

  const goToNextPage = () => {
    if (followUpData.followUpQuestions.length === 0) return;

    if (page < followUpData.followUpQuestions.length - 1) {
      setPage(page + 1);
    }
  };

  return (
    <div className="overflow-scroll h-fit">
      <h3 className="p-3 flex justify-start border-t text-lg font-bold text-slate-700 antialiased tracking-normal">
        Follow Up Questions
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
              followUpData.followUpQuestions.length === 0 ||
              page === followUpData.headerText.length - 1
                ? "#ccc"
                : "black",
            cursor:
              followUpData.followUpQuestions.length === 0 ||
              page === followUpData.headerText.length - 1
                ? "default"
                : "pointer",
            fill:
              followUpData.followUpQuestions.length === 0 ||
              page === followUpData.headerText.length - 1
                ? "#ccc"
                : hoveredRight
                ? "black"
                : "none",
          }}
          onMouseEnter={() => setHoveredRight(true)}
          onMouseLeave={() => setHoveredRight(false)}
          disabled={
            followUpData.followUpQuestions.length === 0 ||
            page === followUpData.headerText.length - 1
          }
        />
      </div>
      <div
        style={{
          height: `calc(${height * 0.67}vh - 20px)`,
          overflowY: "auto",
        }}
      >
        <div
          style={{
            backgroundColor:
              followUpData.headerText.length === 0 ? "inherit" : "inherit",
          }}
        >
          {followUpData.headerText.length === 0 ? (
            <h4 className="mt-40 flex justify-center items-center text-xl font-semibold tracking-tight">
              No follow up questions...
            </h4>
          ) : (
            <>
              <p className="p-2 font-bold text-blue-950 ml-4 mt-2 mb-3">
                {followUpData.headerText[page]}
              </p>
              {followUpData?.followUpQuestions[page].map((item, idx) => (
                <p
                  key={idx}
                  className="p-3 mb-3 font-normal rounded-lg border border-gray-300 mx-4"
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
