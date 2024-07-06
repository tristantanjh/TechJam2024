import { Button } from "@/Components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/Components/ui/label";
import { Textarea } from "@/Components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import "ldrs/hatch";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
} from "@/Components/ui/accordion";
import { AccordionContent } from "@radix-ui/react-accordion";
import { CircleCheck, CircleX } from "lucide-react";
import { Input } from "@/Components/ui/input";
import { useCopilot } from "@/hooks/useCopilot";

export default function ApiCard({ data, index }) {
  const [inputData, setInputData] = useState(data?.extracted_inputs);
  const [state, setState] = useState("initial");
  const initialised = useRef(false);
  const [apiResponse, setApiResponse] = useState(null);
  const [reminder, setReminder] = useState(false);
  const { socketInstance, setChatHistory } = useCopilot();

  const handleInput = (e) => {
    setInputData({ ...inputData, [e.target.id]: e.target.value });
  };

  const validateInput = () => {
    return Object.values(inputData).every((value) => value !== "");
  };

  const handleSubmit = () => {
    console.log(index);
    if (!validateInput()) {
      setReminder(true);
      setTimeout(() => {
        setReminder(false);
      }, 5000);
      return;
    }
    console.log("Submitted");
    setState("loading");
    console.log(data);
    socketInstance.emit("api-call", {
      action_name: data?.action_name,
      api_service: data?.api_service,
      extracted_inputs: inputData,
      index: index,
    });
  };

  const updateChatHistory = (index, newMessage) => {
    setChatHistory((prevList) => {
      const newList = [...prevList];
      newList[index] = newMessage;
      return newList;
    });
  };

  useEffect(() => {
    if (!initialised.current) {
      socketInstance?.on("api-response", (dataNew) => {
        setState("submitted");
        setApiResponse(dataNew);
        if (dataNew.index === index) {
          const newMessage = {
            type: "apiSubmitted",
            status: dataNew.status,
            text: {
              ...data,
              extracted_inputs: dataNew.extracted_inputs,
            },
          };

          updateChatHistory(index, newMessage);
        }
      });
      initialised.current = true;
    }
  }, [socketInstance]);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {"Action: " + data?.action_name}
        </CardTitle>
        <AnimatePresence>
          {state === "initial" && (
            <motion.div exit={{ opacity: 0 }}>
              <CardDescription>Please confirm the fields below</CardDescription>
            </motion.div>
          )}
        </AnimatePresence>
      </CardHeader>
      <AnimatePresence mode="wait">
        {state === "initial" && (
          <motion.div key="initial" exit={{ opacity: 0 }}>
            <CardContent>
              {Object.entries(data?.extracted_inputs).map(
                ([key, value], index) => (
                  <div key={key} className="flex flex-col justify-between mb-5">
                    <Label htmlFor={key}>{key}</Label>
                    <Textarea
                      className="mt-3"
                      id={key}
                      value={inputData[key]}
                      onChange={handleInput}
                    />
                  </div>
                )
              )}
            </CardContent>
          </motion.div>
        )}
        {state === "loading" && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <CardContent>
              <div className="flex flex-col justify-center items-center w-full h-full min-h-[300px] ">
                <l-hatch
                  size="28"
                  stroke="4"
                  speed="3.5"
                  color="black"
                ></l-hatch>
                <p className="translate-x-1 mt-5">Submitting...</p>
              </div>
            </CardContent>
          </motion.div>
        )}
        {state === "submitted" && (
          <motion.div
            key="submitted"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <CardContent>
              {apiResponse?.status === "success" ? (
                <div className="flex justify-start w-full p-4 rounded-md bg-emerald-500 hover:bg-emerald-600">
                  <CircleCheck />{" "}
                  <span className="ml-4 font-semibold">Success</span>
                </div>
              ) : (
                <div className="flex justify-start w-full p-4 rounded-md bg-rose-700 hover:bg-rose-800">
                  <CircleX />
                  <span className="ml-4 font-semibold">
                    Error. Try again later.
                  </span>
                </div>
              )}

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="input-list">
                  <AccordionTrigger>Input Parameters</AccordionTrigger>
                  <AccordionContent>
                    {Object.entries(data?.extracted_inputs).map(
                      ([key, value], index) => (
                        <div
                          key={key}
                          className="flex flex-col justify-between mb-5"
                        >
                          <Label htmlFor={key}>{key}</Label>
                          <Input
                            className="mt-3"
                            id={key}
                            value={inputData[key]}
                            disabled
                          />
                        </div>
                      )
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {state === "initial" && (
          <motion.div exit={{ opacity: 0 }}>
            <CardFooter className="flex flex-col">
              <AnimatePresence>
                {reminder && (
                  <motion.div
                    key="reminder"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, x: 25 }}
                    className="flex justify-start w-full p-2 rounded-md text-rose-700 hover:text-rose-800"
                  >
                    <span className="">
                      Please make sure all input fields are filled.
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              <Button onClick={handleSubmit} className="w-full">
                Confirm
              </Button>
            </CardFooter>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
