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
    <div className="relative w-full h-[calc(100vh-56px)] overflow-hidden bg-black">
      
      {/* Absolute Background Evil Eye */}
      <div className="absolute inset-0 z-0 opacity-80 pointer-events-auto">
        <EvilEye {...getEyeProps()} />
      </div>

      {/* Left Panel: Upload & Controls */}
      <div className="absolute top-0 left-0 h-full w-full md:w-[380px] bg-black/40 backdrop-blur-md border-r border-white/10 p-6 flex flex-col z-10 shadow-2xl overflow-y-auto custom-scrollbar pointer-events-auto">
        
        <div className="mb-6">
          <h2 className="text-xl font-bold tracking-tight mb-1 flex items-center gap-2 uppercase text-white">
            Control Center
          </h2>
          <p className="text-xs text-gray-400 font-medium">Initialize Inference Engine</p>
        </div>

        {/* Controls */}
        <div className="space-y-4 mb-6 shrink-0">
          <div className="bg-white/5 border border-white/10 p-1 rounded-md flex relative">
            <motion.div 
              className="absolute inset-y-1 bg-white rounded-sm shadow w-[calc(50%-4px)] transition-all z-0"
              animate={{ x: mode === "image" ? 4 : 'calc(100% + 4px)' }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
            <button 
              onClick={() => { setMode("image"); setResult(null); }}
              className={clsx("flex-1 py-1.5 z-10 text-xs font-bold transition-colors uppercase tracking-wider", mode === "image" ? "text-black" : "text-gray-400 hover:text-white")}
            >
              Image
            </button>
            <button 
              onClick={() => { setMode("webcam"); setResult(null); }}
              className={clsx("flex-1 py-1.5 z-10 text-xs font-bold transition-colors uppercase tracking-wider", mode === "webcam" ? "text-black" : "text-gray-400 hover:text-white")}
            >
              Webcam
            </button>
          </div>

          <div className="border border-white/10 rounded-lg bg-black/40 overflow-hidden relative backdrop-blur-sm">
            {mode === "image" ? (
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={clsx(
                  "text-center transition-all cursor-pointer h-[180px] flex flex-col items-center justify-center relative",
                  isDragging ? "border-2 border-white bg-white/5" : "hover:bg-white/5",
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
                    <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button 
                        onClick={(e) => { e.stopPropagation(); document.getElementById('file-upload')?.click(); }}
                        className="px-4 py-2 bg-white text-black hover:bg-gray-200 rounded-sm font-bold text-xs uppercase tracking-wide transition-colors"
                      >
                        Change Media
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-3 pointer-events-none">
                    <div className="w-12 h-12 border border-white/10 rounded-full flex items-center justify-center">
                      <Upload className="text-gray-400" size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-200 uppercase tracking-wide">Drag & Drop</p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Or click to browse</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-[180px] bg-black flex items-center justify-center relative overflow-hidden">
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  className="w-full h-full object-cover"
                  videoConstraints={{ facingMode: "user" }}
                />
                <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/80 px-2 py-1 rounded-sm border border-white/10 text-[9px] font-bold tracking-widest uppercase">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                  LIVE
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => mode === "image" ? processDetection() : captureWebcam()}
            disabled={(mode === "image" && !file) || isProcessing}
            className={clsx(
              "w-full py-3 rounded-md font-bold transition-all duration-300 shadow-lg text-xs uppercase tracking-widest",
              ((mode === "image" && !file) || isProcessing) 
                ? "bg-white/5 text-gray-600 border border-white/5 cursor-not-allowed" 
                : "bg-white text-black hover:bg-gray-200"
            )}
          >
            {isProcessing ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-3.5 h-3.5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                Processing...
              </span>
            ) : mode === "webcam" ? (
              <span className="flex items-center justify-center gap-2">
                <CameraIcon size={14} /> Capture & Analyze
              </span>
            ) : (
              "Initialize Inference"
            )}
          </button>
        </div>
      </div>

      {/* Right Panel: Quick Analysis & Results */}
      <div className="absolute top-0 right-0 h-full w-full md:w-[380px] bg-black/40 backdrop-blur-md border-l border-white/10 p-6 flex flex-col z-10 shadow-2xl overflow-y-auto custom-scrollbar pointer-events-auto">
        <h3 className="text-xs font-bold mb-4 text-white tracking-widest uppercase">Telemetry</h3>

        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center text-center text-gray-600 space-y-3"
            >
              <ShieldCheck size={28} className="opacity-20" />
              <p className="text-[10px] font-medium uppercase tracking-widest">Awaiting telemetry data</p>
            </motion.div>
          ) : (
            <motion.div 
              key="result"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex-1 flex flex-col space-y-4"
            >
              {/* Result Image */}
              <div className="rounded-lg overflow-hidden border border-white/10 shadow-xl relative bg-black/80">
                <img src={result.annotated_image_base64} alt="Annotated" className="w-full h-auto object-contain max-h-[220px]" />
                
                <div className="absolute top-2 right-2">
                  <span className={clsx(
                    "px-2.5 py-1 rounded-sm font-bold text-[9px] uppercase tracking-widest border backdrop-blur-md",
                    result.risk_level === "CRITICAL" ? "bg-white text-black border-white" :
                    result.risk_level === "HIGH" ? "bg-gray-300 text-black border-gray-300" :
                    result.risk_level === "MODERATE" ? "bg-gray-600 text-white border-gray-500" :
                    "bg-black text-white border-white/20"
                  )}>
                    {result.risk_level} RISK
                  </span>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 border border-white/10 p-3 rounded-md flex flex-col justify-between">
                  <span className="text-gray-400 text-[9px] font-bold uppercase tracking-widest mb-1">Fire count</span>
                  <span className="text-lg font-bold text-white">{result.fire_count}</span>
                </div>
                <div className="bg-white/5 border border-white/10 p-3 rounded-md flex flex-col justify-between">
                  <span className="text-gray-400 text-[9px] font-bold uppercase tracking-widest mb-1">Smoke count</span>
                  <span className="text-lg font-bold text-white">{result.smoke_count}</span>
                </div>
                <div className="bg-white/5 border border-white/10 p-3 rounded-md flex flex-col justify-between col-span-2">
                  <span className="text-gray-400 text-[9px] font-bold uppercase tracking-widest mb-1">Peak Confidence</span>
                  <span className="text-lg font-bold text-white">{(result.max_confidence * 100).toFixed(1)}%</span>
                </div>
              </div>

              {/* Heuristic Description */}
              <div className="bg-white/5 p-3 rounded-md flex items-start gap-2 border border-white/10 text-xs">
                <AlertTriangle className="text-white shrink-0 mt-0.5" size={14} />
                <p className="text-gray-300 font-medium leading-relaxed">
                  {result.risk_description}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
