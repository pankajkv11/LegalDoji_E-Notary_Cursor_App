'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Menu, X, FileText, Home, BookOpen, Users, HelpCircle, Phone, User, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react'
import { useMutation, gql } from '@apollo/client'
import { getAccessToken, getUser, clearAuth } from '@/lib/auth'

const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout
  }
`

export default function Header() {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<any>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  const [logout] = useMutation(LOGOUT_MUTATION, {
    onCompleted: () => {
      clearAuth()
      setIsLoggedIn(false)
      setUser(null)
      router.push('/')
    },
    onError: () => {
      // Even if server logout fails, clear local auth
      clearAuth()
      setIsLoggedIn(false)
      setUser(null)
      router.push('/')
    }
  })

  // Check authentication status on mount and when localStorage changes
  useEffect(() => {
    const checkAuth = () => {
      const token = getAccessToken()
      const userData = getUser()
      setIsLoggedIn(!!token)
      setUser(userData)
    }

    checkAuth()

    // Listen for storage changes (e.g., login in another tab)
    window.addEventListener('storage', checkAuth)
    
    // Custom event for same-tab auth changes
    window.addEventListener('authChange', checkAuth)

    return () => {
      window.removeEventListener('storage', checkAuth)
      window.removeEventListener('authChange', checkAuth)
    }
  }, [])

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    setUserMenuOpen(false)
    logout()
  }

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Services', href: '/services', icon: FileText },
    { name: 'How It Works', href: '/how-it-works', icon: BookOpen },
    { name: 'Join as Notary', href: '/join-notary', icon: Users },
    { name: 'FAQ', href: '/faq', icon: HelpCircle },
    { name: 'Contact', href: '/contact', icon: Phone },
  ]

  // Get user initials for avatar
  const getUserInitials = () => {
    if (user?.name) {
      const names = user.name.split(' ')
      return names.length > 1 
        ? `${names[0][0]}${names[1][0]}`.toUpperCase()
        : names[0].substring(0, 2).toUpperCase()
    }
    return 'U'
  }

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

          {/* CTA Buttons / User Menu - Desktop */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {isLoggedIn ? (
              /* Logged In - User Menu */
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-primary-600 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {/* User Avatar */}
                  <div className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-medium">
                    {getUserInitials()}
                  </div>
                  <span className="text-sm font-medium max-w-[120px] truncate">
                    {user?.name || 'User'}
                  </span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    {/* User Info */}
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>

                    {/* Menu Items */}
                    <Link
                      href="/dashboard"
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                    <Link
                      href="/dashboard/profile"
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary-600"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      <span>My Profile</span>
                    </Link>

                    {/* Logout */}
                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Not Logged In - Login/Signup Buttons */
              <>
                <Link
                  href="/login"
                  className="text-primary-600 hover:text-primary-700 px-4 py-2 text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="bg-primary-600 text-white hover:bg-primary-700 px-6 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Sign Up
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
                {isLoggedIn ? (
                  /* Mobile - Logged In */
                  <>
                    {/* User Info */}
                    <div className="flex items-center space-x-3 px-3 py-2 bg-gray-50 rounded-lg">
                      <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-medium">
                        {getUserInitials()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      </div>
                    </div>

                    <Link
                      href="/dashboard"
                      className="flex items-center space-x-3 text-gray-700 hover:text-primary-600 hover:bg-gray-50 px-3 py-2 rounded-lg text-sm font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <LayoutDashboard className="h-5 w-5" />
                      <span>Dashboard</span>
                    </Link>
                    <Link
                      href="/dashboard/profile"
                      className="flex items-center space-x-3 text-gray-700 hover:text-primary-600 hover:bg-gray-50 px-3 py-2 rounded-lg text-sm font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <User className="h-5 w-5" />
                      <span>My Profile</span>
                    </Link>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false)
                        handleLogout()
                      }}
                      className="flex items-center space-x-3 text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg text-sm font-medium"
                    >
                      <LogOut className="h-5 w-5" />
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  /* Mobile - Not Logged In */
                  <>
                    <Link
                      href="/login"
                      className="text-primary-600 hover:bg-primary-50 px-3 py-2 rounded-lg text-sm font-medium text-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      href="/signup"
                      className="bg-primary-600 text-white hover:bg-primary-700 px-3 py-2 rounded-lg text-sm font-medium text-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign Up
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
