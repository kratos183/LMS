'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, Calendar, ArrowRight, 
  ArrowUp, LayoutGrid, List
} from 'lucide-react';
import NextLink from 'next/link';
import Navbar from '../component/navbar';
import { supabase } from '@/lib/supabase';
import { BlogPost } from '@/types';

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

export default function BlogListingPage() {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [currentPage, setCurrentPage] = useState(1);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const blogsPerPage = 6;

  useEffect(() => {
    const fetchBlogs = async () => {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching blogs:', error);
      } else {
        setBlogs(data || []);
      }
      setLoading(false);
    };

    fetchBlogs();
  }, []);

  const filteredBlogs = blogs.filter((blog) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      blog.title?.toLowerCase().includes(q) ||
      blog.author?.toLowerCase().includes(q) ||
      blog.category?.toLowerCase().includes(q) ||
      blog.excerpt?.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filteredBlogs.length / blogsPerPage);
  const startIndex = (currentPage - 1) * blogsPerPage;
  const paginatedBlogs = filteredBlogs.slice(startIndex, startIndex + blogsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white font-sans text-gray-800">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <p className="text-center text-gray-500">Loading articles...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans text-gray-800">
      
      <Navbar />

      {/* --- BREADCRUMB --- */}
      <div className="bg-gray-50 py-3 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-xs text-gray-500 flex items-center gap-2">
          <span>Homepage</span>
          <span>&gt;</span>
          <span className="text-gray-800">Blog</span>
        </div>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* LEFT COLUMN: BLOG POSTS */}
          <div className="lg:col-span-8">
            
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <h1 className="text-2xl font-bold text-gray-900">All Articles</h1>
              
              <div className="flex items-center gap-4 w-full sm:w-auto">
                {/* Search Bar */}
                <div className="relative flex-1 sm:flex-none">
                  <input 
                    type="text" 
                    placeholder="Search..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full sm:w-48 pl-4 pr-10 py-2 border-b border-gray-300 focus:border-orange-500 outline-none text-sm bg-transparent transition-colors"
                  />
                  <button className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500">
                    <Search className="w-4 h-4" />
                  </button>
                </div>

                {/* View Toggle Buttons */}
                <div className="flex border border-gray-200 rounded-md overflow-hidden shrink-0">
                  <button 
                    onClick={() => setViewMode('list')}
                    className={`p-2 transition ${viewMode === 'list' ? 'bg-orange-500 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                    title="List View"
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setViewMode('grid')}
                    className={`p-2 transition border-l border-gray-200 ${viewMode === 'grid' ? 'bg-orange-500 text-white' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                    title="Grid View"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {blogs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No articles available yet.</p>
              </div>
            ) : filteredBlogs.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No articles match your search.</p>
              </div>
            ) : (
              <>
                {/* Posts Container */}
                <div className={`
                  ${viewMode === 'list' 
                    ? 'flex flex-col gap-6' 
                    : 'grid grid-cols-1 sm:grid-cols-2 gap-6'}
                `}>
                  {paginatedBlogs.map((post) => (
                    <article 
                      key={post.id} 
                      className={`
                        bg-white border border-gray-100 rounded-lg overflow-hidden hover:shadow-lg transition duration-300 group flex
                        ${viewMode === 'list' ? 'flex-row' : 'flex-col'}
                      `}
                    >
                      {/* Image Section */}
                      <div className={`relative overflow-hidden shrink-0 ${viewMode === 'list' ? 'w-1/3 min-w-[200px]' : 'w-full h-48'}`}>
                        <img 
                          src={post.image} 
                          alt={post.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                        />
                      </div>

                      {/* Content Section */}
                      <div className={`p-6 flex flex-col justify-center ${viewMode === 'list' ? 'w-2/3' : 'flex-1'}`}>
                        <h2 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-orange-500 transition">
                          {post.title}
                        </h2>
                        
                        <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                          <Calendar className="w-3.5 h-3.5 text-orange-500" />
                          <span>{post.date}</span>
                        </div>

                        <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed">
                          {post.excerpt}
                        </p>

                        <NextLink href={`/blog/${post.id}`} className="text-orange-500 text-sm font-semibold flex items-center gap-1 group/btn self-start">
                          Read More 
                          <ArrowRight className="w-3.5 h-3.5 transform group-hover/btn:translate-x-1 transition" />
                        </NextLink>
                      </div>
                    </article>
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
                      <ArrowRight className="w-4 h-4 rotate-180" />
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
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            )}
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
                {blogs.slice(0, 3).map((post) => (
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
