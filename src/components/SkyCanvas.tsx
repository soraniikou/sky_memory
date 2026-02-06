import { useContrailCanvas } from "@/hooks/useContrailCanvas";

const SkyCanvas = () => {
  const { canvasRef } = useContrailCanvas();

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-10 cursor-crosshair touch-none"
      style={{ mixBlendMode: "screen" }}
    />
  );
};

export default SkyCanvas;
