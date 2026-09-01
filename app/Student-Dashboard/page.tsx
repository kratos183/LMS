"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  LayoutDashboard, BookOpen, PlayCircle, BarChart3, Heart,
  Award, Star, Bell, CreditCard, User, Settings, MessageSquare,
  FileText, Bot, LogOut, Download, Share2, CheckCircle,
  Search, Menu, Moon, Sun, Globe, Mail, Trash2, Edit3, Send,
  Loader2, Sparkles, RotateCcw
} from "lucide-react";
import Navbar from "../component/navbar";

interface ChatMessage {
  role: 'ai' | 'user';
  text: string;
  latencyMs?: number;
  source?: 'cache' | 'llm';
}

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/';
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard Home", icon: LayoutDashboard },
    { id: "courses", label: "My Courses", icon: BookOpen },
    { id: "continue", label: "Continue Watching", icon: PlayCircle },
    { id: "progress", label: "Progress", icon: BarChart3 },
    { id: "wishlist", label: "Wishlist", icon: Heart },
    { id: "certificates", label: "Certificates", icon: Award },
    { id: "reviews", label: "Reviews", icon: Star },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "history", label: "Purchase History", icon: CreditCard },
    { id: "profile", label: "Profile", icon: User },
    { id: "settings", label: "Settings", icon: Settings },
    { id: "discussions", label: "Discussions", icon: MessageSquare },
    { id: "assignments", label: "Assignments", icon: FileText },
    { id: "ai", label: "AI Assistant", icon: Bot },
  ];

  /* -------------------------------------------------------------------------- */
  /*                                VIEW COMPONENTS                             */
  /* -------------------------------------------------------------------------- */

  const DashboardHome = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Welcome Ethan 👋</h1>
        <p className="opacity-90">You&apos;ve learned for 58 hours this month. Keep up the great work!</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Enrolled Courses", val: "6", icon: BookOpen, color: "bg-blue-50 text-blue-600" },
          { label: "Completed", val: "2", icon: CheckCircle, color: "bg-green-50 text-green-600" },
          { label: "Certificates", val: "2", icon: Award, color: "bg-purple-50 text-purple-600" },
          { label: "Hours Learned", val: "58", icon: PlayCircle, color: "bg-orange-50 text-orange-600" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full ${stat.color} flex items-center justify-center`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stat.val}</p>
              <p className="text-xs text-gray-500 uppercase tracking-wide">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <h3 className="font-bold text-gray-900 mb-4">Continue Learning</h3>
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer group">
          <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden shrink-0">
            <img src="https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=100&h=100&fit=crop" alt="React" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-gray-900 group-hover:text-orange-500 transition">React Masterclass</h4>
            <p className="text-xs text-gray-500 mt-1">Module 4 • Lesson 3: Advanced Hooks</p>
            <div className="w-full bg-gray-200 h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-orange-500 h-full rounded-full" style={{ width: "78%" }}></div>
            </div>
          </div>
          <button className="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center hover:bg-orange-600 transition shrink-0">
            <PlayCircle className="w-5 h-5 fill-current" />
          </button>
        </div>
      </div>
    </div>
  );

  // Courses State with Asynchronous Queue Support
  const [coursesList, setCoursesList] = useState([
    { id: "c101", title: "Full Stack Web Development", progress: 100, instructor: "John Doe", img: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=250&fit=crop", claimed: false },
    { id: "c102", title: "React Masterclass", progress: 78, instructor: "John Doe", img: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=250&fit=crop", claimed: false },
    { id: "c103", title: "Next.js Fundamentals", progress: 100, instructor: "Jane Smith", img: "https://images.unsplash.com/photo-1555099962-4199c345e5dd?w=400&h=250&fit=crop", claimed: true },
    { id: "c104", title: "Python Data Science", progress: 100, instructor: "Alex Rivera", img: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=250&fit=crop", claimed: true },
  ]);

  // Certificates State
  const [certificatesList, setCertificatesList] = useState([
    { id: "CERT-EDU-NEXTJS-4921", courseTitle: "Next.js Fundamentals", date: "Jan 28, 2024", instructor: "Jane Smith" },
    { id: "CERT-EDU-PYTHON-8832", courseTitle: "Python Data Science", date: "Feb 02, 2024", instructor: "Alex Rivera" },
  ]);

  const [completingCourseId, setCompletingCourseId] = useState<string | null>(null);
  const [queueNotice, setQueueNotice] = useState<{ msg: string; jobId: string; latencyMs: number } | null>(null);

  // High-Resolution Certificate PDF/PNG Generator & Downloader
  const handleDownloadCertificate = (courseTitle: string, instructorName: string, certId: string, certDate: string) => {
    const canvas = document.createElement("canvas");
    canvas.width = 1400;
    canvas.height = 950;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 1. Parchment Ivory Background
    ctx.fillStyle = "#FDFCF7";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Decorative Outer & Inner Luxury Gold Borders
    ctx.strokeStyle = "#C5A059";
    ctx.lineWidth = 14;
    ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);

    ctx.strokeStyle = "#E6CA85";
    ctx.lineWidth = 3;
    ctx.strokeRect(45, 45, canvas.width - 90, canvas.height - 90);

    ctx.strokeStyle = "#C5A059";
    ctx.lineWidth = 1;
    ctx.strokeRect(55, 55, canvas.width - 110, canvas.height - 110);

    // 3. Header
    ctx.textAlign = "center";
    ctx.fillStyle = "#8C7137";
    ctx.font = "bold 22px serif";
    ctx.fillText("★  E D U P R E S S   A C A D E M Y   O F   T E C H N O L O G Y  ★", canvas.width / 2, 120);

    ctx.fillStyle = "#1E293B";
    ctx.font = "bold 44px serif";
    ctx.fillText("CERTIFICATE OF ACHIEVEMENT", canvas.width / 2, 185);

    ctx.strokeStyle = "#C5A059";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - 250, 210);
    ctx.lineTo(canvas.width / 2 + 250, 210);
    ctx.stroke();

    // 4. Subtitle & Recipient
    ctx.fillStyle = "#64748B";
    ctx.font = "italic 20px serif";
    ctx.fillText("This is officially awarded and presented to", canvas.width / 2, 270);

    ctx.fillStyle = "#EA580C";
    ctx.font = "bold 56px 'Georgia', serif";
    ctx.fillText("Ethan Hunt", canvas.width / 2, 350);

    ctx.strokeStyle = "#EA580C";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2 - 200, 375);
    ctx.lineTo(canvas.width / 2 + 200, 375);
    ctx.stroke();

    // 5. Completion Description
    ctx.fillStyle = "#475569";
    ctx.font = "20px sans-serif";
    ctx.fillText("for successfully completing all curriculum lectures, practical hands-on labs,", canvas.width / 2, 435);
    ctx.fillText("and professional milestone projects required for mastery of", canvas.width / 2, 470);

    ctx.fillStyle = "#0F172A";
    ctx.font = "bold 38px serif";
    ctx.fillText(courseTitle, canvas.width / 2, 540);

    // 6. Metadata (ID & Date)
    ctx.fillStyle = "#64748B";
    ctx.font = "16px monospace";
    ctx.fillText(`Certificate ID: ${certId}`, canvas.width / 2, 610);
    ctx.fillText(`Issued: ${certDate}  •  Accredited by EduPress Global LMS`, canvas.width / 2, 638);

    // 7. Gold Seal
    ctx.beginPath();
    ctx.arc(canvas.width / 2, 740, 52, 0, Math.PI * 2);
    ctx.fillStyle = "#C5A059";
    ctx.fill();
    ctx.strokeStyle = "#E6CA85";
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 13px sans-serif";
    ctx.fillText("★ VERIFIED ★", canvas.width / 2, 735);
    ctx.fillText("ACCREDITED", canvas.width / 2, 755);

    // 8. Signatures
    // Left: Instructor
    ctx.textAlign = "center";
    ctx.fillStyle = "#0F172A";
    ctx.font = "italic bold 22px 'Brush Script MT', cursive, serif";
    ctx.fillText(instructorName, 260, 750);
    ctx.strokeStyle = "#94A3B8";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(140, 765);
    ctx.lineTo(380, 765);
    ctx.stroke();
    ctx.fillStyle = "#64748B";
    ctx.font = "14px sans-serif";
    ctx.fillText(`${instructorName} — Lead Instructor`, 260, 790);

    // Right: Director
    ctx.fillStyle = "#0F172A";
    ctx.font = "italic bold 22px 'Brush Script MT', cursive, serif";
    ctx.fillText("Dr. Sarah Jenkins", canvas.width - 260, 750);
    ctx.strokeStyle = "#94A3B8";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(canvas.width - 380, 765);
    ctx.lineTo(canvas.width - 140, 765);
    ctx.stroke();
    ctx.fillStyle = "#64748B";
    ctx.font = "14px sans-serif";
    ctx.fillText("Dr. Sarah Jenkins — Academic Director", canvas.width - 260, 790);

    // 9. Trigger Direct PNG/PDF Download
    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `EduPress_Certificate_${courseTitle.replace(/\s+/g, "_")}.png`;
    link.href = dataUrl;
    link.click();
  };

  // Asynchronous Queue Trigger (Concept #27)
  const handleClaimCertificateAsync = async (course: typeof coursesList[0]) => {
    setCompletingCourseId(course.id);
    try {
      const res = await fetch("/api/courses/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: course.id,
          courseTitle: course.title,
          studentEmail: "ethan@example.com",
          studentName: "Ethan Hunt",
          instructorName: course.instructor,
        }),
      });
      const data = await res.json();

      if (data.success) {
        const newCertId = `CERT-EDU-${course.id.toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        const newCert = {
          id: newCertId,
          courseTitle: course.title,
          date: "Sep 01, 2026",
          instructor: course.instructor,
        };

        // Update local state
        setCertificatesList(prev => [newCert, ...prev]);
        setCoursesList(prev => prev.map(c => c.id === course.id ? { ...c, claimed: true } : c));

        setQueueNotice({
          msg: `🎉 Event published to Message Queue in ${data.latencyMs || 15}ms! Certificate generated & ready.`,
          jobId: data.jobId,
          latencyMs: data.latencyMs || 15,
        });

        setTimeout(() => setQueueNotice(null), 8000);
      }
    } catch {
      alert("Failed to connect to message queue. Please check server status.");
    } finally {
      setCompletingCourseId(null);
    }
  };

  const MyCourses = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">My Courses</h2>
        <span className="text-xs font-semibold bg-orange-50 text-orange-600 px-3 py-1 rounded-full border border-orange-200">
          ⚡ Event-Driven Message Queue Active
        </span>
      </div>

      {queueNotice && (
        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm font-bold">✓</span>
            <div>
              <p className="text-sm font-bold text-emerald-900">{queueNotice.msg}</p>
              <p className="text-xs text-emerald-700">Job ID: <code className="bg-emerald-100 px-1.5 py-0.5 rounded">{queueNotice.jobId}</code> • Queue Latency: <b>{queueNotice.latencyMs}ms</b></p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab("certificates")}
            className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition"
          >
            View Certificates →
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {coursesList.map((course) => (
          <div key={course.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden group flex flex-col justify-between">
            <div>
              <div className="h-44 overflow-hidden relative">
                <img src={course.img} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gray-200">
                  <div className={`h-full ${course.progress === 100 ? "bg-emerald-500" : "bg-orange-500"}`} style={{ width: `${course.progress}%` }}></div>
                </div>
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-gray-900 text-base">{course.title}</h3>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${course.progress === 100 ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700"}`}>
                    {course.progress}%
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-4">Instructor: {course.instructor}</p>
              </div>
            </div>

            <div className="p-5 pt-0">
              {course.progress === 100 ? (
                course.claimed ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDownloadCertificate(course.title, course.instructor, `CERT-EDU-${course.id.toUpperCase()}`, "Sep 01, 2026")}
                      className="flex-1 bg-emerald-600 text-white text-xs font-bold py-2.5 rounded-lg hover:bg-emerald-700 transition flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-200"
                    >
                      <Download className="w-4 h-4" /> Download Certificate
                    </button>
                    <button
                      onClick={() => setActiveTab("certificates")}
                      className="px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-xs font-medium text-gray-600"
                    >
                      View All
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleClaimCertificateAsync(course)}
                    disabled={completingCourseId === course.id}
                    className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold py-2.5 rounded-lg transition flex items-center justify-center gap-2 shadow-sm shadow-orange-200 disabled:opacity-50"
                  >
                    {completingCourseId === course.id ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Queuing Event in Redis...</span>
                      </>
                    ) : (
                      <>
                        <Award className="w-4 h-4" />
                        <span>Claim Certificate (Async Queue)</span>
                      </>
                    )}
                  </button>
                )
              ) : (
                <div className="flex gap-2">
                  <button className="flex-1 bg-black text-white text-xs py-2.5 rounded-lg hover:bg-gray-800 transition font-medium">
                    Continue Learning
                  </button>
                  <button className="px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                    <MessageSquare className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const Certificates = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">My Certificates</h2>
          <p className="text-xs text-gray-500 mt-1">Official verified credentials generated by EduPress LMS</p>
        </div>
        <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full border border-emerald-200 flex items-center gap-1.5">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> {certificatesList.length} Verified Credentials
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {certificatesList.map((cert, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition">
            <div className="flex gap-4 items-start">
              <div className="w-14 h-14 bg-gradient-to-tr from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center text-white shadow-sm shadow-orange-200 shrink-0">
                <Award className="w-7 h-7" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] uppercase font-bold text-orange-600 tracking-wider">Official Certificate</span>
                <h3 className="font-bold text-gray-900 text-base truncate mt-0.5">{cert.courseTitle}</h3>
                <p className="text-xs text-gray-500 mt-0.5">Instructor: {cert.instructor} • Issued: {cert.date}</p>
                <p className="text-[11px] font-mono text-gray-400 mt-1">ID: {cert.id}</p>
              </div>
            </div>

            <div className="flex gap-2 mt-5 pt-4 border-t border-gray-50">
              <button
                onClick={() => handleDownloadCertificate(cert.courseTitle, cert.instructor, cert.id, cert.date)}
                className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm shadow-orange-200 transition"
              >
                <Download className="w-3.5 h-3.5" /> Download Certificate
              </button>
              <button
                onClick={() => alert(`Certificate ${cert.id} is officially verified on EduPress LMS Blockchain Registry.`)}
                className="text-xs flex items-center gap-1 text-gray-600 hover:text-orange-500 px-3 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition"
              >
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Verify
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const ContinueWatching = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold text-gray-900">Continue Watching</h2>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="aspect-video bg-gray-900 relative flex items-center justify-center group cursor-pointer">
          <img src="https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200&h=675&fit=crop" className="absolute inset-0 w-full h-full object-cover opacity-60" alt="Video" />
          <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition z-10">
            <PlayCircle className="w-10 h-10 fill-current" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gray-700">
            <div className="bg-orange-500 h-full w-[45%]"></div>
          </div>
        </div>
        <div className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-bold text-orange-500 uppercase tracking-wider">React Masterclass</span>
              <h3 className="text-xl font-bold text-gray-900 mt-1">Module 4: Advanced Patterns</h3>
              <p className="text-gray-500 text-sm mt-1">Lesson 3: Custom Hooks & Performance</p>
            </div>
            <button className="bg-black text-white px-6 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition">
              Continue ▶
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const Progress = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold text-gray-900">Your Progress</h2>
      <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm text-center">
        <h3 className="text-lg font-medium text-gray-500 mb-4">Overall Progress</h3>
        <div className="relative w-48 h-48 mx-auto mb-4">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path className="text-gray-100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
            <path className="text-orange-500" strokeDasharray="82, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <span className="text-4xl font-bold text-gray-900">82%</span>
            <span className="text-xs text-gray-400">Completed</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h4 className="font-bold text-gray-900 mb-4">Per-course progress</h4>
          <div className="space-y-4">
            {["React", "Next.js", "Python"].map((c, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{c}</span>
                  <span className="font-bold text-gray-900">{[78, 35, 100][i]}%</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-orange-500 h-full rounded-full" style={{ width: `${[78, 35, 100][i]}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h4 className="font-bold text-gray-900 mb-4">Time Spent Learning</h4>
          <div className="flex items-end gap-2 h-32">
            {[40, 65, 30, 80, 55, 90, 45].map((h, i) => (
              <div key={i} className="flex-1 bg-orange-100 rounded-t-sm relative group">
                <div className="absolute bottom-0 left-0 right-0 bg-orange-500 rounded-t-sm transition-all duration-500 group-hover:bg-orange-600" style={{ height: `${h}%` }}></div>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
          </div>
        </div>
      </div>
    </div>
  );

  const Wishlist = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold text-gray-900">My Wishlist</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {["Python Advanced", "Node.js Backend", "AI Masterclass"].map((item, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <h3 className="font-bold text-gray-900">{item}</h3>
              <button className="text-red-400 hover:text-red-600 transition"><Trash2 className="w-4 h-4" /></button>
            </div>
            <p className="text-sm text-gray-500">Master the fundamentals of {item.split(" ")[0]} with hands-on projects.</p>
            <div className="mt-auto pt-4 border-t border-gray-50 flex gap-2">
              <button className="flex-1 bg-orange-500 text-white py-2 rounded text-sm font-medium hover:bg-orange-600 transition">Enroll Now</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const Reviews = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold text-gray-900">My Reviews</h2>
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex gap-4 mb-4">
          <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden shrink-0">
            <img src="https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=100&h=100&fit=crop" alt="Course" className="w-full h-full object-cover" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">React Masterclass</h3>
            <div className="flex text-yellow-400 my-1">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
            </div>
            <p className="text-sm text-gray-600 italic">&ldquo;Amazing course. The instructor explains complex concepts very clearly.&rdquo;</p>
          </div>
        </div>
        <div className="flex gap-3 pt-4 border-t border-gray-50">
          <button className="text-xs flex items-center gap-1 text-gray-500 hover:text-orange-500 transition"><Edit3 className="w-3 h-3" /> Edit Review</button>
          <button className="text-xs flex items-center gap-1 text-red-400 hover:text-red-600 transition"><Trash2 className="w-3 h-3" /> Delete</button>
        </div>
      </div>
    </div>
  );

  const Notifications = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-50">
        {[
          { title: "New Lesson Uploaded", desc: 'Instructor uploaded "Advanced Redux" in React Masterclass', time: "2h ago", read: false },
          { title: "Certificate Ready", desc: "Your Python Data Science certificate is ready to download.", time: "1d ago", read: false },
          { title: "Payment Successful", desc: "Receipt for Next.js Fundamentals purchase.", time: "3d ago", read: true },
          { title: "Assignment Graded", desc: "You scored 8/10 on Assignment 1 in React Masterclass.", time: "5d ago", read: true },
        ].map((notif, i) => (
          <div key={i} className={`p-4 flex gap-4 hover:bg-gray-50 transition ${!notif.read ? "bg-orange-50/30" : ""}`}>
            <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${!notif.read ? "bg-orange-500" : "bg-transparent"}`}></div>
            <div className="flex-1">
              <h4 className="text-sm font-bold text-gray-900">{notif.title}</h4>
              <p className="text-xs text-gray-500 mt-1">{notif.desc}</p>
            </div>
            <span className="text-xs text-gray-400 whitespace-nowrap">{notif.time}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const PurchaseHistory = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold text-gray-900">Purchase History</h2>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
            <tr>
              <th className="px-6 py-4 font-medium">Course</th>
              <th className="px-6 py-4 font-medium">Amount</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {[
              { name: "React Masterclass", price: "₹999", status: "Paid" },
              { name: "Next.js Fundamentals", price: "₹1,499", status: "Paid" },
              { name: "Python Data Science", price: "₹799", status: "Paid" },
            ].map((item, i) => (
              <tr key={i} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 font-medium text-gray-900">{item.name}</td>
                <td className="px-6 py-4 text-gray-600">{item.price}</td>
                <td className="px-6 py-4"><span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">{item.status}</span></td>
                <td className="px-6 py-4 text-right">
                  <button className="text-orange-500 hover:text-orange-600 text-xs font-medium">Download Invoice</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const Profile = () => (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-3xl">
      <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
      <div className="flex items-center gap-6 mb-8">
        <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden border-4 border-white shadow-md">
          <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop" alt="Avatar" className="w-full h-full object-cover" />
        </div>
        <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition">Update Avatar</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Full Name</label>
          <input type="text" defaultValue="Ethan Hunt" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Email Address</label>
          <input type="email" defaultValue="ethan@example.com" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition" />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-gray-700">Bio</label>
          <textarea rows={3} defaultValue="Frontend Developer passionate about React and UI Design." className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"></textarea>
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-gray-700">Social Links</label>
          <input type="url" placeholder="https://twitter.com/username" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition" />
        </div>
      </div>
      <div className="pt-6 border-t border-gray-100">
        <h3 className="font-bold text-gray-900 mb-4">Change Password</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input type="password" placeholder="Current Password" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition" />
          <input type="password" placeholder="New Password" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition" />
        </div>
      </div>
      <div className="flex justify-end pt-4">
        <button className="bg-orange-500 text-white px-8 py-3 rounded-lg font-bold hover:bg-orange-600 transition shadow-md shadow-orange-200">Save Changes</button>
      </div>
    </div>
  );

  const AccountSettings = () => (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-2xl">
      <h2 className="text-2xl font-bold text-gray-900">Account Settings</h2>
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {darkMode ? <Moon className="w-5 h-5 text-orange-500" /> : <Sun className="w-5 h-5 text-orange-500" />}
            <div>
              <h4 className="font-bold text-gray-900">Dark Mode</h4>
              <p className="text-xs text-gray-500">Adjust the appearance of the dashboard</p>
            </div>
          </div>
          <button onClick={() => setDarkMode(!darkMode)} className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${darkMode ? "bg-orange-500" : "bg-gray-300"}`}>
            <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${darkMode ? "translate-x-6" : "translate-x-0"}`}></div>
          </button>
        </div>
        <div className="flex items-center justify-between pt-6 border-t border-gray-50">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-orange-500" />
            <div>
              <h4 className="font-bold text-gray-900">Language</h4>
              <p className="text-xs text-gray-500">Select your preferred language</p>
            </div>
          </div>
          <select className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-orange-500">
            <option>English (US)</option>
            <option>Spanish</option>
            <option>French</option>
          </select>
        </div>
        <div className="flex items-center justify-between pt-6 border-t border-gray-50">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-orange-500" />
            <div>
              <h4 className="font-bold text-gray-900">Email Notifications</h4>
              <p className="text-xs text-gray-500">Receive updates about courses and assignments</p>
            </div>
          </div>
          <button className="w-12 h-6 bg-orange-500 rounded-full p-1">
            <div className="w-4 h-4 bg-white rounded-full shadow-md translate-x-6"></div>
          </button>
        </div>
        <div className="pt-6 border-t border-gray-50">
          <button className="flex items-center gap-2 text-red-500 hover:text-red-600 transition text-sm font-medium">
            <Trash2 className="w-4 h-4" /> Delete Account
          </button>
        </div>
      </div>
    </div>
  );

  const Discussions = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Course Discussions</h2>
        <button className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-orange-600 transition flex items-center gap-2">
          <MessageSquare className="w-4 h-4" /> New Question
        </button>
      </div>
      <div className="space-y-4">
        {[
          { user: "Sarah J.", title: "How do I fix the useEffect dependency warning?", replies: 12, likes: 5, time: "2h ago", bookmarked: true },
          { user: "Mike T.", title: "Best resources for learning TypeScript with React?", replies: 8, likes: 15, time: "5h ago", bookmarked: false },
          { user: "Alex R.", title: "Assignment 2 submission deadline extended?", replies: 3, likes: 2, time: "1d ago", bookmarked: false },
        ].map((post, i) => (
          <div key={i} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">{post.user.charAt(0)}</div>
                <span className="text-sm font-bold text-gray-900">{post.user}</span>
                <span className="text-xs text-gray-400">• {post.time}</span>
              </div>
              <button className={`${post.bookmarked ? "text-orange-500" : "text-gray-300 hover:text-orange-500"} transition`}>
                <Heart className={`w-4 h-4 ${post.bookmarked ? "fill-current" : ""}`} />
              </button>
            </div>
            <h3 className="font-medium text-gray-800 mb-3 hover:text-orange-500 cursor-pointer">{post.title}</h3>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {post.replies} Replies</span>
              <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {post.likes} Likes</span>
              <button className="ml-auto text-orange-500 font-medium hover:underline">Reply</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const Assignments = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold text-gray-900">My Assignments</h2>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-gray-900">Assignment 1: Component Architecture</h3>
            <p className="text-sm text-gray-500 mt-1">React Masterclass • Due: Jan 20, 2024</p>
          </div>
          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Submitted
          </span>
        </div>
        <div className="p-6 bg-gray-50/50 flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">Grade Received</p>
            <p className="text-2xl font-bold text-gray-900">8<span className="text-base text-gray-400 font-normal">/10</span></p>
          </div>
          <button className="text-orange-500 text-sm font-medium hover:underline">View Feedback</button>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden opacity-75">
        <div className="p-6 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-gray-900">Assignment 2: State Management</h3>
            <p className="text-sm text-gray-500 mt-1">React Masterclass • Due: Feb 05, 2024</p>
          </div>
          <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold">Pending</span>
        </div>
      </div>
    </div>
  );



  /* -------------------------------------------------------------------------- */
  /*                                MAIN RENDER                                 */
  /* -------------------------------------------------------------------------- */
  return (
    <div className={`min-h-screen bg-gray-50 font-sans text-gray-800 ${darkMode ? "dark" : ""}`}>
      {/* TOP NAVBAR — full width */}
      <Navbar />

      {/* BELOW NAVBAR: sidebar + main content side by side */}
      <div className="flex" style={{ minHeight: "calc(100vh - 80px)" }}>

        {/* MOBILE OVERLAY */}
        {isSidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)}></div>
        )}

        {/* SIDEBAR */}
        <aside className={`fixed top-20 left-0 h-[calc(100vh-80px)] w-72 bg-white border-r border-gray-100 z-50 transform transition-transform duration-300 lg:sticky lg:top-20 lg:transform-none lg:translate-x-0 flex flex-col shrink-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>

          <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1 custom-scrollbar">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeTab === item.id
                    ? "bg-orange-50 text-orange-600 shadow-sm"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <item.icon className={`w-5 h-5 ${activeTab === item.id ? "text-orange-500" : "text-gray-400"}`} />
                {item.label}
                {item.id === "notifications" && <span className="ml-auto w-2 h-2 bg-red-500 rounded-full"></span>}
              </button>
            ))}
            <div className="pt-4 mt-4 border-t border-gray-100">
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition">
                <LogOut className="w-5 h-5" /> Logout
              </button>
            </div>
          </nav>

          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop" alt="User" className="w-10 h-10 rounded-full object-cover" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">Ethan Hunt</p>
                <p className="text-xs text-gray-500 truncate">Student Account</p>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* TOP BAR */}
          <header className="sticky top-20 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-gray-500 hover:text-gray-900">
                <Menu className="w-6 h-6" />
              </button>
              <h2 className="text-xl font-bold text-gray-900 capitalize hidden sm:block">
                {navItems.find(n => n.id === activeTab)?.label}
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center bg-gray-100 rounded-full px-4 py-2 focus-within:ring-2 focus-within:ring-orange-500/20 transition">
                <Search className="w-4 h-4 text-gray-400 mr-2" />
                <input type="text" placeholder="Search courses..." className="bg-transparent border-none outline-none text-sm w-48 placeholder-gray-400" />
              </div>
              <button className="relative w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
            </div>
          </header>

          {/* DYNAMIC CONTENT */}
          <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
            <div className="max-w-6xl mx-auto">
              {activeTab === "dashboard" && <DashboardHome />}
              {activeTab === "courses" && <MyCourses />}
              {activeTab === "continue" && <ContinueWatching />}
              {activeTab === "progress" && <Progress />}
              {activeTab === "wishlist" && <Wishlist />}
              {activeTab === "certificates" && <Certificates />}
              {activeTab === "reviews" && <Reviews />}
              {activeTab === "notifications" && <Notifications />}
              {activeTab === "history" && <PurchaseHistory />}
              {activeTab === "profile" && <Profile />}
              {activeTab === "settings" && <AccountSettings />}
              {activeTab === "discussions" && <Discussions />}
              {activeTab === "assignments" && <Assignments />}
              {activeTab === "ai" && <AIAssistant />}
            </div>
          </main>
        </div>

      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                     STANDALONE AI ASSISTANT COMPONENT                     */
/* -------------------------------------------------------------------------- */
function AIAssistant() {
  const initialChat: ChatMessage[] = [
    { role: "ai", text: "Hello! 👋 I'm your AI Learning Assistant powered by Groq. You can ask me anything about programming, courses, or just have a casual friendly chat. How can I help you today?" }
  ];

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(initialChat);
  const [inputMessage, setInputMessage] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isAiLoading]);

  const handleSendMessage = async (customMsg?: string) => {
    const textToSend = (customMsg || inputMessage).trim();
    if (!textToSend || isAiLoading) return;

    const newHistory: ChatMessage[] = [...chatHistory, { role: "user", text: textToSend }];
    setChatHistory(newHistory);
    setInputMessage("");
    setIsAiLoading(true);

    try {
      const studentContext = {
        name: "Ethan Hunt",
        email: "ethan@example.com",
        enrolledSince: "January 2024",
        totalSpent: "₹3,297",
        courses: [
          {
            title: "React Masterclass",
            progress: "75%",
            completedLessons: 12,
            totalLessons: 16,
            remainingLessons: 4,
            instructor: "John Doe",
            status: "In Progress",
            certificateEarned: false,
          },
          {
            title: "Next.js Fundamentals",
            progress: "100%",
            completedLessons: 20,
            totalLessons: 20,
            remainingLessons: 0,
            instructor: "Jane Smith",
            status: "Completed",
            certificateEarned: true,
          },
          {
            title: "Python Data Science",
            progress: "30%",
            completedLessons: 6,
            totalLessons: 20,
            remainingLessons: 14,
            instructor: "Alex Rivera",
            status: "In Progress",
            certificateEarned: false,
          },
        ],
        purchases: [
          { course: "React Masterclass", price: "₹999", date: "Jan 15, 2024", invoiceId: "INV-2024-001" },
          { course: "Next.js Fundamentals", price: "₹1,499", date: "Jan 28, 2024", invoiceId: "INV-2024-002" },
          { course: "Python Data Science", price: "₹799", date: "Feb 02, 2024", invoiceId: "INV-2024-003" },
        ],
      };

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newHistory, studentContext }),
      });
      const data = await res.json();
      if (data.error) {
        setChatHistory(prev => [...prev, {
          role: "ai",
          text: `⚠️ ${data.error}`
        }]);
      } else {
        setChatHistory(prev => [...prev, {
          role: "ai",
          text: data.reply || "I didn't receive a response. Please try again!",
          latencyMs: data.latencyMs,
          source: data.source,
        }]);
      }
    } catch {
      setChatHistory(prev => [...prev, {
        role: "ai",
        text: "⚠️ Connection error. Please check your internet or try again."
      }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const quickPrompts = [
    "💰 How much money have I spent on courses?",
    "🏆 When will I get my React Masterclass certificate?",
    "📚 What courses am I currently enrolled in?",
    "📬 How do I contact platform support?",
    "💡 Explain React Hooks simply",
  ];

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col animate-in fade-in duration-500 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-tr from-orange-500 to-amber-500 rounded-xl flex items-center justify-center text-white shadow-sm shadow-orange-200">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-900 text-sm">AI Learning Assistant</h3>
              <span className="bg-orange-100 text-orange-700 text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Groq AI Fast
              </span>
            </div>
            <p className="text-[11px] text-gray-500">Ask questions, discuss topics, or have casual friendly talks</p>
          </div>
        </div>
        <button
          onClick={() => setChatHistory(initialChat)}
          title="Reset Chat"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition border border-gray-200 hover:border-orange-200"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Clear</span>
        </button>
      </div>

      {/* Message Thread */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-gray-50/40 custom-scrollbar">
        {chatHistory.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-2.5`}>
            {msg.role === "ai" && (
              <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
            )}
            <div
              className={`max-w-[85%] sm:max-w-[75%] p-3.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-br-sm shadow-sm"
                  : "bg-white text-gray-800 border border-gray-100 rounded-tl-sm shadow-xs"
              }`}
            >
              {msg.text}
              {msg.role === "ai" && msg.latencyMs !== undefined && (
                <div className="mt-2.5 pt-2 border-t border-gray-100/80 flex items-center gap-1.5 text-[11px]">
                  {msg.source === "cache" ? (
                    <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60 font-semibold shadow-2xs">
                      ⚡ {msg.latencyMs}ms (Redis Cache HIT)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60 font-medium shadow-2xs">
                      ⏱️ {msg.latencyMs}ms (Groq LLM)
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isAiLoading && (
          <div className="flex justify-start gap-2.5 items-center">
            <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-gray-100 px-4 py-2.5 rounded-2xl rounded-tl-sm text-sm text-gray-500 flex items-center gap-2 shadow-xs">
              <Loader2 className="w-4 h-4 text-orange-500 animate-spin" />
              <span className="text-xs">AI is thinking...</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Quick Suggestion Prompts */}
      {chatHistory.length <= 2 && !isAiLoading && (
        <div className="px-4 py-2 bg-white border-t border-gray-100 flex items-center gap-2 overflow-x-auto custom-scrollbar">
          <span className="text-[11px] text-gray-400 font-medium shrink-0">Try asking:</span>
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              className="shrink-0 text-xs bg-gray-50 hover:bg-orange-50 hover:text-orange-600 text-gray-600 px-3 py-1.5 rounded-full border border-gray-200 hover:border-orange-200 transition"
            >
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input Bar */}
      <div className="p-3 sm:p-4 border-t border-gray-100 bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={isAiLoading ? "Waiting for AI..." : "Type your message or ask a question..."}
            disabled={isAiLoading}
            className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition disabled:bg-gray-50"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isAiLoading}
            className="px-4 bg-orange-500 text-white rounded-xl flex items-center justify-center hover:bg-orange-600 transition disabled:opacity-40 disabled:cursor-not-allowed shadow-sm shadow-orange-200"
          >
            {isAiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  );
}
