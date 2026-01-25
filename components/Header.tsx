'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Menu, X, FileText, Home, BookOpen, Users, HelpCircle, Phone } from 'lucide-react'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Services', href: '/services', icon: FileText },
    { name: 'How It Works', href: '/how-it-works', icon: BookOpen },
    { name: 'Join as Notary', href: '/join-notary', icon: Users },
    { name: 'FAQ', href: '/faq', icon: HelpCircle },
    { name: 'Contact', href: '/contact', icon: Phone },
  ]

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

          {/* CTA Buttons - Desktop */}
          <div className="hidden md:flex md:items-center md:space-x-4">
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
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
