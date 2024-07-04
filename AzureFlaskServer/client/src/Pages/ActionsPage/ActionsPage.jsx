import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import React, { useState } from "react";
import { ListView } from "./components/ListView";
import { columns } from "./components/columns";

export default function ActionsPage() {

  const [data, setData] = useState([
    {
      "action": "Query automobile sales",
      "description": "Answers any queries related to automobile sales from the year of 2012 onwards",
      "action_type": "Query",
      "database": "Auto Sales Data"
    },
    {
      "action": "Query shopping trends",
      "description": "Answers any queries related to shopping trends from the latest studies",
      "action_type": "Query",
      "database": "Shopping Trends Updated"
    },
    {
      "action": "Query supermarket sales",
      "description": "Answers any queries related to supermarket sales from the year of 2012 onwards",
      "action_type": "Query",
      "database": "Supermarket Data"
    },
    {
      "action": "Query automobile sales by country",
      "description": "Answers any queries related to automobile sales by country",
      "action_type": "Query",
      "database": "Auto sales Data"
    },
    {
      "action": "Email a user on the supermarket sales",
      "description": "Email a user on data retrieved regarding supermarket sales",
      "action_type": "API",
      "database": "Supermarket Data"
    },
  ])
  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col justify-between h-[15vh] p-10">
        <h1 className="text-4xl font-bold text-primary">Actions</h1>
        <div className="mt-10"> 
          <Tabs defaultValue="account" className="w-full">
            <TabsList>
              <TabsTrigger value="actions">Actions</TabsTrigger>
              <TabsTrigger value="databases">Databases</TabsTrigger>
            </TabsList>
            <TabsContent value="actions">
              <ListView data={data} columns={columns}/>
            </TabsContent>
            <TabsContent value="databases">Change your password here.</TabsContent>
          </Tabs>
        </div>
        
      </div>
      

    </div>
  );
}
