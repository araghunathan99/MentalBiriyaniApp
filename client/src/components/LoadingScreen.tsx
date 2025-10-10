import biriyaniImage from "@assets/stock_images/delicious_artistic_b_94775806.jpg";

export default function LoadingScreen() {
  return (
    <div className="h-screen w-full bg-gradient-to-b from-black to-[#1a2642] flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Biriyani Image Container */}
      <div className="relative mb-8 animate-fade-in">
        <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full overflow-hidden border-4 border-[#FFD700] shadow-2xl">
          <img 
            src={biriyaniImage} 
            alt="Delicious Biriyani" 
            className="w-full h-full object-cover"
          />
          {/* Golden glow effect */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>
        
        {/* Spinning golden ring */}
        <div className="absolute inset-0 animate-spin-slow">
          <div className="absolute inset-0 border-4 border-transparent border-t-[#FFD700] rounded-full opacity-60" />
        </div>
      </div>

      {/* Loading Text */}
      <div className="text-center space-y-4 animate-fade-in-delay">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">
          Mental Biriyani
        </h2>
        <p className="text-base md:text-lg font-semibold italic" style={{ color: '#FFD700' }}>
          Preparing your nostalgia ride...
        </p>
        
        {/* Loading spinner */}
        <div className="flex justify-center mt-6">
          <div className="animate-spin rounded-full h-8 w-8 border-3 border-[#FFD700] border-t-transparent" />
        </div>
      </div>

      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-[#FFD700] opacity-20 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 6 + 2}px`,
              height: `${Math.random() * 6 + 2}px`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${Math.random() * 3 + 2}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
