"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Database, Trash2 } from "lucide-react";

export default function History() {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = () => {
    setLoading(true);
    axios.get("http://localhost:8000/api/history?limit=100")
      .then(res => {
        setRecords(res.data.records);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const clearHistory = async () => {
    if (!confirm("Are you sure you want to delete all history?")) return;
    try {
      await axios.delete("http://localhost:8000/api/history");
      fetchHistory();
    } catch (e) {
      alert("Failed to clear history");
    }
  };

  return (
    <div className="w-full px-12 pt-32 pb-12">
      <div className="space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2 flex items-center gap-3">
              Detection Log <Database className="text-scarlet-500" />
            </h1>
            <p className="text-gray-400">A permanent log of all inference requests run through the engine.</p>
          </div>
          <button 
            onClick={clearHistory}
            className="flex items-center gap-2 px-4 py-2 bg-dark-800 border border-dark-600 hover:border-red-500/50 hover:text-red-400 rounded-lg transition"
          >
            <Trash2 size={18} /> Clear Log
          </button>
        </div>

        <div className="bg-dark-800 rounded-2xl border border-dark-600 overflow-hidden shadow-xl">
          {loading ? (
            <div className="p-12 text-center text-gray-500">Loading records...</div>
          ) : records.length === 0 ? (
            <div className="p-12 text-center text-gray-500">No history found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-dark-900/50 border-b border-dark-600 text-gray-400">
                  <tr>
                    <th className="px-6 py-4 font-medium">Timestamp</th>
                    <th className="px-6 py-4 font-medium">Filename</th>
                    <th className="px-6 py-4 font-medium text-center">Fire</th>
                    <th className="px-6 py-4 font-medium text-center">Smoke</th>
                    <th className="px-6 py-4 font-medium text-center">Confidence</th>
                    <th className="px-6 py-4 font-medium text-center">Risk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-700/50">
                  {records.map((record, i) => (
                    <tr key={i} className="hover:bg-dark-700/30 transition">
                      <td className="px-6 py-4 text-gray-300 font-mono text-xs">
                        {new Date(record.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-gray-200 font-medium truncate max-w-[200px]" title={record.filename}>
                        {record.filename}
                      </td>
                      <td className="px-6 py-4 text-center text-orange-400 font-medium">
                        {record.fire_count}
                      </td>
                      <td className="px-6 py-4 text-center text-gray-400 font-medium">
                        {record.smoke_count}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="bg-dark-900 px-2 py-1 rounded border border-dark-600 text-scarlet-400">
                          {record.max_confidence.toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          record.risk_level === 'CRITICAL' ? 'bg-red-500/20 text-red-400' :
                          record.risk_level === 'HIGH' ? 'bg-orange-500/20 text-orange-400' :
                          record.risk_level === 'MODERATE' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>
                          {record.risk_level}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
