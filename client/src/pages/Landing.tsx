import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import confetti from "canvas-confetti";

export default function Landing() {
  const [, setLocation] = useLocation();
  const [showText, setShowText] = useState(false);

  // Generate random stars across full screen
  const stars = Array.from({ length: 100 }, (_, i) => ({
    id: i,
    top: Math.random() * 100,
    left: Math.random() * 100,
    size: Math.random() * 2 + 1,
    delay: Math.random() * 3,
    duration: Math.random() * 2 + 1,
  }));

  useEffect(() => {
    // Show text and confetti after initial delay
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
          clearInterval(interval);
          
          // Start gentle snowfall confetti
          const snowfallInterval = setInterval(() => {
            confetti({
              particleCount: 3,
              angle: 60,
              spread: 55,
              origin: { x: 0, y: 0 },
              colors: ['#ffffff', '#a5d8ff', '#ffd43b'],
              gravity: 0.4,
              drift: 0.5,
              ticks: 200,
              zIndex: 0
            });
            confetti({
              particleCount: 3,
              angle: 120,
              spread: 55,
              origin: { x: 1, y: 0 },
              colors: ['#ffffff', '#a5d8ff', '#ffd43b'],
              gravity: 0.4,
              drift: -0.5,
              ticks: 200,
              zIndex: 0
            });
          }, 300);
          
          return;
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
      className="h-screen w-full bg-gradient-to-b from-black to-[#1a2642] flex items-center justify-center p-6 cursor-pointer relative overflow-hidden"
      onClick={handleClick}
      data-testid="button-enter-app"
    >
      {/* Twinkling stars */}
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-white animate-twinkle"
          style={{
            top: `${star.top}%`,
            left: `${star.left}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animationDelay: `${star.delay}s`,
            animationDuration: `${star.duration}s`,
          }}
        />
      ))}

      <div 
        className={`text-center space-y-6 transition-all duration-1000 ${
          showText ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <h1 
          className="text-4xl md:text-5xl font-bold text-primary mb-4"
          data-testid="text-title"
        >
          Happy Birthday!!
          <br />
          Div Papa
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
