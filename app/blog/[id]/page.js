'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import NextLink from 'next/link';
import Navbar from '../../component/navbar';
import { supabase } from '@/lib/supabase';
import { 
  Search, User, Menu, ChevronDown, Calendar, MessageSquare, 
  ArrowUp, Share, Share2, Globe as GlobeIcon, CornerUpLeft
} from 'lucide-react';

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
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/></svg>
);

export default function BlogSinglePage() {
  const params = useParams();
  const blogId = params.id;

  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentBlogs, setRecentBlogs] = useState([]);

  useEffect(() => {
    const fetchBlog = async () => {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('id', blogId)
        .single();

      if (error) {
        console.error('Error fetching blog:', error);
      } else {
        setBlog(data);
      }
      setLoading(false);
    };

    const fetchRecentBlogs = async () => {
      const { data } = await supabase
        .from('blogs')
        .select('id, title, date, image')
        .order('created_at', { ascending: false })
        .limit(3);

      setRecentBlogs(data || []);
    };

    if (blogId) {
      fetchBlog();
      fetchRecentBlogs();
    }
  }, [blogId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white font-sans text-gray-800">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <p className="text-center text-gray-500">Loading article...</p>
        </main>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-white font-sans text-gray-800">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <p className="text-center text-gray-500">Article not found.</p>
        </main>
      </div>
    );
  }

  const content = Array.isArray(blog.content) ? blog.content : [];
  const tags = Array.isArray(blog.tags) ? blog.tags : [];
  const comments = Array.isArray(blog.comments) ? blog.comments : [];

  const extractTextFromBlock = (block) => {
    if (!block) return '';
    if (typeof block === 'string') return block;
    if (typeof block.text === 'string') return block.text;
    if (Array.isArray(block.content)) {
      return block.content.map(extractTextFromBlock).join('');
    }
    return '';
  };

  const renderContent = () => {
    if (content.length === 0) return <p className="mb-6 leading-relaxed">No content available.</p>;

    const firstItem = content[0];
    if (typeof firstItem === 'string') {
      return content.map((paragraph, index) => (
        <p key={index} className="mb-6 leading-relaxed">{paragraph}</p>
      ));
    }

    if (typeof firstItem === 'object' && firstItem !== null) {
      return content.map((block, index) => {
        const text = extractTextFromBlock(block);
        if (!text) return null;
        const Tag = block.type === 'heading' ? 'h2' : 'p';
        return <Tag key={index} className={`mb-6 leading-relaxed ${block.type === 'heading' ? 'text-2xl font-bold' : ''}`}>{text}</Tag>;
      });
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-800">
      
      {/* --- HEADER --- */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <NextLink href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center text-white font-bold">M</div>
            <span className="text-xl font-bold tracking-tight text-gray-900">EduPress</span>
          </NextLink>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <NextLink href="/" className="hover:text-orange-500 transition">Home</NextLink>
            <NextLink href="/courses" className="hover:text-orange-500 transition">Courses</NextLink>
            <NextLink href="/blog" className="text-orange-500">Blog</NextLink>
            <div className="relative group cursor-pointer flex items-center gap-1 hover:text-orange-500 transition">
              Page
              <ChevronDown className="w-3 h-3" />
            </div>
            <a href="#" className="hover:text-orange-500 transition">LearnPress Add-On</a>
            <a href="#" className="hover:text-orange-500 transition">Premium Theme</a>
          </nav>

          <div className="flex items-center gap-4">
            <span className="hidden lg:block text-sm font-medium text-gray-600">Login / Register</span>
            <button className="w-8 h-8 rounded-full border border-orange-500 flex items-center justify-center text-orange-500 hover:bg-orange-50 transition">
              <Search className="w-4 h-4" />
            </button>
            <button className="md:hidden text-gray-600">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* --- BREADCRUMB --- */}
      <div className="bg-gray-50 py-3 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-xs text-gray-500 flex items-center gap-2">
          <span>Homepage</span>
          <span>&gt;</span>
          <span>Blog</span>
          <span>&gt;</span>
          <span className="text-gray-800 truncate max-w-[200px]">{blog.title}</span>
        </div>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* LEFT COLUMN: ARTICLE CONTENT */}
          <div className="lg:col-span-8">
            
            {/* Article Header */}
            <div className="mb-8">
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                {blog.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-orange-500" />
                  <span>{blog.author}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-orange-500" />
                  <span>{blog.date}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-orange-500" />
                  <span>{blog.comments_count} Comments</span>
                </div>
              </div>
            </div>

            {/* Featured Image */}
            <div className="mb-8 rounded-xl overflow-hidden bg-gray-100">
              <img 
                src={blog.image} 
                alt={blog.title} 
                className="w-full h-auto object-cover"
              />
            </div>

            {/* Article Body */}
            <div className="prose prose-lg max-w-none text-gray-600 mb-8">
              {renderContent()}
            </div>

            {/* Tags & Share */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 py-6 border-t border-b border-gray-100 mb-10">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-bold text-gray-900 mr-2">Tags:</span>
                {tags.map((tag, i) => (
                  <a key={i} href="#" className="px-3 py-1 border border-gray-200 rounded text-xs text-gray-600 hover:border-orange-500 hover:text-orange-500 transition">
                    {tag}
                  </a>
                ))}
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-gray-900 mr-2">Share:</span>
                {[GlobeIcon, Share, Share2, GlobeIcon, Share].map((Icon, i) => (
                  <a key={i} href="#" className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-orange-500 hover:text-white transition">
                    <Icon className="w-3.5 h-3.5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Post Navigation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
              <NextLink href={`/blog/${Math.max(1, blogId - 1)}`} className="flex items-center gap-4 p-6 border border-gray-200 rounded-lg hover:border-orange-500 hover:shadow-md transition group">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-orange-500 group-hover:text-white transition">
                  <CornerUpLeft className="w-5 h-5 rotate-180" />
                </div>
                <div>
                  <span className="block text-xs text-gray-500 mb-1">Prev Articles</span>
                  <h3 className="font-bold text-gray-900 text-sm line-clamp-2 group-hover:text-orange-500 transition">
                    {blog.title}
                  </h3>
                </div>
              </NextLink>

              <NextLink href={`/blog/${blogId + 1}`} className="flex items-center gap-4 p-6 border border-gray-200 rounded-lg hover:border-orange-500 hover:shadow-md transition group flex-row-reverse text-right">
                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-orange-500 group-hover:text-white transition">
                  <CornerUpLeft className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-xs text-gray-500 mb-1">Next Articles</span>
                  <h3 className="font-bold text-gray-900 text-sm line-clamp-2 group-hover:text-orange-500 transition">
                    {blog.title}
                  </h3>
                </div>
              </NextLink>
            </div>

            {/* Comments Section */}
            <div className="mb-12">
              <h3 className="text-xl font-bold text-gray-900 mb-1">Comments</h3>
              <p className="text-sm text-gray-500 mb-8">{comments.length} Comments</p>

              <div className="space-y-8">
                {comments.map((comment) => (
                  <div key={comment.id}>
                    {/* Main Comment */}
                    <div className="flex gap-4">
                      <img src={comment.avatar} alt={comment.user} className="w-12 h-12 rounded-full object-cover shrink-0" />
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-bold text-sm text-gray-900">{comment.user}</h4>
                          <span className="text-xs text-gray-400">{comment.date}</span>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed mb-3">
                          {comment.text}
                        </p>
                        <button className="text-xs font-bold text-orange-500 flex items-center gap-1 hover:text-orange-600">
                          <CornerUpLeft className="w-3 h-3" /> Reply
                        </button>
                      </div>
                    </div>

                    {/* Nested Replies */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="mt-6 ml-8 sm:ml-16 space-y-6 border-l-2 border-gray-100 pl-6">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="flex gap-4">
                            <img src={reply.avatar} alt={reply.user} className="w-10 h-10 rounded-full object-cover shrink-0" />
                            <div className="flex-1">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-sm text-gray-900">{reply.user}</h4>
                                <span className="text-xs text-gray-400">{reply.date}</span>
                              </div>
                              <p className="text-sm text-gray-600 leading-relaxed mb-3">
                                {reply.text}
                              </p>
                              <button className="text-xs font-bold text-orange-500 flex items-center gap-1 hover:text-orange-600">
                                <CornerUpLeft className="w-3 h-3" /> Reply
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Pagination for Comments */}
              <div className="mt-10 flex justify-center items-center gap-2">
                <button className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:border-orange-500 hover:text-orange-500 transition">
                  <ChevronDown className="w-4 h-4 rotate-90" />
                </button>
                {[1, 2, 3].map((page) => (
                  <button 
                    key={page}
                    className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium transition ${
                      page === 1 ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:border-orange-500 hover:text-orange-500 transition">
                  <ChevronDown className="w-4 h-4 -rotate-90" />
                </button>
              </div>
            </div>

            {/* Leave A Comment Form */}
            <div className="bg-gray-50 p-8 rounded-xl">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Leave A Comment</h3>
              <p className="text-xs text-gray-500 mb-6">Your email address will not be published. Required fields are marked *</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input type="text" placeholder="Name*" className="w-full border border-gray-300 rounded px-4 py-3 text-sm focus:outline-none focus:border-orange-500 transition bg-white" />
                <input type="email" placeholder="Email*" className="w-full border border-gray-300 rounded px-4 py-3 text-sm focus:outline-none focus:border-orange-500 transition bg-white" />
              </div>
              <textarea rows="5" placeholder="Comment" className="w-full border border-gray-300 rounded px-4 py-3 text-sm focus:outline-none focus:border-orange-500 transition mb-4 bg-white"></textarea>
              
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
                  <input type="checkbox" className="rounded text-orange-500 focus:ring-orange-500" />
                  Save my name, email in this browser for the next time I comment
                </label>
                <button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full text-sm font-bold transition shadow-md shadow-orange-200">
                  Posts Comment
                </button>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: SIDEBAR WIDGETS */}
          <aside className="lg:col-span-4 space-y-10">
            
            {/* Category Widget */}
            <div>
              <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide border-b border-gray-100 pb-2">Category</h3>
              <ul className="space-y-3 text-sm text-gray-600">
                {["Commercial", "Office", "Shop", "Educate", "Academy", "Single family home"].map((cat, i) => (
                  <li key={i} className="flex justify-between items-center group cursor-pointer hover:text-orange-500 transition">
                    <span>{cat}</span>
                    <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded group-hover:bg-orange-50 group-hover:text-orange-500 transition">15</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recent Posts Widget */}
            <div>
              <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide border-b border-gray-100 pb-2">Recent Posts</h3>
              <div className="space-y-4">
                {recentBlogs.slice(0, 3).map((post) => (
                  <NextLink key={post.id} href={`/blog/${post.id}`} className="flex gap-3 group cursor-pointer">
                    <div className="w-16 h-16 shrink-0 rounded overflow-hidden">
                      <img src={post.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition duration-300" />
                    </div>
                    <div className="flex flex-col justify-center">
                      <h4 className="text-xs font-bold text-gray-800 line-clamp-2 group-hover:text-orange-500 transition leading-snug mb-1">
                        {post.title}
                      </h4>
                      <span className="text-[10px] text-gray-400">{post.date}</span>
                    </div>
                  </NextLink>
                ))}
              </div>
            </div>

            {/* Tags Widget */}
            <div>
              <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide border-b border-gray-100 pb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {["Free courses", "Marketing", "Idea", "LMS", "LearnPress", "Instructor"].map((tag, i) => (
                  <a 
                    key={i} 
                    href="#" 
                    className="px-3 py-1.5 border border-gray-200 rounded text-xs text-gray-600 hover:border-orange-500 hover:text-orange-500 hover:bg-orange-50 transition"
                  >
                    {tag}
                  </a>
                ))}
              </div>
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
}
