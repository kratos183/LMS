"use client";

import React, { useState, useEffect } from "react";
import NextLink from 'next/link';
import Navbar from '../component/navbar';
import { supabase } from '@/lib/supabase';
import { Course } from '@/types';

export default function CourseListingPage() {
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [currentPage, setCurrentPage] = useState(1);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const coursesPerPage = 6;

  useEffect(() => {
    const fetchCourses = async () => {
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });

      if (coursesError) {
        console.error('Error fetching courses:', coursesError);
        setLoading(false);
        return;
      }

      try {
        // Fetch all lessons to match with courses client-side
        const { data: lessonsData, error: lessonsError } = await supabase
          .from('lessons')
          .select('id, course_id');

        if (lessonsError) {
          // If lessons table doesn't exist yet, fallback gracefully
          setCourses(coursesData || []);
        } else {
          const mapped = (coursesData || []).map(course => ({
            ...course,
            lessons: (lessonsData || []).filter(l => l.course_id === course.id)
          }));
          setCourses(mapped);
        }
      } catch {
        setCourses(coursesData || []);
      }
      setLoading(false);
    };

    fetchCourses();
  }, []);

  const filteredCourses = courses.filter((course) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      course.title?.toLowerCase().includes(q) ||
      course.instructor?.toLowerCase().includes(q) ||
      course.category?.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);
  const startIndex = (currentPage - 1) * coursesPerPage;
  const paginatedCourses = filteredCourses.slice(startIndex, startIndex + coursesPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
    <div className="flex text-yellow-400 text-xs">
      {[...Array(5)].map((_, i) => (
        <svg key={i} className={`w-3 h-3 ${i < rating ? "fill-current" : "text-gray-300 fill-current"}`} viewBox="0 0 20 20">
          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
        </svg>
      ))}
    </div>
  );

  const CourseMetaItem: React.FC<{ icon: React.ReactNode; text: string; colorClass?: string }> = ({ icon, text, colorClass = "text-gray-500" }) => (
    <span className={`flex items-center gap-1.5 text-xs ${colorClass}`}>
      {icon}
      {text}
    </span>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-white font-sans text-gray-800">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <p className="text-center text-gray-500">Loading courses...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans text-gray-800">
      
      <Navbar />

      {/* Breadcrumbs */}
      <div className="bg-gray-50 py-3 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-xs text-gray-500 flex items-center gap-2">
          <span>Homepage</span>
          <span>&gt;</span>
          <span>Course</span>
          <span>&gt;</span>
          <span className="text-gray-800 truncate max-w-[200px]">The Ultimate Guide To The Best WordPress LMS Plugin</span>
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* LEFT COLUMN: COURSES */}
          <div className="lg:w-3/4">
            
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <h1 className="text-2xl font-bold text-gray-900">All Courses</h1>
              
              <div className="flex items-center gap-4 w-full sm:w-auto">
                {/* Search */}
                <div className="relative flex-1 sm:flex-none">
                  <input 
                    type="text" 
                    placeholder="Search..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full sm:w-48 pl-4 pr-10 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-orange-500 transition"
                  />
                  <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  </button>
                </div>

                {/* View Toggle Buttons */}
                <div className="flex border border-gray-200 rounded-md overflow-hidden">
                  <button 
                    onClick={() => setViewMode("list")}
                    className={`p-2 transition ${viewMode === "list" ? "bg-orange-500 text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
                    title="List View"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                  </button>
                  <button 
                    onClick={() => setViewMode("grid")}
                    className={`p-2 transition border-l border-gray-200 ${viewMode === "grid" ? "bg-orange-500 text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
                    title="Grid View"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                  </button>
                </div>
              </div>
            </div>

            {courses.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No courses available yet.</p>
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No courses match your search.</p>
              </div>
            ) : (
              <>
                {/* Course List/Grid Container */}
                <div className={`
                  ${viewMode === "list" 
                    ? "flex flex-col gap-6" 
                    : "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"}
                `}>
                  {paginatedCourses.map((course) => (
                    <div 
                      key={course.id} 
                      className={`
                        bg-white border border-gray-100 rounded-lg overflow-hidden hover:shadow-lg transition duration-300 group
                        ${viewMode === "list" ? "flex flex-col sm:flex-row" : "flex flex-col"}
                      `}
                    >
                      {/* Image Section */}
                      <div className={`relative overflow-hidden ${viewMode === "list" ? "sm:w-1/3 h-48 sm:h-auto" : "w-full h-48"}`}>
                        <img 
                          src={course.image || course.thumbnail_url || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=400&fit=crop"} 
                          alt={course.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                        <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm text-white text-xs font-medium px-3 py-1 rounded-full">
                          {course.category}
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className={`p-5 flex flex-col justify-between ${viewMode === "list" ? "sm:w-2/3" : "flex-1"}`}>
                        <div>
                          <div className="text-xs text-gray-500 mb-2">by <span className="text-gray-800 font-medium">{course.instructor}</span></div>
                          <h3 className="font-bold text-gray-900 mb-3 line-clamp-2 leading-snug hover:text-orange-500 transition cursor-pointer">
                            {course.title}
                          </h3>
                          
                          {/* Meta Info Row */}
                          <div className="flex flex-wrap items-center gap-4 mb-4">
                            <CourseMetaItem 
                              icon={<svg className="w-3.5 h-3.5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                              text={course.duration || "Self-paced"}
                            />
                            <CourseMetaItem 
                              icon={<svg className="w-3.5 h-3.5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                              text={`${course.students || 0} Students`}
                            />
                            <CourseMetaItem 
                              icon={<svg className="w-3.5 h-3.5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
                              text={course.level || "Beginner"}
                            />
                             <CourseMetaItem 
                              icon={<svg className="w-3.5 h-3.5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>}
                              text={`${Array.isArray(course.lessons) ? course.lessons.length : (course.lessons || 0)} Lessons`}
                            />
                          </div>
                        </div>

                        {/* Footer of Card */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-50 mt-auto">
                          <div className="flex items-center gap-2">
                            {course.original_price && <span className="text-xs text-gray-400 line-through">{course.original_price}</span>}
                            <span className={`font-bold ${(!course.price || course.price === 0) ? "text-green-600" : "text-gray-900"}`}>
                              {(!course.price || course.price === 0) ? "Free" : `₹${course.price}`}
                            </span>
                          </div>
                          <NextLink href={`/courses/${course.id}`} className="text-orange-500 font-medium text-sm hover:underline">View More</NextLink>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-12 flex justify-center items-center gap-2">
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:border-orange-500 hover:text-orange-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      if (
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={page}
                            onClick={() => goToPage(page)}
                            className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition ${
                              currentPage === page
                                ? "bg-black text-white"
                                : "text-gray-600 hover:bg-gray-100"
                            }`}
                          >
                            {page}
                          </button>
                        );
                      } else if (
                        page === currentPage - 2 ||
                        page === currentPage + 2
                      ) {
                        return (
                          <span key={page} className="text-gray-400 text-sm">...</span>
                        );
                      }
                      return null;
                    })}

                    <button
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:border-orange-500 hover:text-orange-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* RIGHT COLUMN: SIDEBAR FILTERS */}
          <aside className="lg:w-1/4 space-y-8">
            
            {/* Course Category */}
            <div>
              <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide">Course Category</h3>
              <ul className="space-y-3 text-sm text-gray-600">
                {["Commercial", "Office", "Shop", "Educate", "Academy", "Single family home", "Studio", "University"].map((cat, i) => (
                  <li key={i} className="flex justify-between items-center group cursor-pointer">
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 border rounded-sm flex items-center justify-center ${i === 2 ? "bg-orange-500 border-orange-500" : "border-gray-300 group-hover:border-orange-500"}`}>
                        {i === 2 && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      <span className={i === 2 ? "text-orange-500 font-medium" : "group-hover:text-orange-500 transition"}>{cat}</span>
                    </div>
                    <span className="text-xs text-gray-400">15</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Instructors */}
            <div>
              <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide">Instructors</h3>
              <ul className="space-y-3 text-sm text-gray-600">
                {["Kenny White", "John Doe"].map((inst, i) => (
                  <li key={i} className="flex justify-between items-center group cursor-pointer">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border border-gray-300 rounded-sm group-hover:border-orange-500"></div>
                      <span className="group-hover:text-orange-500 transition">{inst}</span>
                    </div>
                    <span className="text-xs text-gray-400">15</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Price */}
            <div>
              <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide">Price</h3>
              <ul className="space-y-3 text-sm text-gray-600">
                {[
                  { label: "All", checked: true },
                  { label: "Free", checked: false },
                  { label: "Paid", checked: false }
                ].map((item, i) => (
                  <li key={i} className="flex justify-between items-center group cursor-pointer">
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 border rounded-sm flex items-center justify-center ${item.checked ? "bg-orange-500 border-orange-500" : "border-gray-300 group-hover:border-orange-500"}`}>
                        {item.checked && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      <span className={item.checked ? "text-orange-500 font-medium" : "group-hover:text-orange-500 transition"}>{item.label}</span>
                    </div>
                    <span className="text-xs text-gray-400">15</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Review */}
            <div>
              <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide">Review</h3>
              <ul className="space-y-3 text-sm text-gray-600">
                {[5, 4, 3, 2, 1].map((stars, i) => (
                  <li key={i} className="flex justify-between items-center group cursor-pointer">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border border-gray-300 rounded-sm group-hover:border-orange-500"></div>
                      <StarRating rating={stars} />
                    </div>
                    <span className="text-xs text-gray-400">(1,025)</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Level */}
            <div>
              <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide">Level</h3>
              <ul className="space-y-3 text-sm text-gray-600">
                {["All levels", "Beginner", "Intermediate", "Expert"].map((lvl, i) => (
                  <li key={i} className="flex justify-between items-center group cursor-pointer">
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 border rounded-sm flex items-center justify-center ${i === 2 ? "bg-orange-500 border-orange-500" : "border-gray-300 group-hover:border-orange-500"}`}>
                        {i === 2 && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      <span className={i === 2 ? "text-orange-500 font-medium" : "group-hover:text-orange-500 transition"}>{lvl}</span>
                    </div>
                    <span className="text-xs text-gray-400">15</span>
                  </li>
                ))}
              </ul>
            </div>

          </aside>
        </div>
      </main>

      {/* --- FOOTER --- */}
      <footer className="bg-gray-50 border-t border-gray-200 pt-16 pb-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            
            {/* Brand Info */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center text-white font-bold">M</div>
                <span className="text-xl font-bold tracking-tight">EduPress</span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed mb-6">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
            </div>

            {/* Get Help */}
            <div>
              <h4 className="font-bold text-gray-900 mb-6 text-sm uppercase tracking-wide">Get Help</h4>
              <ul className="space-y-3 text-sm text-gray-500">
                <li><a href="#" className="hover:text-orange-500 transition">Contact Us</a></li>
                <li><a href="#" className="hover:text-orange-500 transition">Latest Articles</a></li>
                <li><a href="#" className="hover:text-orange-500 transition">FAQ</a></li>
              </ul>
            </div>

            {/* Programs */}
            <div>
              <h4 className="font-bold text-gray-900 mb-6 text-sm uppercase tracking-wide">Programs</h4>
              <ul className="space-y-3 text-sm text-gray-500">
                <li><a href="#" className="hover:text-orange-500 transition">Art & Design</a></li>
                <li><a href="#" className="text-orange-500 font-medium">Business</a></li>
                <li><a href="#" className="hover:text-orange-500 transition">IT & Software</a></li>
                <li><a href="#" className="hover:text-orange-500 transition">Languages</a></li>
                <li><a href="#" className="hover:text-orange-500 transition">Programming</a></li>
              </ul>
            </div>

            {/* Contact Us */}
            <div>
              <h4 className="font-bold text-gray-900 mb-6 text-sm uppercase tracking-wide">Contact Us</h4>
              <ul className="space-y-3 text-sm text-gray-500">
                <li className="leading-relaxed">Address: 2321 New Design Str, Lorem Ipsum10<br/>Hudson Yards, USA</li>
                <li>Tel: + (123) 2500-567-8988</li>
                <li>Mail: supportlms@gmail.com</li>
                <li className="flex gap-3 mt-4">
                  {["f", "P", "X", "in", "Y"].map((social, i) => (
                    <a key={i} href="#" className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:bg-orange-500 hover:text-white transition text-xs font-bold">
                      {social}
                    </a>
                  ))}
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-400">Copyright © 2024 LearnPress LMS | Powered by ThimPress</p>
            <button className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white hover:bg-orange-500 transition shadow-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
