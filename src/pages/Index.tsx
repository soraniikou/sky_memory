import skyBackground from "@/assets/sky-background.jpg";
import SkyCanvas from "@/components/SkyCanvas";
import FloatingPrayer from "@/components/FloatingPrayer";

const Index = () => {
  return (
    <div className="relative w-screen h-screen overflow-hidden animate-page-fade-in select-none">
      {/* Sky background */}
      <img
        src={skyBackground}
        alt="祈りの空"
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />

      {/* Subtle gradient overlay to enhance depth */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, transparent 40%, transparent 70%, rgba(0,0,0,0.15) 100%)",
        }}
      />

      {/* Drawing canvas */}
      <SkyCanvas />

      {/* Text prayer input & floating messages */}
      <FloatingPrayer />

      {/* Minimal title */}
      <div className="absolute top-8 left-0 right-0 z-20 flex justify-center pointer-events-none">
        <h1
          className="text-prayer-text/60 text-xs md:text-sm font-extralight tracking-[0.3em] animate-breathe"
          style={{
            textShadow: "0 0 20px rgba(255,255,255,0.3)",
          }}
        >
          祈りの空
        </h1>
      </div>

      {/* Gentle instruction text */}
      <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
        <p
          className="text-prayer-text/30 text-sm md:text-lg font-extralight tracking-[0.25em] animate-hint-fade"
          style={{
            textShadow: "0 0 30px rgba(255,255,255,0.15)",
          }}
        >
          あなたの想いを　自由にマウスで書いて
        </p>
      </div>
    </div>
  );
};

export default Index;
