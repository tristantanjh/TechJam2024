import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "./DataTableColumnHeader";
import { DataTableRowActions } from "./DataTableRowActions";
import { sortingFns } from "@tanstack/react-table";

export const db_columns = [
  {
    accessorKey: "database_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Database" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[100] truncate font-medium">
            {row.getValue("database_name")}
          </span>
        </div>
      );
    },
    enableHiding: false,
    enableSorting: true
  },
  {
    accessorKey: "database_description",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Description" />
    ),
    cell: ({ row }) => <div className="min-w-[300px] max-w-[1000px] truncate">
      {row.getValue("database_description")}
    </div>,
    enableSorting: false,
    enableHiding: true
  },
  {
    accessorKey: "date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date" />
    ),
    cell: ({ row }) => {
      return (
        <Badge variant="outline">{row.getValue("date")}</Badge>
      ); 
    },
    enableSorting: false,
    enableHiding: true,
    // sortingFn: "datetime"
  },
];