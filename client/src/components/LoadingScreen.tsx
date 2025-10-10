import biriyaniImage from "@assets/stock_images/biriyani.jpg";

export default function LoadingScreen() {
  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      {/* Biriyani image - scaled to fit without stretching */}
      <img 
        src={biriyaniImage} 
        alt="Delicious Biriyani" 
        className="absolute inset-0 w-full h-full object-contain"
      />
      
      {/* Dark gradient overlay at bottom for text visibility */}
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black via-black/60 to-transparent pointer-events-none" />

      {/* Content overlay - positioned at bottom */}
      <div className="relative h-full flex flex-col items-center justify-end pb-20 p-6">
        {/* Loading Text */}
        <div className="text-center space-y-4 animate-fade-in-delay">
          <h2 className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg">
            Mental Biriyani
          </h2>
          <p className="text-base md:text-lg font-semibold italic text-[#FFD700] drop-shadow-lg">
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
    </div>
  );
}
