"use client";
import React, { useRef, useEffect, useState } from "react";
import useWaveFunctionCollapse from "../index";
import Button from "./Button";
import Spinner from "./Spinner";
import Progress from "./Progress";

interface CanvasComponentProps {
  outputDimWidth?: number;
  outputDimHight?: number;
  sizeFactor?: number;
  patternDim?: number;
  frameRate?: number;
  canvasWidth?: number;
  canvasHeight?: number;
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
  outputDimHight = 50,
  sizeFactor = 9,
  patternDim = 3,
}: CanvasComponentProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [imageData, setImageData] = useState<ImageData>();
  const [drawnPatterns, setDrawnPatterns] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [status, setStatus] = useState("Ready");
  const [error, setError] = useState<string | null>(null);
  const [isSetupComplete, setIsSetupComplete] = useState(false);

  const { setup, draw } = useWaveFunctionCollapse(
    outputDimWidth,
    outputDimHight,
    sizeFactor,
    patternDim,
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
            console.log(imageData, "imageData");
            setImageData(imageData);
            setStatus("Image loaded successfully");
            setError(null);
          })
          .catch((error) => {
            console.error("Error loading image", error);
            setError("Failed to load image");
            setStatus("Error");
          });

        canvas.width = outputDimWidth * sizeFactor;
        canvas.height = outputDimHight * sizeFactor;

        context.fillStyle = "#FFFFFF";
        context.fillRect(0, 0, context.canvas.width, context.canvas.height);
      }
    }
  }, [outputDimWidth, outputDimHight, sizeFactor]);

  useEffect(() => {
    if (imageData) {
      try {
        setup(
          imageData.data,
          imageData.width,
          imageData.height,
          outputDimWidth * sizeFactor,
          outputDimHight * sizeFactor,
        );
        setIsSetupComplete(true);
        setStatus("Ready to generate");
        setError(null);
      } catch (err) {
        setError("Failed to setup WFC algorithm");
        setStatus("Error");
      }
    }
  }, [imageData, outputDimWidth, outputDimHight, sizeFactor]);

  const drawOnCanvas = async () => {
    if (!context || !isSetupComplete) return false;

    try {
      const drawResult = await draw();
      if (drawResult) {
        const { selectedPattern, entropyMin, cellDimentionX, cellDimentionY } =
          drawResult;

        if (selectedPattern && cellDimentionX && cellDimentionY) {
          const patternSize = Math.sqrt(selectedPattern.length);
          selectedPattern.forEach((pixel, pixelIndex) => {
            const rowIndex = Math.floor(pixelIndex / patternSize);
            const colIndex = pixelIndex % patternSize;

            context.fillStyle = `rgba(${pixel[0]}, ${pixel[1]}, ${pixel[2]}, ${
              pixel[3] / 255
            })`;

            const x =
              (entropyMin % outputDimWidth) * cellDimentionX +
              colIndex * patternDim;
            const y =
              Math.floor(entropyMin / outputDimWidth) * cellDimentionY +
              rowIndex * patternDim;

            context.fillRect(x, y, patternDim, patternDim);
          });
          setDrawnPatterns((prev) => [...prev, drawResult]);
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

    // Start spinner immediately
    setIsGenerating(true);
    setStatus("Generating full map...");

    // Small delay to ensure UI updates before heavy computation
    await new Promise((resolve) => setTimeout(resolve, 10));

    let loop = true;
    while (loop) {
      const result = await drawOnCanvas();
      if (!result) {
        loop = false;
      }
    }

    setIsGenerating(false);
    setStatus("Generation complete!");
  };

  const handleReset = () => {
    if (context) {
      context.fillStyle = "#FFFFFF";
      context.fillRect(0, 0, context.canvas.width, context.canvas.height);
    }
    setDrawnPatterns([]);
    setStatus("Ready to generate");
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
      setStatus("Generation complete!");
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
                      : isGenerating
                        ? "text-blue-600"
                        : "text-green-600"
                  }`}
                >
                  {status}
                </span>
                {isGenerating && <Spinner size="sm" />}
              </div>
              <div className="text-sm text-gray-500">
                Patterns drawn: {drawnPatterns.length}
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

          {/* Info Panel */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Configuration
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Width:</span>
                <span className="ml-2 font-medium">{outputDimWidth}</span>
              </div>
              <div>
                <span className="text-gray-500">Height:</span>
                <span className="ml-2 font-medium">{outputDimHight}</span>
              </div>
              <div>
                <span className="text-gray-500">Pattern Size:</span>
                <span className="ml-2 font-medium">
                  {patternDim}x{patternDim}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Scale Factor:</span>
                <span className="ml-2 font-medium">{sizeFactor}px</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CanvasComponent;
