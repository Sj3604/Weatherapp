import React from 'react';
import { Wind, Search } from 'lucide-react';

const LandingPage = ({ onStart }) => {
  return (
    <div className="flex-grow flex flex-col items-center justify-center w-full z-10 px-6">
      <div className="glass-panel p-10 md:p-16 rounded-[3rem] flex flex-col items-center text-center max-w-2xl w-full relative overflow-hidden backdrop-blur-xl border border-[var(--border-glass)] shadow-2xl">
        
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--primary)] rounded-full blur-[100px] opacity-20 -mr-20 -mt-20 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500 rounded-full blur-[100px] opacity-20 -ml-20 -mb-20 pointer-events-none"></div>

        {/* Icon & Title */}
        <div className="flex justify-center mb-6">
          <div className="p-5 bg-[var(--bg-dark)] rounded-3xl border border-[var(--border-glass)] shadow-inner">
            <Wind className="w-16 h-16 text-[var(--primary)] animate-pulse-soft" />
          </div>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[var(--primary)] via-purple-400 to-indigo-400 tracking-tight">
          RainPulse
        </h1>
        
        <p className="text-xl md:text-2xl text-[var(--text-muted)] mb-12 font-light max-w-lg leading-relaxed">
          Advanced atmospheric insights powered by wind direction and humidity for smarter rain prediction
        </p>

        {/* CTA Button */}
        <button 
          onClick={onStart}
          className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 text-lg font-bold text-white transition-all duration-300 ease-in-out bg-[var(--primary)] rounded-full hover:bg-purple-600 hover:scale-[1.02] shadow-[0_0_40px_rgba(168,85,247,0.4)] hover:shadow-[0_0_60px_rgba(168,85,247,0.6)] focus:outline-none focus:ring-4 focus:ring-purple-500/50"
        >
          <span>Click Here to Search</span>
          <Search className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          
          {/* Button Shine Effect */}
          <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
            <div className="absolute top-0 left-[-100%] w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-[-20deg] group-hover:left-[200%] transition-all duration-1000 ease-out"></div>
          </div>
        </button>

      </div>
    </div>
  );
};

export default LandingPage;
