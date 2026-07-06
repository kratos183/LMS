"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard, BookOpen, PlayCircle, BarChart3, Heart,
  Award, Star, Bell, CreditCard, User, Settings, MessageSquare,
  FileText, Bot, LogOut, ChevronRight, Download, Share2, CheckCircle,
  Search, Menu, X, Moon, Sun, Globe, Mail, Trash2, Edit3, Send
} from "lucide-react";
import Navbar from "../component/navbar";
import { supabase } from "@/lib/supabase";

export default function StudentDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/';
  };

  // AI Chat State
  const [chatHistory, setChatHistory] = useState([
    { role: "ai", text: "Hello Ethan! I'm your course AI assistant. Ask me anything about React Context." }
  ]);
  const [inputMessage, setInputMessage] = useState("");

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    const newHistory = [...chatHistory, { role: "user", text: inputMessage }];
    setChatHistory(newHistory);
    setInputMessage("");
    setTimeout(() => {
      setChatHistory(prev => [...prev, {
        role: "ai",
        text: "Based on Module 4 of your React Masterclass: React Context provides a way to pass data through the component tree without having to pass props down manually at every level."
      }]);
    }, 800);
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
        <p className="opacity-90">You've learned for 58 hours this month. Keep up the great work!</p>
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

  const MyCourses = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold text-gray-900">My Courses</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { title: "React Masterclass", progress: 78, img: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=250&fit=crop" },
          { title: "Next.js Fundamentals", progress: 35, img: "https://images.unsplash.com/photo-1555099962-4199c345e5dd?w=400&h=250&fit=crop" },
          { title: "Python for Data Science", progress: 100, img: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=250&fit=crop" },
        ].map((course, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden group">
            <div className="h-40 overflow-hidden relative">
              <img src={course.img} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
                <div className={`h-full ${course.progress === 100 ? "bg-green-500" : "bg-orange-500"}`} style={{ width: `${course.progress}%` }}></div>
              </div>
            </div>
            <div className="p-5">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-gray-900 line-clamp-1">{course.title}</h3>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${course.progress === 100 ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                  {course.progress}%
                </span>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                <button className="flex-1 bg-black text-white text-xs py-2 rounded hover:bg-gray-800 transition">
                  {course.progress === 100 ? "View Course" : "Continue"}
                </button>
                <button className="px-3 py-2 border border-gray-200 rounded hover:bg-gray-50 transition"><Download className="w-4 h-4 text-gray-600" /></button>
                <button className="px-3 py-2 border border-gray-200 rounded hover:bg-gray-50 transition"><MessageSquare className="w-4 h-4 text-gray-600" /></button>
              </div>
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

  const Certificates = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold text-gray-900">My Certificates</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {["React Masterclass", "Python Data Science"].map((cert, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex gap-4 items-center">
            <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center text-orange-500 shrink-0">
              <Award className="w-8 h-8" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 truncate">{cert} Certificate</h3>
              <p className="text-xs text-gray-500 mt-1">Issued on Jan 15, 2024</p>
              <div className="flex gap-2 mt-3">
                <button className="text-xs flex items-center gap-1 text-gray-600 hover:text-orange-500 transition"><Download className="w-3 h-3" /> PDF</button>
                <button className="text-xs flex items-center gap-1 text-gray-600 hover:text-orange-500 transition"><Share2 className="w-3 h-3" /> Share</button>
                <button className="text-xs flex items-center gap-1 text-gray-600 hover:text-orange-500 transition"><CheckCircle className="w-3 h-3" /> Verify</button>
              </div>
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
            <p className="text-sm text-gray-600 italic">"Amazing course. The instructor explains complex concepts very clearly."</p>
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
          <textarea rows="3" defaultValue="Frontend Developer passionate about React and UI Design." className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition"></textarea>
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

  const AIAssistant = () => (
    <div className="h-[calc(100vh-140px)] flex flex-col animate-in fade-in duration-500 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
        <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white">
          <Bot className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 text-sm">Course AI Assistant</h3>
          <p className="text-[10px] text-gray-500">Answers based only on your enrolled courses</p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
        {chatHistory.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
              msg.role === "user"
                ? "bg-orange-500 text-white rounded-br-none"
                : "bg-gray-100 text-gray-800 rounded-bl-none"
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 border-t border-gray-100 bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Ask about React Context..."
            className="flex-1 border border-gray-300 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-orange-500 transition"
          />
          <button
            onClick={handleSendMessage}
            className="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center hover:bg-orange-600 transition shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  /* -------------------------------------------------------------------------- */
  /*                                MAIN RENDER                                 */
  /* -------------------------------------------------------------------------- */
  return (
    <div className={`min-h-screen bg-gray-50 font-sans text-gray-800 ${darkMode ? "dark" : ""}`}>
      {/* TOP NAVBAR — full width, same as other pages */}
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