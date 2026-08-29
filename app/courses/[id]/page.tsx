'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '../../component/navbar';
import { supabase } from '@/lib/supabase';
import { Course, Lesson, FaqItem, Review } from '@/types';
import { PlayCircle, Clock, Users, BarChart2, BookOpen, ChevronDown, ArrowUp, X } from 'lucide-react';

const Facebook: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
);
const Twitter: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
);
const Instagram: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
);
const Linkedin: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
);
const Youtube: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/></svg>
);

const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
  <div className="flex text-yellow-400">
    {[...Array(5)].map((_, i) => (
      <svg key={i} className={`w-3.5 h-3.5 ${i < rating ? "fill-current" : "text-gray-300 fill-current"}`} viewBox="0 0 20 20">
        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
      </svg>
    ))}
  </div>
);

export default function CourseDetailPage() {
  const params = useParams();
  const rawId = params?.id;
  const courseId = Array.isArray(rawId) ? rawId[0] : rawId;

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [openSection, setOpenSection] = useState<string | null>('section1');
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

  const toggleSection = (sectionId: string) => {
    setOpenSection(openSection === sectionId ? null : sectionId);
  };

  useEffect(() => {
    const fetchCourse = async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (error) {
        console.error('Error fetching course:', error);
      } else {
        setCourse(data);
      }

      // Also fetch lessons
      const { data: lessonData } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', courseId)
        .order('sort_order', { ascending: true });
      setLessons((lessonData as Lesson[]) || []);

      setLoading(false);
    };

    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);


  if (loading) {
    return (
      <div className="min-h-screen bg-white font-sans text-gray-800">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <p className="text-center text-gray-500">Loading course...</p>
        </main>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-white font-sans text-gray-800">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <p className="text-center text-gray-500">Course not found.</p>
        </main>
      </div>
    );
  }

  const faqs: FaqItem[] = Array.isArray(course.faqs) ? course.faqs : [];
  const reviews: Review[] = Array.isArray(course.reviews) ? course.reviews : [];

  return (
    <div className="min-h-screen bg-white font-sans text-gray-800">
      <Navbar />

      {/* --- BREADCRUMB --- */}
      <div className="bg-gray-50 py-3 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-xs text-gray-500 flex items-center gap-2">
          <span>Homepage</span>
          <span>&gt;</span>
          <span>Course</span>
          <span>&gt;</span>
          <span className="text-gray-800 truncate max-w-[200px]">{course.title}</span>
        </div>
      </div>

      {/* --- HERO SECTION --- */}
      <section className="bg-[#1a1c20] text-white py-12 lg:py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
            <div className="lg:col-span-2 space-y-6">
              <div className="inline-block bg-gray-700/50 backdrop-blur-sm px-3 py-1 rounded text-xs font-semibold tracking-wide uppercase text-gray-300 mb-2">
                {course.category}
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold leading-tight">
                {course.title}
              </h1>
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-300">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center text-[10px]">DP</div>
                  <span>by {course.instructor}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-orange-500" />
                  <span>{course.students} Students</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <BarChart2 className="w-4 h-4 text-orange-500" />
                  <span>{course.level}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-orange-500" />
                  <span>{lessons.length || (typeof course.lessons === 'number' ? course.lessons : 0)} Lessons</span>
                </div>
              </div>
            </div>
            <div className="hidden lg:block relative">
              <div className="absolute -top-10 -right-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
              <div className="bg-white rounded-xl p-4 shadow-2xl transform rotate-2 hover:rotate-0 transition duration-500">
                <div className="bg-blue-50 rounded-lg overflow-hidden h-48 relative flex items-center justify-center">
                  <img src={course.image || course.thumbnail_url || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=400&fit=crop"} alt={course.title} className="w-full h-full object-cover" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8">
            {/* --- VIDEO PLAYER FOR LESSONS --- */}
            {activeLesson && (
              <div className="mb-8 bg-black rounded-2xl overflow-hidden shadow-xl aspect-video relative border border-gray-800 animate-in fade-in duration-300">
                <video 
                  src={activeLesson.video_url} 
                  controls 
                  autoPlay 
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-xs font-semibold flex items-center gap-2">
                  <PlayCircle className="w-4 h-4 text-orange-500 animate-pulse" />
                  <span>Now Playing: {activeLesson.title}</span>
                  <button 
                    onClick={() => setActiveLesson(null)} 
                    className="ml-3 text-gray-400 hover:text-white transition bg-gray-800 rounded-full p-1"
                    title="Close Video"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            <div className="border-b border-gray-200 mb-8 overflow-x-auto">
              <div className="flex gap-8 min-w-max">
                {['Overview', 'Curriculum', 'Instructor', 'FAQs', 'Reviews'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab.toLowerCase())}
                    className={`pb-4 text-sm font-medium transition-colors relative ${
                      activeTab === tab.toLowerCase()
                        ? 'text-orange-500'
                        : 'text-gray-500 hover:text-gray-800'
                    }`}
                  >
                    {tab}
                    {activeTab === tab.toLowerCase() && (
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-500"></span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="min-h-[400px]">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <p className="text-gray-600 leading-relaxed">{course.overview || course.description || 'No overview available.'}</p>
                </div>
              )}

              {activeTab === 'curriculum' && (
                <div className="space-y-4">
                  {lessons.length === 0 ? (
                    <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                      <PlayCircle className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">No lessons have been added to this course yet.</p>
                    </div>
                  ) : (
                    <div className="bg-white rounded-xl border border-gray-150 divide-y divide-gray-100 overflow-hidden shadow-sm">
                      {lessons.map((lesson) => (
                        <div 
                          key={lesson.id}
                          onClick={() => {
                            if (lesson.video_url) {
                              setActiveLesson(lesson);
                            } else {
                              alert("This lesson doesn't have a video uploaded yet.");
                            }
                          }}
                          className={`p-4 flex items-center justify-between hover:bg-orange-50/30 transition cursor-pointer ${
                            activeLesson?.id === lesson.id ? 'bg-orange-50/60 border-l-4 border-orange-500' : ''
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <PlayCircle className={`w-5 h-5 shrink-0 ${activeLesson?.id === lesson.id ? 'text-orange-600' : 'text-gray-400'}`} />
                            <div>
                              <p className={`text-sm font-medium ${activeLesson?.id === lesson.id ? 'text-orange-700' : 'text-gray-800'}`}>
                                {lesson.title}
                              </p>
                              {lesson.description && <p className="text-xs text-gray-400 mt-0.5">{lesson.description}</p>}
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            {lesson.is_free && (
                              <span className="text-[10px] bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full uppercase">Free</span>
                            )}
                            <span className="text-xs text-gray-400">{lesson.duration || "0:00"}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'instructor' && (
                <div>
                  <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="w-32 h-32 bg-red-500 rounded-lg flex items-center justify-center text-white shrink-0">
                      <span className="text-4xl font-serif font-bold italic">
                        {course.instructor_name
                          ?.split(' ')
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase() || 'TP'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{course.instructor_name || 'Instructor'}</h3>
                      <p className="text-sm text-gray-500 mb-4">{course.instructor_title || 'Instructor'}</p>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {course.instructor_bio || 'No instructor bio available.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'faqs' && (
                <div className="space-y-4">
                  {faqs.length === 0 && (
                    <p className="text-gray-500">No FAQs available yet.</p>
                  )}
                  {faqs.map((faq, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleSection(`faq-${idx}`)}
                        className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition text-left"
                      >
                        <span className={`font-medium text-sm ${openSection === `faq-${idx}` ? 'text-orange-500' : 'text-gray-800'}`}>
                          {faq.q}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${openSection === `faq-${idx}` ? 'rotate-180' : ''}`} />
                      </button>
                      {openSection === `faq-${idx}` && (
                        <div className="p-4 pt-0 text-sm text-gray-600 leading-relaxed border-t border-gray-100 mt-2">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'reviews' && (
                <div>
                  <div className="flex flex-col md:flex-row gap-8 mb-10">
                    <div className="md:w-1/3 space-y-4">
                      <h3 className="font-bold text-gray-900">Comments</h3>
                      <div className="flex items-end gap-2">
                        <span className="text-4xl font-bold text-gray-900">4.0</span>
                        <StarRating rating={4} />
                      </div>
                      <p className="text-xs text-gray-500">based on {reviews.length} ratings</p>
                    </div>
                    <div className="md:w-2/3 space-y-8">
                      {reviews.length === 0 && (
                        <p className="text-gray-500">No reviews yet.</p>
                      )}
                      {reviews.map((review, idx) => (
                        <div key={idx} className="border-b border-gray-100 pb-6">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-xs">
                                {review.user
                                  ?.split(' ')
                                  .map((n) => n[0])
                                  .join('')
                                  .slice(0, 2)
                                  .toUpperCase() || 'U'}
                              </div>
                              <div>
                                <h4 className="font-bold text-sm text-gray-900">{review.user}</h4>
                                <StarRating rating={review.rating || 4} />
                              </div>
                            </div>
                            <span className="text-xs text-gray-400">{review.date}</span>
                          </div>
                          <p className="text-sm text-gray-600 leading-relaxed">{review.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: SIDEBAR CARD */}
          <div className="lg:col-span-4">
            <div className="sticky top-24">
              <div className="bg-white border border-gray-100 rounded-xl shadow-lg p-6 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-gray-900">
                      {course.price === 0 || !course.price ? 'Free' : `₹${course.price}`}
                    </span>
                    {course.original_price && (
                      <span className="text-sm text-gray-400 line-through">{course.original_price}</span>
                    )}
                  </div>
                  <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-full text-sm font-bold transition shadow-md shadow-orange-200">
                    Start Now
                  </button>
                </div>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-50">
                    <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-gray-400" /> Duration</span>
                    <span className="font-medium text-gray-900">{course.duration || 'Self-paced'}</span>
                  </div>
                  <div className="flex items-center justify-between pb-3 border-b border-gray-50">
                    <span className="flex items-center gap-2"><BookOpen className="w-4 h-4 text-gray-400" /> Lectures</span>
                    <span className="font-medium text-gray-900">{lessons.length || (typeof course.lessons === 'number' ? course.lessons : 0)}</span>
                  </div>
                  <div className="flex items-center justify-between pb-3 border-b border-gray-50">
                    <span className="flex items-center gap-2"><Users className="w-4 h-4 text-gray-400" /> Students</span>
                    <span className="font-medium text-gray-900">{course.students || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2"><BarChart2 className="w-4 h-4 text-gray-400" /> Skill Level</span>
                    <span className="font-medium text-gray-900">{course.level || 'Beginner'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* --- FOOTER --- */}
      <footer className="bg-gray-50 border-t border-gray-200 pt-16 pb-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center text-white font-bold">M</div>
                <span className="text-xl font-bold tracking-tight text-gray-900">EduPress</span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-6 text-sm uppercase tracking-wide">Get Help</h4>
              <ul className="space-y-3 text-sm text-gray-500">
                <li><a href="#" className="hover:text-orange-500 transition">Contact Us</a></li>
                <li><a href="#" className="hover:text-orange-500 transition">Latest Articles</a></li>
                <li><a href="#" className="hover:text-orange-500 transition">FAQ</a></li>
              </ul>
            </div>
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
            <div>
              <h4 className="font-bold text-gray-900 mb-6 text-sm uppercase tracking-wide">Contact Us</h4>
              <ul className="space-y-3 text-sm text-gray-500">
                <li className="leading-relaxed">Address: 2321 New Design Str, Lorem Ipsum10<br/>Hudson Yards, USA</li>
                <li>Tel: + (123) 2500-567-8988</li>
                <li>Mail: supportlms@gmail.com</li>
                <li className="flex gap-3 mt-4">
                  {[Facebook, Twitter, Instagram, Linkedin, Youtube].map((Icon, i) => (
                    <a key={i} href="#" className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:bg-orange-500 hover:text-white transition text-xs font-bold">
                      <Icon className="w-3.5 h-3.5" />
                    </a>
                  ))}
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-400">Copyright © 2024 LearnPress LMS | Powered by ThimPress</p>
            <button className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white hover:bg-orange-500 transition shadow-lg">
              <ArrowUp className="w-5 h-5" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
