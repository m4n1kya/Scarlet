"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Upload, Camera as CameraIcon, AlertTriangle, ShieldCheck, Zap, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import clsx from "clsx";
import Webcam from "react-webcam";
import EvilEye from "@/components/EvilEye";

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
  const [mode, setMode] = useState<"image" | "webcam">("image");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  
  const webcamRef = useRef<Webcam>(null);

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

  const processDetection = async (base64Image?: string) => {
    setIsProcessing(true);
    const formData = new FormData();
    formData.append("confidence", "0.25");
    formData.append("iou", "0.45");

    if (mode === "webcam" && typeof base64Image === 'string') {
      formData.append("image_base64", base64Image);
      setPreview(base64Image); 
    } else if (file) {
      formData.append("file", file);
    } else {
      setIsProcessing(false);
      return;
    }

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

  const captureWebcam = () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setResult(null);
      processDetection(imageSrc);
    }
  };

  // Determine Evil Eye State based on results
  const getEyeProps = () => {
    if (isProcessing) {
      return { eyeColor: "#25d8fb", intensity: 2.5, pupilFollow: 3.0, flameSpeed: 3.0, pupilSize: 0.4 }; // Scanning
    }
    if (result) {
      if (result.fire_count > 0 || result.risk_level === "CRITICAL" || result.risk_level === "HIGH") {
        return { eyeColor: "#FF2400", intensity: 3.5, pupilFollow: 0, flameSpeed: 2.5, pupilSize: 0.8 }; // Scarlet Fire detected
      }
      return { eyeColor: "#25d8fb", intensity: 1.5, pupilFollow: 1.0, flameSpeed: 0.8, pupilSize: 0.5 }; // No Fire
    }
    // Default Idle (When no import)
    return { eyeColor: "#617592", intensity: 1.5, pupilFollow: 1.0, flameSpeed: 1.0, pupilSize: 0.6 }; 
  };

  return (
    <div className="relative w-full h-[calc(100vh-48px)] overflow-hidden bg-dark-900">
      
      {/* Absolute Background Evil Eye */}
      <div className="absolute inset-0 z-0 opacity-80 pointer-events-auto">
        <EvilEye {...getEyeProps()} />
      </div>

      {/* Left Panel: Upload & Controls */}
      <div className="absolute top-0 left-0 h-full w-full md:w-[380px] bg-dark-900/40 backdrop-blur-2xl border-r border-white/5 p-4 flex flex-col z-10 shadow-2xl overflow-y-auto custom-scrollbar">
        
        <div className="mb-4">
          <h2 className="text-xl font-bold tracking-tight mb-0.5 flex items-center gap-1.5">
            Control Center <Zap className="text-scarlet-500" size={16} />
          </h2>
          <p className="text-xs text-gray-400">Initialize SCARLET inference engine.</p>
        </div>

        {/* Controls */}
        <div className="space-y-3 mb-6 shrink-0">
          <div className="bg-dark-800/30 border border-white/10 p-1 rounded-lg flex relative">
            <motion.div 
              className="absolute inset-y-1 bg-white/10 rounded-md shadow w-[calc(50%-4px)] transition-all z-0"
              animate={{ x: mode === "image" ? 4 : 'calc(100% + 4px)' }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
            <button 
              onClick={() => { setMode("image"); setResult(null); }}
              className={clsx("flex-1 py-1 z-10 text-xs font-medium transition-colors", mode === "image" ? "text-white" : "text-gray-400 hover:text-white")}
            >
              Image
            </button>
            <button 
              onClick={() => { setMode("webcam"); setResult(null); }}
              className={clsx("flex-1 py-1 z-10 text-xs font-medium transition-colors", mode === "webcam" ? "text-white" : "text-gray-400 hover:text-white")}
            >
              Webcam
            </button>
          </div>

          <div className="border border-white/10 rounded-xl bg-black/30 overflow-hidden relative backdrop-blur-sm">
            {mode === "image" ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={clsx(
                  "text-center transition-all cursor-pointer h-[160px] flex flex-col items-center justify-center relative",
                  isDragging ? "border-2 border-scarlet-500 bg-scarlet-500/10" : "hover:bg-white/5",
                  preview ? "p-0 border-0" : "p-4"
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
                  <div className="relative w-full h-full group">
                    <img src={preview} alt="Preview" className="w-full h-full object-contain" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button 
                        onClick={(e) => { e.stopPropagation(); document.getElementById('file-upload')?.click(); }}
                        className="px-3 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur rounded-md text-white font-medium text-xs"
                      >
                        Change Media
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-1.5 pointer-events-none">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shadow-inner">
                      <Upload className="text-gray-400" size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-200">Drag & Drop</p>
                      <p className="text-[10px] text-gray-500">or click to browse</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-[160px] bg-black flex items-center justify-center relative overflow-hidden">
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  className="w-full h-full object-cover"
                  videoConstraints={{ facingMode: "user" }}
                />
                <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/50 backdrop-blur px-2 py-0.5 rounded-full border border-white/10 text-[9px] font-medium tracking-wide">
                  <span className="w-1 h-1 rounded-full bg-red-500 animate-pulse"></span>
                  LIVE
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => mode === "image" ? processDetection() : captureWebcam()}
            disabled={(mode === "image" && !file) || isProcessing}
            className={clsx(
              "w-full py-2.5 rounded-lg font-bold transition-all duration-300 shadow-lg text-xs",
              ((mode === "image" && !file) || isProcessing) 
                ? "bg-white/5 text-gray-500 cursor-not-allowed" 
                : "bg-scarlet-600 text-white hover:bg-scarlet-500 transform hover:-translate-y-0.5"
            )}
          >
            {isProcessing ? (
              <span className="flex items-center justify-center gap-1.5">
                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </span>
            ) : mode === "webcam" ? (
              <span className="flex items-center justify-center gap-1.5">
                <CameraIcon size={14} /> Capture & Analyze
              </span>
            ) : (
              "Initialize Inference"
            )}
          </button>
        </div>
      </div>

      {/* Right Panel: Quick Analysis & Results */}
      <div className="absolute top-0 right-0 h-full w-full md:w-[380px] bg-dark-900/40 backdrop-blur-2xl border-l border-white/5 p-4 flex flex-col z-10 shadow-2xl overflow-y-auto custom-scrollbar">
        <h3 className="text-xs font-semibold mb-3 text-gray-300 tracking-wide uppercase">Quick Analysis</h3>

        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center text-center text-gray-500 space-y-2"
            >
              <ShieldCheck size={24} className="opacity-20" />
              <p className="text-[10px]">Awaiting telemetry data.</p>
            </motion.div>
          ) : (
            <motion.div 
              key="result"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex-1 flex flex-col space-y-3"
            >
              {/* Result Image */}
              <div className="rounded-lg overflow-hidden border border-white/10 shadow-lg relative bg-black/50">
                <img src={result.annotated_image_base64} alt="Annotated" className="w-full h-auto object-contain max-h-[200px]" />
                
                <div className="absolute top-1.5 right-1.5">
                  <span className={clsx(
                    "px-2 py-0.5 rounded-full font-bold text-[10px] shadow-xl backdrop-blur-md border",
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
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white/5 border border-white/5 p-2 rounded-lg flex items-center justify-between">
                  <span className="text-gray-400 text-[10px] font-medium">🔥 Fire</span>
                  <span className="text-sm font-bold text-white">{result.fire_count}</span>
                </div>
                <div className="bg-white/5 border border-white/5 p-2 rounded-lg flex items-center justify-between">
                  <span className="text-gray-400 text-[10px] font-medium">💨 Smoke</span>
                  <span className="text-sm font-bold text-white">{result.smoke_count}</span>
                </div>
                <div className="bg-white/5 border border-white/5 p-2 rounded-lg flex items-center justify-between col-span-2">
                  <span className="text-gray-400 text-[10px] font-medium">🎯 Peak Confidence</span>
                  <span className="text-sm font-bold text-white">{(result.max_confidence * 100).toFixed(1)}%</span>
                </div>
              </div>

              {/* Heuristic Description */}
              <div className="bg-scarlet-900/20 p-2 rounded-lg flex items-start gap-1.5 border border-scarlet-500/20 text-[10px]">
                <AlertTriangle className="text-scarlet-500 shrink-0 mt-0.5" size={12} />
                <p className="text-gray-300 leading-relaxed">
                  {result.risk_description}
                </p>
              </div>

              {/* Detailed Analysis Button */}
              <div className="mt-auto pt-4 border-t border-white/10">
                <a href="/analytics" className="w-full flex items-center justify-center gap-2 py-2 bg-dark-800 border border-dark-600 hover:border-scarlet-500/50 text-gray-300 hover:text-white rounded-lg transition text-xs font-medium">
                  <Activity size={14} className="text-scarlet-500" /> View Detailed Analysis
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
