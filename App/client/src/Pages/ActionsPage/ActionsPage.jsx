import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React, { useState, useEffect } from "react";
import { ListView } from "./components/ListView";
import { columns } from "./components/columns";
import { db_columns } from "./components/db_columns";
import axiosInstance from "../../../axios.config";
import { useActions } from "@/hooks/useActions";

export default function ActionsPage() {

  const { dbInfo, setDBInfo, actions, setActions } = useActions();


  useEffect(() => {
    axiosInstance.get("/api/get-databases").then((res) => {
      setDBInfo(res.data);
    });
  }, [setDBInfo]);

  useEffect(() => {
    axiosInstance.get("/api/get-actions").then((res) => {
      console.log("res", res.data);
      setActions(res.data);
    });
  }, []);
  console.log("actions", actions);
  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col justify-between h-[15vh] p-10">
        <h1 className="text-4xl font-bold text-primary">Actions</h1>
        <div className="mt-10">
          <Tabs defaultValue="actions" className="w-full">
            <TabsList>
              <TabsTrigger value="actions">Actions</TabsTrigger>
              <TabsTrigger value="databases">Databases</TabsTrigger>
            </TabsList>
            <TabsContent value="actions">
              <ListView data={actions} columns={columns} type="Actions" />
            </TabsContent>
            <TabsContent value="databases">
              <ListView data={dbInfo} columns={db_columns} type="Databases" />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
