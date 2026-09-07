"use client";

import React, { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import {
  LayoutDashboard, BookOpen, PlayCircle, BarChart3, Heart,
  Award, Star, Bell, CreditCard, User, Settings, MessageSquare,
  FileText, Bot, LogOut, Download, Share2, CheckCircle,
  Search, Menu, Moon, Sun, Globe, Mail, Trash2, Edit3, Send,
  Loader2, Sparkles, RotateCcw, Radio, Zap, ShieldCheck,
  Database, Activity, RefreshCw, Layers, ShieldAlert, Server, HardDrive, Filter, Eye, PlusCircle,
  Plus, PanelLeft, X, Clock, MessageCircle, KeyRound, CheckCircle2, AlertCircle, EyeOff, Save
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

  // Authenticated Student State
  const [currentUser, setCurrentUser] = useState<{
    id?: string;
    fullName: string;
    username: string;
    email: string;
    avatarUrl: string;
    bio?: string;
    role?: string;
  }>({
    fullName: "Student",
    username: "student",
    email: "",
    avatarUrl: "",
    bio: "",
  });

  const [userPurchases, setUserPurchases] = useState<any[]>([]);
  const [totalSpentAmount, setTotalSpentAmount] = useState<number>(0);

  // Real-Time WebSockets State (Concept #24)
  const [wsConnected, setWsConnected] = useState(false);
  const [realtimeToast, setRealtimeToast] = useState<{ title: string; desc: string; type: string } | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [notificationsList, setNotificationsList] = useState([
    { id: "notif_1", title: "Certificate Ready", desc: "Your Full Stack Web Development certificate is ready to download.", time: "Just now", read: false, type: "CERTIFICATE" },
    { id: "notif_2", title: "New Lesson Uploaded", desc: 'Instructor uploaded "Advanced Custom Hooks" in React Masterclass', time: "2h ago", read: false, type: "LESSON" },
    { id: "notif_3", title: "Payment Successful", desc: "Receipt for Next.js Fundamentals purchase.", time: "3d ago", read: true, type: "PAYMENT" },
    { id: "notif_4", title: "Assignment Graded", desc: "You scored 9.5/10 on Redux Toolkit Milestone.", time: "5d ago", read: true, type: "ASSIGNMENT" },
  ]);

  // Fetch student profile and calculate purchases
  const fetchUserProfile = async () => {
    try {
      const res = await fetch('/api/users/profile');
      const data = await res.json();
      if (data.profile) {
        const p = data.profile;
        const avatar = p.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(p.email || p.username || 'student')}`;
        const userObj = {
          id: p.id,
          fullName: p.fullName || (p.username ? p.username.charAt(0).toUpperCase() + p.username.slice(1) : 'Student'),
          username: p.username || 'student',
          email: p.email || '',
          avatarUrl: avatar,
          bio: p.bio || '',
          role: p.role || 'student',
        };
        setCurrentUser(userObj);

        // Load user-scoped purchases
        if (p.email) {
          const userPurchaseKey = `student_purchases_${p.email}`;
          const raw = localStorage.getItem(userPurchaseKey) || localStorage.getItem('student_purchases');
          let purchases = [];
          try {
            purchases = raw ? JSON.parse(raw) : [];
          } catch {
            purchases = [];
          }
          if (!Array.isArray(purchases)) purchases = [];
          setUserPurchases(purchases);

          // Calculate total spent
          let total = 0;
          purchases.forEach((item: any) => {
            if (typeof item.price === 'number') {
              total += item.price;
            } else if (item.price) {
              const num = parseFloat(String(item.price).replace(/[^0-9.]/g, ''));
              if (!isNaN(num)) total += num;
            }
          });
          setTotalSpentAmount(total);
        }
      }
    } catch (err) {
      console.warn('Failed to load user profile in StudentDashboard:', err);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Concept #11: Telemetry Logger for MongoDB Atlas User Activity Logs
  const logStudentActivity = async (action: string, details?: any) => {
    try {
      await fetch('/api/logs/activity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          studentEmail: currentUser.email || 'student@example.com',
          details: details || {},
        }),
      });
    } catch {
      // Graceful telemetry fallback
    }
  };

  // Automatically record tab navigation events to MongoDB Atlas
  useEffect(() => {
    logStudentActivity('VIEW_TAB', { tab: activeTab });
  }, [activeTab, currentUser.email]);

  // Connect to Real-Time WebSocket Server (Port 4000 / Nginx Proxy)
  useEffect(() => {
    const wsUrl = typeof window !== 'undefined'
      ? (window.location.port ? `${window.location.protocol}//${window.location.hostname}:4000` : window.location.origin)
      : 'http://127.0.0.1:4000';

    let socket: any = null;
    try {
      socket = io(wsUrl, {
        path: '/socket.io/',
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 10,
        reconnectionDelay: 2000,
      });

      socket.on('connect', () => {
        setWsConnected(true);
      });

      socket.on('disconnect', () => {
        setWsConnected(false);
      });

      // Event 1: Real-Time Blog Push from Instructor
      socket.on('notification:new_blog', (data: any) => {
        const newNotif = {
          id: data.id || `notif_${Date.now()}`,
          title: `📝 ${data.title}`,
          desc: `${data.desc} (By ${data.author})`,
          time: 'Just now',
          read: false,
          type: 'BLOG',
        };
        setNotificationsList((prev) => [newNotif, ...prev]);
        setRealtimeToast({ title: newNotif.title, desc: newNotif.desc, type: 'BLOG' });
        setTimeout(() => setRealtimeToast(null), 7000);
      });

      // Event 2: Real-Time Doubt Reply from Instructor
      socket.on('notification:doubt_reply', (data: any) => {
        const newNotif = {
          id: data.id || `notif_${Date.now()}`,
          title: `💬 ${data.title}`,
          desc: `${data.desc} (Instructor: ${data.instructorName || 'John Doe'})`,
          time: 'Just now',
          read: false,
          type: 'DOUBT',
        };
        setNotificationsList((prev) => [newNotif, ...prev]);
        setRealtimeToast({ title: newNotif.title, desc: newNotif.desc, type: 'DOUBT' });
        setTimeout(() => setRealtimeToast(null), 7000);
      });
    } catch (err) {
      console.warn('WebSocket init warning:', err);
    }

    return () => {
      if (socket) socket.disconnect();
    };
  }, []);

  // Simulator helper to trigger real-time push from UI
  const triggerSimulatorPush = async (type: 'BLOG' | 'DOUBT') => {
    setIsSimulating(true);
    try {
      const payload = type === 'BLOG'
        ? {
            type: 'BLOG',
            payload: {
              title: 'Mastering Next.js Turbopack in 2026',
              author: 'John Doe',
              desc: 'Learn how to optimize bundle sizes and speed up HMR build times by 10x.',
            },
          }
        : {
            type: 'DOUBT',
            payload: {
              courseTitle: 'React Masterclass',
              replyPreview: 'Yes! useEffect cleanups execute before the component unmounts or before re-running the effect.',
              studentEmail: currentUser.email || 'student@example.com',
              instructorName: 'John Doe',
            },
          };

      await fetch('/api/notifications/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.error('Simulator error:', err);
    } finally {
      setIsSimulating(false);
    }
  };

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
    { id: "logs", label: "Audit Logs (MongoDB)", icon: Database },
  ];

  /* -------------------------------------------------------------------------- */
  /*                                VIEW COMPONENTS                             */
  /* -------------------------------------------------------------------------- */

  const DashboardHome = () => {
    const firstName = (currentUser.fullName || currentUser.username || "Student").split(" ")[0];
    const enrolledCount = userPurchases.length > 0 ? userPurchases.length : coursesList.length;
    const completedCount = coursesList.filter(c => c.progress === 100 || c.claimed).length;
    const certsCount = certificatesList.length;

    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-8 text-white shadow-lg">
          <h1 className="text-3xl font-bold mb-2">Welcome {firstName} 👋</h1>
          <p className="opacity-90">
            {totalSpentAmount > 0
              ? `Total investment: ₹${totalSpentAmount.toLocaleString('en-IN')} across ${enrolledCount} course${enrolledCount === 1 ? '' : 's'}. Keep up the great work!`
              : "You're all set to start your learning journey. Check out your enrolled courses below!"}
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Enrolled Courses", val: String(enrolledCount), icon: BookOpen, color: "bg-blue-50 text-blue-600" },
            { label: "Completed", val: String(completedCount), icon: CheckCircle, color: "bg-green-50 text-green-600" },
            { label: "Certificates", val: String(certsCount), icon: Award, color: "bg-purple-50 text-purple-600" },
            { label: "Total Spent", val: `₹${totalSpentAmount.toLocaleString('en-IN')}`, icon: CreditCard, color: "bg-orange-50 text-orange-600" },
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
  };

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
    ctx.fillText(currentUser.fullName || currentUser.username || "Student", canvas.width / 2, 350);

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
          studentEmail: currentUser.email || "student@example.com",
          studentName: currentUser.fullName || currentUser.username || "Student",
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

  const Reviews = () => {
    const [reviewsList, setReviewsList] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState("react-masterclass");
    const [rating, setRating] = useState(5);
    const [reviewText, setReviewText] = useState("");
    const [queryLatency, setQueryLatency] = useState<number | null>(null);

    const availableCourses = [
      { id: "react-masterclass", title: "React Masterclass & Enterprise Patterns", instructor: "John Doe" },
      { id: "nextjs-fundamentals", title: "Full Stack Next.js & System Architecture", instructor: "Jane Smith" },
      { id: "python-data-science", title: "Python for Data Science & Machine Learning", instructor: "Alex Rivera" },
    ];

    const fetchReviews = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/reviews');
        const data = await res.json();
        if (data.reviews) {
          setReviewsList(data.reviews);
          setQueryLatency(data.latencyMs);
        }
      } catch (err) {
        console.warn('Failed to load reviews:', err);
      } finally {
        setIsLoading(false);
      }
    };

    useEffect(() => {
      fetchReviews();
    }, []);

    const handlePostReview = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!reviewText.trim() || isSubmitting) return;

      setIsSubmitting(true);
      const course = availableCourses.find(c => c.id === selectedCourse);

      try {
        await fetch('/api/reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            course_id: selectedCourse,
            course_title: course?.title,
            instructor_name: course?.instructor, // Denormalized: stored directly in review table
            student_name: currentUser.fullName || currentUser.username || 'Student',
            student_email: currentUser.email || 'student@example.com',
            rating,
            text: reviewText.trim(),
          }),
        });
        setReviewText("");
        await fetchReviews();
      } catch (err) {
        console.error('Error submitting review:', err);
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        {/* ARCHITECTURE BANNER (Concept #20) */}
        <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent border border-orange-200/80 rounded-2xl p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="bg-orange-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Concept #20: Denormalization
                </span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  ⚡ 0 SQL JOINs
                </span>
              </div>
              <h3 className="text-base font-bold text-gray-900">
                Directly Stored Instructor & Course Metadata
              </h3>
              <p className="text-xs text-gray-600 max-w-2xl">
                Instead of joining 3 SQL tables (<code className="font-mono bg-white px-1 rounded border border-gray-200 text-gray-800">reviews ➔ courses ➔ users</code>) on every page load, <code className="font-mono text-orange-600">instructor_name</code> and <code className="font-mono text-orange-600">course_title</code> are stored directly inside the review record for ultra-fast O(1) indexed reads.
              </p>
            </div>
            {queryLatency !== null && (
              <div className="text-right shrink-0">
                <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 inline-block">
                  Read Latency: {queryLatency}ms
                </span>
              </div>
            )}
          </div>
        </div>

        {/* WRITE REVIEW FORM */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
            <Star className="w-4 h-4 text-orange-500 fill-current" /> Write a Course Review
          </h3>
          <form onSubmit={handlePostReview} className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Select Course & Instructor</label>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 bg-white"
                >
                  {availableCourses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} (Instructor: {c.instructor})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Rating</label>
                <div className="flex items-center gap-1.5 pt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 hover:scale-110 transition"
                    >
                      <Star className={`w-5 h-5 ${star <= rating ? "text-amber-400 fill-amber-400" : "text-gray-300"}`} />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-gray-700 ml-2">{rating} / 5 Stars</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Your Review</label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share your learning experience, course structure feedback, or instructor rating..."
                rows={2}
                className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!reviewText.trim() || isSubmitting}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-5 py-2 rounded-xl transition flex items-center gap-2 disabled:opacity-40 shadow-sm shadow-orange-200"
              >
                {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />} Post Review (Stores Denormalized)
              </button>
            </div>
          </form>
        </div>

        {/* REVIEWS LISTING */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-1">
            <h3 className="font-bold text-gray-900 text-sm">
              Course Reviews Stream ({reviewsList.length})
            </h3>
            <button
              onClick={fetchReviews}
              className="text-xs text-gray-500 hover:text-orange-600 flex items-center gap-1"
            >
              <RefreshCw className={`w-3 h-3 ${isLoading ? "animate-spin" : ""}`} /> Refresh
            </button>
          </div>

          {isLoading ? (
            <div className="py-8 text-center text-gray-400 text-xs flex flex-col items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
              <span>Querying denormalized reviews table...</span>
            </div>
          ) : reviewsList.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-gray-100 text-center text-gray-400 text-xs">
              No reviews found. Be the first to post one above!
            </div>
          ) : (
            reviewsList.map((rev) => (
              <div key={rev.id || rev._id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3 hover:border-orange-200 transition">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <img
                      src={rev.student_avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop"}
                      alt={rev.student_name}
                      className="w-10 h-10 rounded-full object-cover border border-gray-100"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-gray-900 text-xs sm:text-sm">{rev.student_name || "Student"}</h4>
                        <span className="text-[10px] text-gray-400">• {rev.date || "Recently"}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <div className="flex text-amber-400">
                          {[...Array(5)].map((_, idx) => (
                            <Star
                              key={idx}
                              className={`w-3 h-3 ${idx < (rev.rating || 5) ? "fill-amber-400 text-amber-400" : "text-gray-200"}`}
                            />
                          ))}
                        </div>
                        <span className="text-[11px] font-bold text-gray-700">{rev.rating || 5}.0</span>
                      </div>
                    </div>
                  </div>

                  {/* Denormalized Meta Tags */}
                  <div className="flex flex-wrap items-center gap-1.5 sm:self-start">
                    <span className="bg-gray-100 text-gray-700 text-[10px] font-medium px-2 py-0.5 rounded-md border border-gray-200">
                      📚 {rev.course_title || rev.course_id}
                    </span>
                    <span className="bg-orange-50 text-orange-700 text-[10px] font-semibold px-2 py-0.5 rounded-md border border-orange-200">
                      👨‍🏫 Instructor: {rev.instructor_name || "John Doe"}
                    </span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed bg-gray-50/50 p-3 rounded-xl border border-gray-100/80">
                  &ldquo;{rev.text}&rdquo;
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const Notifications = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Real-Time Notifications</h2>
          <p className="text-xs text-gray-500 mt-0.5">Instant event streaming via WebSockets & Socket.IO (Concept #24)</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
            wsConnected
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-amber-50 text-amber-700 border-amber-200"
          }`}>
            <span className={`w-2 h-2 rounded-full ${wsConnected ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`}></span>
            {wsConnected ? "WebSocket Connected (Port 4000)" : "Connecting WebSocket..."}
          </span>
        </div>
      </div>

      {/* Simulator Control Panel */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-5 rounded-2xl text-white shadow-md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-orange-400 animate-pulse" />
            <h3 className="font-bold text-sm">Instructor Event Simulator (Test Real-Time Push)</h3>
          </div>
          <span className="text-[11px] font-mono text-indigo-300">0s Latency WebSockets</span>
        </div>
        <p className="text-xs text-slate-300 mb-4">
          Click either button below to simulate an instructor action. Watch the real-time push toast appear instantly on your screen with zero page reloads!
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => triggerSimulatorPush('BLOG')}
            disabled={isSimulating}
            className="flex-1 min-w-[200px] bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
          >
            {isSimulating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>📢 Post New Blog Post</span>}
          </button>
          <button
            onClick={() => triggerSimulatorPush('DOUBT')}
            disabled={isSimulating}
            className="flex-1 min-w-[200px] bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
          >
            {isSimulating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>💬 Answer Student Doubt</span>}
          </button>
        </div>
      </div>

      {/* Notification Stream List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50 overflow-hidden">
        {notificationsList.map((notif) => (
          <div
            key={notif.id}
            className={`p-4 sm:p-5 flex gap-4 hover:bg-gray-50/80 transition ${
              !notif.read ? "bg-orange-50/20" : ""
            }`}
          >
            <div className={`w-2.5 h-2.5 rounded-full mt-2 shrink-0 ${!notif.read ? "bg-orange-500 shadow-sm shadow-orange-300 animate-pulse" : "bg-transparent"}`}></div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-gray-900 truncate">{notif.title}</h4>
                {notif.type === 'BLOG' && <span className="text-[10px] uppercase tracking-wider font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Blog</span>}
                {notif.type === 'DOUBT' && <span className="text-[10px] uppercase tracking-wider font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Doubt</span>}
              </div>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">{notif.desc}</p>
            </div>
            <span className="text-[11px] text-gray-400 whitespace-nowrap">{notif.time}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const PurchaseHistory = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Purchase History</h2>
          <p className="text-xs text-gray-500 mt-1">Verified transactions and payment invoices for {currentUser.email || 'your account'}</p>
        </div>
        <div className="bg-orange-50 border border-orange-200 px-4 py-2 rounded-xl text-right">
          <p className="text-[11px] uppercase tracking-wider text-orange-600 font-bold">Total Spent</p>
          <p className="text-xl font-extrabold text-orange-700">₹{totalSpentAmount.toLocaleString('en-IN')}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {userPurchases.length === 0 ? (
          <div className="p-12 text-center text-gray-500 space-y-2">
            <CreditCard className="w-10 h-10 text-gray-300 mx-auto" />
            <p className="font-semibold text-gray-700">No purchases recorded yet</p>
            <p className="text-xs text-gray-400">When you enroll in courses, your invoices and purchase details will appear here.</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-6 py-4 font-medium">Course</th>
                <th className="px-6 py-4 font-medium">Invoice ID</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {userPurchases.map((item, i) => (
                <tr key={i} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-medium text-gray-900">{item.course || item.courseTitle || item.name}</td>
                  <td className="px-6 py-4 font-mono text-xs text-gray-500">{item.invoiceId || `INV-${i + 1001}`}</td>
                  <td className="px-6 py-4 font-semibold text-gray-900">{typeof item.price === 'number' ? `₹${item.price.toLocaleString('en-IN')}` : (item.price || '₹0')}</td>
                  <td className="px-6 py-4 text-gray-500 text-xs">{item.date || 'Recent'}</td>
                  <td className="px-6 py-4"><span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">{item.status || 'Paid'}</span></td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => alert(`Invoice ${item.invoiceId || 'INV-2026'} downloaded.`)}
                      className="text-orange-500 hover:text-orange-600 text-xs font-medium cursor-pointer"
                    >
                      Download Invoice
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );

  const Profile = () => {
    const [profileLoading, setProfileLoading] = useState(true);
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [isSavingPassword, setIsSavingPassword] = useState(false);

    // Profile Fields
    const [username, setUsername] = useState("");
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [bio, setBio] = useState("");
    const [avatarUrl, setAvatarUrl] = useState("");
    const [socialTwitter, setSocialTwitter] = useState("");
    const [socialGithub, setSocialGithub] = useState("");
    const [socialLinkedin, setSocialLinkedin] = useState("");

    // Password Fields
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    // Messages
    const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Fetch Profile
    const fetchProfile = async () => {
      setProfileLoading(true);
      try {
        const res = await fetch('/api/users/profile');
        const data = await res.json();
        if (data.profile) {
          setUsername(data.profile.username || "");
          setFullName(data.profile.fullName || "");
          setEmail(data.profile.email || "");
          setBio(data.profile.bio || "");
          setAvatarUrl(data.profile.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(data.profile.email || 'student')}`);
          if (data.profile.socialLinks) {
            setSocialTwitter(data.profile.socialLinks.twitter || "");
            setSocialGithub(data.profile.socialLinks.github || "");
            setSocialLinkedin(data.profile.socialLinks.linkedin || "");
          }
        }
      } catch (err: any) {
        console.warn('Failed to load profile:', err.message);
      } finally {
        setProfileLoading(false);
      }
    };

    useEffect(() => {
      fetchProfile();
    }, []);

    // Save Profile (Username, Full Name, Bio, Social)
    const handleSaveProfile = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSavingProfile(true);
      setProfileMsg(null);

      try {
        const res = await fetch('/api/users/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: username.trim(),
            fullName: fullName.trim(),
            bio: bio.trim(),
            avatarUrl,
            socialLinks: {
              twitter: socialTwitter.trim(),
              github: socialGithub.trim(),
              linkedin: socialLinkedin.trim(),
            },
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          setProfileMsg({ type: 'error', text: data.error || 'Failed to save profile' });
        } else {
          setProfileMsg({ type: 'success', text: data.message || 'Profile saved successfully!' });
          setCurrentUser((prev) => ({
            ...prev,
            username: username.trim(),
            fullName: fullName.trim() || username.trim(),
            bio: bio.trim(),
            avatarUrl: avatarUrl || prev.avatarUrl,
          }));
          setTimeout(() => setProfileMsg(null), 5000);
        }
      } catch (err: any) {
        setProfileMsg({ type: 'error', text: err.message || 'Network error' });
      } finally {
        setIsSavingProfile(false);
      }
    };

    // Update Password
    const handleChangePassword = async (e: React.FormEvent) => {
      e.preventDefault();
      setPasswordMsg(null);

      if (newPassword.length < 6) {
        setPasswordMsg({ type: 'error', text: 'New password must be at least 6 characters long.' });
        return;
      }

      if (newPassword !== confirmPassword) {
        setPasswordMsg({ type: 'error', text: 'New password and confirmation do not match.' });
        return;
      }

      setIsSavingPassword(true);
      try {
        const res = await fetch('/api/users/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          setPasswordMsg({ type: 'error', text: data.error || 'Failed to update password' });
        } else {
          setPasswordMsg({ type: 'success', text: 'Password updated successfully!' });
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
          setTimeout(() => setPasswordMsg(null), 5000);
        }
      } catch (err: any) {
        setPasswordMsg({ type: 'error', text: err.message || 'Network error' });
      } finally {
        setIsSavingPassword(false);
      }
    };

    if (profileLoading) {
      return (
        <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center space-y-3 max-w-3xl">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin mx-auto" />
          <p className="text-xs text-gray-500">Loading student profile details...</p>
        </div>
      );
    }

    return (
      <div className="space-y-8 animate-in fade-in duration-500 max-w-3xl">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Student Profile Settings</h2>
          <p className="text-xs text-gray-500 mt-1">Manage your public account profile, username, and account credentials</p>
        </div>

        {/* --- PROFILE DETAILS CARD --- */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-6 border-b border-gray-100">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-orange-400 to-amber-500 p-0.5 shadow-md">
              <img
                src={avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username || email || 'student')}`}
                alt="Avatar"
                className="w-full h-full object-cover rounded-2xl bg-white"
              />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-base text-gray-900">{fullName || username || 'Student'}</h3>
              <p className="text-xs text-gray-500">{email}</p>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setAvatarUrl(`https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`)}
                  className="text-xs text-orange-600 bg-orange-50 hover:bg-orange-100 px-3 py-1 rounded-lg font-semibold transition"
                >
                  Generate New Avatar
                </button>
              </div>
            </div>
          </div>

          {profileMsg && (
            <div
              className={`p-4 rounded-xl text-xs flex items-center gap-2.5 animate-in fade-in duration-200 ${
                profileMsg.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}
            >
              {profileMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span>{profileMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="e.g. ethan_hunt"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs bg-gray-50 focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Ethan Hunt"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs bg-gray-50 focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none transition"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-gray-700">Email Address (Read-Only)</label>
                <input
                  type="email"
                  value={email}
                  disabled
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs bg-gray-100/70 text-gray-500 outline-none cursor-not-allowed"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-gray-700">Bio / About Me</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell instructors and classmates about your learning background and interests..."
                  className="w-full border border-gray-200 rounded-xl p-3.5 text-xs bg-gray-50 focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none transition resize-none"
                ></textarea>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">GitHub Profile</label>
                <input
                  type="url"
                  value={socialGithub}
                  onChange={(e) => setSocialGithub(e.target.value)}
                  placeholder="https://github.com/username"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs bg-gray-50 focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">LinkedIn Profile</label>
                <input
                  type="url"
                  value={socialLinkedin}
                  onChange={(e) => setSocialLinkedin(e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs bg-gray-50 focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none transition"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSavingProfile}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition shadow-md shadow-orange-500/20"
              >
                {isSavingProfile ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" /> Save Profile Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* --- CHANGE PASSWORD CARD --- */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-gray-900">Change Account Password</h3>
              <p className="text-xs text-gray-500">Update your login password securely</p>
            </div>
          </div>

          {passwordMsg && (
            <div
              className={`p-4 rounded-xl text-xs flex items-center gap-2.5 animate-in fade-in duration-200 ${
                passwordMsg.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}
            >
              {passwordMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span>{passwordMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">Current Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current password"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs bg-gray-50 focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none transition pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">New Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="Min 6 characters"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs bg-gray-50 focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Confirm New Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Repeat new password"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-xs bg-gray-50 focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none transition"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isSavingPassword || !newPassword}
                className="inline-flex items-center gap-2 bg-gray-900 hover:bg-orange-600 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition shadow-sm"
              >
                {isSavingPassword ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Updating Password...
                  </>
                ) : (
                  <>
                    <KeyRound className="w-3.5 h-3.5" /> Update Password
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

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

  const ActivityLogs = () => {
    const [logs, setLogs] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterAction, setFilterAction] = useState<string>("ALL");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [customEvent, setCustomEvent] = useState("");
    const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

    const fetchLogs = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/logs/activity?limit=50');
        const data = await res.json();
        if (data.logs) {
          setLogs(data.logs);
        }
      } catch (err) {
        console.error('Failed to fetch activity logs:', err);
      } finally {
        setIsLoading(false);
      }
    };

    useEffect(() => {
      fetchLogs();
    }, []);

    const handleCreateCustomLog = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!customEvent.trim() || isSubmitting) return;

      setIsSubmitting(true);
      try {
        await fetch('/api/logs/activity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'CUSTOM_STUDENT_ACTION',
            studentEmail: currentUser.email || 'student@example.com',
            details: {
              customNote: customEvent.trim(),
              sessionId: 'sess_' + Math.random().toString(36).substring(2, 9),
              deviceType: 'Desktop Web Browser',
            },
            metadata: {
              triggeredVia: 'Dashboard UI Concept #11',
              timestampLocal: new Date().toLocaleTimeString(),
            }
          }),
        });
        setCustomEvent("");
        await fetchLogs();
      } catch (err) {
        console.error('Failed to log event:', err);
      } finally {
        setIsSubmitting(false);
      }
    };

    const filteredLogs = filterAction === "ALL"
      ? logs
      : logs.filter(l => l.action === filterAction);

    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        {/* TOP ARCHITECTURE COMPARISON BANNER (Concept #11) */}
        <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-slate-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl border border-emerald-500/20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-emerald-400" /> Concept #11: SQL vs NoSQL Polyglot Persistence
                </span>
                <span className="bg-amber-500/20 text-amber-300 text-xs font-bold px-2.5 py-1 rounded-full border border-amber-500/30">
                  Phase 3
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                MongoDB Atlas Telemetry & Audit Stream
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                PostgreSQL handles structured ACID relational data (Users, Courses, Payments), while MongoDB Atlas ingests high-throughput, unstructured documents (AI conversations & audit activity streams) with zero schema migrations.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <button
                onClick={fetchLogs}
                disabled={isLoading}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} /> Refresh Stream
              </button>
            </div>
          </div>

          {/* DUAL DATABASE ARCHITECTURE TILES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-800">
            <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30">
                <Server className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400">Structured Relational (PostgreSQL)</h4>
                <p className="text-xs text-slate-300 mt-0.5">Users, Course Catalogs, Razorpay Payments, Enrollments (ACID Transactions).</p>
              </div>
            </div>

            <div className="bg-slate-800/60 rounded-xl p-4 border border-slate-700/50 flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                <HardDrive className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Unstructured Document (MongoDB Atlas)</h4>
                <p className="text-xs text-slate-300 mt-0.5">AI Chat History, Clickstreams, Navigation Audits, Video Telemetry (BASE Model).</p>
              </div>
            </div>
          </div>
        </div>

        {/* LOG WRITER FORM */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h3 className="text-base font-bold text-gray-900 mb-1 flex items-center gap-2">
            <PlusCircle className="w-4 h-4 text-orange-500" /> Dispatch Test Event to MongoDB Atlas
          </h3>
          <p className="text-xs text-gray-500 mb-4">
            Type any test event payload or note. It will be written directly into the <code className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-800 font-mono">user_activity_logs</code> collection.
          </p>

          <form onSubmit={handleCreateCustomLog} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={customEvent}
              onChange={(e) => setCustomEvent(e.target.value)}
              placeholder="e.g. Completed Chapter 4 Quiz or Clicked Resume Video button..."
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
            />
            <button
              type="submit"
              disabled={!customEvent.trim() || isSubmitting}
              className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition disabled:opacity-40 shadow-sm shadow-orange-200 shrink-0"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />} Record to MongoDB
            </button>
          </form>
        </div>

        {/* LOGS LISTING */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
            <div>
              <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-500" /> Audit Log Stream
                <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-2.5 py-0.5 rounded-full">
                  {filteredLogs.length} Documents
                </span>
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">Live unstructured JSON records queried from MongoDB Atlas</p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              {["ALL", "VIEW_TAB", "AI_QUERY", "CUSTOM_STUDENT_ACTION", "SIMULATION_PUSH"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilterAction(f)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition shrink-0 ${
                    filterAction === f
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
              <p className="text-sm font-medium">Fetching real-time documents from MongoDB Atlas...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="py-12 text-center text-gray-500 bg-gray-50/50 rounded-xl border border-dashed border-gray-200">
              <Database className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-gray-700">No activity logs found for this filter</p>
              <p className="text-xs text-gray-400 mt-1">Navigate across tabs or submit a test event above to generate MongoDB documents.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredLogs.map((log: any, idx: number) => {
                const isExpanded = expandedLogId === (log._id || String(idx));
                const actionColor =
                  log.action === "AI_QUERY" ? "bg-amber-100 text-amber-800 border-amber-200" :
                  log.action === "VIEW_TAB" ? "bg-blue-100 text-blue-800 border-blue-200" :
                  log.action === "CUSTOM_STUDENT_ACTION" ? "bg-emerald-100 text-emerald-800 border-emerald-200" :
                  "bg-purple-100 text-purple-800 border-purple-200";

                return (
                  <div
                    key={log._id || idx}
                    className="p-4 rounded-xl border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/20 transition group"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-md border ${actionColor}`}>
                          {log.action}
                        </span>
                        <span className="text-xs font-semibold text-gray-800">
                          {log.studentEmail || currentUser.email || "student@example.com"}
                        </span>
                        {log.ip && (
                          <span className="text-[11px] text-gray-400 hidden md:inline-block font-mono">
                            IP: {log.ip}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-400">
                          {log.timestamp ? new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Recent'}
                        </span>
                        <button
                          onClick={() => setExpandedLogId(isExpanded ? null : (log._id || String(idx)))}
                          className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" /> {isExpanded ? "Hide JSON" : "Inspect"}
                        </button>
                      </div>
                    </div>

                    {/* Quick Preview */}
                    {log.details && (
                      <p className="text-xs text-gray-600 mt-2 font-mono bg-gray-50/80 px-3 py-1.5 rounded-lg truncate">
                        {JSON.stringify(log.details)}
                      </p>
                    )}

                    {/* Expandable JSON Inspector */}
                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-gray-100 animate-in fade-in duration-200">
                        <div className="bg-slate-950 text-emerald-400 p-4 rounded-xl text-xs font-mono overflow-x-auto shadow-inner">
                          <div className="text-slate-400 mb-1 text-[10px] uppercase font-bold tracking-wider">// MongoDB BSON Document</div>
                          <pre>{JSON.stringify(log, null, 2)}</pre>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };



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
                {item.id === "notifications" && notificationsList.filter(n => !n.read).length > 0 && (
                  <span className="ml-auto bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs animate-pulse">
                    {notificationsList.filter(n => !n.read).length}
                  </span>
                )}
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
              <img
                src={currentUser.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(currentUser.email || currentUser.username || 'student')}`}
                alt={currentUser.fullName || currentUser.username || 'User'}
                className="w-10 h-10 rounded-full object-cover border border-gray-200"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">{currentUser.fullName || currentUser.username || 'Student'}</p>
                <p className="text-xs text-gray-500 truncate">{currentUser.email || 'Student Account'}</p>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 flex flex-col min-w-0 relative">
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
              <button
                onClick={() => setActiveTab("notifications")}
                className="relative w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-orange-50 hover:text-orange-600 transition"
                title="View Notifications"
              >
                <Bell className="w-5 h-5" />
                {notificationsList.filter(n => !n.read).length > 0 && (
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-orange-500 rounded-full border-2 border-white animate-pulse"></span>
                )}
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
              {activeTab === "ai" && (
                <AIAssistant
                  currentUser={currentUser}
                  totalSpentAmount={totalSpentAmount}
                  coursesList={coursesList}
                  userPurchases={userPurchases}
                />
              )}
              {activeTab === "logs" && <ActivityLogs />}
            </div>
          </main>

          {/* FLOATING REAL-TIME TOAST POPUP (Concept #24 WebSockets) */}
          {realtimeToast && (
            <div
              onClick={() => { setActiveTab("notifications"); setRealtimeToast(null); }}
              className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-700/80 max-w-sm cursor-pointer animate-in slide-in-from-bottom-5 duration-300 hover:scale-102 transition"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center shrink-0 shadow-md">
                  <Zap className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-orange-400">Real-Time Push</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  </div>
                  <h4 className="text-sm font-bold text-white mt-0.5 truncate">{realtimeToast.title}</h4>
                  <p className="text-xs text-slate-300 mt-1 line-clamp-2">{realtimeToast.desc}</p>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                     STANDALONE AI ASSISTANT COMPONENT                     */
/* -------------------------------------------------------------------------- */
interface ConversationSummary {
  conversationId: string;
  title: string;
  messageCount: number;
  lastMessage?: string;
  updatedAt?: string;
  createdAt?: string;
}

interface AIAssistantProps {
  currentUser: {
    fullName: string;
    username: string;
    email: string;
    avatarUrl: string;
  };
  totalSpentAmount: number;
  coursesList: any[];
  userPurchases: any[];
}

function AIAssistant({
  currentUser,
  totalSpentAmount,
  coursesList,
  userPurchases,
}: AIAssistantProps) {
  const studentEmail = currentUser.email || 'student@example.com';
  const studentName = currentUser.fullName || currentUser.username || 'Student';
  const firstName = studentName.split(' ')[0];
  const totalSpentFormatted = `₹${totalSpentAmount.toLocaleString('en-IN')}`;

  const initialGreeting: ChatMessage[] = [
    { role: "ai", text: `Hello ${firstName}! 👋 I'm your AI Learning Assistant powered by Groq. You can ask me anything about your enrolled courses, spent fees (${totalSpentFormatted}), programming concepts, or ask for guidance. How can I help you today?` }
  ];

  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string>(() => `conv_${Date.now()}`);
  const [activeTitle, setActiveTitle] = useState<string>("New Chat");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(initialGreeting);
  const [inputMessage, setInputMessage] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Fetch list of saved conversations from MongoDB Atlas on mount or when user changes
  const fetchConversationList = async () => {
    try {
      const res = await fetch(`/api/ai/history?email=${encodeURIComponent(studentEmail)}`);
      const data = await res.json();
      if (data.conversations && Array.isArray(data.conversations)) {
        setConversations(data.conversations);
        return data.conversations;
      }
    } catch (err) {
      console.warn('Failed to load conversation list:', err);
    }
    return [];
  };

  // Load a specific conversation's message history
  const loadConversation = async (convId: string, title?: string) => {
    setIsHistoryLoading(true);
    setActiveConversationId(convId);
    if (title) setActiveTitle(title);
    setIsDrawerOpen(false);

    try {
      const res = await fetch(`/api/ai/history?email=${encodeURIComponent(studentEmail)}&conversationId=${encodeURIComponent(convId)}`);
      const data = await res.json();
      if (data.conversation && data.conversation.messages) {
        setChatHistory(data.conversation.messages.length > 0 ? data.conversation.messages : initialGreeting);
        if (data.conversation.title) setActiveTitle(data.conversation.title);
      }
    } catch (err) {
      console.error('Error loading conversation:', err);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  // Start fresh new conversation
  const handleNewChat = () => {
    const newId = `conv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    setActiveConversationId(newId);
    setActiveTitle("New Chat");
    setChatHistory(initialGreeting);
    setIsDrawerOpen(false);
  };

  // Delete a specific conversation thread
  const handleDeleteConversation = async (e: React.MouseEvent, convId: string) => {
    e.stopPropagation();
    try {
      await fetch(`/api/ai/history?email=${encodeURIComponent(studentEmail)}&conversationId=${encodeURIComponent(convId)}`, {
        method: 'DELETE',
      });
      setConversations(prev => prev.filter(c => c.conversationId !== convId));
      if (activeConversationId === convId) {
        handleNewChat();
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    }
  };

  // Clear all conversations
  const handleClearAllConversations = async () => {
    if (!confirm("Are you sure you want to delete all saved conversations from MongoDB?")) return;
    try {
      await fetch(`/api/ai/history?email=${encodeURIComponent(studentEmail)}&all=true`, {
        method: 'DELETE',
      });
      setConversations([]);
      handleNewChat();
    } catch (err) {
      console.error('Failed to clear conversations:', err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setIsHistoryLoading(true);
      const list = await fetchConversationList();
      if (list.length > 0) {
        await loadConversation(list[0].conversationId, list[0].title);
      }
      setIsHistoryLoading(false);
    };
    init();
  }, [currentUser.email]);

  // Isolate scroll ONLY to the message container to prevent whole page / header from jumping
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [chatHistory, isAiLoading]);

  // Send message
  const handleSendMessage = async (customMsg?: string) => {
    const textToSend = (customMsg || inputMessage).trim();
    if (!textToSend || isAiLoading) return;

    let currentTitle = activeTitle;
    if (activeTitle === "New Chat" || activeTitle === "Untitled Chat") {
      currentTitle = textToSend.length > 34 ? `${textToSend.slice(0, 34)}...` : textToSend;
      setActiveTitle(currentTitle);
    }

    const newHistory: ChatMessage[] = [...chatHistory, { role: "user", text: textToSend }];
    setChatHistory(newHistory);
    setInputMessage("");
    setIsAiLoading(true);

    // Update conversation list optimistically
    setConversations(prev => {
      const exists = prev.find(c => c.conversationId === activeConversationId);
      if (exists) {
        return prev.map(c =>
          c.conversationId === activeConversationId
            ? { ...c, title: currentTitle, messageCount: newHistory.length, updatedAt: new Date().toISOString() }
            : c
        );
      } else {
        return [
          {
            conversationId: activeConversationId,
            title: currentTitle,
            messageCount: newHistory.length,
            updatedAt: new Date().toISOString(),
          },
          ...prev,
        ];
      }
    });

    try {
      const studentContext = {
        name: studentName,
        email: studentEmail,
        enrolledSince: "2026",
        totalSpent: totalSpentFormatted,
        courses: coursesList.map(c => ({
          title: c.title,
          progress: `${c.progress}%`,
          instructor: c.instructor,
          status: c.progress === 100 || c.claimed ? "Completed" : "In Progress"
        })),
        recentPurchases: userPurchases.map(p => ({
          course: p.course || p.courseTitle,
          price: typeof p.price === 'number' ? `₹${p.price.toLocaleString('en-IN')}` : p.price,
          date: p.date,
          invoiceId: p.invoiceId
        })),
      };

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory,
          studentContext,
          conversationId: activeConversationId,
          title: currentTitle,
        }),
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
      fetchConversationList();
    }
  };

  const quickPrompts = [
    "💰 How much money have I spent on courses?",
    "🏆 When will I get my React Masterclass certificate?",
    "📚 What courses am I currently enrolled in?",
    "💡 Explain Polyglot Persistence simply",
    "⚡ Explain React Hooks with an example",
  ];

  const formatRelativeTime = (dateStr?: string) => {
    if (!dateStr) return "Recent";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    return `${diffDays}d ago`;
  };

  return (
    <div className="space-y-4">
      {/* INTEGRATED CHAT CONTAINER */}
      <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm overflow-hidden flex flex-row h-[620px] max-h-[calc(100vh-200px)] min-h-[500px] relative">

        {/* MOBILE BACKDROP OVERLAY */}
        {isDrawerOpen && (
          <div
            onClick={() => setIsDrawerOpen(false)}
            className="absolute inset-0 bg-slate-900/20 backdrop-blur-2xs z-30 lg:hidden"
          />
        )}

        {/* ------------------------------------------------------------------ */}
        {/* 1. SEAMLESS LIGHT CONVERSATIONS SIDEBAR                            */}
        {/* ------------------------------------------------------------------ */}
        <div
          className={`w-64 sm:w-72 bg-gray-50/90 border-r border-gray-200/80 flex flex-col shrink-0 transition-all duration-200 ${
            isDrawerOpen
              ? "absolute inset-y-0 left-0 shadow-2xl flex bg-white z-40"
              : "hidden lg:flex relative z-10"
          }`}
        >
          {/* Top: New Chat Button */}
          <div className="p-3.5 border-b border-gray-200/70 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center border border-orange-200">
                  <Database className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-gray-800 tracking-wider">Chat History</span>
              </div>
              {isDrawerOpen && (
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="lg:hidden text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              onClick={handleNewChat}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white py-2.5 px-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm shadow-orange-200 transition active:scale-98"
            >
              <Plus className="w-4 h-4" /> + New Chat
            </button>
          </div>

          {/* Conversations Scrollable List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
            <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center justify-between">
              <span>Saved Sessions ({conversations.length})</span>
              <span className="text-emerald-600 font-mono text-[9px] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> MongoDB
              </span>
            </div>

            {conversations.length === 0 ? (
              <div className="p-4 text-center text-gray-400 text-xs">
                <MessageCircle className="w-6 h-6 mx-auto mb-1.5 text-gray-300" />
                <p className="font-medium text-gray-500">No past chats yet</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Start chatting to auto-save conversations.</p>
              </div>
            ) : (
              conversations.map((conv) => {
                const isActive = conv.conversationId === activeConversationId;
                return (
                  <div
                    key={conv.conversationId}
                    onClick={() => loadConversation(conv.conversationId, conv.title)}
                    className={`group w-full p-2.5 rounded-xl text-left cursor-pointer transition flex items-center justify-between gap-2 text-xs ${
                      isActive
                        ? "bg-orange-50 text-orange-700 border border-orange-200 shadow-2xs font-semibold"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-orange-500" : "text-gray-400"}`} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs">{conv.title}</p>
                        <p className={`text-[10px] flex items-center gap-1 mt-0.5 ${isActive ? "text-orange-500/80" : "text-gray-400"}`}>
                          <Clock className="w-2.5 h-2.5" /> {formatRelativeTime(conv.updatedAt)}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleDeleteConversation(e, conv.conversationId)}
                      title="Delete Conversation"
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {conversations.length > 0 && (
            <div className="p-2.5 border-t border-gray-200/70 bg-gray-50/50">
              <button
                onClick={handleClearAllConversations}
                className="w-full py-1.5 px-3 text-[11px] text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3 h-3" /> Clear All History
              </button>
            </div>
          )}
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* 2. RIGHT CHAT PANEL                                                */}
        {/* ------------------------------------------------------------------ */}
        <div className="flex-1 flex flex-col min-w-0 h-full bg-white relative">
          {/* Header */}
          <div className="p-3 sm:p-4 border-b border-gray-100 bg-white flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2.5 min-w-0">
              {/* Mobile Drawer Toggle Button */}
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="lg:hidden p-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition shrink-0"
                title="Open Conversation History"
              >
                <PanelLeft className="w-4 h-4" />
              </button>

              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-tr from-orange-500 to-amber-500 rounded-xl flex items-center justify-center text-white shadow-sm shadow-orange-200 shrink-0">
                <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-900 text-xs sm:text-sm truncate max-w-[140px] sm:max-w-xs md:max-w-md">
                    {activeTitle}
                  </h3>
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] sm:text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                    <Database className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-600" /> Atlas
                  </span>
                  <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[9px] sm:text-[10px] font-semibold px-2 py-0.5 rounded-full items-center gap-1 shrink-0 hidden md:inline-flex">
                    <ShieldCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-blue-500" /> 10 req/min
                  </span>
                </div>
                <p className="text-[10px] sm:text-[11px] text-gray-400 truncate hidden sm:block">
                  Persistent Chat Sessions in MongoDB Atlas (Concept #11) & Redis Rate Limiting (Concept #28)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleNewChat}
                title="Start a fresh chat"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-xl transition border border-orange-200 shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">New Chat</span>
              </button>
            </div>
          </div>

          {/* Message Thread */}
          <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-gray-50/40 custom-scrollbar">
            {isHistoryLoading && (
              <div className="flex justify-center items-center py-4 text-xs text-emerald-600 gap-2 font-medium">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading MongoDB session...
              </div>
            )}

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
                      : "bg-white text-gray-800 border border-gray-200/80 rounded-tl-sm shadow-xs"
                  }`}
                >
                  {msg.text}
                  {msg.role === "ai" && msg.latencyMs !== undefined && (
                    <div className="mt-2.5 pt-2 border-t border-gray-100 flex items-center gap-1.5 text-[11px]">
                      {msg.source === "cache" ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60 font-semibold shadow-2xs">
                          ⚡ {msg.latencyMs}ms (Redis Cache HIT)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60 font-medium shadow-2xs">
                          ⏱️ {msg.latencyMs}ms (Groq LLM)
                        </span>
                      )}
                      <span className="text-[10px] text-gray-400 font-mono">| Saved to MongoDB</span>
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
                <div className="bg-white border border-gray-200/80 px-4 py-2.5 rounded-2xl rounded-tl-sm text-sm text-gray-500 flex items-center gap-2 shadow-xs">
                  <Loader2 className="w-4 h-4 text-orange-500 animate-spin" />
                  <span className="text-xs">AI is thinking...</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Suggestion Prompts */}
          {chatHistory.length <= 2 && !isAiLoading && (
            <div className="px-4 py-2 bg-white border-t border-gray-100 flex items-center gap-2 overflow-x-auto custom-scrollbar shrink-0">
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
          <div className="p-3 sm:p-4 border-t border-gray-100 bg-white shrink-0">
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
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition disabled:bg-gray-50"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isAiLoading}
                className="px-4 bg-orange-500 text-white rounded-xl flex items-center justify-center hover:bg-orange-600 transition disabled:opacity-40 disabled:cursor-not-allowed shadow-sm shadow-orange-200 shrink-0"
              >
                {isAiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
