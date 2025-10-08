import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import confetti from "canvas-confetti";

export default function Landing() {
  const [, setLocation] = useLocation();
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowText(true);
      
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);

      return () => clearInterval(interval);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleClick = () => {
    setLocation("/home");
  };

  return (
    <div 
      className="h-screen w-full bg-background flex items-center justify-center p-6 cursor-pointer"
      onClick={handleClick}
      data-testid="button-enter-app"
    >
      <div 
        className={`text-center space-y-6 transition-all duration-1000 ${
          showText ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <h1 
          className="text-4xl md:text-5xl font-bold text-primary mb-4"
          data-testid="text-title"
        >
          Happy Birthday Div Papa!
        </h1>
        <p 
          className="text-lg md:text-xl text-foreground max-w-2xl leading-relaxed"
          data-testid="text-message"
        >
          Hope this bundle of memories shows how much we all love you and how far you have come along. Let's keep the good times going :)
        </p>
        <p className="text-sm text-muted-foreground mt-8 animate-pulse">
          Tap anywhere to continue
        </p>
      </div>
    </div>
  );
}
