import React from 'react';
import { Box, Typography } from '@mui/material';
import { Sparkles } from 'lucide-react';

/**
 * LogoSection - مكون هوية المنصة
 * عسومه: هذا الكود مخصص ليوضع داخل ملف LogoSection.jsx
 * يعرض شعار SkillArena والتاج لاين بطريقة جذابة ومودرن.
 */

const LogoSection = () => {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        mb: 4, 
        position: 'relative', 
        zIndex: 2 
      }}
    >
      {/* عرض صورة اللوغو الأصلية من مجلد public */}
      <Box 
        component="img" 
        src="/logo.png" 
        alt="SkillArena Logo" 
        sx={{ 
          height: 140, // حجم مناسب للظهور بوضوح
          mb: 2, 
          filter: 'drop-shadow(0px 8px 12px rgba(138, 45, 46, 0.2))', // ظل ناعم لإبراز الصورة
          transition: 'transform 0.3s ease',
          '&:hover': { transform: 'scale(1.05)' } // تأثير تكبير خفيف عند مرور الماوس
        }} 
        onError={(e) => { 
          // في حال عدم توفر الصورة يظهر نص بديل منسق
          e.target.src = 'https://placehold.co/200x200/faca07/8a2d2e?text=SkillArena'; 
        }}
      />

      {/* التاج لاين الموسيقي بالألوان المارونية */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Sparkles size={18} color="#8a2d2e" fill="#8a2d2e" />
        <Typography 
          variant="subtitle2" 
          sx={{ 
            color: '#8a2d2e', 
            fontWeight: 900, 
            letterSpacing: 4, 
            textTransform: 'uppercase',
            fontSize: { xs: '0.75rem', sm: '0.85rem' }
          }}
        >
          Play • Learn • Earn
        </Typography>
        <Sparkles size={18} color="#8a2d2e" fill="#8a2d2e" />
      </Box>
    </Box>
  );
};

export default LogoSection;