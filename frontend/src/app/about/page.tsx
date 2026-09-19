export default function About() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl space-y-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            About SCARLET
          </h1>
          <p className="text-gray-400">AI-Powered Wildfire Detection & Monitoring Platform</p>
        </div>

        <div className="prose prose-invert max-w-none">
          <p className="text-lg leading-relaxed text-gray-300">
            SCARLET is an AI-powered computer vision platform designed for detecting fire and smoke in real-time. It leverages a custom-trained YOLOv8 architecture to provide high-speed inference, coupled with a robust risk assessment heuristic engine.
          </p>

          <div className="bg-dark-800 border border-dark-600 rounded-2xl p-6 my-8">
            <h3 className="text-xl font-semibold mb-4 text-white">Technology Stack</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <strong className="block text-scarlet-500">Frontend</strong>
                <span className="text-gray-400">Next.js, React, TailwindCSS, Framer Motion</span>
              </div>
              <div>
                <strong className="block text-scarlet-500">Backend API</strong>
                <span className="text-gray-400">FastAPI, Python</span>
              </div>
              <div>
                <strong className="block text-scarlet-500">ML Engine</strong>
                <span className="text-gray-400">PyTorch, Ultralytics YOLOv8</span>
              </div>
              <div>
                <strong className="block text-scarlet-500">Storage</strong>
                <span className="text-gray-400">SQLite (Local)</span>
              </div>
            </div>
          </div>

          <h3 className="text-xl font-semibold mb-4 text-white">Attribution & Licenses</h3>
          <ul className="space-y-2 text-gray-400">
            <li><strong>Application Code:</strong> MIT License</li>
            <li><strong>YOLOv8 Engine:</strong> Ultralytics AGPL-3.0</li>
            <li><strong>Dataset:</strong> Roboflow fire-wrpgm v8 (CC BY 4.0)</li>
          </ul>
          
          <div className="mt-12 pt-8 border-t border-dark-700 text-sm text-gray-500">
            Developed by Manikya N. (m4n1kya)
          </div>
        </div>
      </div>
    </div>
  );
}
