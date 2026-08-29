"use client";

import React from 'react';
import Navbar from "./component/navbar";

export default function Home() {
  const categories = [
    { name: "Art & Design", courses: "38 Courses", icon: "🎨" },
    { name: "Development", courses: "38 Courses", icon: "💻", featured: true },
    { name: "Communication", courses: "38 Courses", icon: "📢" },
    { name: "Videography", courses: "38 Courses", icon: "🎥" },
    { name: "Photography", courses: "38 Courses", icon: "📷" },
    { name: "Marketing", courses: "38 Courses", icon: "📈" },
    { name: "Content Writing", courses: "38 Courses", icon: "✍️" },
    { name: "Finance", courses: "38 Courses", icon: "💰" },
    { name: "Science", courses: "38 Courses", icon: "🔬" },
    { name: "Network", courses: "38 Courses", icon: "🌐" },
  ];

  const courses = [
    {
      category: "Photography",
      title: "Create An LMS Website With LearnPress",
      instructor: "Determined Poitras",
      duration: "2 Weeks",
      students: "156 Students",
      price: "Free",
      originalPrice: "$29.0",
      image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=250&fit=crop",
      featured: false,
    },
    {
      category: "Photography",
      title: "Design A Website With ThimPress",
      instructor: "Determined Poitras",
      duration: "2 Weeks",
      students: "156 Students",
      price: "$49.0",
      originalPrice: "$89.0",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop",
      featured: true,
    },
    {
      category: "Photography",
      title: "Create An LMS Website With LearnPress",
      instructor: "Determined Poitras",
      duration: "2 Weeks",
      students: "156 Students",
      price: "Free",
      originalPrice: "$29.0",
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=250&fit=crop",
      featured: false,
    },
    {
      category: "Photography",
      title: "Create An LMS Website With LearnPress",
      instructor: "Determined Poitras",
      duration: "2 Weeks",
      students: "156 Students",
      price: "Free",
      originalPrice: "$29.0",
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&h=250&fit=crop",
      featured: false,
    },
    {
      category: "Photography",
      title: "Create An LMS Website With LearnPress",
      instructor: "Determined Poitras",
      duration: "2 Weeks",
      students: "156 Students",
      price: "Free",
      originalPrice: "$29.0",
      image: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&h=250&fit=crop",
      featured: false,
    },
    {
      category: "Photography",
      title: "Create An LMS Website With LearnPress",
      instructor: "Determined Poitras",
      duration: "2 Weeks",
      students: "156 Students",
      price: "Free",
      originalPrice: "$29.0",
      image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&h=250&fit=crop",
      featured: false,
    },
  ];

  const testimonials = [
    {
      text: "I must explain to you how all this mistaken . Tdea of denouncing pleasure and praising pain was born and I will give you a complete account of the system and expound",
      name: "Roe Smith",
      role: "Designer",
    },
    {
      text: "I must explain to you how all this mistaken . Tdea of denouncing pleasure and praising pain was born and I will give you a complete account of the system and expound",
      name: "Roe Smith",
      role: "Designer",
    },
    {
      text: "I must explain to you how all this mistaken . Tdea of denouncing pleasure and praising pain was born and I will give you a complete account of the system and expound",
      name: "Roe Smith",
      role: "Designer",
    },
    {
      text: "I must explain to you how all this mistaken . Tdea of denouncing pleasure and praising pain was born and I will give you a complete account of the system and expound",
      name: "Roe Smith",
      role: "Designer",
    },
  ];

  const articles = [
    {
      title: "Best LearnPress WordPress Theme Collection For 2023",
      date: "Jan 24, 20203",
      excerpt: "Looking for an amazing & well-functional LearnPress WordPress Theme?...",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop",
    },
    {
      title: "Best LearnPress WordPress Theme Collection For 2023",
      date: "Jan 24, 20203",
      excerpt: "Looking for an amazing & well-functional LearnPress WordPress Theme?...",
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=250&fit=crop",
    },
    {
      title: "Best LearnPress WordPress Theme Collection For 2023",
      date: "Jan 24, 20203",
      excerpt: "Looking for an amazing & well-functional LearnPress WordPress Theme?...",
      image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&h=250&fit=crop",
    },
  ];

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-100 via-yellow-50 to-green-100 opacity-60"></div>
        <div className="absolute inset-0" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%239C92AC\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'}}></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-6">
                Build Skills With<br />Online Course
              </h1>
              <p className="text-gray-600 mb-8 max-w-md">
                We denounce with righteous indignation and dislike men who are so beguiled and demoralized that cannot trouble.
              </p>
              <button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full font-medium transition">
                Posts Comment
              </button>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&h=700&fit=crop" 
                alt="Student" 
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -z-10 top-10 -right-10 w-full h-full bg-gradient-to-br from-orange-200 to-green-200 rounded-2xl opacity-50"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Top Categories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Top Categories</h2>
              <p className="text-gray-500">Explore our Popular Categories</p>
            </div>
            <button className="hidden sm:block border-2 border-gray-300 text-gray-700 px-6 py-2 rounded-full hover:border-orange-500 hover:text-orange-500 transition">
              All Categories
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {categories.map((cat, index) => (
              <div key={index} className={`group p-6 rounded-2xl border border-gray-100 hover:shadow-xl transition cursor-pointer text-center ${cat.featured ? 'bg-orange-50 border-orange-200 shadow-lg' : 'bg-white hover:border-orange-200'}`}>
                <div className="text-4xl mb-3">{cat.icon}</div>
                <h3 className={`font-semibold mb-1 ${cat.featured ? 'text-orange-600' : 'text-gray-900'}`}>{cat.name}</h3>
                <p className="text-sm text-gray-500">{cat.courses}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Featured Courses</h2>
              <p className="text-gray-500">Explore our Popular Courses</p>
            </div>
            <button className="hidden sm:block border-2 border-gray-300 text-gray-700 px-6 py-2 rounded-full hover:border-orange-500 hover:text-orange-500 transition">
              All Courses
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course, index) => (
              <div key={index} className={`bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition group ${course.featured ? 'ring-2 ring-orange-500' : ''}`}>
                <div className="relative overflow-hidden">
                  <img src={course.image} alt={course.title} className="w-full h-48 object-cover group-hover:scale-105 transition duration-300" />
                  <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-white text-xs px-3 py-1 rounded-full">
                    {course.category}
                  </div>
                  {course.featured && (
                    <div className="absolute top-4 right-4 bg-orange-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold">
                      9T
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <p className="text-sm text-gray-500 mb-2">by {course.instructor}</p>
                  <h3 className="font-bold text-gray-900 mb-4 line-clamp-2">{course.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {course.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                      {course.students}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400 line-through text-sm">{course.originalPrice}</span>
                      <span className={`font-bold ${course.price === 'Free' ? 'text-green-500' : 'text-orange-500'}`}>{course.price}</span>
                    </div>
                    <button className="text-orange-500 font-medium text-sm hover:underline">View More</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LearnPress Add-Ons Banner */}
      <section className="py-16 bg-gradient-to-r from-green-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-green-100 to-orange-100 rounded-3xl p-8 lg:p-12 relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative z-10">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">GET MORE POWER FROM</p>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">LearnPress Add-Ons</h2>
                <p className="text-gray-600 mb-6">The next level of LearnPress - LMS WordPress Plugin. More Powerful, Flexible and Magical Inside.</p>
                <button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full font-medium transition">
                  Explorer Course
                </button>
              </div>
              <div className="flex justify-center lg:justify-end">
                <div className="grid grid-cols-3 gap-4">
                  {["💎", "🏆", "💳", "🎓", "🚀", "💡"].map((icon, i) => (
                    <div key={i} className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center text-3xl transform hover:scale-110 transition">
                      {icon}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Decorative circles */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-orange-300 rounded-full opacity-20"></div>
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-green-300 rounded-full opacity-20"></div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { number: "25K+", label: "Active Students" },
              { number: "899", label: "Total Courses" },
              { number: "158", label: "Instructor" },
              { number: "100%", label: "Satisfaction Rate" },
            ].map((stat, index) => (
              <div key={index} className="bg-gray-50 rounded-2xl p-8 text-center hover:shadow-lg transition">
                <div className="text-3xl font-bold text-orange-500 mb-2">{stat.number}</div>
                <div className="text-gray-600 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Grow Your Skill Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop" 
                alt="Learning" 
                className="rounded-2xl"
              />
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Grow Us Your Skill<br />With LearnPress LMS</h2>
              <p className="text-gray-600 mb-6">We denounce with righteous indignation and dislike men who are so beguiled and demoralized that cannot trouble.</p>
              <ul className="space-y-3 mb-8">
                {["Certification", "Certification", "Certification", "Certification"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-700">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    {item}
                  </li>
                ))}
              </ul>
              <button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full font-medium transition">
                Explorer Course
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Education WordPress Theme Banner */}
      <section className="py-16 bg-gradient-to-r from-purple-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-purple-100 to-orange-100 rounded-3xl p-8 lg:p-12 relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative z-10">
              <div className="text-center lg:text-left">
                <p className="text-sm font-medium text-gray-600 mb-2">PROVIDING AMAZING</p>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Education Wordpress Theme</h2>
                <p className="text-gray-600 mb-6">The next level of LMS WordPress Theme. Learn anytime and anywhere.</p>
                <button className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full font-medium transition">
                  Explorer Course
                </button>
              </div>
              <div className="flex justify-center">
                <img 
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop" 
                  alt="Theme Preview" 
                  className="rounded-2xl shadow-xl transform rotate-3 hover:rotate-0 transition duration-300"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Student Feedbacks */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Student Feedbacks</h2>
            <p className="text-gray-500">What Students Say About Academy LMS</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-xl transition">
                <div className="text-orange-300 text-4xl mb-4">"</div>
                <p className="text-gray-600 text-sm mb-6 leading-relaxed">{testimonial.text}</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="text-orange-600 font-bold text-sm">{testimonial.name.charAt(0)}</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">{testimonial.name}</h4>
                    <p className="text-gray-500 text-xs">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-3xl p-8 lg:p-12">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Let&apos;s Start With Academy LMS</h3>
              </div>
              <div className="flex gap-4">
                <button className="border-2 border-orange-500 text-orange-500 px-6 py-2 rounded-full hover:bg-orange-500 hover:text-white transition">
                  I&apos;m A Student
                </button>
                <button className="bg-orange-500 text-white px-6 py-2 rounded-full hover:bg-orange-600 transition">
                  Become An Instructor
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Articles */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Latest Articles</h2>
              <p className="text-gray-500">Explore our Free Articles</p>
            </div>
            <button className="hidden sm:block border-2 border-gray-300 text-gray-700 px-6 py-2 rounded-full hover:border-orange-500 hover:text-orange-500 transition">
              All Articles
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article, index) => (
              <div key={index} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition group">
                <div className="overflow-hidden">
                  <img src={article.image} alt={article.title} className="w-full h-48 object-cover group-hover:scale-105 transition duration-300" />
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-gray-900 mb-3 line-clamp-2">{article.title}</h3>
                  <p className="text-sm text-gray-500 mb-3">{article.date}</p>
                  <p className="text-gray-600 text-sm line-clamp-2">{article.excerpt}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center text-white font-bold text-lg">M</div>
                <span className="text-2xl font-bold text-gray-900">EduPress</span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-4">GET HELP</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#" className="hover:text-orange-500 transition">Contact Us</a></li>
                <li><a href="#" className="hover:text-orange-500 transition">Latest Articles</a></li>
                <li><a href="#" className="hover:text-orange-500 transition">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-4">PROGRAMS</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#" className="hover:text-orange-500 transition">Art & Design</a></li>
                <li><a href="#" className="text-orange-500">Business</a></li>
                <li><a href="#" className="hover:text-orange-500 transition">IT & Software</a></li>
                <li><a href="#" className="hover:text-orange-500 transition">Languages</a></li>
                <li><a href="#" className="hover:text-orange-500 transition">Programming</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-4">CONTACT US</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li>Address: 2321 New Design Str, Lorem Ipsum10<br />Hudson Yards, USA</li>
                <li>Tel: + (123) 2500-567-8988</li>
                <li>Mail: supportfm@gmail.com</li>
                <li className="flex gap-3 mt-4">
                  {["f", "P", "X", "in", "Y"].map((social, i) => (
                    <a key={i} href="#" className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:bg-orange-500 hover:text-white transition text-xs">
                      {social}
                    </a>
                  ))}
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">Copyright © 2024 LearnPress LMS | Powered by ThimPress</p>
            <button className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center text-white hover:bg-orange-500 transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
