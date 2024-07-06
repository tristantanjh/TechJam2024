import React from "react";
import { TextField, Box, IconButton, Button, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

const KeyValueFields = ({
  register,
  errors,
  appendKeyValue,
  removeKeyValue,
  keyValues,
}) => {
  return (
    <Box>
      <Typography variant="h7" fontWeight="medium" sx={{ mt: 2, mb: 2 }}>
        Parameters
      </Typography>
      {keyValues.map((keyValue, index) => (
        <Box
          key={index}
          display="flex"
          alignItems="center"
          gap={2}
          mb={1}
          mt={1}
        >
          <TextField
            {...register(`api_key_values[${index}].key`)}
            label="Key"
            variant="outlined"
            size="small"
            error={!!errors.api_key_values?.[index]?.key}
            helperText={errors.api_key_values?.[index]?.key?.message}
            style={{ marginRight: "10px" }}
          />
          <TextField
            {...register(`api_key_values[${index}].value`)}
            label="Value"
            variant="outlined"
            size="small"
            error={!!errors.api_key_values?.[index]?.value}
            helperText={errors.api_key_values?.[index]?.value?.message}
            style={{ marginRight: "10px" }}
          />
          <IconButton onClick={() => removeKeyValue(index)} color="secondary">
            <DeleteIcon
              sx={{
                color: "#333",
              }}
            />
          </IconButton>
        </Box>
      ))}
      <Button
        onClick={appendKeyValue}
        startIcon={<AddIcon />}
        variant="text"
        sx={{
          color: "#333",
          fontSize: "0.875rem", // Smaller font size
          padding: "4px 8px", // Smaller padding
        }}
        size="small"
      >
        Add New Option
      </Button>
    </Box>
  );
};

export default KeyValueFields;
