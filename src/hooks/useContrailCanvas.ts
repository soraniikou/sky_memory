import { useRef, useEffect, useCallback } from "react";

interface StrokePoint {
  x: number;
  y: number;
  timestamp: number;
}

interface StrokeSegment {
  points: StrokePoint[];
  createdAt: number;
}

const FADE_DURATION = 4000; // 4 seconds to fully dissolve
const LINE_WIDTH = 8;
const BLUR_AMOUNT = 12;

export function useContrailCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const segments = useRef<StrokeSegment[]>([]);
  const currentStroke = useRef<StrokePoint[]>([]);
  const animationFrameId = useRef<number>(0);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);

  const getPos = useCallback(
    (e: MouseEvent | TouchEvent): { x: number; y: number } => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      if ("touches" in e) {
        const touch = e.touches[0];
        return {
          x: (touch.clientX - rect.left) * (canvas.width / rect.width),
          y: (touch.clientY - rect.top) * (canvas.height / rect.height),
        };
      }
      return {
        x: (e.clientX - rect.left) * (canvas.width / rect.width),
        y: (e.clientY - rect.top) * (canvas.height / rect.height),
      };
    },
    []
  );

  const startDrawing = useCallback(
    (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      isDrawing.current = true;
      const pos = getPos(e);
      lastPoint.current = pos;
      currentStroke.current = [{ ...pos, timestamp: Date.now() }];
    },
    [getPos]
  );

  const draw = useCallback(
    (e: MouseEvent | TouchEvent) => {
      e.preventDefault();
      if (!isDrawing.current) return;
      const pos = getPos(e);
      currentStroke.current.push({ ...pos, timestamp: Date.now() });
      lastPoint.current = pos;
    },
    [getPos]
  );

  const stopDrawing = useCallback((e: MouseEvent | TouchEvent) => {
    e.preventDefault();
    if (isDrawing.current && currentStroke.current.length > 1) {
      segments.current.push({
        points: [...currentStroke.current],
        createdAt: Date.now(),
      });
    }
    isDrawing.current = false;
    currentStroke.current = [];
    lastPoint.current = null;
  }, []);

  const renderLoop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const now = Date.now();

    // Remove fully faded segments
    segments.current = segments.current.filter(
      (seg) => now - seg.createdAt < FADE_DURATION + 1000
    );

    // Draw all stored segments
    for (const segment of segments.current) {
      const age = now - segment.createdAt;
      const globalAlpha = Math.max(0, 1 - age / FADE_DURATION);
      const blurGrow = (age / FADE_DURATION) * 20;

      if (globalAlpha <= 0) continue;

      ctx.save();
      ctx.globalAlpha = globalAlpha;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
      ctx.lineWidth = LINE_WIDTH + blurGrow * 0.5;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.shadowColor = "rgba(255, 255, 255, 0.6)";
      ctx.shadowBlur = BLUR_AMOUNT + blurGrow;

      ctx.beginPath();
      const pts = segment.points;
      if (pts.length > 0) {
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) {
          // Smooth curve using quadratic bezier
          const prev = pts[i - 1];
          const curr = pts[i];
          const midX = (prev.x + curr.x) / 2;
          const midY = (prev.y + curr.y) / 2;
          ctx.quadraticCurveTo(prev.x, prev.y, midX, midY);
        }
        if (pts.length > 1) {
          const last = pts[pts.length - 1];
          ctx.lineTo(last.x, last.y);
        }
      }
      ctx.stroke();

      // Draw a second, wider, more blurred pass for cloud-like depth
      ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
      ctx.lineWidth = LINE_WIDTH * 2.5 + blurGrow;
      ctx.shadowBlur = BLUR_AMOUNT * 2 + blurGrow * 2;
      ctx.stroke();

      ctx.restore();
    }

    // Draw current (active) stroke
    if (isDrawing.current && currentStroke.current.length > 1) {
      ctx.save();
      ctx.globalAlpha = 0.9;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
      ctx.lineWidth = LINE_WIDTH;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.shadowColor = "rgba(255, 255, 255, 0.7)";
      ctx.shadowBlur = BLUR_AMOUNT;

      ctx.beginPath();
      const pts = currentStroke.current;
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) {
        const prev = pts[i - 1];
        const curr = pts[i];
        const midX = (prev.x + curr.x) / 2;
        const midY = (prev.y + curr.y) / 2;
        ctx.quadraticCurveTo(prev.x, prev.y, midX, midY);
      }
      const last = pts[pts.length - 1];
      ctx.lineTo(last.x, last.y);
      ctx.stroke();

      // Wider glow pass
      ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
      ctx.lineWidth = LINE_WIDTH * 2.5;
      ctx.shadowBlur = BLUR_AMOUNT * 2;
      ctx.stroke();

      ctx.restore();
    }

    animationFrameId.current = requestAnimationFrame(renderLoop);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
    };

    resize();
    window.addEventListener("resize", resize);

    // Mouse events
    canvas.addEventListener("mousedown", startDrawing);
    canvas.addEventListener("mousemove", draw);
    canvas.addEventListener("mouseup", stopDrawing);
    canvas.addEventListener("mouseleave", stopDrawing);

    // Touch events
    canvas.addEventListener("touchstart", startDrawing, { passive: false });
    canvas.addEventListener("touchmove", draw, { passive: false });
    canvas.addEventListener("touchend", stopDrawing, { passive: false });
    canvas.addEventListener("touchcancel", stopDrawing, { passive: false });

    // Start render loop
    animationFrameId.current = requestAnimationFrame(renderLoop);

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousedown", startDrawing);
      canvas.removeEventListener("mousemove", draw);
      canvas.removeEventListener("mouseup", stopDrawing);
      canvas.removeEventListener("mouseleave", stopDrawing);
      canvas.removeEventListener("touchstart", startDrawing);
      canvas.removeEventListener("touchmove", draw);
      canvas.removeEventListener("touchend", stopDrawing);
      canvas.removeEventListener("touchcancel", stopDrawing);
      cancelAnimationFrame(animationFrameId.current);
    };
  }, [startDrawing, draw, stopDrawing, renderLoop]);

  return { canvasRef };
}
