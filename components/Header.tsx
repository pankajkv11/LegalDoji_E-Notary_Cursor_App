'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import {
  Menu, X, FileText, Home, BookOpen, Users, HelpCircle, Phone,
  ChevronDown, User, LayoutDashboard, Settings, LogOut, Briefcase, Shield, Calendar
} from 'lucide-react'
import { getUser, clearUser, type AuthUser } from '@/lib/auth'

export default function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setUser(getUser())
  }, [pathname])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    clearUser()
    setUser(null)
    setDropdownOpen(false)
    router.push('/')
  }

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Services', href: '/services', icon: FileText },
    { name: 'How It Works', href: '/how-it-works', icon: BookOpen },
    ...(!user ? [{ name: 'Join as Notary', href: '/join-notary', icon: Users }] : []),
    { name: 'FAQ', href: '/faq', icon: HelpCircle },
    { name: 'Contact', href: '/contact', icon: Phone },
  ]

  const profileMenuItems = user ? ({
    user: [
      { name: 'Personal Details', href: '/dashboard', icon: User },
      { name: 'My Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'My Documents', href: '/dashboard/documents', icon: FileText },
      { name: 'Settings', href: '/settings', icon: Settings },
    ],
    notary: [
      { name: 'My Dashboard', href: '/notary/dashboard', icon: LayoutDashboard },
      { name: 'My Profile', href: '/notary/profile', icon: User },
      { name: 'Availability', href: '/notary/availability', icon: Calendar },
      { name: 'Settings', href: '/settings', icon: Settings },
    ],
    admin: [
      { name: 'Admin Panel', href: '/admin', icon: Shield },
      { name: 'User Management', href: '/admin/users', icon: Users },
      { name: 'Notary Applications', href: '/admin/notary-applications', icon: Briefcase },
      { name: 'Settings', href: '/settings', icon: Settings },
    ],
  }[user.role]) : []

  const roleBadgeClass = user ? ({
    user: 'bg-green-100 text-green-700',
    notary: 'bg-blue-100 text-blue-700',
    admin: 'bg-red-100 text-red-700',
  }[user.role]) : ''

  const roleLabel = user ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ''

  const initials = user ? user.name.slice(0, 2).toUpperCase() : ''

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center space-x-2">
              <FileText className="h-8 w-8 text-primary-600" />
              <span className="text-2xl font-bold text-gray-900">Legal<span className="text-primary-600">Doji</span></span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* CTA / Profile - Desktop */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center space-x-2 bg-primary-50 hover:bg-primary-100 px-3 py-2 rounded-full transition-colors"
                >
                  <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {initials}
                  </div>
                  <ChevronDown className={`h-4 w-4 text-gray-600 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
                    {/* User info */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center justify-between mb-0.5">
                        <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleBadgeClass}`}>
                          {roleLabel}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate">{user.email || user.phone}</p>
                    </div>

                    {/* Menu items */}
                    {profileMenuItems.map((item) => {
                      const Icon = item.icon
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-colors"
                        >
                          <Icon className="h-4 w-4" />
                          <span>{item.name}</span>
                        </Link>
                      )
                    })}

                    <div className="border-t border-gray-100 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-primary-600 hover:text-primary-700 px-4 py-2 text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/create"
                  className="bg-primary-600 text-white hover:bg-primary-700 px-6 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 hover:text-primary-600 p-2"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4">
            <div className="flex flex-col space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="flex items-center space-x-3 text-gray-700 hover:text-primary-600 hover:bg-gray-50 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}

              <div className="flex flex-col space-y-2 pt-4 border-t">
                {user ? (
                  <>
                    <div className="flex items-center space-x-3 px-3 py-2">
                      <div className="w-9 h-9 bg-primary-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {initials}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleBadgeClass}`}>
                            {roleLabel}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 truncate">{user.email || user.phone}</p>
                      </div>
                    </div>
                    {profileMenuItems.map((item) => {
                      const Icon = item.icon
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="flex items-center space-x-3 text-gray-700 hover:text-primary-600 hover:bg-gray-50 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Icon className="h-5 w-5" />
                          <span>{item.name}</span>
                        </Link>
                      )
                    })}
                    <button
                      onClick={() => { handleLogout(); setMobileMenuOpen(false) }}
                      className="flex items-center space-x-3 text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      <LogOut className="h-5 w-5" />
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="text-primary-600 hover:bg-primary-50 px-3 py-2 rounded-lg text-sm font-medium text-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      href="/create"
                      className="bg-primary-600 text-white hover:bg-primary-700 px-3 py-2 rounded-lg text-sm font-medium text-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
