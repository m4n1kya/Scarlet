"use client";

import { useState, useRef } from "react";
import { Upload, Camera as CameraIcon, AlertTriangle, ShieldCheck, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import clsx from "clsx";

interface DetectionResult {
  fire_count: number;
  smoke_count: number;
  default_count: number;
  total_detections: number;
  max_confidence: number;
  avg_confidence: number;
  risk_level: string;
  risk_description: string;
  annotated_image_base64: string;
}

export default function Dashboard() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setResult(null);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(selectedFile);
  };

  const processImage = async () => {
    if (!file) return;
    
    setIsProcessing(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("confidence", "0.25");
    formData.append("iou", "0.45");

    try {
      const response = await axios.post("http://localhost:8000/api/detect/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(response.data);
    } catch (error) {
      console.error("Error processing image", error);
      alert("Failed to process image. Make sure the backend is running.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight mb-2 flex items-center gap-3">
          Detection Dashboard <Zap className="text-scarlet-500" />
        </h1>
        <p className="text-gray-400">Upload media to run SCARLET's YOLOv8 inference engine in real-time.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Area */}
        <div className="space-y-4">
          <div className="bg-dark-800 border border-dark-600 p-1 rounded-xl flex">
            <button className="flex-1 py-2 rounded-lg bg-dark-700 text-white font-medium shadow">Image Upload</button>
            <button className="flex-1 py-2 rounded-lg text-gray-400 font-medium hover:text-white transition cursor-not-allowed" disabled title="Coming soon">Webcam Stream</button>
          </div>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={clsx(
              "border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer relative overflow-hidden",
              isDragging ? "border-scarlet-500 bg-scarlet-500/10" : "border-dark-600 bg-dark-800 hover:border-gray-500 hover:bg-dark-700/50",
              preview ? "p-4" : ""
            )}
            onClick={() => !preview && document.getElementById('file-upload')?.click()}
          >
            <input
              id="file-upload"
              type="file"
              className="hidden"
              accept="image/*"
              onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
            />
            
            {preview ? (
              <div className="relative rounded-xl overflow-hidden group">
                <img src={preview} alt="Preview" className="w-full h-64 object-cover" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button 
                    onClick={(e) => { e.stopPropagation(); document.getElementById('file-upload')?.click(); }}
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur rounded-lg text-white font-medium"
                  >
                    Change Image
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 space-y-4 pointer-events-none">
                <div className="w-16 h-16 rounded-full bg-dark-700 flex items-center justify-center">
                  <Upload className="text-gray-400" size={32} />
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-200">Drag & Drop</p>
                  <p className="text-sm text-gray-500">or click to browse local files</p>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={processImage}
            disabled={!file || isProcessing}
            className={clsx(
              "w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-xl",
              (!file || isProcessing) 
                ? "bg-dark-700 text-gray-500 cursor-not-allowed" 
                : "bg-scarlet-600 text-white hover:bg-scarlet-500 hover:shadow-scarlet-500/25 transform hover:-translate-y-1"
            )}
          >
            {isProcessing ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing Inference...
              </span>
            ) : (
              "Run Detection Analysis"
            )}
          </button>
        </div>

        {/* Output Area */}
        <div className="bg-dark-800 border border-dark-600 rounded-2xl p-6 min-h-[500px] flex flex-col relative overflow-hidden">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <CameraIcon className="text-gray-400" /> Result Output
          </h2>

          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center text-center text-gray-500 space-y-4"
              >
                <ShieldCheck size={48} className="opacity-20" />
                <p>Run a detection to see AI results here.</p>
              </motion.div>
            ) : (
              <motion.div 
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-1 flex flex-col space-y-6"
              >
                {/* Result Image */}
                <div className="rounded-xl overflow-hidden border border-dark-600 shadow-lg relative">
                  <img src={result.annotated_image_base64} alt="Annotated" className="w-full h-auto" />
                  
                  {/* Risk Badge overlay */}
                  <div className="absolute top-4 right-4">
                    <span className={clsx(
                      "px-4 py-1.5 rounded-full font-bold text-sm shadow-xl backdrop-blur-md border",
                      result.risk_level === "CRITICAL" ? "bg-red-500/20 text-red-400 border-red-500/50" :
                      result.risk_level === "HIGH" ? "bg-orange-500/20 text-orange-400 border-orange-500/50" :
                      result.risk_level === "MODERATE" ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/50" :
                      "bg-green-500/20 text-green-400 border-green-500/50"
                    )}>
                      {result.risk_level} RISK
                    </span>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-dark-900 border border-dark-700 p-4 rounded-xl flex flex-col items-center justify-center transition hover:border-orange-500/50">
                    <span className="text-gray-400 text-sm font-medium mb-1">🔥 Fire</span>
                    <span className="text-3xl font-bold text-white">{result.fire_count}</span>
                  </div>
                  <div className="bg-dark-900 border border-dark-700 p-4 rounded-xl flex flex-col items-center justify-center transition hover:border-gray-400">
                    <span className="text-gray-400 text-sm font-medium mb-1">💨 Smoke</span>
                    <span className="text-3xl font-bold text-white">{result.smoke_count}</span>
                  </div>
                  <div className="bg-dark-900 border border-dark-700 p-4 rounded-xl flex flex-col items-center justify-center transition hover:border-scarlet-500/50">
                    <span className="text-gray-400 text-sm font-medium mb-1">🎯 Max Conf</span>
                    <span className="text-3xl font-bold text-white">{result.max_confidence.toFixed(2)}</span>
                  </div>
                </div>

                {/* Heuristic Description */}
                <div className="bg-dark-700/50 p-4 rounded-xl flex items-start gap-3 border border-dark-600 text-sm">
                  <AlertTriangle className="text-scarlet-500 shrink-0 mt-0.5" size={18} />
                  <p className="text-gray-300 leading-relaxed">
                    <strong className="text-white block mb-1">Heuristic Engine Note:</strong>
                    {result.risk_description}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
