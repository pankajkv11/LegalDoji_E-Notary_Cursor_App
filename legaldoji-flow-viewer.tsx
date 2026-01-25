import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Home, FileText, Users, Settings, Video, CreditCard, Package, Download } from 'lucide-react';

const LegalDojiCompleteFlow = () => {
  const [activeTab, setActiveTab] = useState('user-flow');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Complete Website Structure
  const websiteStructure = {
    'Public Pages': [
      {
        page: 'Homepage',
        url: '/',
        sections: [
          'Hero: Headline + CTA (Get Started)',
          'Document Categories (2 cards: Document Delivery, Online Consultation)',
          'How It Works (3 steps visual)',
          'Pricing Cards (₹499 for Document Delivery, ₹999 Online Consultation)',
          'Trust Indicators (Verified notaries, Court-accepted)',
          'Testimonials',
          'FAQ Quick Links',
          'Footer: Links to all pages'
        ],
        ctas: ['Get Started', 'Document Delivery', 'Online Consultation', 'Join as Notary']
      },
      {
        page: 'About Us',
        url: '/about',
        sections: [
          'Mission & Vision',
          'Pan-India Coverage Map',
          'Why Choose LegalDoji',
          'Team (Optional)',
          'Statistics & Achievements'
        ],
        ctas: ['Get Started']
      },
      {
        page: 'Services / Document Library',
        url: '/services',
        sections: [
          'Document Categories Grid',
          'Property: Rental, Sale Deed, Lease, NOC',
          'Personal: Affidavit, POA, Will, Name Change',
          'Business: NDA, Employment, Partnership, Service Agreement',
          'Legal: Vakalatnama, Court Affidavit, Undertaking',
          'Search & Filter',
          'Template Previews'
        ],
        ctas: ['Create This Document', 'View Sample']
      },
      {
        page: 'Pricing',
        url: '/pricing',
        sections: [
          '₹499 for Document Delivery',
          '₹999 for Online Consultation',
          'Add-on Pricing (E-stamp, Delivery)',
          'FAQ on Pricing'
        ],
        ctas: ['Choose Plan', 'Get Started']
      },
      {
        page: 'How It Works',
        url: '/how-it-works',
        sections: [
          'Step-by-step Visual Guide',
          'Video Tutorial',
          'Document Creation Flow',
          'Notarization Process',
          'Delivery Timeline',
          'Interactive Demo'
        ],
        ctas: ['Try It Now']
      },
      {
        page: 'Join as Notary',
        url: '/join-notary',
        sections: [
          'Benefits & Earnings',
          'Requirements Checklist',
          'Application Process',
          'How It Works for Notaries',
          'Testimonials from Notaries',
          'Earnings Calculator'
        ],
        ctas: ['Apply Now']
      },
      {
        page: 'Resources / Blog',
        url: '/resources',
        sections: [
          'Article Categories',
          'Legal Guides',
          'Document Templates Info',
          'State-wise Stamp Duty',
          'Industry News',
          'Search'
        ],
        ctas: ['Read More', 'Download Guide']
      },
      {
        page: 'Contact',
        url: '/contact',
        sections: [
          'Contact Form',
          'Email & Phone',
          'Live Chat Widget',
          'Office Address',
          'Business Hours',
          'Social Media Links'
        ],
        ctas: ['Submit', 'Chat Now']
      },
      {
        page: 'FAQs',
        url: '/faq',
        sections: [
          'General Questions',
          'Document Creation',
          'Notarization Process',
          'Pricing & Payment',
          'Delivery & Tracking',
          'Account & Security',
          'Search FAQs'
        ],
        ctas: ['Contact Support']
      }
    ],
    'Legal Pages': [
      {
        page: 'Privacy Policy',
        url: '/privacy-policy',
        sections: ['Data Collection', 'Usage', 'Storage', 'Third Parties', 'User Rights'],
        ctas: []
      },
      {
        page: 'Terms & Conditions',
        url: '/terms',
        sections: ['Service Agreement', 'User Obligations', 'Limitations', 'Dispute Resolution'],
        ctas: []
      },
      {
        page: 'Refund Policy',
        url: '/refund-policy',
        sections: ['Eligibility', 'Process', 'Timeline', 'Exceptions'],
        ctas: ['Request Refund']
      },
      {
        page: 'Legal Disclaimer',
        url: '/disclaimer',
        sections: ['Service Scope', 'No Legal Advice', 'Accuracy', 'Liability Limits'],
        ctas: []
      },
      {
        page: 'Cookie Policy',
        url: '/cookie-policy',
        sections: ['Types of Cookies', 'Usage', 'Control', 'Third-party Cookies'],
        ctas: []
      }
    ],
    'Authentication Pages': [
      {
        page: 'Login',
        url: '/login',
        sections: [
          'Email/Phone Input',
          'OTP Verification',
          'Social Login (Google)',
          'Remember Me',
          'Forgot Password'
        ],
        ctas: ['Send OTP', 'Login', 'Sign Up Instead']
      },
      {
        page: 'Signup',
        url: '/signup',
        sections: [
          'Basic Info (Name, Email, Phone)',
          'OTP Verification',
          'Password Creation',
          'Terms Acceptance',
          'KYC Notice'
        ],
        ctas: ['Create Account', 'Login Instead']
      }
    ],
    'User Dashboard': [
      {
        page: 'Dashboard Home',
        url: '/dashboard',
        sections: [
          'Welcome Message',
          'Quick Actions (Create, Upload, Track)',
          'Recent Documents',
          'Active Orders',
          'Saved Drafts',
          'Statistics'
        ],
        ctas: ['Create Document', 'Upload Document', 'View All']
      },
      {
        page: 'My Documents',
        url: '/dashboard/documents',
        sections: [
          'All Documents List',
          'Filters (Date, Type, Status)',
          'Search',
          'Document Cards with Actions',
          'Download, Re-order, Share'
        ],
        ctas: ['Download', 'Re-order Physical', 'Delete']
      },
      {
        page: 'Create Document',
        url: '/dashboard/create',
        sections: [
          'Document Type Selection',
          'Template Preview',
          'Guided Form with Sections',
          'Live Document Preview (Right Panel)',
          'Field-level Help Tooltips',
          'Auto-save Indicator',
          'Progress Bar'
        ],
        ctas: ['Save Draft', 'Continue to Checkout', 'Need Help? (Chatbot)']
      },
      {
        page: 'Upload Document',
        url: '/dashboard/upload',
        sections: [
          'Drag & Drop Zone',
          'File Format Guide',
          'Upload Progress',
          'Document Preview',
          'Validation Status'
        ],
        ctas: ['Upload Another', 'Continue to Services']
      },
      {
        page: 'Checkout',
        url: '/dashboard/checkout',
        sections: [
          'Document Summary',
          'Service Selection (Notarization, E-stamp, Delivery)',
          'Info Cards for Each Service',
          'Price Breakdown',
          'Coupon Code',
          'Total Amount'
        ],
        ctas: ['Apply Coupon', 'Proceed to Payment']
      },
      {
        page: 'Payment',
        url: '/dashboard/payment',
        sections: [
          'Razorpay Integration',
          'Payment Methods (Card, UPI, Net Banking, Wallet)',
          'Saved Payment Methods',
          'Order Summary',
          'Secure Payment Badge'
        ],
        ctas: ['Pay Now', 'Save Card for Future']
      },
      {
        page: 'Video Notarization',
        url: '/dashboard/video-session',
        sections: [
          'Pre-session Checklist',
          'Preparation Tips',
          'Video Interface (Twilio)',
          'Document Display Panel',
          'Chat with Notary',
          'Recording Indicator',
          'End Session'
        ],
        ctas: ['Start Video', 'Report Issue', 'End Session']
      },
      {
        page: 'Order Confirmation',
        url: '/dashboard/confirmation',
        sections: [
          'Success Message',
          'Order Number',
          'Download Document',
          'Next Steps Guide',
          'Track Delivery Link',
          'Share Options',
          'Rate Experience'
        ],
        ctas: ['Download PDF', 'Track Order', 'Create Another', 'Go to Dashboard']
      },
      {
        page: 'Track Order',
        url: '/dashboard/track',
        sections: [
          'Order Timeline',
          'Current Status',
          'Document Processing',
          'Printing Status',
          'Courier Details',
          'Estimated Delivery',
          'Contact Courier'
        ],
        ctas: ['Download Invoice', 'Contact Support']
      },
      {
        page: 'Profile Settings',
        url: '/dashboard/settings',
        sections: [
          'Personal Information',
          'KYC Status & Upload',
          'Email & Phone Verification',
          'Password Change',
          'Notification Preferences',
          'Saved Addresses'
        ],
        ctas: ['Update Profile', 'Complete KYC', 'Change Password']
      }
    ],
    'Notary Dashboard': [
      {
        page: 'Notary Dashboard Home',
        url: '/notary/dashboard',
        sections: [
          'Welcome & Stats',
          'Pending Appointments',
          'Today\'s Schedule',
          'Earnings Summary',
          'Quick Actions',
          'Notifications'
        ],
        ctas: ['View Appointments', 'Set Availability', 'View Earnings']
      },
      {
        page: 'Appointments',
        url: '/notary/appointments',
        sections: [
          'Request Queue',
          'Upcoming Sessions',
          'Completed Sessions',
          'Filters & Search',
          'Calendar View',
          'Accept/Reject Actions'
        ],
        ctas: ['Accept', 'Reject', 'Join Video', 'View Details']
      },
      {
        page: 'Availability Calendar',
        url: '/notary/availability',
        sections: [
          'Weekly Calendar',
          'Recurring Schedule Setup',
          'Block Dates',
          'Time Slot Management',
          'Instant Availability Toggle'
        ],
        ctas: ['Save Schedule', 'Set Instant Available']
      },
      {
        page: 'Earnings & Payments',
        url: '/notary/earnings',
        sections: [
          'Total Earnings',
          'This Month Statistics',
          'Payment History',
          'Pending Payments',
          'Bank Details',
          'Download Statements'
        ],
        ctas: ['Update Bank Details', 'Request Payout', 'Download Statement']
      },
      {
        page: 'Notary Profile',
        url: '/notary/profile',
        sections: [
          'Professional Information',
          'Registration Details',
          'Credentials & Certificates',
          'Verification Status',
          'Performance Rating',
          'Reviews'
        ],
        ctas: ['Update Profile', 'Upload Credential', 'View Reviews']
      }
    ]
  };

  // Complete User Flows
  const completeUserFlows = [
    {
      id: 'new-user-create',
      name: 'New User - Create Document & Get Notarized',
      steps: [
        { num: 1, page: 'Homepage', action: 'User lands on homepage', details: 'Views hero, reads about services', element: 'Hero section', expected: 'Clear value proposition visible' },
        { num: 2, page: 'Homepage', action: 'Clicks "Create Document" or document category', details: 'Selects from 4 categories', element: 'Document cards', expected: 'Tooltips show document info' },
        { num: 3, page: 'Login/Signup', action: 'Guest checkout OR creates account', details: 'Can proceed without login initially', element: 'Auth modal', expected: 'Guest option available' },
        { num: 4, page: 'Create Document', action: 'Selects specific document type', details: 'E.g., Rental Agreement', element: 'Template selector', expected: 'Preview available' },
        { num: 5, page: 'Create Document', action: 'Fills guided form', details: 'Step-by-step fields with live preview', element: 'Form + Preview panel', expected: 'Auto-save works, preview updates' },
        { num: 6, page: 'Create Document', action: 'Uses help features if needed', details: 'Tooltips, chatbot, field help', element: 'Help icons', expected: 'Contextual help appears' },
        { num: 7, page: 'Create Document', action: 'Reviews document in live preview', details: 'Makes edits if needed', element: 'Preview panel', expected: 'Editable, real-time updates' },
        { num: 8, page: 'Checkout', action: 'Selects services', details: 'Notarization + E-stamp + Delivery options', element: 'Service cards', expected: 'Info tooltips explain each' },
        { num: 9, page: 'Checkout', action: 'Reviews pricing', details: 'Sees breakdown, applies coupon if any', element: 'Price summary', expected: 'Transparent pricing shown' },
        { num: 10, page: 'Login (if guest)', action: 'Completes authentication', details: 'OTP verification for payment', element: 'Auth modal', expected: 'Quick OTP login' },
        { num: 11, page: 'Payment', action: 'Completes payment', details: 'Razorpay - Card/UPI/Net Banking', element: 'Payment gateway', expected: 'Multiple methods available' },
        { num: 12, page: 'Video Session (if selected)', action: 'Watches pre-video tutorial', details: 'First-time users see 30-sec guide', element: 'Tutorial modal', expected: 'Skip option available' },
        { num: 13, page: 'Video Session', action: 'Joins video call with notary', details: 'Auto-connect or scheduled time', element: 'Twilio video', expected: 'Connection stable' },
        { num: 14, page: 'Video Session', action: 'Completes verification', details: 'Shows ID, verifies details', element: 'Video interface', expected: 'Clear instructions shown' },
        { num: 15, page: 'Video Session', action: 'Receives digital signature', details: 'Notary signs document', element: 'Document panel', expected: 'Signature applied' },
        { num: 16, page: 'Confirmation', action: 'Downloads notarized document', details: 'PDF with digital signature', element: 'Download button', expected: 'Instant download' },
        { num: 17, page: 'Confirmation', action: 'Views next steps guide', details: 'How to use document', element: 'Guide section', expected: 'Clear instructions' },
        { num: 18, page: 'Track Order (if physical)', action: 'Tracks printing & delivery', details: 'Real-time status updates', element: 'Tracking timeline', expected: 'Status updates visible' }
      ]
    },
    {
      id: 'upload-notarize',
      name: 'Upload Existing Document for Notarization',
      steps: [
        { num: 1, page: 'Homepage', action: 'Clicks "Upload Document"', details: 'Has pre-made document', element: 'Upload CTA', expected: 'Clear upload option' },
        { num: 2, page: 'Upload Page', action: 'Drags & drops file', details: 'PDF/Word format', element: 'Upload zone', expected: 'Format validation works' },
        { num: 3, page: 'Upload Page', action: 'Reviews uploaded document', details: 'Preview shows in browser', element: 'Document preview', expected: 'Clear preview' },
        { num: 4, page: 'Login/Signup', action: 'Authenticates during upload', details: 'Background OTP while file processes', element: 'Auth modal', expected: 'Non-blocking auth' },
        { num: 5, page: 'Checkout', action: 'Selects notarization service', details: 'Must select for uploaded docs', element: 'Service selector', expected: 'Notarization pre-selected' },
        { num: 6, page: 'Checkout', action: 'Chooses instant or scheduled', details: 'Appointment preference', element: 'Scheduling options', expected: 'Both options visible' },
        { num: 7, page: 'Payment', action: 'Completes payment', details: 'Notarization fee', element: 'Payment gateway', expected: 'Payment successful' },
        { num: 8, page: 'Video Session', action: 'Joins video with notary', details: 'Identity verification', element: 'Video call', expected: 'Connection established' },
        { num: 9, page: 'Video Session', action: 'Document verified & signed', details: 'Notary reviews and signs', element: 'Digital signature', expected: 'Signature applied' },
        { num: 10, page: 'Confirmation', action: 'Downloads notarized copy', details: 'Original + notary seal', element: 'Download button', expected: 'Download works' }
      ]
    },
    {
      id: 'notary-onboarding',
      name: 'Notary Registration & First Session',
      steps: [
        { num: 1, page: 'Homepage', action: 'Clicks "Join as Notary"', details: 'Interested in becoming notary', element: 'Notary CTA', expected: 'Link visible in nav/footer' },
        { num: 2, page: 'Join as Notary', action: 'Reviews benefits & requirements', details: 'Earnings, process, eligibility', element: 'Info sections', expected: 'Clear information' },
        { num: 3, page: 'Join as Notary', action: 'Clicks "Apply Now"', details: 'Starts application', element: 'Apply button', expected: 'Form loads' },
        { num: 4, page: 'Application Form', action: 'Fills professional details', details: 'Name, registration number, etc.', element: 'Form fields', expected: 'Validation works' },
        { num: 5, page: 'Application Form', action: 'Uploads credentials', details: 'Registration cert, ID, photo', element: 'File upload', expected: 'Multiple files accepted' },
        { num: 6, page: 'Application Form', action: 'Submits application', details: 'Auto-save worked throughout', element: 'Submit button', expected: 'Submission successful' },
        { num: 7, page: 'Dashboard (Limited)', action: 'Gets instant dashboard access', details: 'Limited features during review', element: 'Notary dashboard', expected: 'Access granted' },
        { num: 8, page: 'Email', action: 'Receives approval notification', details: 'Admin approves within 24-48hrs', element: 'Email', expected: 'Approval received' },
        { num: 9, page: 'Availability', action: 'Sets availability schedule', details: 'Recurring weekly schedule', element: 'Calendar', expected: 'Schedule saves' },
        { num: 10, page: 'Dashboard', action: 'Receives first appointment', details: 'Notification of user booking', element: 'Notification', expected: 'Alert appears' },
        { num: 11, page: 'Appointments', action: 'Accepts appointment', details: 'One-click accept', element: 'Accept button', expected: 'Appointment confirmed' },
        { num: 12, page: 'Video Session', action: 'Joins scheduled video', details: 'Auto-launch at appointment time', element: 'Video interface', expected: 'Video connects' },
        { num: 13, page: 'Video Session', action: 'Verifies user & document', details: 'Checks ID, reviews document', element: 'Verification tools', expected: 'Tools work properly' },
        { num: 14, page: 'Video Session', action: 'Applies digital signature', details: 'Signs using DSC', element: 'Signature tool', expected: 'Signature applied' },
        { num: 15, page: 'Earnings', action: 'Views updated earnings', details: 'Session fee added', element: 'Earnings dashboard', expected: 'Amount reflected' }
      ]
    }
  ];

  // Testing Document Structure - First 3 categories for display
  const testingCategories = [
    {
      category: 'Homepage & Navigation',
      tests: [
        { id: 'HP-001', feature: 'Homepage loads', scenario: 'User visits legaldoji.com', steps: 'Navigate to URL', expected: 'Page loads in <3s, hero visible', priority: 'Critical', status: 'Pass', notes: '' },
        { id: 'HP-002', feature: 'Document categories display', scenario: 'User views document types', steps: 'Check homepage cards', expected: '4 categories visible with icons', priority: 'High', status: 'Pass', notes: '' },
        { id: 'HP-003', feature: 'Navigation menu', scenario: 'User clicks menu items', steps: 'Click each nav link', expected: 'All pages accessible', priority: 'Critical', status: 'Pass', notes: '' }
      ]
    },
    {
      category: 'Authentication',
      tests: [
        { id: 'AUTH-001', feature: 'User signup', scenario: 'New user creates account', steps: '1. Click signup 2. Enter details 3. Verify OTP', expected: 'Account created, redirected to dashboard', priority: 'Critical', status: 'Pass', notes: '' },
        { id: 'AUTH-002', feature: 'User login', scenario: 'Existing user logs in', steps: '1. Enter email 2. Enter OTP 3. Submit', expected: 'Login successful, dashboard loads', priority: 'Critical', status: 'Pass', notes: '' }
      ]
    },
    {
      category: 'Document Creation',
      tests: [
        { id: 'DOC-001', feature: 'Template selection', scenario: 'User selects rental agreement', steps: '1. Click Property 2. Select Rental', expected: 'Form loads with relevant fields', priority: 'Critical', status: 'Pass', notes: '' },
        { id: 'DOC-002', feature: 'Form filling', scenario: 'User fills document details', steps: 'Enter all required fields', expected: 'Fields validate, no errors', priority: 'Critical', status: 'Pass', notes: '' }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="max-w-7xl mx-auto">
        <header className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">LegalDoji.com - Complete Flow & Testing</h1>
          <p className="text-gray-600">Comprehensive user flows, website structure, and testing documentation</p>
        </header>

        <div className="flex gap-2 mb-6 flex-wrap">
          {['user-flow', 'website-structure', 'testing'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-lg font-semibold transition ${
                activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab === 'user-flow' && '📊 User Flows'}
              {tab === 'website-structure' && '🏗️ Website Structure'}
              {tab === 'testing' && '✅ Testing Document'}
            </button>
          ))}
        </div>

        {activeTab === 'user-flow' && (
          <div className="space-y-6">
            {completeUserFlows.map(flow => (
              <div key={flow.id} className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">{flow.name}</h2>
                <div className="space-y-3">
                  {flow.steps.map(step => (
                    <div key={step.num} className="flex gap-4 p-4 bg-gradient-to-r from-blue-50 to-white rounded-lg border-l-4 border-blue-500">
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                        {step.num}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-800">{step.action}</div>
                        <div className="text-sm text-blue-600 font-medium">{step.page}</div>
                        <div className="text-sm text-gray-600 mt-1">{step.details}</div>
                        <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                          <div><span className="font-semibold">Element:</span> {step.element}</div>
                          <div><span className="font-semibold">Expected:</span> {step.expected}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'website-structure' && (
          <div className="space-y-6">
            {Object.entries(websiteStructure).map(([category, pages]) => (
              <div key={category} className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">{category}</h2>
                <div className="space-y-4">
                  {pages.map((page, idx) => (
                    <div key={idx}>
                      <button
                        onClick={() => toggleSection(`${category}-${idx}`)}
                        className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-indigo-50 to-white rounded-lg hover:shadow-md transition"
                      >
                        <div className="flex items-center gap-3">
                          {expandedSections[`${category}-${idx}`] ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                          <div className="text-left">
                            <div className="font-semibold text-gray-800">{page.page}</div>
                            <div className="text-sm text-gray-500">{page.url}</div>
                          </div>
                        </div>
                        {page.ctas.length > 0 && (
                          <div className="text-xs bg-blue-100 px-3 py-1 rounded">
                            {page.ctas.length} CTAs
                          </div>
                        )}
                      </button>
                      
                      {expandedSections[`${category}-${idx}`] && (
                        <div className="ml-8 mt-2 space-y-2">
                          <div className="text-sm font-semibold text-gray-700">Sections:</div>
                          <ul className="space-y-1">
                            {page.sections.map((section, i) => (
                              <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                                <span className="text-blue-500">•</span>
                                <span>{section}</span>
                              </li>
                            ))}
                          </ul>
                          {page.ctas.length > 0 && (
                            <>
                              <div className="text-sm font-semibold text-gray-700 mt-3">CTAs:</div>
                              <div className="flex gap-2 flex-wrap">
                                {page.ctas.map((cta, i) => (
                                  <span key={i} className="text-xs bg-blue-600 text-white px-3 py-1 rounded">
                                    {cta}
                                  </span>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'testing' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg p-6">
              <h2 className="text-xl font-bold mb-2">Testing Document Structure</h2>
              <p className="text-sm">Sample test cases - Full documentation contains 100+ tests</p>
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="bg-white/20 p-3 rounded">
                  <div className="text-2xl font-bold">100+</div>
                  <div className="text-sm">Total Test Cases</div>
                </div>
                <div className="bg-white/20 p-3 rounded">
                  <div className="text-2xl font-bold text-green-300">97</div>
                  <div className="text-sm">Passed</div>
                </div>
                <div className="bg-white/20 p-3 rounded">
                  <div className="text-2xl font-bold text-red-300">3</div>
                  <div className="text-sm">Failed</div>
                </div>
              </div>
            </div>

            {testingCategories.map((category, catIdx) => (
              <div key={catIdx} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-4">
                  <h3 className="text-xl font-bold">{category.category}</h3>
                  <div className="text-sm mt-1">{category.tests.length} test cases</div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Test ID</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Feature</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Scenario</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Test Steps</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Expected Result</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Priority</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {category.tests.map((test, idx) => (
                        <tr key={idx} className={`border-b ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                          <td className="px-4 py-3 text-sm font-mono text-gray-800">{test.id}</td>
                          <td className="px-4 py-3 text-sm text-gray-800">{test.feature}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{test.scenario}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{test.steps}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{test.expected}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-1 rounded ${
                              test.priority === 'Critical' ? 'bg-red-100 text-red-700' :
                              test.priority === 'High' ? 'bg-orange-100 text-orange-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {test.priority}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-1 rounded font-semibold ${
                              test.status === 'Pass' ? 'bg-green-100 text-green-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {test.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Testing Spreadsheet Columns</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="font-mono text-sm bg-blue-100 px-2 py-1 rounded">Test ID</span>
                    <span className="text-sm text-gray-600">Unique identifier (e.g., HP-001, AUTH-002)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-mono text-sm bg-blue-100 px-2 py-1 rounded">Feature</span>
                    <span className="text-sm text-gray-600">Feature being tested</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-mono text-sm bg-blue-100 px-2 py-1 rounded">Scenario</span>
                    <span className="text-sm text-gray-600">User scenario description</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="font-mono text-sm bg-blue-100 px-2 py-1 rounded">Expected Result</span>
                    <span className="text-sm text-gray-600">What should happen</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-mono text-sm bg-blue-100 px-2 py-1 rounded">Priority</span>
                    <span className="text-sm text-gray-600">Critical | High | Medium | Low</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-mono text-sm bg-blue-100 px-2 py-1 rounded">Status</span>
                    <span className="text-sm text-gray-600">Pass | Fail | Pending</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LegalDojiCompleteFlow;