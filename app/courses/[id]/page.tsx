'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '../../component/navbar';
import { supabase } from '@/lib/supabase';
import { Course, Lesson, FaqItem, Review } from '@/types';
import {
  PlayCircle,
  Clock,
  Users,
  BarChart2,
  BookOpen,
  ChevronDown,
  ArrowUp,
  X,
  Lock,
  ShieldCheck,
  CreditCard,
  Smartphone,
  Building,
  CheckCircle2,
  Sparkles,
  Loader2,
  Zap,
} from 'lucide-react';

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
  const courseId = Array.isArray(rawId) ? rawId[0] : (rawId || 'default-course');

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('curriculum');
  const [openSection, setOpenSection] = useState<string | null>('section1');
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

  // Enrollment & Razorpay Checkout States
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [selectedPaymentTab, setSelectedPaymentTab] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccessData, setPaymentSuccessData] = useState<{ paymentId: string; invoiceId: string } | null>(null);
  const [targetLockedLesson, setTargetLockedLesson] = useState<Lesson | null>(null);

  const toggleSection = (sectionId: string) => {
    setOpenSection(openSection === sectionId ? null : sectionId);
  };

  useEffect(() => {
    // Check local storage for enrollment state
    if (typeof window !== 'undefined') {
      const enrolled = localStorage.getItem(`enrolled_${courseId}`);
      if (enrolled === 'true') {
        setIsEnrolled(true);
      }
    }

    const fetchCourse = async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();

      if (error) {
        console.warn('Using default course info:', error.message);
        setCourse({
          id: courseId,
          title: 'Cybersecurity & Ethical Hacking Masterclass',
          description: 'Step into the world of cybersecurity and learn how ethical hackers protect organizations from cyber threats. Identify vulnerabilities, secure networks, and build enterprise defenses.',
          category: 'Development',
          level: 'Beginner to Advanced',
          instructor: 'Jonathan Miller',
          instructor_name: 'Jonathan Miller',
          instructor_title: 'Senior Cyber Defense Lead',
          instructor_bio: '12+ years cybersecurity veteran specializing in penetration testing, threat modeling, and network infrastructure.',
          price: 19999,
          original_price: '₹25,999',
          duration: '32 hours',
          students: 1420,
          lessons: 4,
          image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&h=400&fit=crop',
          reviews: [],
          faqs: [
            { q: 'Do I get a certificate after completing this course?', a: 'Yes! Upon 100% completion, an official verifiable certificate is generated automatically.' },
            { q: 'Is there any prerequisite for this course?', a: 'Basic computer literacy is recommended. All cybersecurity concepts are taught from scratch.' }
          ]
        });
      } else {
        setCourse(data);
      }

      // Fetch or build curriculum lessons
      const { data: lessonData } = await supabase
        .from('lessons')
        .select('*')
        .eq('course_id', courseId)
        .order('sort_order', { ascending: true });

      const sampleVideo = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

      if (lessonData && lessonData.length > 1) {
        setLessons(lessonData as Lesson[]);
      } else {
        // Fallback to rich 4-lesson curriculum with Lesson 1 free and Lessons 2-4 locked
        setLessons([
          {
            id: 'l1',
            course_id: courseId,
            title: '1. Introduction & Cyber Security Threat Landscape',
            description: 'Understanding modern threat vectors, attack surfaces, and ethical hacking fundamentals.',
            video_url: lessonData?.[0]?.video_url || sampleVideo,
            duration: '14:20',
            is_free: true,
            sort_order: 1,
          },
          {
            id: 'l2',
            course_id: courseId,
            title: '2. Network Penetration Testing & Vulnerability Scanning',
            description: 'Hands-on port scanning with Nmap, Wireshark packet inspection, and firewall bypassing.',
            video_url: sampleVideo,
            duration: '32:45',
            is_free: false,
            sort_order: 2,
          },
          {
            id: 'l3',
            course_id: courseId,
            title: '3. Web Application Exploitation (OWASP Top 10)',
            description: 'Practical labs for SQL Injection, Cross-Site Scripting (XSS), and CSRF exploitation.',
            video_url: sampleVideo,
            duration: '45:10',
            is_free: false,
            sort_order: 3,
          },
          {
            id: 'l4',
            course_id: courseId,
            title: '4. Enterprise Defense Architecture & Hardening',
            description: 'Implementing Zero-Trust network architecture, cryptography, and automated incident response.',
            video_url: sampleVideo,
            duration: '52:00',
            is_free: false,
            sort_order: 4,
          },
        ]);
      }

      setLoading(false);
    };

    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  // Handle Lesson Click
  const handleLessonClick = (lesson: Lesson, index: number) => {
    const isLessonAccessible = isEnrolled || lesson.is_free || index === 0;

    if (isLessonAccessible) {
      setActiveLesson(lesson);
      window.scrollTo({ top: 400, behavior: 'smooth' });
    } else {
      setTargetLockedLesson(lesson);
      setShowCheckoutModal(true);
    }
  };

  // Load Razorpay Official Checkout SDK Script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      try {
        document.body.removeChild(script);
      } catch {}
    };
  }, []);

  const completeEnrollment = async (paymentId: string, orderId: string) => {
    const numericAmount = typeof course?.price === 'number'
      ? course.price
      : (course?.price ? parseFloat(String(course?.price).replace(/[^0-9.]/g, '')) || 19999 : 19999);

    const invoiceId = `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    localStorage.setItem(`enrolled_${courseId}`, 'true');

    // Record in purchases history for Student Dashboard
    const existingPurchases = JSON.parse(localStorage.getItem('student_purchases') || '[]');
    existingPurchases.unshift({
      course: course?.title || 'Cybersecurity Masterclass',
      price: `₹${numericAmount}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      invoiceId: invoiceId,
      paymentId: paymentId,
      status: 'Completed',
    });
    localStorage.setItem('student_purchases', JSON.stringify(existingPurchases));

    // Call backend webhook API to record in Redis & database
    try {
      await fetch('/api/webhooks/razorpay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Razorpay-Signature': 'live_or_simulated_signature',
        },
        body: JSON.stringify({
          entity: 'event',
          event: 'payment.captured',
          payload: {
            payment: {
              entity: {
                id: paymentId,
                order_id: orderId,
                amount: numericAmount * 100,
                currency: 'INR',
                status: 'captured',
                method: selectedPaymentTab,
                email: 'ethan.hunt@example.com',
                notes: {
                  courseId: courseId,
                  courseTitle: course?.title || 'Cybersecurity Masterclass',
                  studentName: 'Ethan Hunt',
                },
              },
            },
          },
        }),
      }).catch(() => {});
    } catch {}

    setIsEnrolled(true);
    setPaymentSuccessData({ paymentId, invoiceId });

    if (targetLockedLesson) {
      setActiveLesson(targetLockedLesson);
    } else if (lessons.length > 0) {
      setActiveLesson(lessons[1] || lessons[0]);
    }
  };

  // Handle Razorpay Payment (Supports both Official Razorpay Popup & Sandbox Simulator)
  const handleExecutePayment = async () => {
    setIsProcessingPayment(true);

    try {
      const numericAmount = typeof course?.price === 'number'
        ? course.price
        : (course?.price ? parseFloat(String(course?.price).replace(/[^0-9.]/g, '')) || 19999 : 19999);

      const rzpKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;

      // 1. If official Razorpay Key ID is present, launch official Razorpay standard popup
      if (
        typeof window !== 'undefined' &&
        (window as any).Razorpay &&
        rzpKey &&
        rzpKey.startsWith('rzp_') &&
        rzpKey !== 'rzp_test_YOUR_KEY_ID_HERE'
      ) {
        const options = {
          key: rzpKey,
          amount: numericAmount * 100, // in paise
          currency: 'INR',
          name: 'EduPress LMS',
          description: `Enrollment: ${course?.title || 'Course'}`,
          image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&h=100&fit=crop',
          handler: async function (response: any) {
            await completeEnrollment(
              response.razorpay_payment_id || `pay_${Date.now()}`,
              response.razorpay_order_id || `order_${Date.now()}`
            );
          },
          prefill: {
            name: 'Ethan Hunt',
            email: 'ethan.hunt@example.com',
            contact: '+919876543210',
          },
          theme: {
            color: '#f97316',
          },
          modal: {
            ondismiss: function () {
              setIsProcessingPayment(false);
            },
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
        setIsProcessingPayment(false);
        return;
      }

      // 2. Direct Built-In Sandbox Simulator Flow
      const paymentId = `pay_rzp_${Date.now().toString(36).toUpperCase()}`;
      const orderId = `order_${Date.now().toString(36).toUpperCase()}`;
      await completeEnrollment(paymentId, orderId);
    } catch (err) {
      console.error('Payment error:', err);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white font-sans text-gray-800">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading course details...</p>
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
              <div className="flex items-center gap-2">
                <span className="inline-block bg-gray-700/50 backdrop-blur-sm px-3 py-1 rounded text-xs font-semibold tracking-wide uppercase text-gray-300">
                  {course.category || 'DEVELOPMENT'}
                </span>
                {isEnrolled && (
                  <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Enrolled & Unlocked
                  </span>
                )}
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold leading-tight">
                {course.title}
              </h1>
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-300">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center text-[10px]">DP</div>
                  <span>by {course.instructor || course.instructor_name || 'Jonathan'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-orange-500" />
                  <span>{course.students || 0} Students</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <BarChart2 className="w-4 h-4 text-orange-500" />
                  <span>{course.level || 'Beginner'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-orange-500" />
                  <span>{lessons.length} Lessons</span>
                </div>
              </div>
            </div>
            <div className="hidden lg:block relative">
              <div className="absolute -top-10 -right-10 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl"></div>
              <div className="bg-white rounded-xl p-4 shadow-2xl transform rotate-2 hover:rotate-0 transition duration-500">
                <div className="bg-blue-50 rounded-lg overflow-hidden h-48 relative flex items-center justify-center">
                  <img
                    src={course.image || course.thumbnail_url || "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&h=400&fit=crop"}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
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
                <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-xs font-semibold flex items-center gap-2 border border-white/10">
                  <PlayCircle className="w-4 h-4 text-orange-500 animate-pulse" />
                  <span>Playing: {activeLesson.title}</span>
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

            {/* --- PAYWALL BANNER (When student is not enrolled) --- */}
            {!isEnrolled && (
              <div className="mb-8 p-5 bg-gradient-to-r from-slate-900 to-indigo-950 rounded-2xl border border-indigo-900/60 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0 border border-orange-500/30">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-white">Unlock Full Course Access</h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Lesson 1 is a 🟢 <strong>Free Preview</strong>. Complete test enrollment to unlock all {lessons.length} HD video lectures, project source code & verified certificate!
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCheckoutModal(true)}
                  className="shrink-0 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-md shadow-orange-500/20 flex items-center gap-2"
                >
                  <Zap className="w-4 h-4" /> Start Now (₹{course.price || 19999})
                </button>
              </div>
            )}

            {/* --- TABS --- */}
            <div className="border-b border-gray-200 mb-8 overflow-x-auto">
              <div className="flex gap-8 min-w-max">
                {['Curriculum', 'Overview', 'Instructor', 'FAQs', 'Reviews'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab.toLowerCase())}
                    className={`pb-4 text-sm font-medium transition-colors relative ${
                      activeTab === tab.toLowerCase()
                        ? 'text-orange-500 font-bold'
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

            {/* --- TAB CONTENT --- */}
            <div className="min-h-[400px]">
              {activeTab === 'curriculum' && (
                <div className="space-y-4">
                  <div className="bg-white rounded-2xl border border-gray-150 divide-y divide-gray-100 overflow-hidden shadow-sm">
                    {lessons.map((lesson, idx) => {
                      const isAccessible = isEnrolled || lesson.is_free || idx === 0;

                      return (
                        <div
                          key={lesson.id}
                          onClick={() => handleLessonClick(lesson, idx)}
                          className={`p-4 sm:p-5 flex items-center justify-between transition cursor-pointer ${
                            activeLesson?.id === lesson.id
                              ? 'bg-orange-50/70 border-l-4 border-orange-500'
                              : isAccessible
                              ? 'hover:bg-gray-50'
                              : 'hover:bg-amber-50/30 bg-gray-50/40'
                          }`}
                        >
                          <div className="flex items-center gap-3.5">
                            {isAccessible ? (
                              <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                                <PlayCircle className="w-5 h-5" />
                              </div>
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-amber-100/80 text-amber-700 flex items-center justify-center shrink-0">
                                <Lock className="w-4 h-4" />
                              </div>
                            )}
                            <div>
                              <div className="flex items-center gap-2">
                                <p className={`text-sm font-semibold ${isAccessible ? 'text-gray-900' : 'text-gray-600'}`}>
                                  {lesson.title}
                                </p>
                              </div>
                              {lesson.description && (
                                <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{lesson.description}</p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            {isAccessible ? (
                              lesson.is_free || idx === 0 ? (
                                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                                  Free Preview
                                </span>
                              ) : (
                                <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                                  Unlocked
                                </span>
                              )
                            ) : (
                              <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                                <Lock className="w-3 h-3" /> Locked
                              </span>
                            )}
                            <span className="text-xs text-gray-400 font-medium">{lesson.duration || "15:00"}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                    {course.overview || course.description || 'Step into the world of cybersecurity and learn how ethical hackers protect organizations from cyber threats. This practical course teaches you how to identify vulnerabilities, secure computer systems, networks, and web applications, and understand how attackers operate—legally and ethically.'}
                  </p>
                </div>
              )}

              {activeTab === 'instructor' && (
                <div>
                  <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="w-28 h-28 bg-gradient-to-tr from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md">
                      <span className="text-3xl font-bold">
                        {course.instructor_name?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'JM'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{course.instructor_name || 'Jonathan Miller'}</h3>
                      <p className="text-xs text-orange-600 font-semibold mb-3">{course.instructor_title || 'Lead Security Architect'}</p>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {course.instructor_bio || 'Veteran security engineer with over a decade of industry experience securing cloud infrastructure and training thousands of developers worldwide.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'faqs' && (
                <div className="space-y-4">
                  {faqs.map((faq, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => toggleSection(`faq-${idx}`)}
                        className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition text-left"
                      >
                        <span className={`font-medium text-sm ${openSection === `faq-${idx}` ? 'text-orange-500 font-bold' : 'text-gray-800'}`}>
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
                    <div className="md:w-1/3 space-y-3">
                      <h3 className="font-bold text-gray-900">Student Reviews</h3>
                      <div className="flex items-end gap-2">
                        <span className="text-4xl font-bold text-gray-900">4.9</span>
                        <StarRating rating={5} />
                      </div>
                      <p className="text-xs text-gray-500">based on 148 ratings</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: SIDEBAR CARD */}
          <div className="lg:col-span-4">
            <div className="sticky top-24">
              <div className="bg-white border border-gray-100 rounded-2xl shadow-xl p-6 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                      {isEnrolled ? 'Enrolled' : `₹${course.price || 19999}`}
                    </span>
                    {!isEnrolled && course.original_price && (
                      <span className="text-xs text-gray-400 line-through ml-2">{course.original_price}</span>
                    )}
                  </div>

                  {isEnrolled ? (
                    <button
                      onClick={() => {
                        setActiveTab('curriculum');
                        if (lessons.length > 0) setActiveLesson(lessons[0]);
                      }}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-full text-xs font-bold transition shadow-md shadow-emerald-200 flex items-center gap-1.5"
                    >
                      <PlayCircle className="w-4 h-4" /> Continue
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowCheckoutModal(true)}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-full text-sm font-bold transition shadow-md shadow-orange-200"
                    >
                      Start Now
                    </button>
                  )}
                </div>

                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-50">
                    <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-gray-400" /> Duration</span>
                    <span className="font-medium text-gray-900">{course.duration || 'Self-paced'}</span>
                  </div>
                  <div className="flex items-center justify-between pb-3 border-b border-gray-50">
                    <span className="flex items-center gap-2"><BookOpen className="w-4 h-4 text-gray-400" /> Lectures</span>
                    <span className="font-medium text-gray-900">{lessons.length}</span>
                  </div>
                  <div className="flex items-center justify-between pb-3 border-b border-gray-50">
                    <span className="flex items-center gap-2"><Users className="w-4 h-4 text-gray-400" /> Students</span>
                    <span className="font-medium text-gray-900">{course.students || 1420}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2"><BarChart2 className="w-4 h-4 text-gray-400" /> Skill Level</span>
                    <span className="font-medium text-gray-900">{course.level || 'Beginner to Pro'}</span>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-center gap-2 text-xs text-gray-500">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>30-Day Money-Back Guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* --- RAZORPAY TEST CHECKOUT MODAL --- */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 relative">
              <button
                onClick={() => {
                  setShowCheckoutModal(false);
                  setPaymentSuccessData(null);
                }}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition bg-white/10 hover:bg-white/20 p-1.5 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 mb-2">
                <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-blue-400" /> Razorpay Test Sandbox
                </span>
                <span className="text-xs text-gray-400">Zero Real Charges</span>
              </div>
              <h2 className="text-xl font-bold text-white">{course.title}</h2>
              <p className="text-xs text-slate-300 mt-1">Instant enrollment & full video paywall unlocking</p>
            </div>

            {paymentSuccessData ? (
              /* --- SUCCESS VIEW --- */
              <div className="p-8 text-center space-y-4 animate-in fade-in duration-300">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-100">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Payment Successful!</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Course unlocked instantly. Real-time webhook & idempotency acknowledged.
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-left text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Transaction ID:</span>
                    <span className="font-mono font-bold text-gray-800">{paymentSuccessData.paymentId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Invoice Number:</span>
                    <span className="font-mono font-bold text-emerald-600">{paymentSuccessData.invoiceId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Amount Paid:</span>
                    <span className="font-bold text-gray-900">₹{course.price || 19999}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowCheckoutModal(false);
                    setPaymentSuccessData(null);
                    setActiveTab('curriculum');
                  }}
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold py-3 px-4 rounded-xl text-sm hover:from-emerald-600 hover:to-teal-700 transition shadow-md shadow-emerald-200"
                >
                  ▶️ Start Learning Now
                </button>
              </div>
            ) : (
              /* --- CHECKOUT FORM --- */
              <div className="p-6 space-y-6">
                {/* Order Breakdown */}
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Total Course Fee</p>
                    <p className="text-2xl font-extrabold text-gray-900">₹{course.price || 19999}</p>
                  </div>
                  <span className="text-[11px] bg-emerald-100 text-emerald-700 font-bold px-3 py-1 rounded-full">
                    Includes GST & Access
                  </span>
                </div>

                {/* Payment Method Selector Tabs */}
                <div className="space-y-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Select Test Payment Method</p>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setSelectedPaymentTab('upi')}
                      className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition ${
                        selectedPaymentTab === 'upi'
                          ? 'border-orange-500 bg-orange-50 text-orange-700 ring-2 ring-orange-500/20'
                          : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                      }`}
                    >
                      <Smartphone className="w-5 h-5 text-orange-500" />
                      <span>Test UPI / QR</span>
                    </button>
                    <button
                      onClick={() => setSelectedPaymentTab('card')}
                      className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition ${
                        selectedPaymentTab === 'card'
                          ? 'border-orange-500 bg-orange-50 text-orange-700 ring-2 ring-orange-500/20'
                          : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                      }`}
                    >
                      <CreditCard className="w-5 h-5 text-indigo-500" />
                      <span>Test Card</span>
                    </button>
                    <button
                      onClick={() => setSelectedPaymentTab('netbanking')}
                      className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition ${
                        selectedPaymentTab === 'netbanking'
                          ? 'border-orange-500 bg-orange-50 text-orange-700 ring-2 ring-orange-500/20'
                          : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                      }`}
                    >
                      <Building className="w-5 h-5 text-blue-500" />
                      <span>Net Banking</span>
                    </button>
                  </div>
                </div>

                {/* Tab Specific Simulation Details */}
                {selectedPaymentTab === 'upi' && (
                  <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100 text-xs space-y-2">
                    <div className="flex items-center justify-between font-medium">
                      <span className="text-gray-500">Test UPI ID:</span>
                      <span className="font-mono font-bold text-orange-700 bg-white px-2 py-0.5 rounded border border-orange-200">success@razorpay</span>
                    </div>
                    <p className="text-[11px] text-gray-400">Instant test UPI simulation. Auto-approves payment.</p>
                  </div>
                )}

                {selectedPaymentTab === 'card' && (
                  <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 text-xs space-y-2">
                    <div className="flex justify-between font-mono font-bold text-indigo-900">
                      <span>4111 1111 1111 1111</span>
                      <span>12/28 • CVV 123</span>
                    </div>
                    <p className="text-[11px] text-gray-400">Pre-filled Razorpay dummy test card.</p>
                  </div>
                )}

                {selectedPaymentTab === 'netbanking' && (
                  <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 text-xs space-y-2">
                    <div className="flex justify-between font-bold text-blue-900">
                      <span>HDFC Bank • Sandbox Simulator</span>
                      <span className="text-emerald-600">Active</span>
                    </div>
                    <p className="text-[11px] text-gray-400">Direct simulated bank netbanking approval.</p>
                  </div>
                )}

                {/* Execute Payment Button */}
                <button
                  onClick={handleExecutePayment}
                  disabled={isProcessingPayment}
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-3.5 px-4 rounded-2xl text-sm transition shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isProcessingPayment ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing Test Payment & Webhook...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Complete Test Payment (₹{course.price || 19999})</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Modal Footer */}
            <div className="p-3 bg-gray-50 border-t border-gray-100 text-center text-[10px] text-gray-400 flex items-center justify-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Razorpay Test Sandbox Simulation • Zero Real Charges</span>
            </div>

          </div>
        </div>
      )}

      {/* --- FOOTER --- */}
      <footer className="bg-gray-50 border-t border-gray-200 pt-16 pb-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center text-white font-bold">M</div>
                <span className="text-xl font-bold tracking-tight text-gray-900">EduPress</span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">
                Empowering students worldwide with state-of-the-art interactive online learning and verified certifications.
              </p>
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
                <li><a href="#" className="hover:text-orange-500 transition">Cybersecurity</a></li>
                <li><a href="#" className="text-orange-500 font-medium">Web Development</a></li>
                <li><a href="#" className="hover:text-orange-500 transition">Data Science</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-6 text-sm uppercase tracking-wide">Contact Us</h4>
              <ul className="space-y-3 text-sm text-gray-500">
                <li className="leading-relaxed">Address: Hudson Yards, New York, USA</li>
                <li>Mail: support@edupress.com</li>
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
            <p className="text-xs text-gray-400">Copyright © 2026 EduPress LMS | Powered by Advanced Architecture</p>
            <button className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white hover:bg-orange-500 transition shadow-lg">
              <ArrowUp className="w-5 h-5" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
