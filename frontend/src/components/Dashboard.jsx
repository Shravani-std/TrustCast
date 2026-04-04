import React from "react";
import DashboardCard from "./DashboardCard";

const Dashboard = () => {
  return (
    <div className="p-8">
      <h1 className="text-white text-2xl mb-6">Dashboard Content</h1>
{/* 
      <DashboardCard
        title="Network Security Monitoring"
        description="Real-time monitoring of network traffic and device trust scores."
      /> */}

      {/* Power BI Dashboard */}
      <div className="mt-8">
        <h2 className="text-white text-xl mb-4">Power BI Report</h2>

        <iframe
          title="final_dashboard"
          width="100%"
          height="500"
          src="https://app.powerbi.com/view?r=eyJrIjoiZTBlM2M4ZDctNzNlYS00OTU1LWFmYzEtZjQxOTJkMGY4ZjVjIiwidCI6IjgxYTUwYmRlLWNjMjAtNDVjNC05NTljLTJkYWQ2NGVjZDg1OSJ9"
          frameBorder="0"
          allowFullScreen={true}
          className="rounded-xl shadow-lg"
        ></iframe>
      </div>
    </div>
  );
};

export default Dashboard;