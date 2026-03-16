import React, { useEffect, useState } from 'react'
import WeatherDashboard from './components/WeatherDashboard'
import LandingPage from './components/LandingPage'

function AnimatedBackground() {
  const [elements, setElements] = useState({ winds: [], sparkles: [], clouds: [] });

  useEffect(() => {
    // Generate random wind lines
    const winds = Array.from({ length: 15 }).map((_, i) => ({
      id: `wind-${i}`,
      top: `${Math.random() * 100}%`,
      left: `${(Math.random() * 100) - 50}%`,
      width: `${Math.random() * 200 + 50}px`,
      height: `${Math.random() * 2 + 1}px`,
      duration: `${Math.random() * 10 + 5}s`,
      delay: `${Math.random() * 5}s`,
      opacity: Math.random() * 0.5 + 0.1
    }));

    // Generate random sparkles
    const sparkles = Array.from({ length: 30 }).map((_, i) => ({
      id: `sparkle-${i}`,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: `${Math.random() * 4 + 2}px`,
      duration: `${Math.random() * 4 + 2}s`,
      delay: `${Math.random() * 5}s`
    }));
    // Generate random slow clouds
    const clouds = Array.from({ length: 6 }).map((_, i) => ({
      id: `cloud-${i}`,
      top: `${Math.random() * 40}%`, // Keep clouds in the upper 40%
      width: `${Math.random() * 100 + 100}px`,
      duration: `${Math.random() * 60 + 40}s`, // Very slow
      delay: `${Math.random() * -60}s`, // Start staggered
      opacity: Math.random() * 0.3 + 0.1
    }));

    setElements({ winds, sparkles, clouds });
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* dynamic blur orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[var(--orb-1)] blur-[120px] transition-colors duration-1000" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[var(--orb-2)] blur-[120px] transition-colors duration-1000" />
      
      {/* Wind Lines */}
      {elements.winds.map(wind => (
        <div
          key={wind.id}
          className="absolute rounded-full animate-wind"
          style={{
            top: wind.top,
            left: wind.left,
            width: wind.width,
            height: wind.height,
            opacity: wind.opacity,
            animationDuration: wind.duration,
            animationDelay: wind.delay,
            transform: 'rotate(15deg)'
          }}
        />
      ))}

      {/* Sparkles */}
      {elements.sparkles.map(sparkle => (
        <div
          key={sparkle.id}
          className="absolute rounded-full animate-sparkle"
          style={{
            top: sparkle.top,
            left: sparkle.left,
            width: sparkle.size,
            height: sparkle.size,
            animationDuration: sparkle.duration,
            animationDelay: sparkle.delay
          }}
        />
      ))}

      {/* Clouds */}
      {elements.clouds.map(cloud => (
        <div
          key={cloud.id}
          className="absolute animate-cloud"
          style={{
            top: cloud.top,
            width: cloud.width,
            height: `${parseFloat(cloud.width) * 0.4}px`, // Proportional height
            opacity: cloud.opacity,
            animationDuration: cloud.duration,
            animationDelay: cloud.delay,
            background: 'var(--text-main)', // Inherits the theme brightness
            borderRadius: '100px',
            filter: 'blur(10px)'
          }}
        />
      ))}
    </div>
  );
}

function CelestialBody({ localHour }) {
  // Determine if it is day or night
  const isDay = localHour >= 6 && localHour < 18;
  
  // Calculate percentage of the cycle
  // For Day (6 to 18): 6 = 0%, 12 = 50%, 18 = 100%
  // For Night (18 to 6): 18 = 0%, 24/0 = 50%, 6 = 100%
  let cyclePercentage = 0;
  if (isDay) {
    cyclePercentage = ((localHour - 6) / 12) * 100;
  } else {
    // Night calculation
    const adjustedHour = localHour >= 18 ? localHour - 18 : localHour + 6;
    cyclePercentage = (adjustedHour / 12) * 100;
  }

  // Calculate arc: Path across screen (Left (0) to Right (100))
  // We use Parabola for altitude: max height at 50%
  // y = a * (x - h)^2 + k. Peak at x=50, y=20. Base at x=0/100, y=120
  // normalized x = cyclePercentage
  const x = cyclePercentage; 
  // Custom gravity curve (base 120vh so it hides below horizon, peaks at 15vh)
  const y = 120 - (Math.sin((cyclePercentage / 100) * Math.PI) * 105);

  return (
    <div 
      className="absolute z-0 transition-all duration-1000 ease-in-out"
      style={{
        left: `${x}%`,
        top: `${y}vh`,
        transform: 'translate(-50%, -50%)',
        opacity: Math.sin((cyclePercentage / 100) * Math.PI) // Fade out at horizons
      }}
    >
      {isDay ? (
        <div className="relative flex items-center justify-center animate-spin-slow">
          <div className="absolute w-48 h-48 bg-yellow-400 rounded-full blur-[60px] opacity-60"></div>
          <div className="absolute w-32 h-32 bg-orange-300 rounded-full blur-[30px] opacity-80"></div>
          <div className="w-24 h-24 bg-gradient-to-tr from-yellow-300 to-yellow-100 rounded-full shadow-[0_0_50px_rgba(253,224,71,0.8)] z-10"></div>
        </div>
      ) : (
        <div className="relative flex items-center justify-center">
          <div className="absolute w-48 h-48 bg-blue-400 rounded-full blur-[60px] opacity-30"></div>
          <div className="absolute w-32 h-32 bg-slate-300 rounded-full blur-[20px] opacity-40"></div>
          <div className="w-20 h-20 bg-slate-100 rounded-full shadow-[0_0_40px_rgba(226,232,240,0.6)] z-10 relative overflow-hidden">
            {/* Moon craters */}
            <div className="absolute top-4 left-4 w-4 h-4 rounded-full bg-slate-200/50 blur-[1px]"></div>
            <div className="absolute bottom-6 right-8 w-6 h-6 rounded-full bg-slate-200/40 blur-[1px]"></div>
            <div className="absolute top-10 right-4 w-3 h-3 rounded-full bg-slate-200/60 blur-[1px]"></div>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  const [themeClass, setThemeClass] = useState('theme-night'); // Default theme
  const [currentLocalHour, setCurrentLocalHour] = useState(new Date().getHours()); 
  const [isStarted, setIsStarted] = useState(false);

  const handleTimeChange = (localHour) => {
    setCurrentLocalHour(localHour);
    if (localHour >= 6 && localHour < 12) setThemeClass('theme-morning');
    else if (localHour >= 12 && localHour < 18) setThemeClass('theme-afternoon');
    else if (localHour >= 18 && localHour < 21) setThemeClass('theme-evening');
    else setThemeClass('theme-night');
  };

  return (
    <div className={`min-h-screen ${themeClass} bg-[var(--bg-dark)] text-[var(--text-main)] selection:bg-[var(--primary)]/30 relative flex flex-col items-center transition-colors duration-1000 overflow-hidden`}>
      <AnimatedBackground />
      <CelestialBody localHour={currentLocalHour} />
      
      <div className="relative z-10 w-full flex-grow flex flex-col justify-center">
        {!isStarted ? (
          <LandingPage onStart={() => setIsStarted(true)} />
        ) : (
          <WeatherDashboard onTimeChange={handleTimeChange} />
        )}
      </div>
      
      {/* Footer */}
      <footer className="relative z-10 w-full text-center py-6 text-[var(--text-muted)] text-sm opacity-80 mt-auto">
        Made by Shagun Jain &copy; All rights reserved
      </footer>
    </div>
  )
}

export default App
