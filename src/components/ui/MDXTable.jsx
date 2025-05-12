import React, { useState } from "react";

export const TBComponent = ({ children }) => {
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  // Convert children to plain text content
  const extractTextContent = (node) => {
    if (typeof node === 'string') return node;
    if (Array.isArray(node)) return node.map(extractTextContent).join('');
    if (node?.props?.children) return extractTextContent(node.props.children);
    return '';
  };

  const content = extractTextContent(children);
  const lines = content.trim().split('\n').filter(line => line.trim());

  if (lines.length < 3) {
    return (
      <div className="text-red-500 dark:text-red-400 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
        Invalid table format - needs header, divider, and at least one row
      </div>
    );
  }

  const headers = lines[0].split('|').map(h => h.trim()).filter(Boolean);
  let rows = lines.slice(2).map(row => 
    row.split('|').map(cell => cell.trim()).filter(Boolean)
  );

  // Mobile-friendly responsive design
  return (
    <div className="my-6">
      {/* Desktop/Large Tablet View (hidden on mobile) */}
      <div className="hidden sm:block overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              {headers.map((header, i) => (
                <th
                  key={i}
                  className={`px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 ${
                    i === 0 ? 'sticky left-0 z-10' : ''
                  }`}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
            {rows.map((row, i) => (
              <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                {row.map((cell, j) => (
                  <td
                    key={j}
                    className={`px-4 py-3 text-sm text-gray-700 dark:text-gray-300 ${
                      j === 0 ? 'sticky left-0 z-10 bg-white dark:bg-gray-900' : ''
                    }`}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile View (shown on small screens) */}
      <div className="sm:hidden space-y-3">
        {rows.map((row, i) => (
          <div key={i} className="border rounded-lg overflow-hidden shadow-sm bg-white dark:bg-gray-900">
            <div className="p-3 bg-gray-50 dark:bg-gray-800 font-medium">
              Row {i + 1}
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {row.map((cell, j) => (
                <div key={j} className="p-3">
                  <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {headers[j] || `Column ${j + 1}`}
                  </div>
                  <div className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                    {cell}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};