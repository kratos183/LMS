"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard, BookOpen, PlusCircle, Layers, Upload, Edit3, Trash2,
  BarChart3, DollarSign, Star, MessageSquare, Award, Tag, Megaphone,
  FileText, User, LogOut, Menu, X, Search, Bell, ChevronDown,
  GripVertical, PlayCircle, MoreHorizontal, CheckCircle2, TrendingUp, Users,
  CheckCircle, ImageIcon, Video, RefreshCw
} from "lucide-react";
import Navbar from "../component/navbar";

export default function InstructorDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/';
  };

  // Real course state
  const [myCourses, setMyCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(false);

  const fetchMyCourses = async () => {
    setCoursesLoading(true);
    const res = await fetch('/api/courses?mine=true');
    const data = await res.json();
    setMyCourses(data.courses || []);
    setCoursesLoading(false);
  };

  useEffect(() => {
    if (activeTab === 'courses') fetchMyCourses();
  }, [activeTab]);


  // Mock Data
  const stats = [
    { label: "Courses", val: "15", icon: BookOpen, color: "bg-blue-50 text-blue-600" },
    { label: "Students", val: "420", icon: Users, color: "bg-green-50 text-green-600" },
    { label: "Revenue", val: "₹2,48,000", icon: DollarSign, color: "bg-purple-50 text-purple-600" },
    { label: "Avg Rating", val: "4.8", icon: Star, color: "bg-orange-50 text-orange-600" },
  ];

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "courses", label: "My Courses", icon: BookOpen },
    { id: "create", label: "Create Course", icon: PlusCircle },
    { id: "builder", label: "Course Builder", icon: Layers },
    { id: "upload", label: "Upload Videos", icon: Upload },
    { id: "lessons", label: "Manage Lessons", icon: Edit3 },
    { id: "analytics", label: "Student Analytics", icon: BarChart3 },
    { id: "revenue", label: "Revenue", icon: DollarSign },
    { id: "reviews", label: "Reviews", icon: Star },
    { id: "qa", label: "Q&A", icon: MessageSquare },
    { id: "certificates", label: "Certificates", icon: Award },
    { id: "coupons", label: "Coupons", icon: Tag },
    { id: "announcements", label: "Announcements", icon: Megaphone },
    { id: "blog", label: "Blog", icon: FileText },
    { id: "profile", label: "Profile", icon: User },
  ];

  /* -------------------------------------------------------------------------- */
  /*                                VIEW COMPONENTS                             */
  /* -------------------------------------------------------------------------- */

  const DashboardHome = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Revenue Chart Placeholder */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4">Revenue Overview</h3>
          <div className="h-48 bg-gray-50 rounded-lg flex items-end justify-between px-4 pb-4 gap-2">
            {[40, 65, 30, 80, 55, 90, 45, 70, 60, 85].map((h, i) => (
              <div key={i} className="flex-1 bg-orange-100 rounded-t-sm relative group hover:bg-orange-200 transition">
                <div className="absolute bottom-0 left-0 right-0 bg-orange-500 rounded-t-sm transition-all duration-500" style={{ height: `${h}%` }}></div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performing Courses */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4">Top Courses</h3>
          <div className="space-y-4">
            {[
              { name: "React Masterclass", students: 156, revenue: "₹1,20,000" },
              { name: "Next.js Fundamentals", students: 89, revenue: "₹65,000" },
              { name: "Python Data Science", students: 64, revenue: "₹42,000" },
            ].map((course, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                  <div>
                    <p className="font-bold text-sm text-gray-900">{course.name}</p>
                    <p className="text-xs text-gray-500">{course.students} students</p>
                  </div>
                </div>
                <span className="font-bold text-orange-600 text-sm">{course.revenue}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // ─── MY COURSES (real data) ────────────────────────────────────────────────
  const MyCourses = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">My Courses</h2>
        <div className="flex gap-3">
          <button onClick={fetchMyCourses} className="text-gray-500 hover:text-orange-500 transition p-2 rounded-lg hover:bg-orange-50">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button onClick={() => setActiveTab("create")} className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-orange-600 transition flex items-center gap-2">
            <PlusCircle className="w-4 h-4" /> Create Course
          </button>
        </div>
      </div>

      {coursesLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : myCourses.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-200 p-16 text-center">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="font-bold text-gray-700 text-lg mb-2">No courses yet</h3>
          <p className="text-gray-500 text-sm mb-6">Create your first course and start teaching!</p>
          <button onClick={() => setActiveTab("create")} className="bg-orange-500 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-orange-600 transition">
            Create Course
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="px-6 py-4 font-medium">Course</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Price</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {myCourses.map((course) => (
                <tr key={course.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {course.thumbnail_url ? (
                        <img src={course.thumbnail_url} alt={course.title} className="w-12 h-9 rounded object-cover" />
                      ) : (
                        <div className="w-12 h-9 bg-gray-100 rounded flex items-center justify-center"><ImageIcon className="w-4 h-4 text-gray-400" /></div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900 line-clamp-1">{course.title}</p>
                        <p className="text-xs text-gray-400">{course.level}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{course.category}</td>
                  <td className="px-6 py-4 text-gray-600">₹{parseFloat(course.price || 0).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      course.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>{course.status === 'published' ? 'Published' : 'Draft'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-1">
                      <button
                        title={course.status === 'published' ? 'Set as Draft' : 'Publish'}
                        onClick={async () => {
                          const newStatus = course.status === 'published' ? 'draft' : 'published';
                          await fetch('/api/courses', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: course.id, status: newStatus }) });
                          fetchMyCourses();
                        }}
                        className="p-2 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded transition"
                      >
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button
                        title="Add Lessons"
                        onClick={() => { setSelectedCourseId(course.id); setSelectedCourseTitle(course.title); setActiveTab('upload'); }}
                        className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded transition"
                      >
                        <Video className="w-4 h-4" />
                      </button>
                      <button
                        title="Delete"
                        onClick={async () => {
                          if (!confirm('Delete this course?')) return;
                          await fetch('/api/courses', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: course.id }) });
                          fetchMyCourses();
                        }}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  // ─── CREATE COURSE (tabbed wizard) ────────────────────────────────────────
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedCourseTitle, setSelectedCourseTitle] = useState('');

  const CreateCourse = () => {
    const [activeCreateTab, setActiveCreateTab] = useState('basic');
    const [form, setForm] = useState({
      title: '', description: '', category: 'Development', price: '', original_price: '', level: 'Beginner',
    });
    // Instructor fields
    const [instructorForm, setInstructorForm] = useState({
      instructor_name: '', instructor_title: '', instructor_bio: '', instructor_image: '',
    });
    // Instructor avatar upload
    const [instructorAvatarFile, setInstructorAvatarFile] = useState(null);
    const [instructorAvatarPreview, setInstructorAvatarPreview] = useState('');
    const instructorAvatarRef = useRef();
    // FAQs
    const [faqs, setFaqs] = useState([{ q: '', a: '' }]);
    // Thumbnail
    const [thumbnail, setThumbnail] = useState(null);
    const [thumbnailPreview, setThumbnailPreview] = useState('');
    const thumbRef = useRef();
    // Status
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const TABS = [
      { id: 'basic', label: 'Basic Info', step: 1 },
      { id: 'instructor', label: 'Instructor', step: 2 },
      { id: 'faqs', label: 'FAQs', step: 3 },
    ];

    const handleThumbSelect = (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setThumbnail(file);
      setThumbnailPreview(URL.createObjectURL(file));
    };

    const handleAvatarSelect = (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setInstructorAvatarFile(file);
      setInstructorAvatarPreview(URL.createObjectURL(file));
    };

    const addFaq = () => setFaqs(f => [...f, { q: '', a: '' }]);
    const removeFaq = (idx) => setFaqs(f => f.filter((_, i) => i !== idx));
    const updateFaq = (idx, field, val) =>
      setFaqs(f => f.map((item, i) => i === idx ? { ...item, [field]: val } : item));

    const uploadImageToCloudinary = async (file, folder) => {
      const sigRes = await fetch('/api/upload/signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder }),
      });
      const sigData = await sigRes.json();
      if (sigData.error) throw new Error('Signature failed: ' + sigData.error);

      const fd = new FormData();
      fd.append('file', file);
      fd.append('api_key', sigData.apiKey);
      fd.append('timestamp', sigData.timestamp);
      fd.append('signature', sigData.signature);
      fd.append('folder', folder);

      const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${sigData.cloudName}/image/upload`, {
        method: 'POST', body: fd,
      });
      const cloudData = await cloudRes.json();
      if (cloudData.error) throw new Error('Upload failed: ' + cloudData.error.message);
      return cloudData.secure_url;
    };

    const handleSubmit = async (status) => {
      if (!form.title.trim()) { setError('Course title is required'); setActiveCreateTab('basic'); return; }
      setError(''); setSaving(true);
      let thumbnail_url = '';
      let instructor_image = instructorForm.instructor_image || '';

      try {
        // Upload thumbnail
        if (thumbnail) {
          setUploading(true);
          thumbnail_url = await uploadImageToCloudinary(thumbnail, 'lms/thumbnails');
          setUploading(false);
        }
        // Upload instructor avatar
        if (instructorAvatarFile) {
          setUploading(true);
          instructor_image = await uploadImageToCloudinary(instructorAvatarFile, 'lms/avatars');
          setUploading(false);
        }

        const cleanFaqs = faqs.filter(f => f.q.trim() && f.a.trim());

        const res = await fetch('/api/courses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...form,
            price: parseFloat(form.price) || 0,
            original_price: form.original_price ? parseFloat(form.original_price) : null,
            thumbnail_url,
            status,
            ...instructorForm,
            instructor_image,
            faqs: cleanFaqs,
          }),
        });
        const data = await res.json();
        setSaving(false);
        if (data.error) { setError(data.error); return; }
        setSuccess(`Course "${data.course.title}" ${status === 'published' ? 'published' : 'saved as draft'}!`);
        setTimeout(() => { setSuccess(''); setActiveTab('courses'); fetchMyCourses(); }, 2000);
      } catch (err) {
        setError(err.message);
        setSaving(false);
        setUploading(false);
      }
    };

    const currentStep = TABS.findIndex(t => t.id === activeCreateTab) + 1;

    return (
      <div className="max-w-3xl space-y-6 animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Create New Course</h2>
          <div className="flex gap-2">
            <button onClick={() => handleSubmit('draft')} disabled={saving}
              className="px-5 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition disabled:opacity-50">
              {saving && uploading ? 'Uploading...' : saving ? 'Saving...' : 'Save Draft'}
            </button>
            <button onClick={() => handleSubmit('published')} disabled={saving}
              className="px-5 py-2 bg-orange-500 text-white rounded-lg text-sm font-bold hover:bg-orange-600 transition disabled:opacity-50 flex items-center gap-2">
              {saving ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Publishing...</>
              ) : 'Publish Course'}
            </button>
          </div>
        </div>

        {/* Alerts */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5 shrink-0" />{success}
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Tab Bar */}
          <div className="flex border-b border-gray-100">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCreateTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition-all relative ${
                  activeCreateTab === tab.id
                    ? 'text-orange-600 bg-orange-50/50'
                    : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                <span className={`w-6 h-6 rounded-full text-xs flex items-center justify-center font-bold shrink-0 ${
                  activeCreateTab === tab.id ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  {tab.step}
                </span>
                {tab.label}
                {activeCreateTab === tab.id && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-500" />
                )}
              </button>
            ))}
          </div>

          {/* Progress Bar */}
          <div className="h-1 bg-gray-100">
            <div
              className="h-full bg-gradient-to-r from-orange-400 to-orange-500 transition-all duration-500"
              style={{ width: `${(currentStep / TABS.length) * 100}%` }}
            />
          </div>

          {/* ── TAB 1: BASIC INFO ─────────────────────────────────────────── */}
          {activeCreateTab === 'basic' && (
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Course Title *</label>
                <input
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  type="text"
                  placeholder="e.g., Advanced React Patterns"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-500 outline-none transition text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows="4"
                  placeholder="What will students learn? What problems does this course solve?"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-500 outline-none transition text-sm resize-none"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Category</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-500 outline-none transition text-sm">
                    <option>Development</option><option>Design</option><option>Business</option>
                    <option>Marketing</option><option>Data Science</option><option>Photography</option>
                    <option>Music</option><option>Health & Fitness</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Level</label>
                  <select value={form.level} onChange={e => setForm(f => ({ ...f, level: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-500 outline-none transition text-sm">
                    <option>Beginner</option><option>Intermediate</option><option>Advanced</option><option>All Levels</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Original Price (₹)</label>
                  <div className="relative">
                    <input value={form.original_price} onChange={e => setForm(f => ({ ...f, original_price: e.target.value }))}
                      type="number" min="0" placeholder="1999"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-500 outline-none transition text-sm" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-medium bg-gray-50 px-1 rounded">MRP</span>
                  </div>
                  <p className="text-[10px] text-gray-400">Shown as <span className="line-through">₹1999</span> (before discount)</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Sale Price (₹)</label>
                  <div className="relative">
                    <input value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                      type="number" min="0" placeholder="999"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-500 outline-none transition text-sm pr-14" />
                    {form.original_price && form.price && parseFloat(form.original_price) > parseFloat(form.price) && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                        {Math.round((1 - parseFloat(form.price) / parseFloat(form.original_price)) * 100)}% off
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-400">Final price students pay</p>
                </div>
              </div>

              {/* Thumbnail */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Course Thumbnail</label>
                <input ref={thumbRef} type="file" accept="image/*" onChange={handleThumbSelect} className="hidden" />
                {thumbnailPreview ? (
                  <div className="relative w-full max-w-sm group">
                    <img src={thumbnailPreview} alt="preview" className="w-full h-48 object-cover rounded-lg border border-gray-200" />
                    <button
                      onClick={() => { setThumbnail(null); setThumbnailPreview(''); }}
                      className="absolute top-2 right-2 bg-white rounded-full p-1.5 shadow-md text-gray-600 hover:text-red-500 transition opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => thumbRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-orange-500 hover:bg-orange-50/30 transition cursor-pointer group"
                  >
                    <ImageIcon className="w-8 h-8 mx-auto text-gray-400 mb-2 group-hover:text-orange-500 transition" />
                    <p className="text-sm text-gray-500">Click to upload thumbnail</p>
                    <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP — auto-optimized via Cloudinary</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <button onClick={() => setActiveCreateTab('instructor')}
                  className="px-6 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition">
                  Next: Instructor →
                </button>
              </div>
            </div>
          )}

          {/* ── TAB 2: INSTRUCTOR ─────────────────────────────────────────── */}
          {activeCreateTab === 'instructor' && (
            <div className="p-8 space-y-6">
              <p className="text-sm text-gray-500">
                These details appear in the <span className="font-semibold text-gray-700">Instructor</span> tab on your public course page.
              </p>

              {/* Avatar */}
              <div className="flex items-center gap-6">
                <div className="shrink-0">
                  {instructorAvatarPreview ? (
                    <div className="relative group">
                      <img src={instructorAvatarPreview} alt="avatar" className="w-24 h-24 rounded-full object-cover border-4 border-orange-100 shadow" />
                      <button
                        onClick={() => { setInstructorAvatarFile(null); setInstructorAvatarPreview(''); }}
                        className="absolute -top-1 -right-1 bg-white rounded-full p-1 shadow text-gray-400 hover:text-red-500 transition"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => instructorAvatarRef.current?.click()}
                      className="w-24 h-24 rounded-full bg-orange-50 border-2 border-dashed border-orange-300 flex flex-col items-center justify-center cursor-pointer hover:bg-orange-100 transition"
                    >
                      <User className="w-8 h-8 text-orange-400" />
                      <span className="text-[10px] text-orange-400 mt-1 font-medium">Upload</span>
                    </div>
                  )}
                  <input ref={instructorAvatarRef} type="file" accept="image/*" onChange={handleAvatarSelect} className="hidden" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium text-gray-700">Instructor Photo</p>
                  <p className="text-xs text-gray-400">Recommended: square image, at least 200×200px</p>
                  <button onClick={() => instructorAvatarRef.current?.click()}
                    className="mt-2 text-xs text-orange-500 font-medium hover:text-orange-600 transition">
                    {instructorAvatarPreview ? 'Change photo' : 'Choose photo →'}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Instructor Name *</label>
                  <input
                    value={instructorForm.instructor_name}
                    onChange={e => setInstructorForm(f => ({ ...f, instructor_name: e.target.value }))}
                    type="text"
                    placeholder="e.g., Sarah Johnson"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-500 outline-none transition text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Title / Role</label>
                  <input
                    value={instructorForm.instructor_title}
                    onChange={e => setInstructorForm(f => ({ ...f, instructor_title: e.target.value }))}
                    type="text"
                    placeholder="e.g., Senior React Developer & Educator"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-500 outline-none transition text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Bio</label>
                <textarea
                  value={instructorForm.instructor_bio}
                  onChange={e => setInstructorForm(f => ({ ...f, instructor_bio: e.target.value }))}
                  rows="5"
                  placeholder="Write a brief bio about your experience, background, and teaching style..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-500 outline-none transition text-sm resize-none"
                />
                <p className="text-xs text-gray-400">{instructorForm.instructor_bio.length} characters — aim for 150–300</p>
              </div>

              {/* Live preview */}
              {(instructorForm.instructor_name || instructorForm.instructor_bio) && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Preview on course page</p>
                  <div className="flex gap-5 items-start">
                    <div className={`w-16 h-16 rounded-lg flex items-center justify-center text-white font-bold text-xl shrink-0 ${instructorAvatarPreview ? '' : 'bg-orange-500'}`}>
                      {instructorAvatarPreview
                        ? <img src={instructorAvatarPreview} className="w-full h-full object-cover rounded-lg" alt="" />
                        : (instructorForm.instructor_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'IN')}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{instructorForm.instructor_name || 'Instructor Name'}</h4>
                      <p className="text-sm text-gray-500 mb-2">{instructorForm.instructor_title || 'Title/Role'}</p>
                      <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{instructorForm.instructor_bio || 'Bio will appear here...'}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-2">
                <button onClick={() => setActiveCreateTab('basic')}
                  className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
                  ← Back
                </button>
                <button onClick={() => setActiveCreateTab('faqs')}
                  className="px-6 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition">
                  Next: FAQs →
                </button>
              </div>
            </div>
          )}

          {/* ── TAB 3: FAQs ───────────────────────────────────────────────── */}
          {activeCreateTab === 'faqs' && (
            <div className="p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">
                    Add frequently asked questions that appear in the <span className="font-semibold text-gray-700">FAQs</span> tab on your public course page.
                  </p>
                </div>
                <button
                  onClick={addFaq}
                  className="shrink-0 flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-bold hover:bg-orange-600 transition"
                >
                  <PlusCircle className="w-4 h-4" /> Add FAQ
                </button>
              </div>

              {faqs.length === 0 ? (
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-10 text-center">
                  <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm mb-2">No FAQs added yet</p>
                  <button onClick={addFaq} className="text-orange-500 font-medium text-sm hover:underline">Add your first FAQ →</button>
                </div>
              ) : (
                <div className="space-y-4">
                  {faqs.map((faq, idx) => (
                    <div key={idx} className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-3 group relative">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">FAQ #{idx + 1}</span>
                        {faqs.length > 1 && (
                          <button
                            onClick={() => removeFaq(idx)}
                            className="text-gray-300 hover:text-red-500 transition p-1 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-600">Question</label>
                        <input
                          value={faq.q}
                          onChange={e => updateFaq(idx, 'q', e.target.value)}
                          type="text"
                          placeholder="e.g., Do I need prior experience to take this course?"
                          className="w-full border border-gray-300 bg-white rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-500 outline-none transition text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-medium text-gray-600">Answer</label>
                        <textarea
                          value={faq.a}
                          onChange={e => updateFaq(idx, 'a', e.target.value)}
                          rows="2"
                          placeholder="e.g., No! This course starts from scratch and is designed for all levels."
                          className="w-full border border-gray-300 bg-white rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-500 outline-none transition text-sm resize-none"
                        />
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={addFaq}
                    className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 text-sm font-medium hover:border-orange-400 hover:text-orange-500 hover:bg-orange-50/30 transition flex items-center justify-center gap-2"
                  >
                    <PlusCircle className="w-4 h-4" /> Add Another FAQ
                  </button>
                </div>
              )}

              {/* Live accordion preview */}
              {faqs.some(f => f.q.trim()) && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Preview on course page</p>
                  <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
                    {faqs.filter(f => f.q.trim()).map((faq, idx) => (
                      <div key={idx} className="bg-white p-4">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm text-gray-800">{faq.q}</span>
                          <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 ml-2" />
                        </div>
                        {faq.a && <p className="text-sm text-gray-500 mt-2 leading-relaxed">{faq.a}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between pt-2">
                <button onClick={() => setActiveCreateTab('instructor')}
                  className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
                  ← Back
                </button>
                <div className="flex gap-3">
                  <button onClick={() => handleSubmit('draft')} disabled={saving}
                    className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition disabled:opacity-50">
                    {saving ? 'Saving...' : 'Save Draft'}
                  </button>
                  <button onClick={() => handleSubmit('published')} disabled={saving}
                    className="px-6 py-2.5 bg-orange-500 text-white rounded-lg text-sm font-bold hover:bg-orange-600 transition disabled:opacity-50 flex items-center gap-2">
                    {saving
                      ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Publishing...</>
                      : <><CheckCircle className="w-4 h-4" />Publish Course</>
                    }
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };


  // ─── UPLOAD VIDEOS / ADD LESSONS (real Cloudinary upload → Supabase) ───────
  const UploadVideos = () => {
    const [lessons, setLessons] = useState([]);
    const [lessonsLoading, setLessonsLoading] = useState(false);
    const [courseId, setCourseId] = useState(selectedCourseId || '');
    const [courseTitle, setCourseTitle] = useState(selectedCourseTitle || '');
    const [lessonForm, setLessonForm] = useState({ title: '', description: '', is_free: false });
    const [videoFile, setVideoFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState('');
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const videoRef = useRef();

    const loadLessons = async (id) => {
      if (!id) return;
      setLessonsLoading(true);
      const res = await fetch(`/api/lessons?courseId=${id}`);
      const data = await res.json();
      setLessons(data.lessons || []);
      setLessonsLoading(false);
    };

    useEffect(() => { if (courseId) loadLessons(courseId); }, [courseId]);

    const handleCourseSelect = (e) => {
      const selected = myCourses.find(c => c.id === e.target.value);
      setCourseId(e.target.value);
      setCourseTitle(selected?.title || '');
    };

    const handleAddLesson = async () => {
      if (!courseId) { setError('Select a course first'); return; }
      if (!lessonForm.title.trim()) { setError('Lesson title is required'); return; }
      setError(''); setUploading(true);

      let video_url = '';
      let duration = '0:00';

      if (videoFile) {
        setUploadProgress('Uploading video directly to Cloudinary...');
        try {
          const sigRes = await fetch('/api/upload/signature', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ folder: 'lms/videos' })
          });
          const sigData = await sigRes.json();
          if (sigData.error) { setError('Video signature failed: ' + sigData.error); setUploading(false); setUploadProgress(''); return; }

          const fd = new FormData();
          fd.append('file', videoFile);
          fd.append('api_key', sigData.apiKey);
          fd.append('timestamp', sigData.timestamp);
          fd.append('signature', sigData.signature);
          fd.append('folder', 'lms/videos');

          const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${sigData.cloudName}/video/upload`, {
            method: 'POST',
            body: fd
          });
          const cloudData = await cloudRes.json();
          if (cloudData.error) { setError('Video upload failed: ' + cloudData.error.message); setUploading(false); setUploadProgress(''); return; }
          video_url = cloudData.secure_url;
          if (cloudData.duration) {
            const m = Math.floor(cloudData.duration / 60);
            const s = Math.floor(cloudData.duration % 60);
            duration = `${m}:${s.toString().padStart(2, '0')}`;
          }
        } catch (err) {
          setError('Video upload failed: ' + err.message);
          setUploading(false);
          setUploadProgress('');
          return;
        }
      }

      setUploadProgress('Saving lesson...');
      const res = await fetch('/api/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ course_id: courseId, ...lessonForm, video_url, duration, sort_order: lessons.length }),
      });
      const data = await res.json();
      setUploading(false); setUploadProgress('');

      if (data.error) { setError(data.error); return; }
      setSuccess(`Lesson "${data.lesson.title}" added!`);
      setLessonForm({ title: '', description: '', is_free: false });
      setVideoFile(null);
      loadLessons(courseId);
      setTimeout(() => setSuccess(''), 3000);
    };

    const handleDeleteLesson = async (id) => {
      if (!confirm('Delete this lesson?')) return;
      await fetch('/api/lessons', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
      loadLessons(courseId);
    };

    return (
      <div className="space-y-8 animate-in fade-in duration-500 max-w-3xl">
        <h2 className="text-2xl font-bold text-gray-900">Upload Lessons & Videos</h2>
        {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2"><CheckCircle className="w-5 h-5" />{success}</div>}
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>}

        {/* Course selector */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
          <label className="text-sm font-medium text-gray-700 block">Select Course</label>
          {myCourses.length === 0 ? (
            <p className="text-gray-500 text-sm">No courses yet. <button onClick={() => setActiveTab('create')} className="text-orange-500 font-medium hover:underline">Create one first →</button></p>
          ) : (
            <select value={courseId} onChange={handleCourseSelect} className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-500 outline-none transition">
              <option value="">-- Select a course --</option>
              {myCourses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          )}
        </div>

        {/* Add lesson form */}
        {courseId && (
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-5">
            <h3 className="font-bold text-gray-900">Add New Lesson to: <span className="text-orange-500">{courseTitle}</span></h3>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Lesson Title *</label>
              <input value={lessonForm.title} onChange={e => setLessonForm(f => ({...f, title: e.target.value}))} type="text" placeholder="e.g., Introduction to Hooks" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-500 outline-none transition" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Lesson Description</label>
              <textarea value={lessonForm.description} onChange={e => setLessonForm(f => ({...f, description: e.target.value}))} rows="2" placeholder="Brief description of this lesson" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-500 outline-none transition"></textarea>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Video File</label>
              <input ref={videoRef} type="file" accept="video/*" onChange={e => setVideoFile(e.target.files?.[0] || null)} className="hidden" />
              {videoFile ? (
                <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <Video className="w-5 h-5 text-orange-500 shrink-0" />
                  <span className="text-sm text-gray-700 truncate">{videoFile.name}</span>
                  <span className="text-xs text-gray-500 shrink-0">({(videoFile.size / 1024 / 1024).toFixed(1)} MB)</span>
                  <button onClick={() => setVideoFile(null)} className="ml-auto text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>
                </div>
              ) : (
                <div onClick={() => videoRef.current?.click()} className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-500 transition cursor-pointer group">
                  <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2 group-hover:text-orange-500 transition" />
                  <p className="text-sm text-gray-500">Click to select video file</p>
                  <p className="text-xs text-gray-400 mt-1">MP4, MOV, AVI — uploaded to Cloudinary (free 25GB)</p>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="is_free" checked={lessonForm.is_free} onChange={e => setLessonForm(f => ({...f, is_free: e.target.checked}))} className="w-4 h-4 accent-orange-500" />
              <label htmlFor="is_free" className="text-sm text-gray-600">Free preview lesson (visible without enrollment)</label>
            </div>
            {uploading && (
              <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg flex items-center gap-3">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin shrink-0"></div>
                <span className="text-sm">{uploadProgress || 'Processing...'}</span>
              </div>
            )}
            <button onClick={handleAddLesson} disabled={uploading} className="w-full bg-orange-500 text-white py-3 rounded-lg font-bold hover:bg-orange-600 transition disabled:opacity-50 flex items-center justify-center gap-2">
              <PlusCircle className="w-5 h-5" /> {uploading ? 'Uploading...' : 'Add Lesson'}
            </button>
          </div>
        )}

        {/* Lessons list */}
        {courseId && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-gray-900">Lessons ({lessons.length})</h3>
              <button onClick={() => loadLessons(courseId)} className="text-gray-400 hover:text-orange-500 transition"><RefreshCw className="w-4 h-4" /></button>
            </div>
            {lessonsLoading ? (
              <div className="p-8 text-center"><div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div></div>
            ) : lessons.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">No lessons yet. Add your first lesson above.</div>
            ) : (
              <div className="divide-y divide-gray-50">
                {lessons.map((lesson, i) => (
                  <div key={lesson.id} className="px-6 py-4 flex items-center gap-4 hover:bg-gray-50 transition">
                    <span className="text-sm text-gray-400 w-6 shrink-0">{i + 1}</span>
                    <PlayCircle className="w-5 h-5 text-orange-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{lesson.title}</p>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs text-gray-400">{lesson.duration}</span>
                        {lesson.is_free && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Free</span>}
                        {lesson.video_url && <span className="text-xs text-blue-500">✓ Video uploaded</span>}
                      </div>
                    </div>
                    <button onClick={() => handleDeleteLesson(lesson.id)} className="text-gray-300 hover:text-red-500 transition shrink-0"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };


  const CourseBuilder = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <div className="mb-6">
          <label className="text-sm font-medium text-gray-700 mb-2 block">Select Course</label>
          <select className="w-full md:w-1/2 border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-500 outline-none transition">
            <option>React Masterclass</option>
            <option>Next.js Fundamentals</option>
          </select>
        </div>

        <div className="space-y-4">
          {/* Module 1 */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-gray-50 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <GripVertical className="w-5 h-5 text-gray-400 cursor-grab" />
                <span className="font-bold text-gray-900">Module 1: Introduction to React</span>
              </div>
              <div className="flex gap-2">
                <button className="text-xs bg-white border border-gray-300 px-3 py-1.5 rounded hover:bg-gray-50 transition">+ Add Lesson</button>
                <MoreHorizontal className="w-4 h-4 text-gray-400 cursor-pointer" />
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {["What is React?", "Setting up Environment", "JSX Basics"].map((lesson, i) => (
                <div key={i} className="p-4 pl-12 flex items-center justify-between hover:bg-gray-50 transition">
                  <div className="flex items-center gap-3">
                    <GripVertical className="w-4 h-4 text-gray-300 cursor-grab" />
                    <PlayCircle className="w-4 h-4 text-orange-500" />
                    <span className="text-sm text-gray-700">{lesson}</span>
                  </div>
                  <div className="flex gap-2">
                    <button className="text-xs text-gray-500 hover:text-orange-500">Edit</button>
                    <button className="text-xs text-gray-500 hover:text-red-500">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Module 2 */}
          <div className="border border-gray-200 rounded-lg overflow-hidden opacity-75">
            <div className="bg-gray-50 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <GripVertical className="w-5 h-5 text-gray-400 cursor-grab" />
                <span className="font-bold text-gray-900">Module 2: Components & Props</span>
              </div>
              <div className="flex gap-2">
                <button className="text-xs bg-white border border-gray-300 px-3 py-1.5 rounded hover:bg-gray-50 transition">+ Add Lesson</button>
                <MoreHorizontal className="w-4 h-4 text-gray-400 cursor-pointer" />
              </div>
            </div>
          </div>

          <button className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 font-medium hover:border-orange-500 hover:text-orange-500 transition">
            + Add New Module
          </button>
        </div>
      </div>
    </div>
  );



  const ManageLessons = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold text-gray-900">Manage Lessons</h2>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
          <span className="font-bold text-gray-700">React Masterclass - Module 1</span>
          <button className="text-xs bg-orange-500 text-white px-3 py-1.5 rounded hover:bg-orange-600 transition">+ Add Lesson</button>
        </div>
        <div className="divide-y divide-gray-50">
          {[
            { title: "Lesson 1: What is React?", duration: "12:30", status: "Published" },
            { title: "Lesson 2: Setting up Environment", duration: "15:45", status: "Published" },
            { title: "Lesson 3: JSX Basics", duration: "10:20", status: "Draft" },
          ].map((lesson, i) => (
            <div key={i} className="p-4 flex items-center justify-between hover:bg-gray-50 transition group">
              <div className="flex items-center gap-4">
                <GripVertical className="w-5 h-5 text-gray-300 cursor-grab opacity-0 group-hover:opacity-100 transition" />
                <div>
                  <h4 className="font-medium text-gray-900">{lesson.title}</h4>
                  <p className="text-xs text-gray-500">{lesson.duration}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`text-xs px-2 py-1 rounded-full ${lesson.status === "Published" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                  {lesson.status}
                </span>
                <button className="text-gray-400 hover:text-orange-500 transition"><Edit3 className="w-4 h-4" /></button>
                <button className="text-gray-400 hover:text-red-500 transition"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const StudentAnalytics = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold text-gray-900">Student Analytics</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Total Students", val: "850", icon: Users, color: "bg-blue-50 text-blue-600" },
          { label: "Completion Rate", val: "62%", icon: CheckCircle2, color: "bg-green-50 text-green-600" },
          { label: "Avg Watch Time", val: "18 hours", icon: PlayCircle, color: "bg-purple-50 text-purple-600" },
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
        <h3 className="font-bold text-gray-900 mb-4">Drop-off Points (Where students stop watching)</h3>
        <div className="space-y-4">
          {[
            { lesson: "Module 3: Advanced Hooks", dropRate: "45%" },
            { lesson: "Module 5: Performance Optimization", dropRate: "32%" },
            { lesson: "Module 2: State Management", dropRate: "18%" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-4">
              <span className="text-sm text-gray-600 w-1/3 truncate">{item.lesson}</span>
              <div className="flex-1 bg-gray-100 h-2 rounded-full overflow-hidden">
                <div className="bg-red-400 h-full rounded-full" style={{ width: item.dropRate }}></div>
              </div>
              <span className="text-sm font-bold text-red-500 w-12 text-right">{item.dropRate}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const Revenue = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold text-gray-900">Revenue Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Today", val: "₹2,000", sub: "+12% from yesterday" },
          { label: "This Month", val: "₹45,000", sub: "+8% from last month" },
          { label: "Lifetime", val: "₹2.4L", sub: "Total earnings" },
        ].map((item, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <p className="text-sm text-gray-500 mb-1">{item.label}</p>
            <p className="text-3xl font-bold text-gray-900 mb-2">{item.val}</p>
            <p className="text-xs text-green-600 font-medium">{item.sub}</p>
          </div>
        ))}
      </div>
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-64 flex items-center justify-center text-gray-400">
        [Detailed Revenue Chart Placeholder]
      </div>
    </div>
  );

  const Reviews = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold text-gray-900">Course Reviews</h2>
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900">Sarah Jenkins</h4>
                  <div className="flex text-yellow-400 text-xs">
                    {[...Array(i === 1 ? 5 : 4)].map((_, idx) => <Star key={idx} className="w-3 h-3 fill-current" />)}
                  </div>
                </div>
              </div>
              <span className="text-xs text-gray-400">2 days ago</span>
            </div>
            <p className="text-sm text-gray-600 mb-4">"Amazing course! The content is very well structured and easy to follow. Highly recommended for beginners."</p>
            <div className="pt-3 border-t border-gray-50">
              <textarea placeholder="Write a reply..." className="w-full text-sm border-none outline-none resize-none bg-transparent placeholder-gray-400" rows="2"></textarea>
              <div className="flex justify-end mt-2">
                <button className="bg-black text-white text-xs px-4 py-2 rounded hover:bg-gray-800 transition">Reply</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const QandA = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold text-gray-900">Q&A Section</h2>
      <div className="space-y-4">
        {[
          { user: "Mike T.", q: "What is React.memo and when should I use it?", a: null },
          { user: "Alex R.", q: "Can I use this course material for commercial projects?", a: "Yes, absolutely! Once you purchase the course, you have full rights to use the code in your projects." },
        ].map((item, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex gap-3 mb-3">
              <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">Q</div>
              <div>
                <p className="text-xs text-gray-500 mb-1">{item.user} asked:</p>
                <p className="font-medium text-gray-900">{item.q}</p>
              </div>
            </div>
            {item.a ? (
              <div className="ml-11 flex gap-3 pt-3 border-t border-gray-50">
                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">A</div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">You replied:</p>
                  <p className="text-sm text-gray-700">{item.a}</p>
                </div>
              </div>
            ) : (
              <div className="ml-11 mt-3">
                <textarea placeholder="Write your answer..." className="w-full text-sm border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 outline-none transition" rows="2"></textarea>
                <button className="mt-2 bg-orange-500 text-white text-xs px-4 py-2 rounded hover:bg-orange-600 transition">Post Answer</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const Certificates = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold text-gray-900">Issued Certificates</h2>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
            <tr>
              <th className="px-6 py-4 font-medium">Student</th>
              <th className="px-6 py-4 font-medium">Course</th>
              <th className="px-6 py-4 font-medium">Date Issued</th>
              <th className="px-6 py-4 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {[
              { student: "Ethan Hunt", course: "React Masterclass", date: "Jan 15, 2024" },
              { student: "Sarah Jenkins", course: "Python Data Science", date: "Jan 10, 2024" },
            ].map((item, i) => (
              <tr key={i} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 font-medium text-gray-900">{item.student}</td>
                <td className="px-6 py-4 text-gray-600">{item.course}</td>
                <td className="px-6 py-4 text-gray-500">{item.date}</td>
                <td className="px-6 py-4 text-right">
                  <button className="text-orange-500 hover:text-orange-600 text-xs font-medium">View Certificate</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const Coupons = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Coupons</h2>
        <button className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-orange-600 transition flex items-center gap-2">
          <PlusCircle className="w-4 h-4" /> Create Coupon
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 rounded-xl text-white shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10"></div>
          <h3 className="text-2xl font-bold mb-2 tracking-wider">SUMMER50</h3>
          <p className="text-orange-100 text-sm mb-4">50% OFF on all courses</p>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-xs text-orange-200">Valid Until</p>
              <p className="font-bold">Aug 31, 2024</p>
            </div>
            <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold">Active</span>
          </div>
        </div>
      </div>
    </div>
  );

  const Announcements = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold text-gray-900">Announcements</h2>
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Title</label>
            <input type="text" defaultValue="New lesson uploaded: Advanced Redux" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-500 outline-none transition" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Message</label>
            <textarea rows="4" defaultValue="Hey everyone! I've just uploaded a new lesson covering Advanced Redux patterns. Check it out in Module 6!" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-500 outline-none transition"></textarea>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded text-orange-500 focus:ring-orange-500" />
              Notify all enrolled students via email
            </label>
          </div>
          <div className="pt-2">
            <button className="bg-orange-500 text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-orange-600 transition flex items-center gap-2">
              <Megaphone className="w-4 h-4" /> Send Announcement
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const Blog = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Blog Posts</h2>
        <button className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-orange-600 transition flex items-center gap-2">
          <PlusCircle className="w-4 h-4" /> New Post
        </button>
      </div>
      <div className="space-y-4">
        {[
          { title: "Why Learn React in 2024?", date: "Jan 20, 2024", status: "Published" },
          { title: "Top 10 JavaScript Tips", date: "Jan 15, 2024", status: "Draft" },
        ].map((post, i) => (
          <div key={i} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex justify-between items-center">
            <div>
              <h3 className="font-bold text-gray-900 mb-1">{post.title}</h3>
              <p className="text-xs text-gray-500">{post.date}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs px-2 py-1 rounded-full ${post.status === "Published" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                {post.status}
              </span>
              <button className="text-gray-400 hover:text-orange-500 transition"><Edit3 className="w-4 h-4" /></button>
              <button className="text-gray-400 hover:text-red-500 transition"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const Profile = () => (
    <div className="max-w-3xl space-y-8 animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold text-gray-900">Instructor Profile</h2>
      <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm space-y-6">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden border-4 border-white shadow-md">
            <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop" alt="Avatar" className="w-full h-full object-cover" />
          </div>
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition">Update Profile Image</button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Full Name</label>
            <input type="text" defaultValue="John Doe" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-500 outline-none transition" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Email</label>
            <input type="email" defaultValue="john@edupress.com" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-500 outline-none transition" />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-gray-700">Bio</label>
            <textarea rows="3" defaultValue="Senior Frontend Developer with 10+ years of experience. Passionate about teaching React and modern web development." className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-500 outline-none transition"></textarea>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Experience</label>
            <input type="text" defaultValue="10 Years" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-500 outline-none transition" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Skills</label>
            <input type="text" defaultValue="React, Next.js, Node.js, TypeScript" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-500 outline-none transition" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Portfolio URL</label>
            <input type="url" placeholder="https://johndoe.dev" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-500 outline-none transition" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">LinkedIn Profile</label>
            <input type="url" placeholder="https://linkedin.com/in/johndoe" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-500 outline-none transition" />
          </div>
        </div>
        
        <div className="pt-6 border-t border-gray-100 flex justify-end">
          <button className="bg-orange-500 text-white px-8 py-3 rounded-lg font-bold hover:bg-orange-600 transition shadow-md shadow-orange-200">Save Profile</button>
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
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center text-white font-bold">M</div>
            <span className="text-xl font-bold tracking-tight text-gray-900">EduPress</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-400"><X className="w-6 h-6" /></button>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-1 custom-scrollbar">
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
            <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop" alt="User" className="w-10 h-10 rounded-full object-cover" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">John Doe</p>
              <p className="text-xs text-gray-500 truncate">Instructor Account</p>
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
              <input type="text" placeholder="Search..." className="bg-transparent border-none outline-none text-sm w-48 placeholder-gray-400" />
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
            {activeTab === "create" && <CreateCourse />}
            {activeTab === "builder" && <CourseBuilder />}
            {activeTab === "upload" && <UploadVideos />}
            {activeTab === "lessons" && <ManageLessons />}
            {activeTab === "analytics" && <StudentAnalytics />}
            {activeTab === "revenue" && <Revenue />}
            {activeTab === "reviews" && <Reviews />}
            {activeTab === "qa" && <QandA />}
            {activeTab === "certificates" && <Certificates />}
            {activeTab === "coupons" && <Coupons />}
            {activeTab === "announcements" && <Announcements />}
            {activeTab === "blog" && <Blog />}
            {activeTab === "profile" && <Profile />}
          </div>
        </main>
      </div>

      </div>
    </div>
  );
}