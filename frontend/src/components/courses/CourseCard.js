import React from 'react';

const CourseCard = ({ title }) => {
  return (
    <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
      <div className="aspect-video bg-gray-100 rounded-lg mb-3 flex items-center justify-center text-gray-400">
        {/* Course Thumbnail Placeholder */}
        <svg
          className="w-12 h-12"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.587-1.587a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
      <h3 className="font-bold text-[#8A2D2E] px-2 pb-2 uppercase text-sm tracking-wide">
        {title || 'Course Title'}
      </h3>
      <button className="w-full py-2 bg-[#FACA07] text-[#8A2D2E] text-xs font-black rounded-lg hover:bg-[#fbd642]">
        ENROLL
      </button>
    </div>
  );
};

export default CourseCard;
