import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axiosInstance from "../../../../axios.config";
import DeleteIcon from "@mui/icons-material/Delete";
import { useActions } from "@/hooks/useActions";

const ActionForm = ({ closeModal }) => {
  const { setActions } = useActions();
  const [page, setPage] = useState(1);

  const query_inputs_Schema = z.object({
    value: z.string().min(1, { message: "Input Query cannot be empty" }),
  });

  const query_outputs_Schema = z.object({
    value: z.string().min(1, { message: "Output Query cannot be empty" }),
  });

  const auth_key_pair_Schema = z.object({
    key: z.string().min(1, { message: "Key cannot be empty" }),
    value: z.string().min(1, { message: "Value cannot be empty" }),
  });

  const schema = z
    .object({
      action_name: z.string().min(1, { message: "Action Name is required" }),
      action_type: z.string().min(1, { message: "Action Type is required" }),
      description: z
        .string()
        .min(1, { message: "Action Description is required" }),
      api_endpoint: z.string().optional(),
      api_service: z.string().optional(),
      query_inputs: z
        .array(query_inputs_Schema)
        .refine((arr) => arr.length > 0, {
          message: "At least one Query Input is required",
        }),
      query_outputs: z.array(query_outputs_Schema),
      auth: z.array(auth_key_pair_Schema).optional(),
    })
    .refine(
      (data) => {
        if (data.action_type === "API" && !data.api_endpoint) {
          return false;
        }
        return true;
      },
      {
        message: "API endpoint is required when action type is API",
        path: ["api_endpoint"],
      }
    )
    .refine(
      (data) => {
        if (data.action_type === "API" && !data.api_service) {
          return false;
        }
        return true;
      },
      {
        message: "API service is required when action type is API",
        path: ["api_service"],
      }
    );
  // .refine(
  //   (data) => {
  //     if (data.auth) {
  //       for (const item of data.auth) {
  //         if (!item.key || !item.value) {
  //           return false;
  //         }
  //       }
  //     }
  //     return true;
  //   },
  //   {
  //     message:
  //       "All authentication key-value pairs must have both key and value",
  //     path: ["auth"],
  //   }
  // );

  const form = useForm({
    defaultValues: {
      action_name: "",
      action_type: "",
      description: "",
      api_service: "",
      api_endpoint: "",
      query_inputs: [],
      query_outputs: [],
      auth: [],
    },
    resolver: zodResolver(schema),
  });

  const {
    register,
    watch,
    handleSubmit,
    setError,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = form;

  const onSubmit = (values) => {
    axiosInstance
      .post("/api/actions", JSON.stringify(values), {
        headers: { "Content-Type": "application/json" },
      })
      .then((res) => {
        const { data, status } = res;
        if (status === 200) {
          setActions(data);
          closeModal();
        }
      });
  };

  const {
    fields: query_inputs,
    append: append_inputs,
    remove: remove_inputs,
  } = useFieldArray({
    name: "query_inputs",
    control: form.control,
  });

  const {
    fields: query_outputs,
    append: append_outputs,
    remove: remove_outputs,
  } = useFieldArray({
    name: "query_outputs",
    control: form.control,
  });

  const {
    fields: auth,
    append: append_auth,
    remove: remove_keypair,
  } = useFieldArray({
    name: "auth",
    control: form.control,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {page === 1 ? (
          <div className="space-y-8">
            <FormField
              control={form.control}
              name="action_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Action Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an action type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="z-[999999]">
                      <SelectItem value="API">API</SelectItem>
                      <SelectItem value="Query">Query</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="action_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Action Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Action Name"
                      {...field}
                      value={watch("action_name")}
                    />
                  </FormControl>
                  <FormDescription>
                    This action name will be displayed to others in the future
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {watch("action_type") === "API" && (
              <FormField
                className="my-3"
                control={form.control}
                name="api_service"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Action Service</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an action service" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="z-[999999]">
                        <SelectItem value="Gmail">Gmail</SelectItem>
                        <SelectItem value="Jira">Jira</SelectItem>
                        <SelectItem value="Custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <Button type="button" onClick={() => setPage(2)}>
              Next
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            <FormField
              control={form.control}
              name="action_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Action Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Action Name"
                      {...field}
                      value={watch("action_name")}
                    />
                  </FormControl>
                  <FormDescription>
                    This action name will be displayed to others in the future
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {watch("action_type") == "API" && (
              <FormField
                control={form.control}
                name="api_endpoint"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>API Endpoint</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="API Endpoint"
                        {...field}
                        value={watch("api_endpoint")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Action Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Action Description"
                      className="resize-none"
                      {...field}
                      value={watch("description")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* <hr/> */}
            <h1 className="font-bold text-lg">Inputs</h1>
            {query_inputs.map((field, index) => (
              <FormField
                control={form.control}
                key={field.id}
                name={`query_inputs[${index}].value`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Input {index + 1}</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Input {...field} />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => remove_inputs(index)}
                        >
                          <DeleteIcon />
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => append_inputs("")}
            >
              Add Input
            </Button>

            <div className="space-y-8">
              <h1 className="font-bold text-lg">Outputs</h1>
              {query_outputs.map((field, index) => (
                <FormField
                  control={form.control}
                  key={field.id}
                  name={`query_outputs[${index}].value`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Output {index + 1}</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <Input {...field} />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              remove_outputs(index);
                            }}
                          >
                            <DeleteIcon />
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => append_outputs("")}
              >
                Add Output
              </Button>
            </div>
            <div className="space-y-8">
              <h1 className="font-bold text-lg">Authentication key-pairs</h1>
              {auth.map((field, index) => (
                <div className="flex items-end">
                  <div className="me-5">
                    <FormField
                      className="me-5"
                      control={form.control}
                      key={field.id}
                      name={`auth.${index}.key`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Key {index + 1}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="me-5">
                    <FormField
                      control={form.control}
                      key={field.id}
                      name={`auth.${index}.value`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Value {index + 1}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mb-1"
                    onClick={() => {
                      remove_keypair(index);
                    }}
                  >
                    <DeleteIcon />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => append_auth("")}
              >
                Add Auth Key-Pair
              </Button>
            </div>
            <div className="flex justify-between">
              <Button type="button" onClick={() => setPage(1)}>
                Back
              </Button>
              <Button type="submit">Submit</Button>
            </div>
          </div>
        )}
      </form>
    </Form>
  );
};

export default ActionForm;
