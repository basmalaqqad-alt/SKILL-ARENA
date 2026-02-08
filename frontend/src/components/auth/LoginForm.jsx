import React from 'react';

const LoginForm = ({ onSwitch, onLogin }) => {
  return (
    /* Glassmorphism container to match the sleek UI */
    <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 animate-fade-in">
      {/* Brand Identity - SKILLARENA */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-black italic tracking-tighter text-[#FACA07]">
          SKILL<span className="text-[#8A2D2E]">ARENA</span>
        </h1>
        <p className="text-[10px] font-bold text-gray-400 tracking-[0.3em] mt-1 uppercase">
          Play • Learn • Earn
        </p>
      </div>

      {/* Auth Toggle Tabs - Matching your Figma design */}
      <div className="flex justify-center gap-2 mb-8">
        <button className="px-6 py-1 text-xs font-bold rounded-full bg-[#FACA07] text-[#8A2D2E]">
          Log in
        </button>
        <button
          onClick={onSwitch}
          className="px-6 py-1 text-xs font-bold rounded-full border border-[#FACA07] text-gray-400 hover:bg-[#FFF7D1] transition-colors"
        >
          Sign up
        </button>
      </div>

      {/* Login Fields */}
      <div className="space-y-5">
        <div className="flex flex-col">
          <label className="text-[10px] font-bold text-[#8A2D2E] mb-1.5 ml-1 uppercase">
            Email
          </label>
          <input
            type="email"
            placeholder="hero@arena.com"
            className="w-full p-3 rounded-xl bg-gray-50 border border-gray-100 outline-none focus:ring-2 ring-[#FACA07] transition-all"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-[10px] font-bold text-[#8A2D2E] mb-1.5 ml-1 uppercase">
            Password
          </label>
          <input
            type="password"
            placeholder="••••••••"
            className="w-full p-3 rounded-xl bg-gray-50 border border-gray-100 outline-none focus:ring-2 ring-[#FACA07] transition-all"
          />
          <span className="text-[10px] text-right mt-2 text-gray-400 cursor-pointer hover:text-[#8A2D2E] transition-colors">
            Forgot password?
          </span>
        </div>
      </div>

      {/* Main Action Button - Royal Maroon */}
      <button
        onClick={onLogin}
        className="w-full mt-8 py-4 bg-[#8A2D2E] text-white font-black rounded-xl shadow-lg hover:opacity-90 active:scale-95 transition-all tracking-widest text-lg"
      >
        LOG IN
      </button>

      {/* Footer Switch */}
      <p className="mt-6 text-center text-[10px] font-bold text-gray-400 uppercase">
        Don't have an account?{' '}
        <span
          onClick={onSwitch}
          className="text-[#8A2D2E] cursor-pointer hover:underline ml-1"
        >
          Sign up for free
        </span>
      </p>
    </div>
  );
};

export default LoginForm;
