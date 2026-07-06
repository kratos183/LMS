'use client';
import React from 'react';
import { ArrowUp, Globe, Send, Camera, Link2, Video } from 'lucide-react';
import Navbar from '../component/navbar';

const ErrorPage = () => {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-800 flex flex-col">
      <Navbar />

      {/* BREADCRUMB */}
      <div className="bg-gray-50 py-3 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-xs text-gray-500 flex items-center gap-2">
          <span>Homepage</span> <span>&gt;</span> <span className="text-gray-800">FAQs</span>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="flex-grow flex flex-col items-center justify-center py-20 px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-12 self-start max-w-7xl w-full">Error</h1>
        
        {/* Illustration Placeholder */}
        <div className="w-full max-w-3xl aspect-video bg-blue-50 rounded-2xl flex items-center justify-center relative overflow-hidden mb-12">
           {/* Abstract shapes mimicking the screenshot */}
           <div className="absolute top-10 left-10 w-20 h-10 bg-blue-100 rounded-full opacity-50"></div>
           <div className="absolute bottom-20 right-20 w-32 h-32 bg-blue-100 rounded-full opacity-50"></div>
           
           <div className="text-center z-10">
             <div className="text-9xl font-bold text-green-400 mb-4">?</div>
             <p className="text-gray-500 font-medium">Page Not Found</p>
           </div>
           
           {/* Character Placeholder */}
           <div className="absolute bottom-0 right-1/4 w-32 h-40 bg-blue-600 rounded-t-full opacity-80"></div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-gray-50 border-t border-gray-200 pt-16 pb-8">
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
                  {[Globe, Send, Camera, Link2, Video].map((Icon, i) => (
                    <a key={i} href="#" className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:bg-orange-500 hover:text-white transition text-xs font-bold"><Icon className="w-3.5 h-3.5" /></a>
                  ))}
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-400">Copyright © 2024 LearnPress LMS | Powered by ThimPress</p>
            <button className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white hover:bg-orange-500 transition shadow-lg"><ArrowUp className="w-5 h-5" /></button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ErrorPage;