/**
 * Table Block
 * Data table display
 */

import type { BlockComponentProps } from "@otl-core/cms-types";

interface TableData {
  headers: string[];
  rows: string[][];
}

interface TableConfig {
  data?: TableData;
}

export function TableBlock({ config }: BlockComponentProps<TableConfig>) {
  const { data } = config;

  if (!data || !data.headers || !data.rows) {
    return null;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-border">
        <thead className="bg-muted">
          <tr>
            {data.headers.map((header, index) => (
              <th
                key={index}
                className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-surface divide-y divide-border">
          {data.rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className="px-6 py-4 whitespace-nowrap text-sm text-foreground"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
