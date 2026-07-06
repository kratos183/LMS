'use client';
import React from 'react';
import { Phone, Mail, ArrowUp, Globe, Send, Camera, Link2, Video } from 'lucide-react';
import Navbar from '../component/navbar';

const ContactPage = () => {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-800 flex flex-col">
      <Navbar />

      {/* BREADCRUMB */}
      <div className="bg-gray-50 py-3 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-xs text-gray-500 flex items-center gap-2">
          <span>Homepage</span> <span>&gt;</span> <span className="text-gray-800">Contact</span>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="flex-grow py-16 px-4">
        <div className="max-w-7xl mx-auto">
          
          {/* Top Section: Info & Map */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            
            {/* Left: Contact Info */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Need A Direct Line?</h1>
              <p className="text-gray-500 mb-8 leading-relaxed">
                Cras massa et odio donec faucibus in. Vitae pretium massa dolor ullamcorper lectus elit quam.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center text-orange-500 shrink-0">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Phone</h3>
                    <p className="text-gray-600">(123) 456 7890</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center text-orange-500 shrink-0">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Email</h3>
                    <p className="text-gray-600">contact@thimpress.com</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Map Placeholder */}
            <div className="h-[400px] bg-gray-200 rounded-xl overflow-hidden relative">
               {/* Using an iframe placeholder for the map look */}
               <iframe 
                 src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.1422937950147!2d-73.98731968482413!3d40.75889497932681!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c25855c6480299%3A0x55194ec5a1ae072e!2sTimes+Square!5e0!3m2!1sen!2sus!4v1560412335448!5m2!1sen!2sus" 
                 width="100%" 
                 height="100%" 
                 style={{border:0}} 
                 allowFullScreen="" 
                 loading="lazy"
                 title="Map"
               ></iframe>
            </div>
          </div>

          {/* Bottom Section: Contact Form */}
          <div className="max-w-4xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Contact Us</h2>
            <p className="text-sm text-gray-500 mb-6">Your email address will not be published. Required fields are marked *</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input type="text" placeholder="Name*" className="w-full border border-gray-300 rounded px-4 py-3 text-sm focus:outline-none focus:border-orange-500 transition" />
              <input type="email" placeholder="Email*" className="w-full border border-gray-300 rounded px-4 py-3 text-sm focus:outline-none focus:border-orange-500 transition" />
            </div>
            <textarea rows="5" placeholder="Comment" className="w-full border border-gray-300 rounded px-4 py-3 text-sm focus:outline-none focus:border-orange-500 transition mb-4"></textarea>
            
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

export default ContactPage;