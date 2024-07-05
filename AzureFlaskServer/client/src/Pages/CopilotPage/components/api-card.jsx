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

export default function ApiCard({ data, socket, key }) {
  const [inputData, setInputData] = useState(data?.extracted_inputs);
  const [state, setState] = useState("initial");
  const initialised = useRef(false);
  const [apiResponse, setApiResponse] = useState(null);
  const [Reminder, setReminder] = useState(false);

  const handleInput = (e) => {
    setInputData({ ...inputData, [e.target.id]: e.target.value });
  };

  const validateInput = () => {
    return Object.values(inputData).every((value) => value !== "");
  };

  const handleSubmit = () => {
    if (!validateInput()) {
      setReminder(true);
      setTimeout(() => {
        setReminder(false);
      }, 3000);
      return;
    }
    console.log("Submitted");
    setState("loading");
    socket.emit("api-call", {
      action_name: data?.action_name,
      extracted_inputs: inputData,
    });
  };

  useEffect(() => {
    if (!initialised.current) {
      socket.on("api-response", (data) => {
        console.log(data);
        setState("submitted");
        setApiResponse(data);
      });
      initialised.current = true;
    }
  }, []);
  return (
    <Card key={key}>
      <CardHeader>
        <CardTitle className="text-lg">
          {"Action: " + data?.action_name}
        </CardTitle>
        <CardDescription>Please confirm the fields below</CardDescription>
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
            <CardFooter>
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
