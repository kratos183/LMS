'use client'
import React, { useState } from 'react';
import {
  PlayCircle, CheckCircle,
  Clock, Users, BarChart2, BookOpen, Star, ChevronRight,
  ArrowUp
} from 'lucide-react';
import Navbar from '../component/navbar';

// Custom Social Media Icon Components
const Facebook = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
);

const Twitter = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
);

const Instagram = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
);

const Linkedin = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
);

const Youtube = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/></svg>
);

const CourseSinglePage = () => {
  // State for Tab Navigation
  const [activeTab, setActiveTab] = useState('overview');
  
  // State for Accordion (Curriculum & FAQ)
  const [openSection, setOpenSection] = useState('section1'); 

  const toggleSection = (sectionId) => {
    setOpenSection(openSection === sectionId ? null : sectionId);
  };

  // Mock Data to simulate what would come from your Database
  const courseData = {
    title: "The Ultimate Guide To The Best WordPress LMS Plugin",
    instructor: "Determined Poitras",
    price: 49.0,
    originalPrice: 69.0,
    stats: {
      students: 156,
      level: "All levels",
      lessons: 20,
      quizzes: 3
    },
    curriculum: [
      {
        id: 'section1',
        title: 'Lessons With Video Content',
        count: '5 Lessons',
        time: '45 Mins',
        lessons: [
          { title: 'Lessons with video content', duration: '12:30', preview: true },
          { title: 'Lessons with video content', duration: '10:05', preview: false },
          { title: 'Lessons with video content', duration: '2:35', preview: false },
        ]
      },
      {
        id: 'section2',
        title: 'Lessons With Video Content',
        count: '5 Lessons',
        time: '45 Mins',
        lessons: [
          { title: 'Lessons With Video Content', duration: '45 Mins', preview: false },
        ]
      }
    ],
    faqs: [
      { q: "What Does Royalty Free Mean?", a: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur bibendum ornare dolor, quis ullamcorper ligula sodales." },
      { q: "What Does Royalty Free Mean?", a: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur bibendum ornare dolor, quis ullamcorper ligula sodales." },
      { q: "What Does Royalty Free Mean?", a: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur bibendum ornare dolor, quis ullamcorper ligula sodales." }
    ],
    reviews: [
      { user: "Laura Hipster", date: "October 03, 2022", rating: 5, text: "Quisque nec non erat ipis. Varius tellus justo odio parturient mauris curabitur lorem in. Pulvinar ut ultrices mi ut eleifend turpis ut. Id sed faucibus bibendum aenean ut cras purus. At eget euismod cursus non. Maecenas dignissim sed vulputate feugiat vel." },
      { user: "Laura Hipster", date: "October 03, 2022", rating: 4, text: "Quisque nec non erat ipis. Varius tellus justo odio parturient mauris curabitur lorem in. Pulvinar ut ultrices mi ut eleifend turpis ut. Id sed faucibus bibendum aenean ut cras purus. At eget euismod cursus non. Maecenas dignissim sed vulputate feugiat vel." }
    ]
  };

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
          <span className="text-gray-800 truncate max-w-[200px]">{courseData.title}</span>
        </div>
      </div>

      {/* --- HERO SECTION --- */}
      <section className="bg-[#1a1c20] text-white py-12 lg:py-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
            
            {/* Left: Text Info */}
            <div className="lg:col-span-2 space-y-6">
              <div className="inline-block bg-gray-700/50 backdrop-blur-sm px-3 py-1 rounded text-xs font-semibold tracking-wide uppercase text-gray-300 mb-2">
                Photography
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold leading-tight">
                {courseData.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-300">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center text-[10px]">DP</div>
                  <span>by {courseData.instructor}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-orange-500" />
                  <span>{courseData.stats.students} Students</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <BarChart2 className="w-4 h-4 text-orange-500" />
                  <span>{courseData.stats.level}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-orange-500" />
                  <span>{courseData.stats.lessons} Lessons</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-orange-500" />
                  <span>{courseData.stats.quizzes} Quizzes</span>
                </div>
              </div>
            </div>

            {/* Right: Thumbnail Card */}
            <div className="hidden lg:block relative">
               {/* Abstract decorative background shapes */}
               <div className="absolute -top-10 -right-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
               
               <div className="bg-white rounded-xl p-4 shadow-2xl transform rotate-2 hover:rotate-0 transition duration-500">
                 <div className="bg-blue-50 rounded-lg overflow-hidden h-48 relative flex items-center justify-center">
                    {/* Placeholder for the illustration in screenshot */}
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-2 flex items-center justify-center">
                        <PlayCircle className="w-8 h-8 text-blue-600" />
                      </div>
                      <p className="text-blue-900 font-bold text-sm">Create an LMS website</p>
                      <p className="text-blue-400 text-xs">with LearnPress plugin</p>
                    </div>
                 </div>
               </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* LEFT COLUMN: TABS & CONTENT */}
          <div className="lg:col-span-8">
            
            {/* Tab Navigation */}
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

            {/* Tab Content Area */}
            <div className="min-h-[400px]">
              
              {/* OVERVIEW TAB */}
              {activeTab === 'overview' && (
                <div className="space-y-6 animate-fadeIn">
                  <p className="text-gray-600 leading-relaxed">
                    LearnPress is a comprehensive WordPress LMS Plugin for WordPress. This is one of the best WordPress LMS Plugins which can be used to easily create & sell courses online. You can create a course curriculum with lessons & quizzes included which is managed with an easy-to-use interface for users. Having this WordPress LMS Plugin, now you have a chance to quickly and easily create education, online school, online-course websites with no coding knowledge required.
                  </p>
                  <p className="text-gray-600 leading-relaxed">
                    LearnPress is free and always will be, but it is still a premium high-quality WordPress Plugin that definitely helps you with making money from your WordPress Based LMS. Just try it and see how amazing it is. LearnPress WordPress Online Course plugin is lightweight and super powerful with lots of Add-Ons to empower its core system.How to use WPML Add-on for LearnPress?
                  </p>
                  
                  {/* Comment Form */}
                  <div className="mt-12 pt-8 border-t border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Leave A Comment</h3>
                    <p className="text-xs text-gray-500 mb-6">Your email address will not be published. Required fields are marked *</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <input type="text" placeholder="Name*" className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500 transition" />
                      <input type="email" placeholder="Email*" className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500 transition" />
                    </div>
                    <textarea rows="4" placeholder="Comment" className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500 transition mb-4"></textarea>
                    
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
                        <input type="checkbox" className="rounded text-orange-500 focus:ring-orange-500" />
                        Save my name, email in this browser for the next time I comment
                      </label>
                      <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded text-sm font-medium transition">
                        Post Comment
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* CURRICULUM TAB */}
              {activeTab === 'curriculum' && (
                <div className="space-y-4 animate-fadeIn">
                   {courseData.curriculum.map((section) => (
                     <div key={section.id} className="border border-gray-200 rounded-lg overflow-hidden">
                       <button 
                         onClick={() => toggleSection(section.id)}
                         className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition text-left"
                       >
                         <div className="flex items-center gap-3">
                           <span className={`transform transition-transform ${openSection === section.id ? 'rotate-90' : ''}`}>
                             <ChevronRight className="w-4 h-4 text-gray-500" />
                           </span>
                           <span className="font-semibold text-gray-800">{section.title}</span>
                         </div>
                         <div className="flex items-center gap-4 text-xs text-gray-500">
                           <span>{section.count}</span>
                           <span>{section.time}</span>
                         </div>
                       </button>
                       
                       {openSection === section.id && (
                         <div className="bg-white divide-y divide-gray-100">
                           {section.lessons.map((lesson, idx) => (
                             <div key={idx} className="p-4 pl-12 flex items-center justify-between hover:bg-gray-50 transition">
                               <div className="flex items-center gap-3">
                                 {lesson.preview ? (
                                   <PlayCircle className="w-4 h-4 text-orange-500" />
                                 ) : (
                                   <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
                                 )}
                                 <span className={`text-sm ${lesson.preview ? 'text-orange-500 font-medium' : 'text-gray-600'}`}>
                                   {lesson.title}
                                 </span>
                               </div>
                               <div className="flex items-center gap-3">
                                 <span className="text-xs text-gray-400">{lesson.duration}</span>
                                 {lesson.preview ? (
                                   <span className="bg-blue-100 text-blue-600 text-[10px] px-2 py-0.5 rounded font-bold uppercase">Preview</span>
                                 ) : (
                                   <span className="bg-gray-100 text-gray-500 text-[10px] px-2 py-0.5 rounded font-bold uppercase">Lock</span>
                                 )}
                               </div>
                             </div>
                           ))}
                         </div>
                       )}
                     </div>
                   ))}
                   
                   {/* Repeated sections to match screenshot density */}
                   <div className="border border-gray-200 rounded-lg overflow-hidden opacity-75">
                      <div className="w-full flex items-center justify-between p-4 bg-gray-50 text-left">
                         <div className="flex items-center gap-3">
                           <ChevronRight className="w-4 h-4 text-gray-500" />
                           <span className="font-semibold text-gray-800">Lessons With Video Content</span>
                         </div>
                         <div className="flex items-center gap-4 text-xs text-gray-500">
                           <span>5 Lessons</span>
                           <span>45 Mins</span>
                         </div>
                       </div>
                   </div>
                </div>
              )}

              {/* INSTRUCTOR TAB */}
              {activeTab === 'instructor' && (
                <div className="animate-fadeIn">
                  <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="w-32 h-32 bg-red-500 rounded-lg flex items-center justify-center text-white shrink-0">
                      <span className="text-4xl font-serif font-bold italic">TT</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">ThimPress</h3>
                      <p className="text-sm text-gray-500 mb-4">WordPress Developer</p>
                      <p className="text-gray-600 text-sm leading-relaxed mb-6">
                        LearnPress is a comprehensive WordPress LMS Plugin for WordPress. This is one of the best WordPress LMS Plugins which can be used to easily create & sell courses online.
                      </p>
                      
                      <div className="flex items-center gap-6 text-sm text-gray-600 mb-6">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-orange-500" />
                          <span>156 Students</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-orange-500" />
                          <span>20 Lessons</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-700">Follow:</span>
                        <div className="flex gap-2">
                          {[Facebook, Twitter, Instagram, Linkedin, Youtube].map((Icon, i) => (
                            <a key={i} href="#" className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-orange-500 hover:text-white transition">
                              <Icon className="w-3.5 h-3.5" />
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Comment Form Duplicate for Instructor Tab (as seen in screenshot flow) */}
                  <div className="mt-12 pt-8 border-t border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Leave A Comment</h3>
                    <p className="text-xs text-gray-500 mb-6">Your email address will not be published. Required fields are marked *</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <input type="text" placeholder="Name*" className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500 transition" />
                      <input type="email" placeholder="Email*" className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500 transition" />
                    </div>
                    <textarea rows="4" placeholder="Comment" className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500 transition mb-4"></textarea>
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
                        <input type="checkbox" className="rounded text-orange-500 focus:ring-orange-500" />
                        Save my name, email in this browser for the next time I comment
                      </label>
                      <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded text-sm font-medium transition">
                        Post Comment
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* FAQ TAB */}
              {activeTab === 'faqs' && (
                <div className="space-y-4 animate-fadeIn">
                  {courseData.faqs.map((faq, idx) => (
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
                  
                  {/* Comment Form Duplicate for FAQ Tab */}
                  <div className="mt-12 pt-8 border-t border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Leave A Comment</h3>
                    <p className="text-xs text-gray-500 mb-6">Your email address will not be published. Required fields are marked *</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <input type="text" placeholder="Name*" className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500 transition" />
                      <input type="email" placeholder="Email*" className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500 transition" />
                    </div>
                    <textarea rows="4" placeholder="Comment" className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500 transition mb-4"></textarea>
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
                        <input type="checkbox" className="rounded text-orange-500 focus:ring-orange-500" />
                        Save my name, email in this browser for the next time I comment
                      </label>
                      <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded text-sm font-medium transition">
                        Post Comment
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* REVIEWS TAB */}
              {activeTab === 'reviews' && (
                <div className="animate-fadeIn">
                  <div className="flex flex-col md:flex-row gap-8 mb-10">
                    {/* Rating Summary */}
                    <div className="md:w-1/3 space-y-4">
                      <h3 className="font-bold text-gray-900">Comments</h3>
                      <div className="flex items-end gap-2">
                        <span className="text-4xl font-bold text-gray-900">4.0</span>
                        <div className="mb-1.5">
                          <StarRating rating={4} />
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">based on 146,950 ratings</p>
                      
                      <div className="space-y-2 mt-4">
                        {[5,4,3,2,1].map(star => (
                          <div key={star} className="flex items-center gap-2 text-xs">
                            <div className="flex text-yellow-400 w-16">
                              {[...Array(5)].map((_, i) => (
                                <svg key={i} className={`w-3 h-3 ${i < star ? "fill-current" : "text-gray-200 fill-current"}`} viewBox="0 0 20 20"><path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" /></svg>
                              ))}
                            </div>
                            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-yellow-400 rounded-full" style={{width: star === 5 ? '90%' : star === 4 ? '5%' : '1%'}}></div>
                            </div>
                            <span className="text-gray-400 w-6 text-right">{star === 5 ? '90%' : '5%'}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Review List */}
                    <div className="md:w-2/3 space-y-8">
                      {courseData.reviews.map((review, idx) => (
                        <div key={idx} className="border-b border-gray-100 pb-6 last:border-0">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-xs">LH</div>
                              <div>
                                <h4 className="font-bold text-sm text-gray-900">{review.user}</h4>
                                <StarRating rating={review.rating} />
                              </div>
                            </div>
                            <span className="text-xs text-gray-400">{review.date}</span>
                          </div>
                          <p className="text-sm text-gray-600 leading-relaxed mb-3">
                            {review.text}
                          </p>
                          <button className="text-xs font-medium text-gray-500 hover:text-orange-500 flex items-center gap-1">
                            Reply
                          </button>
                        </div>
                      ))}
                      
                      {/* Pagination for Reviews */}
                      <div className="flex justify-center gap-2 pt-4">
                        <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:border-orange-500 hover:text-orange-500 transition">
                          <ChevronDown className="w-4 h-4 rotate-90" />
                        </button>
                        {[1,2,3].map(p => (
                          <button key={p} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${p===1 ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                            {p}
                          </button>
                        ))}
                        <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:border-orange-500 hover:text-orange-500 transition">
                          <ChevronDown className="w-4 h-4 -rotate-90" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Comment Form Duplicate for Reviews Tab */}
                  <div className="pt-8 border-t border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Leave A Comment</h3>
                    <p className="text-xs text-gray-500 mb-6">Your email address will not be published. Required fields are marked *</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <input type="text" placeholder="Name*" className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500 transition" />
                      <input type="email" placeholder="Email*" className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500 transition" />
                    </div>
                    <textarea rows="4" placeholder="Comment" className="w-full border border-gray-300 rounded px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500 transition mb-4"></textarea>
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
                        <input type="checkbox" className="rounded text-orange-500 focus:ring-orange-500" />
                        Save my name, email in this browser for the next time I comment
                      </label>
                      <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded text-sm font-medium transition">
                        Post Comment
                      </button>
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
                
                {/* Price Section */}
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-gray-900">${courseData.price}.0</span>
                    <span className="text-sm text-gray-400 line-through">${courseData.originalPrice}.0</span>
                  </div>
                  <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-full text-sm font-bold transition shadow-md shadow-orange-200">
                    Start Now
                  </button>
                </div>

                {/* Course Includes List */}
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-50">
                    <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-gray-400" /> Duration</span>
                    <span className="font-medium text-gray-900">2 Weeks</span>
                  </div>
                  <div className="flex items-center justify-between pb-3 border-b border-gray-50">
                    <span className="flex items-center gap-2"><BookOpen className="w-4 h-4 text-gray-400" /> Lectures</span>
                    <span className="font-medium text-gray-900">20</span>
                  </div>
                  <div className="flex items-center justify-between pb-3 border-b border-gray-50">
                    <span className="flex items-center gap-2"><Users className="w-4 h-4 text-gray-400" /> Students</span>
                    <span className="font-medium text-gray-900">156</span>
                  </div>
                  <div className="flex items-center justify-between pb-3 border-b border-gray-50">
                    <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-gray-400" /> Quizzes</span>
                    <span className="font-medium text-gray-900">3</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2"><BarChart2 className="w-4 h-4 text-gray-400" /> Skill Level</span>
                    <span className="font-medium text-gray-900">All Levels</span>
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
            
            {/* Brand Info */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center text-white font-bold">M</div>
                <span className="text-xl font-bold tracking-tight text-gray-900">EduPress</span>
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
};

// Helper Component for Stars
const StarRating = ({ rating }) => (
  <div className="flex text-yellow-400">
    {[...Array(5)].map((_, i) => (
      <svg key={i} className={`w-3.5 h-3.5 ${i < rating ? "fill-current" : "text-gray-300 fill-current"}`} viewBox="0 0 20 20">
        <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
      </svg>
    ))}
  </div>
);

export default CourseSinglePage;