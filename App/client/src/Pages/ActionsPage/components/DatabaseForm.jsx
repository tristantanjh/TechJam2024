import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axiosInstance from "../../../../axios.config";
import { useActions } from "@/hooks/useActions";

export function DatabaseForm({ closeModal }) {
  const { setDBInfo } = useActions();

  const formSchema = z.object({
    database_name: z
      .string()
      .min(1, {
        message: "Database name is required.",
      })
      .max(255),
    database_description: z.string().min(1, {
      message: "Database description is required",
    }),
    database_file: z
      .any()
      // .refine((files) => files?.length == 1, { message: 'One CSV file is needed.' })
      .refine(
        (files) => {
          console.log(files);
          return files?.type === "text/csv";
        },
        {
          message: "Only .csv files are accepted.",
        }
      ),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      database_name: "",
      database_description: "",
      database_file: null,
    },
    mode: 'onChange'
  });

  // const {
  //   register,
  //   watch,
  //   handleSubmit,
  //   setError,
  //   formState: { errors, isSubmitting },
  // } = form;

  function onSubmit(values) {
    console.log(values);
    axiosInstance
      .post("/api/databases", values, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((res) => {
        console.log(res);
        console.log(res.data);
        const { data, status } = res;
        if (status === 200) {
          setDBInfo(data);
          closeModal();
        }
      });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="database_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Database Name</FormLabel>
              <FormControl>
                <Input placeholder="Database Name" {...field} />
              </FormControl>
              <FormDescription>
                This database name will be displayed to others in the future
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="database_description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Database Description</FormLabel>
              <FormControl>
                <Input placeholder="Database Description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="database_file"
          render={({ field: { value, onChange, ...fieldProps } }) => (
            <FormItem>
              <FormLabel>Database File</FormLabel>
              <FormControl>
                <Input
                  {...fieldProps}
                  type="file"
                  accept="csv"
                  onChange={(event) =>
                    onChange(event.target.files && event.target.files[0])
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end">
          <Button type="submit">Submit</Button>
        </div>
        
      </form>
    </Form>
  );
}
