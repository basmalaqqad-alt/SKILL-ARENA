import React from 'react';

const AboutTab = () => {
  return (
    <div className="flex flex-col items-center animate-fade-in space-y-12">
      {/* Play Learn Earn Icons Section */}
      <div className="flex justify-around w-full">
        <div className="flex flex-col items-center group">
          <span className="text-5xl mb-3 drop-shadow-md group-hover:scale-110 transition-transform">
            🎲
          </span>
          <h3 className="font-black text-[#FACA07] text-2xl tracking-tighter italic">
            PLAY
          </h3>
        </div>
        <div className="flex flex-col items-center group">
          <span className="text-5xl mb-3 drop-shadow-md group-hover:scale-110 transition-transform">
            💻
          </span>
          <h3 className="font-black text-[#FACA07] text-2xl tracking-tighter italic">
            LEARN
          </h3>
        </div>
        <div className="flex flex-col items-center group">
          <span className="text-5xl mb-3 drop-shadow-md group-hover:scale-110 transition-transform">
            🏆
          </span>
          <h3 className="font-black text-[#FACA07] text-2xl tracking-tighter italic">
            EARN
          </h3>
        </div>
      </div>

      {/* Point System List from your Figma Screenshot */}
      <div className="w-full max-w-2xl space-y-4">
        {[
          {
            text: 'Earning one point for each course completion',
            color: 'bg-[#FACA07]',
            icon: 'XP',
          },
          { text: 'Earning 5 points', badge: '5', color: 'bg-[#8A2D2E]' },
          { text: 'Earning 20 points', badge: '20', color: 'bg-[#8A2D2E]' },
          { text: 'Earning 50 points', badge: '50', color: 'bg-[#FACA07]' },
          { text: 'Earning 100 points', badge: '100', color: 'bg-[#FACA07]' },
        ].map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-6 bg-[#FFF7D1] p-5 rounded-2xl border border-[#FACA07]/20 shadow-sm"
          >
            <div
              className={`w-14 h-14 ${item.color} rounded-xl flex items-center justify-center font-black text-white shadow-md`}
            >
              {item.icon || (
                <span className="text-[10px] uppercase">
                  Badge {item.badge}
                </span>
              )}
            </div>
            <p className="font-black text-[#8A2D2E] text-sm uppercase tracking-tight">
              {item.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AboutTab;
