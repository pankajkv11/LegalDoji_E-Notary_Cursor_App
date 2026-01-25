import React from 'react'
import Link from 'next/link'
import { FileText, Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  const footerSections = {
    company: {
      title: 'Company',
      links: [
        { name: 'About Us', href: '/about' },
        { name: 'How It Works', href: '/how-it-works' },
        { name: 'Join as Notary', href: '/join-notary' },
        { name: 'Resources', href: '/services' },
        { name: 'Contact', href: '/contact' },
      ],
    },
    services: {
      title: 'Services',
      links: [
        { name: 'Document Library', href: '/services' },
        { name: 'Create Document', href: '/create' },
        { name: 'Video Consultation', href: '/consultation' },
        { name: 'Pricing', href: '/pricing' },
      ],
    },
    legal: {
      title: 'Legal',
      links: [
        { name: 'Privacy Policy', href: '/privacy-policy' },
        { name: 'Terms & Conditions', href: '/terms' },
        { name: 'Refund Policy', href: '/refund-policy' },
      ],
    },
    support: {
      title: 'Support',
      links: [
        { name: 'FAQ', href: '/faq' },
        { name: 'Help Center', href: '/faq' },
        { name: 'Track Order', href: '/dashboard' },
        { name: 'Report Issue', href: '/contact' },
      ],
    },
  }

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <FileText className="h-8 w-8 text-primary-500" />
              <span className="text-2xl font-bold text-white">Legal<span className="text-primary-500">Doji</span></span>
            </Link>
            <p className="text-sm text-gray-400 mb-4">
              India's trusted platform for creating and notarizing legal documents online.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-primary-500 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-500 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-500 transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-primary-500 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Footer Links */}
          {Object.entries(footerSections).map(([key, section]) => (
            <div key={key}>
              <h3 className="text-white font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-primary-500 transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact Information */}
        <div className="border-t border-gray-800 pt-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start space-x-3">
              <Mail className="h-5 w-5 text-primary-500 mt-1" />
              <div>
                <p className="text-sm font-semibold text-white">Email</p>
                <a href="mailto:support@legaldoji.com" className="text-sm text-gray-400 hover:text-primary-500">
                  support@legaldoji.com
                </a>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Phone className="h-5 w-5 text-primary-500 mt-1" />
              <div>
                <p className="text-sm font-semibold text-white">Phone</p>
                <a href="tel:+911234567890" className="text-sm text-gray-400 hover:text-primary-500">
                  +91 123-456-7890
                </a>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <MapPin className="h-5 w-5 text-primary-500 mt-1" />
              <div>
                <p className="text-sm font-semibold text-white">Address</p>
                <p className="text-sm text-gray-400">
                  Mumbai, Maharashtra, India
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="border-t border-gray-800 pt-8 mb-8">
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-400">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Verified Notaries</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Court Accepted Documents</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Secure & Encrypted</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Pan-India Service</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
          <p>© {currentYear} LegalDoji. All rights reserved. | Made in India with ❤️</p>
        </div>
      </div>
    </footer>
  )
}
