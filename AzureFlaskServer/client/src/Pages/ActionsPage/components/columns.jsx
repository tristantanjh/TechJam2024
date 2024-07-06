import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "./DataTableColumnHeader";
import { DataTableRowActions } from "./DataTableRowActions";

export const columns = [
  // {
  //   id: "select",
  //   header: ({ table }) => (
  //     <Checkbox
  //       checked={
  //         table.getIsAllPageRowsSelected() ||
  //         (table.getIsSomePageRowsSelected() && "indeterminate")
  //       }
  //       onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
  //       aria-label="Select all"
  //       className="translate-y-[2px]"
  //     />
  //   ),
  //   cell: ({ row }) => (
  //     <Checkbox
  //       checked={row.getIsSelected()}
  //       onCheckedChange={(value) => row.toggleSelected(!!value)}
  //       aria-label="Select row"
  //       className="translate-y-[2px]"
  //     />
  //   ),
  //   enableSorting: false,
  //   enableHiding: false,
  // },

  {
    accessorKey: "action_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Action" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[100] truncate font-medium">
            {row.getValue("action_name")}
          </span>
        </div>
      );
    },
    enableHiding: false,
    enableSorting: true,
  },
  {
    accessorKey: "description",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Description" />
    ),
    cell: ({ row }) => (
      <div className="min-w-[300px] truncate">
        {row.getValue("description")}
      </div>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "actionType",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    cell: ({ row }) => {
      return <Badge variant="outline">{row.getValue("actionType")}</Badge>;
    },
    filterFn: (row, id, value) => {
      return value.includes(row.original.actionType);
    },
  },

  {
    accessorKey: "database",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Database" />
    ),
    cell: ({ row }) => {
      return (
        <div className="w-[150px] font-medium">{row.getValue("database")}</div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.original.database);
    },
  },
  {
    accessorKey: "action_api_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="API Name" />
    ),
    cell: ({ row }) => (
      <div className="min-w-[150px] truncate">
        {row.getValue("action_api_name") === ""
          ? "-"
          : row.getValue("action_api_name")}
      </div>
    ),
    enableSorting: true,
  },
  {
    accessorKey: "query_inputs",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Query Inputs" />
    ),
    cell: ({ row }) => {
      const queryInputs = row.getValue("query_inputs") || [];
      return (
        <div style={{ padding: "10px", minWidth: "200px" }}>
          {queryInputs.length > 0 ? (
            queryInputs.map((input, index) => (
              <div key={index}>
                <span>{input}</span>
              </div>
            ))
          ) : (
            <span>-</span>
          )}
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "api_key_values",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="API Key Values" />
    ),
    cell: ({ row }) => {
      const apiKeyValues = row.getValue("api_key_values") || [];
      return (
        <div style={{ padding: "10px", minWidth: "100px" }}>
          {apiKeyValues.length > 0 ? (
            apiKeyValues.map((kv, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "5px",
                }}
              >
                <strong style={{ marginRight: "5px" }}>{kv.key}:</strong>{" "}
                <span>{kv.value}</span>
                {index < apiKeyValues.length - 1 && <hr />}
              </div>
            ))
          ) : (
            <span>-</span>
          )}
        </div>
      );
    },
    enableSorting: false,
  },
];
