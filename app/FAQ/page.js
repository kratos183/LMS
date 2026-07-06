'use client';
import React, { useState } from 'react';
import { ChevronDown, ArrowUp, Globe, Send, Camera, Link2, Video } from 'lucide-react';
import Navbar from '../component/navbar';

const FaqsPage = () => {
  // State to track which FAQ item is open
  const [openIndex, setOpenIndex] = useState(1); // Defaulting to the second one as per screenshot

  const faqData = [
    { q: "What Does Royalty Free Mean?", a: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras facilisis faucibus odio arcu duis dui, adipiscing facilisis. Urna, donec turpis egestas volutpat. Quisque nec non amet quis. Varius tellus justo odio parturient mauris curabitur lorem in." },
    { q: "What Does Royalty Free Mean?", a: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras facilisis faucibus odio arcu duis dui, adipiscing facilisis. Urna, donec turpis egestas volutpat. Quisque nec non amet quis. Varius tellus justo odio parturient mauris curabitur lorem in." },
    { q: "What Does Royalty Free Mean?", a: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras facilisis faucibus odio arcu duis dui, adipiscing facilisis. Urna, donec turpis egestas volutpat. Quisque nec non amet quis. Varius tellus justo odio parturient mauris curabitur lorem in." },
    { q: "What Does Royalty Free Mean?", a: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras facilisis faucibus odio arcu duis dui, adipiscing facilisis. Urna, donec turpis egestas volutpat. Quisque nec non amet quis. Varius tellus justo odio parturient mauris curabitur lorem in." },
    { q: "What Does Royalty Free Mean?", a: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras facilisis faucibus odio arcu duis dui, adipiscing facilisis. Urna, donec turpis egestas volutpat. Quisque nec non amet quis. Varius tellus justo odio parturient mauris curabitur lorem in." },
    { q: "What Does Royalty Free Mean?", a: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras facilisis faucibus odio arcu duis dui, adipiscing facilisis. Urna, donec turpis egestas volutpat. Quisque nec non amet quis. Varius tellus justo odio parturient mauris curabitur lorem in." },
    { q: "What Does Royalty Free Mean?", a: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras facilisis faucibus odio arcu duis dui, adipiscing facilisis. Urna, donec turpis egestas volutpat. Quisque nec non amet quis. Varius tellus justo odio parturient mauris curabitur lorem in." },
    { q: "What Does Royalty Free Mean?", a: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras facilisis faucibus odio arcu duis dui, adipiscing facilisis. Urna, donec turpis egestas volutpat. Quisque nec non amet quis. Varius tellus justo odio parturient mauris curabit......" }
  ];

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
      <main className="flex-grow py-16 px-4">
        <div className="max-w-7xl mx-auto">
          
          <h1 className="text-3xl font-bold text-gray-900 mb-10">FAQs</h1>

          {/* Two Column Grid for FAQs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            {faqData.map((item, index) => (
              <div 
                key={index} 
                className={`border rounded-lg overflow-hidden transition-all duration-300 ${openIndex === index ? 'bg-gray-50 border-gray-200 shadow-sm' : 'bg-white border-gray-100 hover:border-gray-200'}`}
              >
                <button 
                  onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className={`font-medium text-sm ${openIndex === index ? 'text-orange-500' : 'text-gray-800'}`}>
                    {item.q}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`} />
                </button>
                
                {openIndex === index && (
                  <div className="px-5 pb-5 text-sm text-gray-600 leading-relaxed animate-fadeIn">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Illustration Placeholder */}
          <div className="flex justify-center">
             <div className="w-full max-w-2xl aspect-[2/1] bg-blue-50 rounded-xl flex items-center justify-center relative overflow-hidden">
                <div className="text-center z-10">
                   <div className="text-6xl mb-2">🤔</div>
                   <p className="text-blue-400 font-bold">Still have questions?</p>
                </div>
                {/* Decorative elements */}
                <div className="absolute bottom-0 left-10 w-20 h-20 bg-purple-200 rounded-full opacity-50"></div>
                <div className="absolute top-10 right-20 w-16 h-16 bg-yellow-200 rounded-full opacity-50"></div>
             </div>
          </div>

        </div>
      </main>

      {/* FOOTER (Same as others) */}
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

export default FaqsPage;