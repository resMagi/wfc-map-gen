"use client";
import React, { useRef, useEffect, useState } from "react";
import useWaveFunctionCollapse from "../index";
import Button from "./Button";
import Spinner from "./Spinner";
import Progress from "./Progress";

interface CanvasComponentProps {
  outputDimWidth?: number;
  outputDimHeight?: number;
  sizeFactor?: number;
  patternDim?: number;
}

const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
};

const CanvasComponent = ({
  outputDimWidth = 96,
  outputDimHeight = 50,
  sizeFactor = 9,
  patternDim = 3,
}: CanvasComponentProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [imageData, setImageData] = useState<ImageData>();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const stepCountRef = useRef(0);
  const [stepCount, setStepCount] = useState(0);
  const [patternSize, setPatternSize] = useState(patternDim);
  const [scaleFactor, setScaleFactor] = useState(sizeFactor);
  const [status, setStatus] = useState("Ready");
  const [error, setError] = useState<string | null>(null);
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [patternsReady, setPatternsReady] = useState(false);

  const { setup, draw } = useWaveFunctionCollapse(
    outputDimWidth,
    outputDimHeight,
    1, // Always use scale factor 1 for WFC calculations
    patternSize,
  );
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext("2d");
      if (context) {
        setContext(context);

        loadImage("/images/flowers.bmp")
          .then((image) => {
            context.drawImage(image, 0, 0);
            const imageData = context.getImageData(
              0,
              0,
              image.width,
              image.height,
            );
            setImageData(imageData);
            setStatus("Image loaded - ready to scan");
            setError(null);
          })
          .catch((error) => {
            console.error("Error loading image", error);
            setError("Failed to load image");
            setStatus("Error");
          });

        canvas.width = outputDimWidth * scaleFactor;
        canvas.height = outputDimHeight * scaleFactor;

        context.fillStyle = "#FFFFFF";
        context.fillRect(0, 0, context.canvas.width, context.canvas.height);
      }
    }
  }, [outputDimWidth, outputDimHeight, scaleFactor]);

  // Remove automatic setup - will be triggered by scan button

  const handleScan = async () => {
    if (!imageData) return;

    setIsScanning(true);
    setStatus("Scanning patterns...");
    setError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 10)); // Allow UI update

      setup(
        imageData.data,
        imageData.width,
        imageData.height,
        outputDimWidth, // Always use original dimensions for WFC
        outputDimHeight,
      );

      setIsSetupComplete(true);
      setPatternsReady(true);
      setStatus("Patterns ready - ready to generate");
    } catch (err) {
      setError("Failed to scan patterns");
      setStatus("Error");
    } finally {
      setIsScanning(false);
    }
  };

  const drawOnCanvas = async () => {
    if (!context || !isSetupComplete) return false;

    try {
      const drawResult = await draw();
      if (drawResult) {
        const { selectedPattern, entropyMin, cellDimensionX, cellDimensionY } =
          drawResult;

        // Increment step counter
        stepCountRef.current += 1;
        setStepCount(stepCountRef.current);
        setStatus(`Generating step ${stepCountRef.current}...`);

        if (selectedPattern && cellDimensionX && cellDimensionY) {
          // REPLACE WITH:
          const pixel = selectedPattern[0][0];
          const cellX = (entropyMin % outputDimWidth) * scaleFactor;
          const cellY = Math.floor(entropyMin / outputDimWidth) * scaleFactor;

          context.fillStyle = `rgba(${pixel[0]}, ${pixel[1]}, ${pixel[2]}, ${pixel[3] / 255})`;
          context.fillRect(cellX, cellY, scaleFactor, scaleFactor);
        }

        if (selectedPattern === null || !entropyMin || entropyMin === 0) {
          setStatus("Generation complete!");
          return false;
        } else {
          return true;
        }
      }
    } catch (err) {
      setError("Error during generation");
      setStatus("Error");
      return false;
    }
  };

  const drawLoop = async () => {
    if (!isSetupComplete) return;

    // Reset step counter
    stepCountRef.current = 0;
    setStepCount(0);

    // Start spinner immediately
    setIsGenerating(true);
    setStatus("Generating full map...");

    // Small delay to ensure UI updates before heavy computation
    await new Promise((resolve) => setTimeout(resolve, 10));

    let loop = true;
    while (loop) {
      const result = await drawOnCanvas();
      // Small delay to allow UI to update with new step count
      await new Promise((resolve) => setTimeout(resolve, 5));
      if (!result) {
        loop = false;
      }
    }

    setIsGenerating(false);
    setStatus(`Generation complete! Total steps: ${stepCountRef.current}`);
  };

  const handleReset = () => {
    if (context) {
      context.fillStyle = "#FFFFFF";
      context.fillRect(0, 0, context.canvas.width, context.canvas.height);
    }
    stepCountRef.current = 0;
    setStepCount(0);
    setStatus("Ready to scan");
    setError(null);
  };

  const handleStepGeneration = async () => {
    if (!context || !isSetupComplete) return;

    // Start spinner immediately
    setIsGenerating(true);
    setStatus("Generating step...");

    // Small delay to ensure UI updates
    await new Promise((resolve) => setTimeout(resolve, 10));

    const result = await drawOnCanvas();

    setIsGenerating(false);
    if (!result) {
      setStatus(`Generation complete! Total steps: ${stepCountRef.current}`);
    } else {
      setStatus("Ready for next step");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            WFC Generator
          </h1>
          <p className="text-lg text-gray-600">
            Wave Function Collapse algorithm implementation in TypeScript
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Status Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">
                  Status:
                </span>
                <span
                  className={`text-sm font-semibold ${
                    error
                      ? "text-red-600"
                      : isGenerating || isScanning
                        ? "text-blue-600"
                        : patternsReady
                          ? "text-green-600"
                          : "text-yellow-600"
                  }`}
                >
                  {status}
                </span>
                {(isGenerating || isScanning) && <Spinner size="sm" />}
              </div>
              <div className="flex items-center space-x-4">
                {stepCount > 0 && (
                  <div className="text-sm text-gray-500">
                    Steps: {stepCount}
                  </div>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            {/* Removed progress bar */}

            {/* Error Message */}
            {error && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
          </div>

          {/* Canvas Container */}
          <div className="flex justify-center mb-6">
            <div className="border-2 border-gray-300 rounded-lg overflow-hidden">
              <canvas
                ref={canvasRef}
                className="block"
                style={{ imageRendering: "pixelated" }}
              />
            </div>
          </div>

          {/* Control Panel */}
          <div className="space-y-4">
            {/* Pattern Configuration */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
              <div className="flex items-center space-x-2">
                <label
                  htmlFor="patternSize"
                  className="text-sm font-medium text-gray-700"
                >
                  Pattern Size:
                </label>
                <input
                  id="patternSize"
                  type="number"
                  min="1"
                  max="10"
                  value={patternSize}
                  onChange={(e) =>
                    setPatternSize(
                      Math.max(1, Math.min(10, parseInt(e.target.value) || 1)),
                    )
                  }
                  disabled={isScanning || isGenerating}
                  className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-900"
                  style={{ fontVariantNumeric: "tabular-nums" }}
                />
                <span className="text-sm text-gray-500 ml-1">
                  x{patternSize}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <label
                  htmlFor="scaleFactor"
                  className="text-sm font-medium text-gray-700"
                >
                  Scale Factor:
                </label>
                <input
                  id="scaleFactor"
                  type="number"
                  min="1"
                  max="20"
                  value={scaleFactor}
                  onChange={(e) => {
                    const newScale = Math.max(
                      1,
                      Math.min(20, parseInt(e.target.value) || 1),
                    );
                    if (context && canvasRef.current) {
                      canvasRef.current.width = outputDimWidth * newScale;
                      canvasRef.current.height = outputDimHeight * newScale;
                      context.fillStyle = "#FFFFFF";
                      context.fillRect(
                        0,
                        0,
                        context.canvas.width,
                        context.canvas.height,
                      );
                    }
                    setScaleFactor(newScale);
                  }}
                  disabled={isScanning || isGenerating}
                  className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-gray-900"
                  style={{ fontVariantNumeric: "tabular-nums" }}
                />
                <span className="text-sm text-gray-500 ml-1">px</span>
              </div>

              <Button
                onClick={handleScan}
                disabled={!imageData || isScanning || isGenerating}
                className="flex items-center space-x-2"
              >
                {isScanning ? <Spinner size="sm" /> : null}
                <span>{isScanning ? "Scanning..." : "Scan Patterns"}</span>
              </Button>
            </div>

            {/* Generation Controls */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={drawLoop}
                disabled={isGenerating || !isSetupComplete}
                className="flex items-center space-x-2"
              >
                {isGenerating ? <Spinner size="sm" /> : null}
                <span>
                  {isGenerating ? "Generating..." : "Generate Full Map"}
                </span>
              </Button>

              <Button
                onClick={handleStepGeneration}
                disabled={isGenerating || !isSetupComplete}
                variant="secondary"
              >
                Generate Step
              </Button>

              <Button
                onClick={handleReset}
                disabled={isGenerating}
                variant="danger"
              >
                Reset Canvas
              </Button>
            </div>
          </div>

          {/* Info Panel */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Configuration
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Width:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {outputDimWidth}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Height:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {outputDimHeight}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Pattern Size:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {patternSize}x{patternSize}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Scale Factor:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {scaleFactor}px
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CanvasComponent;
