import React from 'react';
import AISuggestions from '../courses/AISuggestions';
import CourseCard from '../courses/CourseCard';

const CoursesTab = () => {
  // Mock data for your courses
  const courses = [
    { id: 1, title: 'UI/UX FOUNDATIONS' },
    { id: 2, title: 'REACT FOR HEROES' },
    { id: 3, title: 'GAME LOGIC 101' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Search & AI Section */}
      <AISuggestions />

      {/* Filter Buttons from your design */}
      <div className="flex flex-wrap gap-2">
        {[
          'All Tutors',
          'Trusted Tutors',
          'All Courses',
          'Free Courses',
          'Paid Courses',
        ].map((filter) => (
          <button
            key={filter}
            className="px-4 py-1.5 bg-[#FACA07] text-[#8A2D2E] text-[10px] font-black rounded-full hover:opacity-80 transition-all shadow-sm"
          >
            {filter.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {courses.map((course) => (
          <CourseCard key={course.id} title={course.title} />
        ))}
      </div>
    </div>
  );
};

export default CoursesTab;
