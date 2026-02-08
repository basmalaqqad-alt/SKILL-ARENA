import React, { useState } from 'react';

const SignupForm = ({ onSwitch }) => {
  const [role, setRole] = useState('learner'); // Default role is learner

  return (
    <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-100 animate-fade-in">
      {/* Brand Header */}
      <div className="text-center mb-6">
        <h1 className="text-4xl font-black italic text-[#FACA07]">
          SKILL<span className="text-[#8A2D2E]">ARENA</span>
        </h1>
      </div>

      {/* Auth Toggle Tabs */}
      <div className="flex justify-center gap-2 mb-8">
        <button
          onClick={onSwitch}
          className="px-6 py-1 text-xs font-bold rounded-full border border-[#FACA07] text-gray-400"
        >
          Log in
        </button>
        <button className="px-6 py-1 text-xs font-bold rounded-full bg-[#FACA07] text-[#8A2D2E]">
          Sign up
        </button>
      </div>

      <div className="space-y-4">
        {/* Role Selection */}
        <div className="flex flex-col gap-2 mb-4">
          <label className="text-[10px] font-black text-[#8A2D2E] uppercase ml-1">
            Select Your Path
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setRole('learner')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold border-2 transition-all ${role === 'learner' ? 'bg-[#8A2D2E] text-white border-[#8A2D2E]' : 'border-gray-100 text-gray-400'}`}
            >
              LEARNER
            </button>
            <button
              onClick={() => setRole('tutor')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold border-2 transition-all ${role === 'tutor' ? 'bg-[#8A2D2E] text-white border-[#8A2D2E]' : 'border-gray-100 text-gray-400'}`}
            >
              TUTOR
            </button>
          </div>
        </div>

        {/* Basic Fields */}
        <input
          type="text"
          placeholder="Hero Nickname"
          className="w-full p-3 rounded-xl bg-gray-50 border border-gray-100 outline-none focus:ring-2 ring-[#FACA07]"
        />
        <input
          type="email"
          placeholder="Email Address"
          className="w-full p-3 rounded-xl bg-gray-50 border border-gray-100 outline-none focus:ring-2 ring-[#FACA07]"
        />

        {/* Conditional Field: Only for Tutors */}
        {role === 'tutor' && (
          <div className="p-4 bg-[#FFF7D1]/50 border-2 border-dashed border-[#FACA07] rounded-xl animate-slide-down">
            <label className="text-[9px] font-black text-[#8A2D2E] uppercase block mb-2">
              Upload Certificate to become Trusted 🛡️
            </label>
            <input
              type="file"
              className="text-[10px] text-gray-500 file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-[#8A2D2E] file:text-white hover:file:opacity-80"
            />
          </div>
        )}

        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 rounded-xl bg-gray-50 border border-gray-100 outline-none focus:ring-2 ring-[#FACA07]"
        />
      </div>

      <button className="w-full mt-8 py-4 bg-[#8A2D2E] text-white font-black rounded-xl shadow-lg hover:opacity-90 active:scale-95 transition-all tracking-widest uppercase">
        Join the Arena
      </button>
    </div>
  );
};

export default SignupForm;
