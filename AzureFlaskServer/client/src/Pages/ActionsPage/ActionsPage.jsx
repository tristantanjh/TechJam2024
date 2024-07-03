import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import React from "react";
import { ListView } from "./components/ListView";
import { columns } from "./components/columns";

export default function ActionsPage() {
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
            <TabsContent value="actions"><ListView data={[]} columns={columns}/></TabsContent>
            <TabsContent value="databases">Change your password here.</TabsContent>
          </Tabs>
        </div>
        
      </div>
      

    </div>
  );
}
