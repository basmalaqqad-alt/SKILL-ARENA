import React from 'react';

// استلام الأوسمة (badges) كـ props من الملف الرئيسي
const BadgesSection = ({ badges }) => {
  // If no badges are found yet, show a placeholder
  if (!badges || badges.length === 0) {
    return <p className="text-center text-gray-400 text-xs">No badges earned yet, Hero!</p>;
  }

  return (
    <div className="grid grid-cols-4 gap-4 py-4">
      {/* عمل تكرار (Map) لعرض كل وسام قادم من الباك إند */}
      {badges.map((badge) => (
        <div key={badge.id} className="flex flex-col items-center">
          <div className="w-16 h-16 bg-[#FACA07] rounded-full flex items-center justify-center shadow-lg border-4 border-white transition-transform hover:scale-110">
            {/* عرض الأيقونة بناءً على النوع */}
            <span className="text-white font-black text-xl">
              {badge.icon === 'shield' ? '🛡️' : badge.icon === 'zap' ? '⚡' : '🏆'}
            </span>
          </div>
          <span className="text-[10px] mt-2 font-bold text-gray-500 uppercase tracking-tighter text-center">
            {badge.name}
          </span>
        </div>
      ))}
    </div>
  );
};

export default BadgesSection;