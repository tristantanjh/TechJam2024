import React from "react";
import { useState } from "react";
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
} from "@mui/material";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const schemaStep1 = z
  .object({
    actionType: z.string().nonempty("Action Type is required"),
    action_name: z.string().optional(),
    action_api_name: z.string().optional(),
  })
  .refine((data) => data.actionType !== "query" || !!data.action_name, {
    message: "Action Name is required when 'Query' is selected.",
    path: ["action_name"],
  })
  .refine((data) => data.actionType !== "api" || !!data.action_api_name, {
    message: "Action API Name is required when 'API' is selected.",
    path: ["action_api_name"],
  })
  .refine((data) => data.actionType !== "api" || !!data.action_name, {
    message: "Action Name is required when 'API' is selected.",
    path: ["action_name"],
  });

const schemaStep2 = z.object({
  copilot_action_name: z.string().nonempty("Action Name is required"),
  description: z.string().nonempty("Action Description is required"),
  input_account_id: z.string().nonempty("Input Account ID is required"),
  input_description: z.string().nonempty("Input Description is required"),
  output_products: z.string().nonempty("Output Products are required"),
  output_description: z.string().nonempty("Output Description is required"),
});

const ActionForm = ({ onClose }) => {
  const [formData, setFormData] = useState({});
  const [currentForm, setCurrentForm] = useState(1);

  const schema = currentForm === 1 ? schemaStep1 : schemaStep2;

  const {
    register,
    watch,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      actionType: "",
      action_name: "",
      action_api_name: "",
      copilot_action_name: "",
      description: "",
      input_account_id: "",
      input_description: "",
      output_products: "",
      output_description: "",
    },
    resolver: zodResolver(schema),
  });

  const actionType = watch("actionType");

  const handleCloseForm = () => {
    setCurrentForm(1);
    onClose();
  };

  const handleBack = () => {
    setCurrentForm(1);
  };

  const onSubmit = async (data) => {
    if (currentForm == 1) {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate backend call'
        console.log(data);
        setFormData(data);
        setCurrentForm(2);
      } catch (error) {
        setError("root", {
          message: "An unexpected error occurred",
        });
      }
    } else {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate backend call
        // Combine form data from both steps and send to backend
        console.log({ ...formData, ...data });
        // Handle combined data
        handleCloseForm();
      } catch (error) {
        setError("root", {
          message: "An unexpected error occurred",
        });
      }
    }
  };

  return (
    <Box
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
              defaultValue=""
              {...register("actionType")}
            >
              <MenuItem value="api">API</MenuItem>
              <MenuItem value="query">Query</MenuItem>
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
          {actionType === "api" && (
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
          )}

          <TextField
            {...register("action_name")}
            label="Action Name"
            variant="outlined"
            fullWidth
            margin="normal"
            error={!!errors.action_name}
            helperText={errors.action_name?.message}
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
            {...register("copilot_action_name")}
            label="Action Name"
            variant="outlined"
            fullWidth
            margin="normal"
            defaultValue={formData.action_name || ""}
            error={!!errors.copilot_action_name}
            helperText={errors.copilot_action_name?.message}
          />
          <TextField
            {...register("description")}
            label="Action Description"
            multiline
            rows={4}
            variant="outlined"
            sx={{ mb: 2 }}
            fullWidth
            margin="normal"
            defaultValue=""
            error={!!errors.description}
            helperText={errors.description?.message}
          />
          <Typography
            variant="h8"
            gutterBottom
            fontWeight="medium"
            sx={{ mt: 4 }}
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
          />
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

      <Box display="flex" justifyContent="space-between" mt={2}>
        {currentForm === 2 ? (
          <Button
            onClick={handleBack}
            sx={{ color: "grey", borderColor: "darkgrey" }}
            size="small"
            variant="outlined"
          >
            Back
          </Button>
        ) : (
          <Button
            onClick={handleCloseForm}
            sx={{ color: "grey", borderColor: "darkgrey" }}
            size="small"
            variant="outlined"
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={isSubmitting}
          size="small"
        >
          {currentForm == 1 ? "Next" : "Finish"}
        </Button>
      </Box>
    </Box>
  );
};

export default ActionForm;
