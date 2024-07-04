"use client";

import { Cross2Icon } from "@radix-ui/react-icons";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "./DataTableViewOptions";
import ActionForm from "./ActionForm";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";
// import { priorities, statuses } from "../data/data";
import CloseIcon from "@mui/icons-material/Close";
import { DataTableFacetedFilter } from "./DataTableFacetedFilter";

export function DataTableToolbar({ table }) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Filter tasks..."
          value={table.getColumn("title")?.getFilterValue() ?? ""}
          onChange={(event) =>
            table.getColumn("title")?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {/* {table.getColumn("status") && (
          <DataTableFacetedFilter
            column={table.getColumn("status")}
            title="Status"
            options={statuses}
          />
        )}
        {table.getColumn("priority") && (
          <DataTableFacetedFilter
            column={table.getColumn("priority")}
            title="Priority"
            options={priorities}
          />
        )} */}
        {isFiltered && (
          <Button
            variant="outline"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <div>
        <Button
          size="sm"
          className="ml-auto hidden h-8 lg:flex mx-2 px-1 py-1"
          onClick={handleOpen}
        >
          Add Action
        </Button>
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
          <DialogTitle>
            <Typography
              variant="h6"
              align="center"
              component="div"
              fontWeight="Bold"
            >
              Create an Action
            </Typography>
          </DialogTitle>
          <DialogContent>
            <ActionForm onClose={handleClose} />
          </DialogContent>
        </Dialog>
      </div>
      <DataTableViewOptions table={table} />
    </div>
  );
}
