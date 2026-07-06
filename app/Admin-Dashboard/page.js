"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard, Users, GraduationCap, DollarSign, BarChart3,
  CheckCircle, XCircle, Trash2, Edit3, Shield, Star, Tag, Megaphone,
  FolderOpen, Award, HardDrive, Settings, Mail, Lock, Search, Bell,
  Menu, X, LogOut, ChevronDown, MoreHorizontal, Eye, EyeOff, AlertTriangle
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import Navbar from "../component/navbar";

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState("");

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/';
  };

  // Mock Data
  const stats = [
    { label: "Users", val: "12,850", icon: Users, color: "bg-blue-50 text-blue-600" },
    { label: "Courses", val: "320", icon: GraduationCap, color: "bg-purple-50 text-purple-600" },
    { label: "Revenue", val: "₹24,50,000", icon: DollarSign, color: "bg-green-50 text-green-600" },
    { label: "Active Students", val: "4,200", icon: BarChart3, color: "bg-orange-50 text-orange-600" },
  ];

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "users", label: "User Management", icon: Users },
    { id: "instructors", label: "Instructor Approval", icon: GraduationCap },
    { id: "courses", label: "Course Management", icon: BookOpenIcon },
    { id: "blog", label: "Blog Management", icon: FileTextIcon },
    { id: "payments", label: "Payments", icon: DollarSign },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "reviews", label: "Reviews", icon: Star },
    { id: "coupons", label: "Coupon Management", icon: Tag },
    { id: "notifications", label: "Notifications", icon: Megaphone },
    { id: "categories", label: "Categories", icon: FolderOpen },
    { id: "certificates", label: "Certificates", icon: Award },
    { id: "storage", label: "File Storage", icon: HardDrive },
    { id: "settings", label: "Platform Settings", icon: Settings },
    { id: "email", label: "Email Templates", icon: Mail },
    { id: "security", label: "Security", icon: Shield },
  ];

  const [roleChanging, setRoleChanging] = useState({}); // { [userId]: true/false }

  useEffect(() => {
    if (activeTab !== 'users') return
    setUsersLoading(true)
    setUsersError('')
    fetch('/api/admin/users')
      .then((res) => res.json())
      .then((data) => {
        if (data?.error) throw new Error(data.error)
        setUsers(data.users || [])
      })
      .catch((err) => setUsersError(err.message))
      .finally(() => setUsersLoading(false))
  }, [activeTab])

  const handleRoleChange = async (userId, newRole) => {
    setRoleChanging(prev => ({ ...prev, [userId]: true }))
    try {
      const res = await fetch('/api/admin/set-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      })
      const data = await res.json()
      if (data.error) {
        alert('Error: ' + data.error)
      } else {
        // Update local state immediately
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u))
      }
    } catch {
      alert('Failed to update role. Check SUPABASE_SERVICE_ROLE_KEY in .env.local')
    } finally {
      setRoleChanging(prev => ({ ...prev, [userId]: false }))
    }
  }

  // Real blogs state
  const [blogs, setBlogs] = useState([]);
  const [blogsLoading, setBlogsLoading] = useState(false);
  const [blogsError, setBlogsError] = useState('');

  const fetchBlogs = async () => {
    setBlogsLoading(true);
    setBlogsError('');
    try {
      const res = await fetch('/api/blogs');
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setBlogs(data.blogs || []);
    } catch (err) {
      setBlogsError(err.message || 'Failed to fetch blogs');
    } finally {
      setBlogsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'blog') {
      fetchBlogs();
    }
  }, [activeTab]);

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
        {/* Revenue Chart Placeholder */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4">Monthly Revenue Growth</h3>
          <div className="h-64 bg-gray-50 rounded-lg flex items-end justify-between px-4 pb-4 gap-2 relative">
             {/* Grid Lines */}
             <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none opacity-20">
                {[...Array(5)].map((_, i) => <div key={i} className="w-full border-t border-gray-400"></div>)}
             </div>
             {[30, 45, 35, 60, 55, 70, 65, 80, 75, 90, 85, 95].map((h, i) => (
               <div key={i} className="flex-1 bg-gradient-to-t from-orange-500 to-orange-400 rounded-t-sm hover:from-orange-600 hover:to-orange-500 transition-all duration-300 relative group" style={{ height: `${h}%` }}>
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">₹{(h * 1000).toLocaleString()}</div>
               </div>
             ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-400 px-2">
            <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
            <span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
          </div>
        </div>

        {/* Recent Activity / Popular Courses */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4">Top Performing Courses</h3>
          <div className="space-y-4">
            {[
              { name: "React Masterclass", students: 1560, revenue: "₹12,00,000", growth: "+12%" },
              { name: "Python Data Science", students: 890, revenue: "₹6,50,000", growth: "+8%" },
              { name: "UI/UX Design Bootcamp", students: 640, revenue: "₹4,20,000", growth: "+15%" },
              { name: "Next.js Full Stack", students: 420, revenue: "₹2,80,000", growth: "+5%" },
            ].map((course, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center font-bold text-sm">{i + 1}</div>
                  <div>
                    <p className="font-bold text-sm text-gray-900">{course.name}</p>
                    <p className="text-xs text-gray-500">{course.students.toLocaleString()} students</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900 text-sm">{course.revenue}</p>
                  <p className="text-xs text-green-600 font-medium">{course.growth}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const roleBadge = (role) => {
    const map = {
      admin: 'bg-red-100 text-red-700',
      instructor: 'bg-blue-100 text-blue-700',
      student: 'bg-green-100 text-green-700',
    }
    return map[role] || 'bg-gray-100 text-gray-700'
  }

  const UserManagement = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
        <button
          onClick={() => {
            setUsersLoading(true)
            fetch('/api/admin/users').then(r => r.json()).then(d => { setUsers(d.users || []); setUsersLoading(false) })
          }}
          className="text-sm text-orange-500 hover:text-orange-600 font-medium flex items-center gap-1"
        >
          ↻ Refresh
        </button>
      </div>

      {usersError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          <strong>Error:</strong> {usersError}
          {usersError.includes('SERVICE_ROLE_KEY') && (
            <p className="mt-1 text-xs">Add <code>SUPABASE_SERVICE_ROLE_KEY</code> to your <code>.env.local</code> file and restart the dev server.</p>
          )}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
            <tr>
              <th className="px-6 py-4 font-medium">User</th>
              <th className="px-6 py-4 font-medium">Current Role</th>
              <th className="px-6 py-4 font-medium">Change Role</th>
              <th className="px-6 py-4 font-medium">Last Sign In</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {usersLoading ? (
              <tr><td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                  <span>Loading users from Supabase...</span>
                </div>
              </td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">No users found.</td></tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm font-bold shrink-0">
                        {(user.username || user.email || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.username || '—'}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${roleBadge(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={user.role}
                      disabled={roleChanging[user.id]}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-orange-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="student">Student</option>
                      <option value="instructor">Instructor</option>
                      <option value="admin">Admin</option>
                    </select>
                    {roleChanging[user.id] && (
                      <span className="ml-2 text-xs text-orange-500 animate-pulse">Saving...</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs">
                    {user.lastSignIn ? new Date(user.lastSignIn).toLocaleString() : 'Never'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const InstructorApproval = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold text-gray-900">Instructor Applications</h2>
      <div className="space-y-4">
        {[
          { name: "John Doe", bio: "Full stack developer with 5 years experience teaching React.", applied: "2 days ago" },
          { name: "Jane Smith", bio: "Data scientist specializing in Python and Machine Learning.", applied: "5 days ago" },
        ].map((app, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between gap-6">
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-lg font-bold text-gray-600 shrink-0">{app.name.charAt(0)}</div>
              <div>
                <h3 className="font-bold text-gray-900">{app.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{app.bio}</p>
                <p className="text-xs text-gray-400 mt-2">Applied: {app.applied}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition">View Profile</button>
              <button className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-100 transition flex items-center gap-2"><XCircle className="w-4 h-4" /> Reject</button>
              <button className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-bold hover:bg-green-600 transition flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Approve</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const CourseManagement = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold text-gray-900">Course Moderation</h2>
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
            <tr>
              <th className="px-6 py-4 font-medium">Course Title</th>
              <th className="px-6 py-4 font-medium">Instructor</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {[
              { title: "Advanced TypeScript Patterns", instructor: "John Doe", status: "Pending" },
              { title: "Docker for Beginners", instructor: "Jane Smith", status: "Published" },
              { title: "Low Quality Course", instructor: "Spam User", status: "Hidden" },
            ].map((course, i) => (
              <tr key={i} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4 font-medium text-gray-900">{course.title}</td>
                <td className="px-6 py-4 text-gray-600">{course.instructor}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    course.status === "Published" ? "bg-green-100 text-green-700" : 
                    course.status === "Pending" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
                  }`}>{course.status}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    {course.status === "Pending" && (
                      <>
                        <button className="px-3 py-1.5 bg-green-50 text-green-700 rounded text-xs font-bold hover:bg-green-100 transition">Approve</button>
                        <button className="px-3 py-1.5 bg-red-50 text-red-700 rounded text-xs font-bold hover:bg-red-100 transition">Reject</button>
                      </>
                    )}
                    <button className="p-1.5 text-gray-400 hover:text-blue-500 transition" title="Feature"><Star className="w-4 h-4" /></button>
                    <button className="p-1.5 text-gray-400 hover:text-gray-700 transition" title="Hide"><EyeOff className="w-4 h-4" /></button>
                    <button className="p-1.5 text-gray-400 hover:text-red-500 transition" title="Delete"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const Analytics = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold text-gray-900">Platform Analytics</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Registrations Chart */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4">User Registrations</h3>
          <div className="h-48 flex items-end gap-2">
             {[20, 35, 45, 30, 55, 65, 50, 70, 80, 60, 75, 90].map((h, i) => (
                <div key={i} className="flex-1 bg-blue-100 rounded-t-sm hover:bg-blue-200 transition relative group" style={{height: `${h}%`}}>
                   <div className="absolute bottom-0 w-full bg-blue-500 rounded-t-sm" style={{height: `${h * 0.7}%`}}></div>
                </div>
             ))}
          </div>
        </div>

        {/* Course Completions Chart */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4">Course Completions</h3>
          <div className="h-48 flex items-end gap-2">
             {[10, 25, 20, 40, 35, 50, 45, 60, 55, 70, 65, 80].map((h, i) => (
                <div key={i} className="flex-1 bg-green-100 rounded-t-sm hover:bg-green-200 transition relative group" style={{height: `${h}%`}}>
                   <div className="absolute bottom-0 w-full bg-green-500 rounded-t-sm" style={{height: `${h * 0.8}%`}}></div>
                </div>
             ))}
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
         <h3 className="font-bold text-gray-900 mb-4">Key Metrics Overview</h3>
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
               <p className="text-xs text-gray-500 uppercase">Most Popular Category</p>
               <p className="text-lg font-bold text-gray-900 mt-1">Development</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
               <p className="text-xs text-gray-500 uppercase">Highest Revenue Month</p>
               <p className="text-lg font-bold text-gray-900 mt-1">October 2023</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
               <p className="text-xs text-gray-500 uppercase">Avg. Completion Rate</p>
               <p className="text-lg font-bold text-green-600 mt-1">68%</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
               <p className="text-xs text-gray-500 uppercase">New Instructors (MoM)</p>
               <p className="text-lg font-bold text-blue-600 mt-1">+12</p>
            </div>
         </div>
      </div>
    </div>
  );

  const BlogManagement = () => {
    const [subTab, setSubTab] = useState('list'); // 'list' | 'create'
    const [blogForm, setBlogForm] = useState({ title: '', author: 'Admin', category: 'Educate', excerpt: '', tags: '' });
    const [blogContent, setBlogContent] = useState('');
    const [blogImage, setBlogImage] = useState(null);
    const [blogImagePreview, setBlogImagePreview] = useState('');
    const [imageUploading, setImageUploading] = useState(false);
    const [savingBlog, setSavingBlog] = useState(false);
    const [blogSuccess, setBlogSuccess] = useState('');
    const [blogErrorMsg, setBlogErrorMsg] = useState('');
    const blogFileInputRef = useRef(null);

    const handleBlogImageSelect = (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setBlogImage(file);
      setBlogImagePreview(URL.createObjectURL(file));
    };

    const handleBlogSubmit = async () => {
      if (!blogForm.title.trim()) { setBlogErrorMsg('Title is required'); return; }
      if (!blogForm.author.trim()) { setBlogErrorMsg('Author is required'); return; }
      setBlogErrorMsg('');
      setSavingBlog(true);
      let imageUrl = '';

      try {
        if (blogImage) {
          setImageUploading(true);
          const sigRes = await fetch('/api/upload/signature', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ folder: 'lms/blogs' })
          });
          const sigData = await sigRes.json();
          if (sigData.error) throw new Error('Signature failed: ' + sigData.error);

          const fd = new FormData();
          fd.append('file', blogImage);
          fd.append('api_key', sigData.apiKey);
          fd.append('timestamp', sigData.timestamp);
          fd.append('signature', sigData.signature);
          fd.append('folder', 'lms/blogs');

          const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${sigData.cloudName}/image/upload`, {
            method: 'POST',
            body: fd
          });
          const cloudData = await cloudRes.json();
          setImageUploading(false);
          if (cloudData.error) throw new Error('Cloudinary upload failed: ' + cloudData.error.message);
          imageUrl = cloudData.secure_url;
        }

        const tagsArray = blogForm.tags
          .split(',')
          .map(t => t.trim())
          .filter(Boolean);
        
        const contentArray = blogContent
          .split('\n')
          .map(p => p.trim())
          .filter(Boolean);

        const res = await fetch('/api/blogs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...blogForm,
            image: imageUrl,
            content: contentArray,
            tags: tagsArray
          })
        });
        const resData = await res.json();
        if (resData.error) throw new Error(resData.error);

        setBlogSuccess('Blog post published successfully!');
        setBlogForm({ title: '', author: 'Admin', category: 'Educate', excerpt: '', tags: '' });
        setBlogContent('');
        setBlogImage(null);
        setBlogImagePreview('');
        fetchBlogs();
        setTimeout(() => {
          setBlogSuccess('');
          setSubTab('list');
        }, 2000);

      } catch (err) {
        setBlogErrorMsg(err.message);
      } finally {
        setSavingBlog(false);
        setImageUploading(false);
      }
    };

    const handleBlogDelete = async (id) => {
      if (!confirm('Are you sure you want to delete this blog post?')) return;
      try {
        const res = await fetch('/api/blogs', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id })
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        fetchBlogs();
      } catch (err) {
        alert('Delete failed: ' + err.message);
      }
    };

    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Blog Management</h2>
          <div className="flex gap-2">
            <button 
              onClick={() => setSubTab('list')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                subTab === 'list' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All Posts
            </button>
            <button 
              onClick={() => setSubTab('create')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                subTab === 'create' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Write New Post
            </button>
          </div>
        </div>

        {subTab === 'list' ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            {blogsLoading ? (
              <div className="flex flex-col items-center py-16 gap-2">
                <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm text-gray-500">Loading blog posts...</p>
              </div>
            ) : blogs.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <p className="mb-2">No blog posts found.</p>
                <button onClick={() => setSubTab('create')} className="text-orange-500 text-sm font-medium hover:underline">Write your first post →</button>
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-4 font-medium">Post Details</th>
                    <th className="px-6 py-4 font-medium">Author</th>
                    <th className="px-6 py-4 font-medium">Category</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {blogs.map((blog) => (
                    <tr key={blog.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {blog.image ? (
                            <img src={blog.image} alt={blog.title} className="w-12 h-9 rounded object-cover shrink-0" />
                          ) : (
                            <div className="w-12 h-9 bg-gray-100 rounded flex items-center justify-center shrink-0"><FolderOpen className="w-4 h-4 text-gray-400" /></div>
                          )}
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 truncate max-w-md">{blog.title}</p>
                            <p className="text-xs text-gray-400">{blog.date}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 font-medium">{blog.author}</td>
                      <td className="px-6 py-4 text-gray-600">{blog.category}</td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleBlogDelete(blog.id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition" 
                          title="Delete Post"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ) : (
          <div className="max-w-3xl bg-white p-8 rounded-xl border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">Create Blog Post</h3>
            {blogSuccess && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2"><CheckCircle className="w-5 h-5" />{blogSuccess}</div>}
            {blogErrorMsg && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{blogErrorMsg}</div>}

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Post Title *</label>
                <input 
                  value={blogForm.title} 
                  onChange={e => setBlogForm(f => ({ ...f, title: e.target.value }))} 
                  type="text" 
                  placeholder="e.g. Best WordPress LMS plugin for 2026" 
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition" 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Author *</label>
                  <input 
                    value={blogForm.author} 
                    onChange={e => setBlogForm(f => ({ ...f, author: e.target.value }))} 
                    type="text" 
                    placeholder="Author name" 
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Category</label>
                  <input 
                    value={blogForm.category} 
                    onChange={e => setBlogForm(f => ({ ...f, category: e.target.value }))} 
                    type="text" 
                    placeholder="e.g. Educate, Design" 
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Tags (comma-separated)</label>
                <input 
                  value={blogForm.tags} 
                  onChange={e => setBlogForm(f => ({ ...f, tags: e.target.value }))} 
                  type="text" 
                  placeholder="e.g. LMS, WordPress, Marketing" 
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Excerpt / Short Summary</label>
                <textarea 
                  value={blogForm.excerpt} 
                  onChange={e => setBlogForm(f => ({ ...f, excerpt: e.target.value }))} 
                  rows="2" 
                  placeholder="Enter a brief post summary for listing pages..." 
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Post Content (press Enter for new paragraphs)</label>
                <textarea 
                  value={blogContent} 
                  onChange={e => setBlogContent(e.target.value)} 
                  rows="8" 
                  placeholder="Write the full post contents here..." 
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition font-sans" 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Cover Image</label>
                <input ref={blogFileInputRef} type="file" accept="image/*" onChange={handleBlogImageSelect} className="hidden" />
                {blogImagePreview ? (
                  <div className="relative w-full max-w-md">
                    <img src={blogImagePreview} alt="preview" className="w-full h-48 object-cover rounded-lg" />
                    <button 
                      onClick={() => { setBlogImage(null); setBlogImagePreview(''); }} 
                      className="absolute top-2 right-2 bg-white rounded-full p-1 shadow text-gray-600 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div 
                    onClick={() => blogFileInputRef.current?.click()} 
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-500 transition cursor-pointer group"
                  >
                    <FolderOpen className="w-8 h-8 mx-auto text-gray-400 mb-2 group-hover:text-orange-500 transition" />
                    <p className="text-sm text-gray-500">Select cover image file</p>
                    <p className="text-xs text-gray-400 mt-1">Image uploads directly to Cloudinary</p>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
              <button 
                onClick={() => setSubTab('list')} 
                className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleBlogSubmit} 
                disabled={savingBlog || imageUploading} 
                className="px-6 py-2.5 bg-orange-500 text-white rounded-lg text-sm font-bold hover:bg-orange-600 transition disabled:opacity-50"
              >
                {savingBlog ? 'Publishing...' : 'Publish Post'}
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const PlatformSettings = () => (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold text-gray-900">Platform Settings</h2>
      
      <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm space-y-8">
        {/* Branding */}
        <section>
          <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Branding & Appearance</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Site Logo</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-orange-500 transition cursor-pointer">
                <p className="text-sm text-gray-500">Upload Logo (PNG/SVG)</p>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Homepage Banner</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-orange-500 transition cursor-pointer">
                <p className="text-sm text-gray-500">Upload Banner Image</p>
              </div>
            </div>
          </div>
        </section>

        {/* General Info */}
        <section>
          <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">General Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Site Name</label>
              <input type="text" defaultValue="EduPress LMS" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-500 outline-none transition" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Support Email</label>
              <input type="email" defaultValue="support@edupress.com" className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-500 outline-none transition" />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-medium text-gray-700">Footer Text</label>
              <textarea rows="2" defaultValue="© 2024 EduPress LMS. All rights reserved." className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-500 outline-none transition"></textarea>
            </div>
          </div>
        </section>

        {/* SEO & Social */}
        <section>
          <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">SEO & Social Links</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Meta Description</label>
              <textarea rows="2" placeholder="Default meta description for search engines..." className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-500 outline-none transition"></textarea>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input type="url" placeholder="Facebook URL" className="border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-500 outline-none transition" />
              <input type="url" placeholder="Twitter/X URL" className="border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-500 outline-none transition" />
              <input type="url" placeholder="LinkedIn URL" className="border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-orange-500 outline-none transition" />
            </div>
          </div>
        </section>

        <div className="pt-4 flex justify-end">
          <button className="bg-orange-500 text-white px-8 py-3 rounded-lg font-bold hover:bg-orange-600 transition shadow-md shadow-orange-200">Save Settings</button>
        </div>
      </div>
    </div>
  );

  const Security = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h2 className="text-2xl font-bold text-gray-900">Security & Audit</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
           <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Lock className="w-4 h-4 text-orange-500" /> Login History</h3>
           <div className="space-y-3">
              {[
                 { user: "admin@edupress.com", ip: "192.168.1.1", time: "2 mins ago", status: "Success" },
                 { user: "john@example.com", ip: "45.22.11.90", time: "1 hour ago", status: "Failed" },
                 { user: "sarah@example.com", ip: "103.44.22.11", time: "3 hours ago", status: "Success" },
              ].map((log, i) => (
                 <div key={i} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded">
                    <div>
                       <p className="font-medium text-gray-900">{log.user}</p>
                       <p className="text-xs text-gray-500">{log.ip} • {log.time}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${log.status === "Success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{log.status}</span>
                 </div>
              ))}
           </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
           <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-red-500" /> Suspicious Activity</h3>
           <div className="space-y-3">
              <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
                 <p className="text-sm font-bold text-red-900">Multiple Failed Logins</p>
                 <p className="text-xs text-red-700 mt-1">IP 45.22.11.90 has failed login 5 times in last 10 mins.</p>
                 <button className="mt-2 text-xs bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition">Block IP</button>
              </div>
              <div className="p-3 bg-yellow-50 border border-yellow-100 rounded-lg">
                 <p className="text-sm font-bold text-yellow-900">Unusual Download Pattern</p>
                 <p className="text-xs text-yellow-700 mt-1">User 'mike_ross' downloaded 50 PDFs in 1 minute.</p>
                 <button className="mt-2 text-xs bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700 transition">Investigate</button>
              </div>
           </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
         <h3 className="font-bold text-gray-900 mb-4">Audit Log</h3>
         <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
               <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                  <tr>
                     <th className="px-4 py-3">Action</th>
                     <th className="px-4 py-3">Performed By</th>
                     <th className="px-4 py-3">Timestamp</th>
                     <th className="px-4 py-3">Details</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-50">
                  <tr>
                     <td className="px-4 py-3 font-medium">Course Approved</td>
                     <td className="px-4 py-3">Admin User</td>
                     <td className="px-4 py-3 text-gray-500">Today, 10:30 AM</td>
                     <td className="px-4 py-3 text-gray-500">Approved "React Masterclass"</td>
                  </tr>
                  <tr>
                     <td className="px-4 py-3 font-medium">User Banned</td>
                     <td className="px-4 py-3">Admin User</td>
                     <td className="px-4 py-3 text-gray-500">Yesterday, 4:15 PM</td>
                     <td className="px-4 py-3 text-gray-500">Banned user "spam_bot_123"</td>
                  </tr>
               </tbody>
            </table>
         </div>
      </div>
    </div>
  );

  /* Helper Icons for Nav */
  function BookOpenIcon(props) { return <GraduationCap {...props} />; } // Reusing GraduationCap for courses visual consistency or use actual BookOpen if imported
  function FileTextIcon(props) { return <FolderOpen {...props} />; } // Placeholder for blog icon

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
            <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold">AD</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">Super Admin</p>
              <p className="text-xs text-gray-500 truncate">admin@edupress.com</p>
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
              <input type="text" placeholder="Search users, courses..." className="bg-transparent border-none outline-none text-sm w-48 placeholder-gray-400" />
            </div>
            <button className="relative w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        {/* DYNAMIC CONTENT */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {activeTab === "dashboard" && <DashboardHome />}
            {activeTab === "users" && <UserManagement />}
            {activeTab === "instructors" && <InstructorApproval />}
            {activeTab === "courses" && <CourseManagement />}
            {activeTab === "blog" && <BlogManagement />}
            {activeTab === "analytics" && <Analytics />}
            {activeTab === "settings" && <PlatformSettings />}
            {activeTab === "security" && <Security />}
            
            {/* Placeholder for other tabs to prevent errors during navigation testing */}
            {!["dashboard", "users", "instructors", "courses", "blog", "analytics", "settings", "security"].includes(activeTab) && (
              <div className="flex flex-col items-center justify-center h-96 text-gray-400 animate-in fade-in duration-500">
                <Settings className="w-16 h-16 mb-4 opacity-20" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">{navItems.find(n => n.id === activeTab)?.label}</h3>
                <p>This module is ready for backend integration.</p>
              </div>
            )}
          </div>
        </main>
      </div>

      </div>
    </div>
  );
}