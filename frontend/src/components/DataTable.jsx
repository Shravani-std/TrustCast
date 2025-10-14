import React from 'react';

const DataTable = ({ rows }) => (
  <div className="overflow-x-auto mt-4 bg-white shadow-lg rounded-xl p-4">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          {rows.length > 0 && Object.keys(rows[0]).map((key) => (
            <th key={key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{key}</th>
          ))}
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {rows.map((row, idx) => (
          <tr key={idx}>
            {Object.values(row).map((val, i) => <td key={i} className="px-6 py-4 whitespace-nowrap">{val}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default DataTable;
