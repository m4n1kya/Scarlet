"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { Activity } from "lucide-react";

export default function Analytics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("http://localhost:8000/api/analytics")
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load analytics", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="animate-pulse flex gap-4"><div className="w-8 h-8 rounded-full bg-dark-700" /> Loading Analytics...</div>;
  }

  if (!data) return <div>Failed to load analytics. Is the backend running?</div>;

  const COLORS = {
    LOW: "#22c55e",
    MODERATE: "#eab308",
    HIGH: "#f97316",
    CRITICAL: "#ef4444"
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight mb-2 flex items-center gap-3">
          Analytics Overview <Activity className="text-scarlet-500" />
        </h1>
        <p className="text-gray-400">Deep dive into historical detection trends and risk profiles.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-dark-800 p-6 rounded-2xl border border-dark-600">
          <p className="text-gray-400 text-sm font-medium">Total Analyses</p>
          <p className="text-3xl font-bold mt-2">{data.stats.total_analyses}</p>
        </div>
        <div className="bg-dark-800 p-6 rounded-2xl border border-dark-600">
          <p className="text-gray-400 text-sm font-medium">Total Fire Detections</p>
          <p className="text-3xl font-bold text-orange-500 mt-2">{data.stats.total_fire}</p>
        </div>
        <div className="bg-dark-800 p-6 rounded-2xl border border-dark-600">
          <p className="text-gray-400 text-sm font-medium">Total Smoke Detections</p>
          <p className="text-3xl font-bold text-gray-300 mt-2">{data.stats.total_smoke}</p>
        </div>
        <div className="bg-dark-800 p-6 rounded-2xl border border-dark-600">
          <p className="text-gray-400 text-sm font-medium">Avg Confidence</p>
          <p className="text-3xl font-bold text-scarlet-500 mt-2">{data.stats.avg_confidence.toFixed(2)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-dark-800 p-6 rounded-2xl border border-dark-600 h-96 flex flex-col">
          <h3 className="font-semibold mb-6">Detection Timeline</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.timeline}>
                <XAxis dataKey="date" stroke="#666" fontSize={12} />
                <YAxis stroke="#666" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#141414', borderColor: '#333' }} />
                <Line type="monotone" dataKey="fire" stroke="#f97316" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="smoke" stroke="#94a3b8" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-dark-800 p-6 rounded-2xl border border-dark-600 h-96 flex flex-col">
          <h3 className="font-semibold mb-6">Risk Distribution</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.risk_distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.risk_distribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#141414', borderColor: '#333' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
