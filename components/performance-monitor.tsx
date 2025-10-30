"use client";

import { useEffect, useState } from "react";

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage?: number;
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const measurePerformance = () => {
      const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType("paint");
      
      const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
      const renderTime = paint.find(entry => entry.name === "first-contentful-paint")?.startTime || 0;
      
      const memoryInfo = (performance as any).memory;
      const memoryUsage = memoryInfo ? memoryInfo.usedJSHeapSize / 1024 / 1024 : undefined;

      setMetrics({
        loadTime,
        renderTime,
        memoryUsage,
      });
    };

    // Measure after page load
    if (document.readyState === "complete") {
      measurePerformance();
    } else {
      window.addEventListener("load", measurePerformance);
    }

    // Show/hide with Ctrl+Shift+P
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "P") {
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("load", measurePerformance);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  if (!isVisible || !metrics) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-3 rounded-lg text-xs font-mono z-50">
      <div className="space-y-1">
        <div>Load: {metrics.loadTime.toFixed(2)}ms</div>
        <div>Render: {metrics.renderTime.toFixed(2)}ms</div>
        {metrics.memoryUsage && (
          <div>Memory: {metrics.memoryUsage.toFixed(2)}MB</div>
        )}
        <div className="text-gray-400 text-xs mt-2">
          Press Ctrl+Shift+P to toggle
        </div>
      </div>
    </div>
  );
}
