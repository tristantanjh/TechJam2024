import React from "react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  TextField,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Box,
  Typography,
  Divider,
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axiosInstance from "../../../../axios.config";
import KeyValueFields from "./KeyValueFields";

// const schemaStep1 = z
//   .object({
//     actionType: z.string().nonempty("Action Type is required"),
//     copilot_action_name: z.string().optional(),
//     action_api_name: z.string().optional(),
//   })
//   .refine((data) => data.actionType !== "Query" || !!data.copilot_action_name, {
//     message: "Action Name is required when 'Query' is selected.",
//     path: ["action_name"],
//   })
//   .refine((data) => data.actionType !== "API" || !!data.action_api_name, {
//     message: "Action API Name is required when 'API' is selected.",
//     path: ["action_api_name"],
//   })
//   .refine((data) => data.actionType !== "API" || !!data.copilot_action_name, {
//     message: "Action Name is required when 'API' is selected.",
//     path: ["action_name"],
//   });

// const baseSchemaStep2 = z.object({
//   action_name: z.string().nonempty("Action Name is required"),
//   description: z.string().nonempty("Action Description is required"),
//   //input_account_id: z.string().nonempty("Input Account ID is required"),
//   //input_description: z.string().nonempty("Input Description is required"),
//   output_products: z.string().nonempty("Output Products are required"),
//   output_description: z.string().nonempty("Output Description is required"),
// });

const ActionForm = ({ onClose }) => {
  const [formData, setFormData] = useState({});
  const [currentForm, setCurrentForm] = useState(1);
  const [queryInputs, setQueryInputs] = useState([""]);
  const [keyValues, setKeyValues] = useState([{ key: "", value: "" }]);
  const schemaStep2 =
    formData.actionType === "API"
      ? baseSchemaStep2.extend({
          api_endpoint: z.string().nonempty("API Endpoint is required"),
          api_key_values: z.array(
            z.object({
              key: z.string().nonempty("Key is required"),
              value: z.string().nonempty("Value is required"),
            })
          ),
        })
      : baseSchemaStep2.extend({
          query_inputs: z.array(z.string().nonempty("Query Input is required")),
        });

  // formData.actionType === "Query";
  // const schema = currentForm === 1 ? schemaStep1 : schemaStep2;
  const schema = z.object({
    action_name: z.string().min(1, {message: "Action Name is required"}),
    action_type: z.string().min(1, {message: "Action Type is required"}),
    description: z.string().min(1, {message: "Action Description is required"}),
    api_endpoint: z.string().min(1, {message: "API endpoint is required"}),
    query_inputs: z.array(z.string().min(1, { message: "Input Query cannot be empty"})).min(1, { message: "At least one Query Input is required"}),
    query_outputs: z.array(z.string().min(1, { message: "Output Query cannot be empty"})).min(1, { message: "At least one Query Output is required"}),
  })

  const {
    register,
    watch,
    handleSubmit,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      action_name: "",
      action_type: "",
      description: "",
      api_endpoint: "",
      query_inputs: [],
      query_outputs: [],
    },
    resolver: zodResolver(schema),
  });

  const actionType = watch("action_type");

  const handleCloseForm = () => {
    setCurrentForm(1);
    onClose();
  };

  const handleBack = () => {
    setCurrentForm(1);
  };

  const appendKeyValue = () => {
    setKeyValues([...keyValues, { key: "", value: "" }]);
  };

  const removeKeyValue = (index) => {
    const newKeyValues = [...keyValues];
    newKeyValues.splice(index, 1);
    setKeyValues(newKeyValues);
  };

  const appendQueryInput = () => {
    setQueryInputs([...queryInputs, ""]);
  };

  const removeQueryInput = (index) => {
    const newQueryInputs = [...queryInputs];
    newQueryInputs.splice(index, 1);
    setQueryInputs(newQueryInputs);
  };

  useEffect(() => {
    setValue("actionType", formData.actionType || "");
  }, [formData.actionType, setValue]);

  useEffect(() => {
    if (formData.copilot_action_name) {
      setValue("action_name", formData.copilot_action_name);
    }
  }, [formData, setValue]);

  const onSubmit = async (data) => {

    try {
      // Combine form data from both steps and send to backend
      const completeData = { ...formData, ...data };
      // Remove copilot_action_name from completeData as it is duplicate
      delete completeData.copilot_action_name;
      // Send combined data to the backend
      console.log("Complete data", completeData);
      await axiosInstance.post("/api/save-action", completeData);
      console.log("Data saved successfully");
      handleCloseForm();
    } catch (error) {
      setError("root", {
        message: "An unexpected error occurred",
      });
    }

  };

  return <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{ mx: "auto", maxWidth: 500 }}
    >
      {currentForm == 1 && (
        <>
          <FormControl fullWidth margin="normal" error={!!errors.actionType}>
            <InputLabel id="action-type-label">Action Type</InputLabel>
            <Select
              labelId="action-type-label"
              label="Action Type"
              value={actionType}
              {...register("action_type")}
            >
              <MenuItem value="API">API</MenuItem>
              <MenuItem value="Query">Query</MenuItem>
            </Select>
            {errors.actionType && (
              <Box sx={{ color: "red" }}>{errors.actionType.message}</Box>
            )}
          </FormControl>

          {/* {actionType === "query" && (
            <TextField
              {...register("description")}
              label="Query Description"
              multiline
              rows={4}
              variant="outlined"
              fullWidth
              margin="normal"
              error={!!errors.description}
              helperText={errors.description?.message}
            />
          )} */}
          {/* {actionType === "API" && (
            <>
              <TextField
                {...register("action_api_name")}
                label="Action API Name"
                variant="outlined"
                fullWidth
                margin="normal"
                error={!!errors.action_api_name}
                helperText={errors.action_api_name?.message}
              />
            </>
          )} */}

          <TextField
            {...register("action_name")}
            label="Action Name"
            variant="outlined"
            fullWidth
            margin="normal"
            error={!!errors.copilot_action_name}
            helperText={errors.copilot_action_name?.message}
          />

          {errors.root && (
            <Box sx={{ color: "red", mt: 2 }}>{errors.root.message}</Box>
          )}
        </>
      )}
      {currentForm === 2 && (
        <>
          <Typography variant="h7" fontWeight="medium" gutterBottom>
            Configure Your Action
          </Typography>
          <Divider sx={{ mb: 1 }} />
          <TextField
            {...register("action_name")}
            label="Action Name"
            variant="outlined"
            fullWidth
            margin="normal"
            defaultValue={watch("action_name")}
            error={!!errors.action_name}
            helperText={errors.action_name?.message}
          />
          <TextField
            {...register("description")}
            label="Action Description"
            multiline
            rows={4}
            variant="outlined"
            fullWidth
            margin="normal"
            defaultValue=""
            error={!!errors.description}
            helperText={errors.description?.message}
            sx={{ mb: 1 }}
          />

          {watch("action_type") === "API" && (
            <>
              <TextField
                {...register("api_endpoint")}
                label="API Endpoint"
                variant="outlined"
                fullWidth
                margin="normal"
                sx={{ mb: 2 }}
                error={!!errors.api_endpoint}
                helperText={errors.api_endpoint?.message}
              />
              <Divider sx={{ mb: 2 }} />
              <KeyValueFields
                register={register}
                errors={errors}
                appendKeyValue={appendKeyValue}
                removeKeyValue={removeKeyValue}
                keyValues={keyValues}
              />
            </>
          )}

          <>
            <Divider sx={{ mb: 2, mt: 1 }} />
            <Typography
              variant="h7"
              fontWeight="medium"
              sx={{ mt: 2, mb: 2 }}
            >
              Query Inputs
            </Typography>
            {watch("query_inputs").map((input, index) => (
              <Box
                key={index}
                display="flex"
                alignItems="center"
                gap={2}
                mb={1}
                mt={2}
                width="100%"
              >
                <TextField
                  {...register(`query_inputs[${index}]`)}
                  label={`Input ${index + 1}`}
                  variant="outlined"
                  size="small"
                  error={!!errors.query_inputs?.[index]}
                  helperText={errors.query_inputs?.[index]?.message}
                  fullWidth
                  style={{ marginRight: "10px" }}
                />
                <IconButton
                  onClick={() => removeQueryInput(index)}
                  color="secondary"
                >
                  <DeleteIcon
                    sx={{
                      color: "#333",
                    }}
                  />
                </IconButton>
              </Box>
            ))}
            <Button
              onClick={appendQueryInput}
              startIcon={<AddIcon />}
              variant="text"
              sx={{
                color: "#333",
                fontSize: "0.875rem",
                padding: "4px 8px",
              }}
              size="small"
            >
              Add Input
            </Button>
          </>

          <Divider sx={{ mt: 1, mb: 2 }} />
          {/* <Typography
            variant="h8"
            gutterBottom
            fontWeight="medium"
            sx={{ mt: 5 }}
          >
            Input
          </Typography>
          <TextField
            {...register("input_account_id")}
            label="AccountID"
            variant="outlined"
            fullWidth
            margin="normal"
            sx={{ mt: 2 }}
            defaultValue=""
            error={!!errors.input_account_id}
            helperText={errors.input_account_id?.message}
          />
          <TextField
            {...register("input_description")}
            label="Description"
            multiline
            rows={4}
            variant="outlined"
            fullWidth
            sx={{ mt: 1, mb: 2 }}
            margin="normal"
            defaultValue=""
            error={!!errors.input_description}
            helperText={errors.input_description?.message}
          /> */}
          <Typography
            variant="h8"
            gutterBottom
            fontWeight="medium"
            sx={{ mt: 4 }}
          >
            Output
          </Typography>
          <TextField
            {...register("output_products")}
            label="Products"
            variant="outlined"
            fullWidth
            margin="normal"
            sx={{ mt: 2 }}
            defaultValue=""
            error={!!errors.output_products}
            helperText={errors.output_products?.message}
          />
          <TextField
            {...register("output_description")}
            label="Description"
            multiline
            sx={{ mt: 1 }}
            rows={4}
            variant="outlined"
            fullWidth
            margin="normal"
            defaultValue=""
            error={!!errors.output_description}
            helperText={errors.output_description?.message}
          />
        </>
      )}

      {currentForm === 1 ? <Box display="flex" justifyContent="space-between" mt={2}>
        <Button
          onClick={handleCloseForm}
          sx={{ color: "grey", borderColor: "darkgrey" }}
          size="small"
          variant="outlined"
        >
          Cancel
        </Button>
        <Button
          onClick={() => setCurrentForm(2)}
          sx={{ color: "black", borderColor: "darkgrey" }}
          size="small"
          variant="outlined"
        >
          Next
        </Button>
      </Box>
      : <Box display="flex" justifyContent="space-between" mt={2}>
        <Button
          onClick={() => setCurrentForm(1)}
          sx={{ color: "grey", borderColor: "darkgrey" }}
          size="small"
          variant="outlined"
        >
          Back
        </Button>
        <Button
          onClick={handleSubmit(onSubmit)}
          variant="contained"
          color="primary"
          disabled={isSubmitting}
          size="small"
        >
          Finish
        </Button>
      </Box>}
    </Box>
}

export default ActionForm;
