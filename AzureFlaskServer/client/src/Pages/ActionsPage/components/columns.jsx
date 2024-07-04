import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "./DataTableColumnHeader";
import { DataTableRowActions } from "./DataTableRowActions";

export const columns = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  
  {
    accessorKey: "action",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Action" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[100] truncate font-medium">
            {row.getValue("action")}
          </span>
        </div>
      );
    },
    enableHiding: false,
    enableSorting: false
  },
  {
    accessorKey: "description",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Description" />
    ),
    cell: ({ row }) => <div className="min-w-[300px] truncate">
      {row.getValue("description")}
    </div>,
    enableSorting: false,
  },
  {
    accessorKey: "action_type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    cell: ({ row }) => {
      return (
        <Badge variant="outline">{row.getValue("action_type")}</Badge>
      ); 
    },
    // filterFn: (row, id, value) => {
    //   return value.includes(row.getValue(id));
    // },
  },
  { 
    accessorKey: "database",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Database" />
    ),
    cell: ({ row }) => {


      return <div className="w-[150px] font-medium">{row.getValue("database")}</div>

      
    },
    // filterFn: (row, id, value) => {
    //   return value.includes(row.getValue(id));
    // },
  },

];