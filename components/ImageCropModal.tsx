"use client";

import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { Loader2, X, ZoomIn, ZoomOut } from "lucide-react";

interface Props {
  imageSrc: string;
  onCancel: () => void;
  onCrop: (blob: Blob) => void;
  aspect?: number;
}

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number }
): Promise<Blob> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.addEventListener("load", () => resolve(img));
    img.addEventListener("error", reject);
    img.src = imageSrc;
  });

  const canvas = document.createElement("canvas");
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext("2d")!;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Canvas is empty"));
    }, "image/png");
  });
}

export function ImageCropModal({ imageSrc, onCancel, onCrop, aspect = 1 }: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [processing, setProcessing] = useState(false);

  const onCropComplete = useCallback((_: any, croppedPixels: any) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleApply = async () => {
    if (!croppedAreaPixels) return;
    setProcessing(true);
    try {
      const blob = await getCroppedImg(imageSrc, croppedAreaPixels);
      onCrop(blob);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#e8d8db]">
          <div>
            <h3 className="text-sm font-semibold text-[#2e0c12]">Crop Logo</h3>
            <p className="text-xs text-[#8b6f76]">Drag to reposition · scroll or pinch to zoom</p>
          </div>
          <button
            onClick={onCancel}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-[#8b6f76] hover:bg-[#550C18]/8 hover:text-[#550C18] transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Crop area */}
        <div className="relative bg-[#1a1a1a]" style={{ height: 300 }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            cropShape="round"
            showGrid={false}
            style={{
              containerStyle: { background: "#1a1a1a" },
              cropAreaStyle: { border: "2px solid #550C18" },
            }}
          />
        </div>

        {/* Zoom slider */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-[#e8d8db]">
          <ZoomOut className="h-4 w-4 shrink-0 text-[#8b6f76]" />
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full accent-[#550C18]"
          />
          <ZoomIn className="h-4 w-4 shrink-0 text-[#8b6f76]" />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 px-5 py-4">
          <button
            onClick={onCancel}
            className="rounded-xl border border-[#e8d8db] px-4 py-2 text-sm font-medium text-[#8b6f76] transition hover:bg-[#fffafb]"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            disabled={processing}
            className="flex items-center gap-2 rounded-xl bg-[#550C18] px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#6a1220] disabled:opacity-60"
          >
            {processing && <Loader2 className="h-4 w-4 animate-spin" />}
            {processing ? "Processing…" : "Apply"}
          </button>
        </div>
      </div>
    </div>
  );
}
