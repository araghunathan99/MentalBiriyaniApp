import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import confetti from "canvas-confetti";
import nightskyImg from "@assets/stock_images/nightsky.jpg";

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
    // Mark as visited (persists across refreshes with localStorage)
    try {
      localStorage.setItem('mental-biriyani-visited', 'true');
      console.log('✅ Landing: Visited flag set in localStorage, navigating to /home');
    } catch (error) {
      console.error('❌ Landing: Failed to set localStorage (very rare):', error);
    }
    
    // iOS Safari Private Mode fallback: set global flag
    (window as any).__fromLanding = true;
    console.log('✅ Landing: Set global flag for fallback');
    
    setLocation("/home");
  };

  return (
    <div 
      className="h-screen w-full flex items-center justify-center p-6 cursor-pointer relative overflow-hidden"
      onClick={handleClick}
      data-testid="button-enter-app"
      style={{
        backgroundImage: `url(${nightskyImg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Dark overlay for better text contrast */}
      <div className="absolute inset-0 bg-black/30" />
      
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
        className={`text-center space-y-6 transition-all duration-1000 relative z-10 ${
          showText ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <h1 
          className="text-4xl md:text-5xl font-bold mb-4"
          style={{ 
            color: '#00BFFF',
            fontFamily: "'Pacifico', 'Brush Script MT', cursive"
          }}
          data-testid="text-title"
        >
          Happy Birthday!!
          <br />
          Divs
        </h1>
        <p className="text-lg md:text-xl font-semibold italic" style={{ color: '#FFD700' }}>
          Mental Biriyani - A curated nostalgia ride that is like biriyani for the soul! #DD40
        </p>
        <p 
          className="text-lg md:text-xl text-foreground max-w-2xl leading-relaxed"
          data-testid="text-message"
        >
          Hope this bundle of memories shows how much we all love you and how far you have come along. Let's keep the good times going :)
        </p>
        <p className="text-sm mt-8 animate-pulse" style={{ color: '#FFD700' }}>
          Tap anywhere to continue
        </p>
      </div>
    </div>
  );
}
