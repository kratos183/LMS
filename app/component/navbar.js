'use client';

import { useState, useEffect } from 'react';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, Menu, Search, User } from 'lucide-react';

const Link = ({ href, className, children, ...props }) => (
  <NextLink href={href} className={className} {...props}>
    {children}
  </NextLink>
);

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pageMenuOpen, setPageMenuOpen] = useState(false);
  // null = still loading, '' = not logged in, 'student'|'instructor'|'admin' = logged in
  const [userRole, setUserRole] = useState(null);
  const pathname = usePathname();

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => setUserRole(data.role || ''))
      .catch(() => setUserRole(''));
  }, [pathname]); // re-check on every route change

  const isLoggedIn = !!userRole;

  const getDashboardHref = () => {
    if (userRole === 'instructor') return '/Instructor-Dashboard';
    if (userRole === 'admin') return '/Admin-Dashboard';
    if (userRole) return '/Student-Dashboard';
    return '/login-page';
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/';
  };

  const isActive = (href) => {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const activeClass = 'text-orange-500 border-b-2 border-orange-500 px-1 pt-1 text-sm font-medium';
  const inactiveClass = 'text-gray-500 hover:text-gray-900 px-1 pt-1 text-sm font-medium';

  return (
    <>
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">

            {/* Logo + nav links */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center text-white font-bold text-lg">M</div>
                <span className="text-2xl font-bold text-gray-900">EduPress</span>
              </Link>
              <div className="hidden md:ml-10 md:flex md:space-x-8">
                <Link href="/" className={isActive('/') ? activeClass : inactiveClass}>Home</Link>
                <Link href="/courses" className={isActive('/courses') ? activeClass : inactiveClass}>Courses</Link>
                <Link href="/blog" className={isActive('/blog') ? activeClass : inactiveClass}>Blog</Link>

                <div className="relative">
                  <button
                    onClick={() => setPageMenuOpen(!pageMenuOpen)}
                    className="text-gray-500 hover:text-gray-900 px-1 pt-1 text-sm font-medium flex items-center gap-1"
                  >
                    Page
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  {pageMenuOpen && (
                    <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5">
                      <Link href="/contactPage" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Contact</Link>
                      <Link href="/FAQ" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">FAQ</Link>
                      <Link href="/error" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Error Page</Link>
                      <Link href="/login-page" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Login / Register</Link>
                      <Link href="/courses/1" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Template</Link>
                    </div>
                  )}
                </div>

                <Link href="#" className="text-gray-500 hover:text-gray-900 px-1 pt-1 text-sm font-medium">LearnPress Add-On</Link>
                <Link href="#" className="text-gray-500 hover:text-gray-900 px-1 pt-1 text-sm font-medium">Premium Theme</Link>
              </div>
            </div>

            {/* Desktop: right-side auth actions */}
            <div className="hidden md:flex items-center gap-4">
              {/* Only render once role is known (avoids flash) */}
              {userRole !== null && (
                <>
                  {!isLoggedIn ? (
                    <Link
                      href="/login-page"
                      className={isActive('/login-page') ? 'text-orange-500 text-sm font-medium' : 'text-gray-500 text-sm hover:text-gray-900'}
                    >
                      Login / Register
                    </Link>
                  ) : (
                    <>
                      <Link
                        href={getDashboardHref()}
                        className="w-8 h-8 rounded-full border-2 border-orange-500 flex items-center justify-center text-orange-500 hover:bg-orange-50 transition"
                        title="My Dashboard"
                      >
                        <User className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="text-gray-500 hover:text-red-600 text-sm font-medium transition"
                      >
                        Logout
                      </button>
                    </>
                  )}
                </>
              )}
              <button className="w-8 h-8 rounded-full border border-orange-500 flex items-center justify-center text-orange-500 hover:bg-orange-50 transition">
                <Search className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile hamburger */}
            <div className="md:hidden">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-500 hover:text-gray-900">
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100">
            <div className="px-4 pt-2 pb-4 space-y-1">
              <Link href="/" className={isActive('/') ? 'block px-3 py-2 text-orange-500 font-medium' : 'block px-3 py-2 text-gray-500 hover:text-gray-900'}>Home</Link>
              <Link href="/courses" className={isActive('/courses') ? 'block px-3 py-2 text-orange-500 font-medium' : 'block px-3 py-2 text-gray-500 hover:text-gray-900'}>Courses</Link>
              <Link href="/blog" className={isActive('/blog') ? 'block px-3 py-2 text-orange-500 font-medium' : 'block px-3 py-2 text-gray-500 hover:text-gray-900'}>Blog</Link>
              <Link href="/contactPage" className={isActive('/contactPage') ? 'block px-3 py-2 text-orange-500 font-medium' : 'block px-3 py-2 text-gray-500 hover:text-gray-900'}>Contact</Link>
              <Link href="/FAQ" className={isActive('/FAQ') ? 'block px-3 py-2 text-orange-500 font-medium' : 'block px-3 py-2 text-gray-500 hover:text-gray-900'}>FAQ</Link>
              {userRole !== null && (
                <>
                  {!isLoggedIn ? (
                    <Link href="/login-page" className={isActive('/login-page') ? 'block px-3 py-2 text-orange-500 font-medium' : 'block px-3 py-2 text-gray-500 hover:text-gray-900'}>Login / Register</Link>
                  ) : (
                    <>
                      <Link href={getDashboardHref()} className="block px-3 py-2 text-gray-500 hover:text-gray-900">My Dashboard</Link>
                      <button onClick={handleLogout} className="block w-full text-left px-3 py-2 text-red-500 hover:text-red-600 font-medium">Logout</button>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
export { Link };
