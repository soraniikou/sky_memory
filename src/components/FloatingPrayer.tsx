import { useState, useCallback } from "react";

interface PrayerMessage {
  id: number;
  text: string;
  x: number;
}

const FloatingPrayer = () => {
  const [text, setText] = useState("");
  const [messages, setMessages] = useState<PrayerMessage[]>([]);
  const [isFocused, setIsFocused] = useState(false);

  const sendPrayer = useCallback(() => {
    if (!text.trim()) return;

    const newMessage: PrayerMessage = {
      id: Date.now(),
      text: text.trim(),
      x: 30 + Math.random() * 40, // random horizontal position between 30-70%
    };

    setMessages((prev) => [...prev, newMessage]);
    setText("");

    // Remove message after animation completes
    setTimeout(() => {
      setMessages((prev) => prev.filter((m) => m.id !== newMessage.id));
    }, 6500);
  }, [text]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendPrayer();
    }
  };

  return (
    <>
      {/* Floating prayer messages */}
      {messages.map((msg) => (
        <div
          key={msg.id}
          className="animate-float-dissolve fixed z-20 pointer-events-none select-none"
          style={{
            left: `${msg.x}%`,
            bottom: "20%",
            transform: "translateX(-50%)",
          }}
        >
          <span
            className="text-prayer-text text-xl md:text-2xl font-light tracking-widest whitespace-nowrap"
            style={{
              textShadow:
                "0 0 20px rgba(255,255,255,0.5), 0 0 40px rgba(255,255,255,0.2)",
            }}
          >
            {msg.text}
          </span>
        </div>
      ))}

      {/* Input area */}
      <div className="fixed bottom-0 left-0 right-0 z-30 flex justify-center pb-8 px-6">
        <div
          className={`
            relative flex items-center w-full max-w-md transition-all duration-700 ease-out
            ${isFocused ? "opacity-90" : "opacity-40 hover:opacity-60"}
          `}
        >
          <div className="absolute inset-0 rounded-full bg-background/10 backdrop-blur-md border border-cloud-white/10" />
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="想いを空に放つ..."
            className="relative w-full bg-transparent text-prayer-text placeholder:text-cloud-white/30 text-sm md:text-base font-light tracking-wider px-6 py-3 outline-none"
          />
          {text.trim() && (
            <button
              onClick={sendPrayer}
              className="relative mr-3 text-cloud-white/50 hover:text-cloud-white/80 transition-colors duration-300"
              aria-label="送信"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default FloatingPrayer;
