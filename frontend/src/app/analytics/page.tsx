import { useEffect, useState } from "react";
import axios from "axios";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  AreaChart, Area, PieChart, Pie, Cell, 
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ComposedChart, Line, CartesianGrid, Legend
} from "recharts";
import { Activity } from "lucide-react";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-black/80 backdrop-blur-md border border-gray-800 p-3 rounded-lg shadow-2xl">
        <p className="text-gray-400 text-xs font-bold mb-2 uppercase tracking-wider">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={`item-${index}`} style={{ color: entry.color }} className="text-sm font-semibold">
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

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
    return <div className="animate-pulse flex items-center justify-center min-h-screen"><div className="w-8 h-8 border-2 border-t-scarlet-500 rounded-full animate-spin" /></div>;
  }

  if (!data) return <div className="flex items-center justify-center min-h-screen text-gray-500">Failed to load analytics. Is the backend running?</div>;

  const COLORS = {
    LOW: "#22c55e",
    MODERATE: "#eab308",
    HIGH: "#f97316",
    CRITICAL: "#ef4444"
  };

  return (
    <div className="w-full px-12 pt-32 pb-12">
      <div className="space-y-12">
        <div>
          <h1 className="text-4xl font-bold tracking-[0.2em] uppercase mb-2 flex items-center gap-3 text-gray-300">
            Analytics Overview <Activity className="text-scarlet-600" />
          </h1>
          <p className="text-gray-500 text-sm tracking-wide font-medium">Deep dive into historical detection trends and risk profiles.</p>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { label: "Total Analyses", value: data.stats.total_analyses, color: "text-gray-200" },
            { label: "Fire Detections", value: data.stats.total_fire, color: "text-scarlet-500" },
            { label: "Smoke Detections", value: data.stats.total_smoke, color: "text-gray-400" },
            { label: "Avg Confidence", value: data.stats.avg_confidence.toFixed(2), color: "text-[#25d8fb]" }
          ].map((stat, i) => (
            <div key={i} className="bg-white/[0.02] backdrop-blur-sm p-6 rounded-2xl border border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all hover:bg-white/[0.04]">
              <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">{stat.label}</p>
              <p className={`text-4xl font-black mt-3 ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Main Charts Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Detection Timeline (Area Chart) */}
          <div className="xl:col-span-2 bg-white/[0.02] backdrop-blur-sm p-8 rounded-3xl border border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.4)] flex flex-col h-[450px]">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-8">Detection Volume Timeline</h3>
            <div className="flex-1 min-h-0 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorFire" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#DC143C" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#DC143C" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorSmoke" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis dataKey="date" stroke="#666" fontSize={11} tickMargin={10} axisLine={false} tickLine={false} />
                  <YAxis stroke="#666" fontSize={11} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} iconType="circle" />
                  <Area type="monotone" dataKey="fire" stroke="#DC143C" strokeWidth={3} fillOpacity={1} fill="url(#colorFire)" name="Fire Signatures" />
                  <Area type="monotone" dataKey="smoke" stroke="#94a3b8" strokeWidth={3} fillOpacity={1} fill="url(#colorSmoke)" name="Smoke Signatures" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Risk Distribution (Donut Chart) */}
          <div className="bg-white/[0.02] backdrop-blur-sm p-8 rounded-3xl border border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.4)] flex flex-col h-[450px]">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-8">Risk Profile Distribution</h3>
            <div className="flex-1 min-h-0 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.risk_distribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {data.risk_distribution.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '11px', marginTop: '20px' }} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <p className="text-3xl font-black text-gray-300">{data.stats.total_analyses}</p>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mt-1">Total</p>
                </div>
              </div>
            </div>
          </div>

          {/* Activity vs Confidence (Composed Chart) */}
          <div className="xl:col-span-2 bg-white/[0.02] backdrop-blur-sm p-8 rounded-3xl border border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.4)] flex flex-col h-[450px]">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-8">Activity vs Confidence Correlation</h3>
            <div className="flex-1 min-h-0 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data.timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="#333" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" stroke="#666" fontSize={11} tickMargin={10} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" stroke="#666" fontSize={11} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" stroke="#25d8fb" fontSize={11} axisLine={false} tickLine={false} domain={[0, 1]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} iconType="circle" />
                  <Bar yAxisId="left" dataKey="detections" fill="#475569" radius={[4, 4, 0, 0]} barSize={20} name="Total Detections" />
                  <Line yAxisId="right" type="monotone" dataKey="avg_confidence" stroke="#25d8fb" strokeWidth={3} dot={{ r: 4, fill: "#0a0a0a", strokeWidth: 2 }} name="Avg Confidence" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Class Distribution (Radar Chart) */}
          <div className="bg-white/[0.02] backdrop-blur-sm p-8 rounded-3xl border border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.4)] flex flex-col h-[450px]">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-8">Class Detection Balance</h3>
            <div className="flex-1 min-h-0 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data.radar_metrics}>
                  <PolarGrid stroke="#333" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 11, fontWeight: 'bold' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                  <Radar name="Class Detections" dataKey="A" stroke="#DC143C" strokeWidth={2} fill="#DC143C" fillOpacity={0.3} />
                  <Tooltip content={<CustomTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
