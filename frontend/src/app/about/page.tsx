export default function About() {
  return (
    <div className="w-full px-12 pt-32 pb-12 min-h-screen flex items-start justify-center">
      <div className="max-w-7xl w-full space-y-12">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold tracking-[0.2em] uppercase text-gray-300">
            About SCARLET
          </h1>
          <div className="h-px w-32 bg-gray-600" />
          <p className="text-gray-500 font-medium tracking-wide uppercase text-sm">
            AI-Powered Wildfire Detection & Monitoring Platform
          </p>
        </div>

        <div className="space-y-8 text-gray-400 leading-relaxed text-sm">
          <section className="space-y-4">
            <h2 className="text-xl font-bold tracking-widest text-gray-300 uppercase">Architecture Overview</h2>
            <p>
              SCARLET is an advanced computer vision telemetry system specifically engineered for the rapid detection of fire and smoke signatures in real-time video feeds. Built on a heavily optimized Ultralytics YOLOv8 architecture, the system provides high-speed, localized inference with minimal latency.
            </p>
            <p>
              The core inference engine is coupled with a robust deterministic risk assessment heuristic. This secondary processing layer evaluates the spatial distribution, confidence scores, and aggregate mass of detected signatures to automatically categorize environmental risk levels, filtering out false positives and ensuring high-fidelity alerting.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold tracking-widest text-gray-300 uppercase">Technical Stack</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="bg-black/40 border border-gray-800 p-6 flex flex-col gap-2 shadow-lg">
                <span className="text-gray-300 font-bold tracking-widest uppercase text-xs">Inference Layer</span>
                <span className="text-gray-500">Python, PyTorch, Ultralytics YOLOv8</span>
                <p className="text-xs mt-2 text-gray-600">Executing sub-100ms predictions on custom weights trained against robust environmental datasets.</p>
              </div>
              <div className="bg-black/40 border border-gray-800 p-6 flex flex-col gap-2 shadow-lg">
                <span className="text-gray-300 font-bold tracking-widest uppercase text-xs">API Gateway</span>
                <span className="text-gray-500">FastAPI</span>
                <p className="text-xs mt-2 text-gray-600">High-concurrency async REST interface handling telemetry ingestion and image processing queues.</p>
              </div>
              <div className="bg-black/40 border border-gray-800 p-6 flex flex-col gap-2 shadow-lg">
                <span className="text-gray-300 font-bold tracking-widest uppercase text-xs">Interface</span>
                <span className="text-gray-500">Next.js, React, Tailwind CSS</span>
                <p className="text-xs mt-2 text-gray-600">Hardware-accelerated WebGL telemetry visualizer with fully responsive control surfacing.</p>
              </div>
              <div className="bg-black/40 border border-gray-800 p-6 flex flex-col gap-2 shadow-lg">
                <span className="text-gray-300 font-bold tracking-widest uppercase text-xs">Persistence</span>
                <span className="text-gray-500">SQLite & File System</span>
                <p className="text-xs mt-2 text-gray-600">Localized robust logging for temporal analysis of historical detection metrics.</p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold tracking-widest text-gray-300 uppercase">Licenses & Attribution</h2>
            <div className="bg-gray-900/30 border border-gray-800 p-6 font-mono text-xs space-y-3 shadow-lg">
              <div className="flex justify-between border-b border-gray-800 pb-2">
                <span className="text-gray-500">System Source</span>
                <span className="text-gray-300">MIT License</span>
              </div>
              <div className="flex justify-between border-b border-gray-800 pb-2">
                <span className="text-gray-500">Ultralytics Engine</span>
                <span className="text-gray-300">AGPL-3.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Dataset (Roboflow)</span>
                <span className="text-gray-300">CC BY 4.0</span>
              </div>
            </div>
          </section>
          
          <div className="pt-12 border-t border-gray-800 flex justify-between items-center">
            <span className="text-xs font-bold tracking-widest text-gray-500 uppercase">Status: Operational</span>
            <span className="text-xs font-bold tracking-widest text-gray-600 uppercase">Developed by m4n1kya</span>
          </div>
        </div>
      </div>
    </div>
  );
}
