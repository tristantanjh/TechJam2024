import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/Components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/Components/ui/accordion";
import { CircleCheck, CircleX } from "lucide-react";
import { Input } from "@/Components/ui/input";
import { useCopilot } from "@/hooks/useCopilot";

export default function ApiCardSubmitted({ data, index }) {
  const { chatHistory } = useCopilot();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          {"Action: " + data?.action_name}
        </CardTitle>
      </CardHeader>

      <CardContent>
        {chatHistory[index].status === "success" ? (
          <div className="flex justify-start w-full p-4 rounded-md bg-emerald-500 hover:bg-emerald-600">
            <CircleCheck /> <span className="ml-4 font-semibold">Success</span>
          </div>
        ) : (
          <div className="flex justify-start w-full p-4 rounded-md bg-rose-700 hover:bg-rose-800">
            <CircleX />
            <span className="ml-4 font-semibold">Error. Try again later.</span>
          </div>
        )}

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="input-list">
            <AccordionTrigger>Input Parameters</AccordionTrigger>
            <AccordionContent>
              {Object.entries(data?.extracted_inputs).map(
                ([key, value], index) => (
                  <div key={key} className="flex flex-col justify-between mb-5">
                    <Label htmlFor={key}>{key}</Label>
                    <Input className="mt-3" id={key} value={value} disabled />
                  </div>
                )
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
