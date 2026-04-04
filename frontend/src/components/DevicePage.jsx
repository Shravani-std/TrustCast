// import { useNavigate } from "react-router-dom";

// const devices = [
//   { id: "D-001", ip: "192.168.1.10", status: "Healthy", trust: 92, lastSeen: "2m ago" },
//   { id: "D-002", ip: "192.168.1.11", status: "Low Trust", trust: 61, lastSeen: "5m ago" },
//   { id: "D-003", ip: "192.168.1.12", status: "Healthy", trust: 88, lastSeen: "1m ago" },
//   { id: "D-004", ip: "192.168.1.13", status: "Anomaly", trust: 28, lastSeen: "Just now" },
//   { id: "D-005", ip: "192.168.1.14", status: "Healthy", trust: 95, lastSeen: "12m ago" },
// ];

// export default function DevicesPage() {
//   const navigate = useNavigate();

//   const statusColor = (status) => {
//     if (status === "Healthy") return "bg-green-100 text-green-700";
//     if (status === "Low Trust") return "bg-yellow-100 text-yellow-700";
//     return "bg-red-100 text-red-700";
//   };

//   const trustColor = (trust) => {
//     if (trust > 80) return "bg-green-500";
//     if (trust > 50) return "bg-yellow-500";
//     return "bg-red-500";
//   };

//   return (
//     <div className="bg-white dark:bg-slate-900 rounded-2xl shadow p-6">
      
//       <h2 className="text-xl font-semibold mb-6 text-slate-900 dark:text-white">
//         Devices Inventory
//       </h2>

//       <table className="w-full text-left text-sm">
//         <thead className="border-b border-slate-200 dark:border-slate-700 text-xs uppercase text-slate-500">
//           <tr>
//             <th className="py-3">Device ID</th>
//             <th>Ip</th>
//             <th>Status</th>
//             <th>Trust Score</th>
//             <th>Last Seen</th>
//             <th></th>
//           </tr>
//         </thead>

//         <tbody>
//           {devices.map((device) => (
//             <tr
//               key={device.id}
//               onClick={() => navigate(`/device-details/${device.ip}`)}
//               className="cursor-pointer border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
//             >
//               <td className="py-4 font-medium text-slate-700 dark:text-slate-300">
//                 {device.id}
//               </td>

//               <td>
//                 <span
//                   className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor(
//                     device.ip
//                   )}`}
//                 >
//                   {device.ip}
//                 </span>
//               </td>
//               <td>
//                 <span
//                   className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor(
//                     device.status
//                   )}`}
//                 >
//                   {device.status}
//                 </span>
//               </td>

//               <td>
//                 <div className="flex items-center gap-3">
//                   <div className="w-32 bg-slate-200 rounded-full h-2">
//                     <div
//                       className={`${trustColor(
//                         device.trust
//                       )} h-2 rounded-full`}
//                       style={{ width: `${device.trust}%` }}
//                     ></div>
//                   </div>
//                   <span className="text-xs font-semibold">
//                     {device.trust}%
//                   </span>
//                 </div>
//               </td>

//               <td className="text-slate-500">{device.lastSeen}</td>

//               <td>
//                 <button
//                   className="text-xs px-3 py-1 border rounded-lg hover:bg-slate-100"
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     navigate(`/device-details/${device.ip}`);
//                   }}
//                 >
//                   View
//                 </button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>

//     </div>
//   );
// }
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { api } from "../lib/apiClient";

export default function DevicesPage() {
  const navigate = useNavigate();
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    api
      .get("/api/devices")
      .then((res) => setDevices(res.data))
      .catch((err) => console.error(err));
  }, []);

  const statusColor = (status) => {
    if (status === "Healthy") return "bg-green-100 text-green-700";
    if (status === "Low Trust") return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  const trustColor = (trust) => {
    if (trust > 80) return "bg-green-500";
    if (trust > 50) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow p-6">
      <h2 className="text-xl font-semibold mb-6 text-slate-900 dark:text-white">
        Devices Inventory
      </h2>

      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-200 dark:border-slate-700 text-xs uppercase text-slate-500">
          <tr>
            <th className="py-3">Device ID</th>
            <th>IP Address</th>
            <th>Status</th>
            <th>Trust Score</th>
            <th>Last Seen</th>
          </tr>
        </thead>

        <tbody>
          {devices.map((device) => (
            <tr
  key={device.id}
  onClick={() => navigate(`/device-details/${device.ip}`)}
  className="cursor-pointer border-b border-slate-700 hover:bg-slate-800 transition-colors"
>
              <td className="py-4">{device.id}</td>

              <td>{device.ip}</td>

              <td>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor(device.status)}`}>
                  {device.status}
                </span>
              </td>

              <td>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-slate-200 rounded-full h-2">
                    <div
                      className={`${trustColor(device.trust)} h-2 rounded-full`}
                      style={{ width: `${device.trust}%` }}
                    ></div>
                  </div>
                  <span>{device.trust}%</span>
                </div>
              </td>

              <td>{device.lastSeen}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}