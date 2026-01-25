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
          'Document Categories (4 cards: Property, Personal, Business, Legal)',
          'How It Works (3 steps visual)',
          'Pricing Cards (Basic, Standard, Premium)',
          'Trust Indicators (Verified notaries, Court-accepted)',
          'Testimonials',
          'FAQ Quick Links',
          'Footer: Links to all pages'
        ],
        ctas: ['Get Started', 'Create Document', 'Upload Document', 'Join as Notary']
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
          'Video Consultation Service Card',
          'Search & Filter',
          'Template Previews'
        ],
        ctas: ['Create This Document', 'View Sample', 'Book Video Consultation']
      },
      {
        page: 'Pricing',
        url: '/pricing',
        sections: [
          'Two Simple Options:',
          'Option 1: Physical Delivery - ₹398 Total',
          '  • Document Creation: ₹249',
          '  • Physical Delivery: ₹149',
          'Option 2: Online Consultation - ₹999 Total',
          '  • Video Consultation with Notary',
          '  • Physical Delivery Included',
          '  • Digital Notarization',
          'FAQ on Pricing'
        ],
        ctas: ['Choose Physical Delivery', 'Book Online Consultation']
      },
      {
        page: 'How It Works',
        url: '/how-it-works',
        sections: [
          'Step-by-step Visual Guide',
          'Two Simple Options:',
          '1. Physical Delivery: ₹249 + ₹149 = ₹398',
          '2. Online Consultation: ₹999 (includes delivery)',
          'Document Creation Process',
          'Video Consultation Process',
          'Schedule Appointment Calendar',
          'Delivery Timeline',
          'Interactive Demo'
        ],
        ctas: ['Create Document', 'Book Video Consultation']
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
          'Progress Bar',
          'Bottom Action Buttons (centered at bottom): Continue to Checkout, Save Draft',
          'NO Previous Button'
        ],
        ctas: ['Continue to Checkout', 'Save Draft', 'Need Help? (Chatbot)']
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
          'Price Breakdown: Document Creation ₹249 + Delivery Fee ₹149 = ₹398',
          'NO Service Selection Options (Video Consultation is separate)',
          'Coupon Code Input',
          'Total Amount: ₹398',
          'Bottom Action Buttons: Continue to Checkout, Save Draft',
          'NO Previous Button'
        ],
        ctas: ['Apply Coupon', 'Continue to Checkout', 'Save Draft']
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
      name: 'New User - Create Document & Get Delivered',
      steps: [
        { num: 1, page: 'Homepage', action: 'User lands on homepage', details: 'Views hero, reads about services', element: 'Hero section', expected: 'Clear value proposition visible' },
        { num: 2, page: 'Homepage', action: 'Clicks "Create Document" or document category', details: 'Selects from categories: Property, Personal, Business, Legal', element: 'Document cards', expected: 'Tooltips show document info' },
        { num: 3, page: 'Login/Signup', action: 'Guest checkout OR creates account', details: 'Can proceed without login initially', element: 'Auth modal', expected: 'Guest option available' },
        { num: 4, page: 'Create Document', action: 'Selects specific document type', details: 'E.g., Rental Agreement, Affidavit, Property documents', element: 'Template selector', expected: 'Preview available' },
        { num: 5, page: 'Create Document', action: 'Fills guided form', details: 'Step-by-step fields with live preview', element: 'Form + Preview panel', expected: 'Auto-save works, preview updates' },
        { num: 6, page: 'Create Document', action: 'Uses help features if needed', details: 'Tooltips, chatbot, field help', element: 'Help icons', expected: 'Contextual help appears' },
        { num: 7, page: 'Create Document', action: 'Reviews document in live preview', details: 'Makes edits if needed', element: 'Preview panel', expected: 'Editable, real-time updates' },
        { num: 8, page: 'Checkout', action: 'Reviews pricing with delivery fee', details: 'Sees breakdown including delivery fee, applies coupon if any', element: 'Price summary', expected: 'Transparent pricing with delivery fee shown' },
        { num: 9, page: 'Checkout', action: 'Clicks Continue to Checkout or Save Draft', details: 'Buttons at bottom of page', element: 'Bottom action buttons', expected: 'Continue to Checkout proceeds, Save Draft saves progress' },
        { num: 10, page: 'Login (if guest)', action: 'Completes authentication', details: 'OTP verification for payment', element: 'Auth modal', expected: 'Quick OTP login' },
        { num: 11, page: 'Payment', action: 'Completes payment', details: 'Razorpay - Card/UPI/Net Banking (includes delivery fee)', element: 'Payment gateway', expected: 'Multiple methods available' },
        { num: 12, page: 'Confirmation', action: 'Receives E-notarized document', details: 'Digital document with e-signature', element: 'Download button', expected: 'Instant download available' },
        { num: 13, page: 'Confirmation', action: 'Views next steps guide', details: 'How to use document', element: 'Guide section', expected: 'Clear instructions' },
        { num: 14, page: 'Track Order', action: 'Tracks printing & delivery', details: 'Real-time status updates for physical copy (₹149 delivery fee paid)', element: 'Tracking timeline', expected: 'Status updates visible' },
        { num: 15, page: 'Delivery', action: 'Receives physical delivery', details: 'Courier delivers printed document (3-5 business days)', element: 'Physical delivery', expected: 'Document received at address' }
      ]
    },
    {
      id: 'video-consultation',
      name: 'Book Online Consultation (₹999)',
      steps: [
        { num: 1, page: 'Services/Homepage', action: 'User clicks "Book Video Consultation"', details: 'Sees Online Consultation service option', element: 'Book Video Consultation CTA', expected: 'CTA visible and clickable' },
        { num: 2, page: 'Schedule Consultation', action: 'Views service details', details: 'Sees ₹999 includes consultation + physical delivery', element: 'Service card', expected: 'Clear pricing and benefits displayed' },
        { num: 3, page: 'Schedule Consultation', action: 'Enters personal details', details: 'Name, email, phone, document type', element: 'Contact form', expected: 'Form validates all required fields' },
        { num: 4, page: 'Schedule Consultation', action: 'Views calendar for current & next month', details: 'Calendar grid showing available dates (Mon-Sat)', element: 'Calendar view', expected: 'Two months visible with date grid' },
        { num: 5, page: 'Schedule Consultation', action: 'Selects appointment date from calendar', details: 'Clicks available date (Sundays disabled)', element: 'Calendar date button', expected: 'Date highlighted, Sundays shown as closed' },
        { num: 6, page: 'Schedule Consultation', action: 'Selects time slot', details: 'Chooses from 9 available slots (9 AM - 6 PM)', element: 'Time slot grid', expected: 'Time slots become active after date selection' },
        { num: 7, page: 'Schedule Consultation', action: 'Reviews appointment summary', details: 'Sees selected date, time, and ₹999 total', element: 'Sticky sidebar summary', expected: 'All appointment details displayed clearly' },
        { num: 8, page: 'Payment', action: 'Proceeds to payment', details: 'Clicks "Proceed to Payment" button', element: 'Payment button', expected: 'Redirects to payment page with appointment data' },
        { num: 9, page: 'Payment', action: 'Completes payment', details: 'Razorpay - ₹999 (consultation + delivery included)', element: 'Payment gateway', expected: 'Payment successful' },
        { num: 10, page: 'Confirmation', action: 'Receives booking confirmation', details: 'Appointment confirmed with all details', element: 'Confirmation page', expected: 'Success message with appointment info' },
        { num: 11, page: 'Email', action: 'Receives confirmation email', details: 'Email with date, time, meeting link', element: 'Email inbox', expected: 'Confirmation email received within 5 minutes' },
        { num: 12, page: 'Calendar Invite', action: 'Adds to calendar', details: 'Calendar invite (.ics) attached to email', element: 'Calendar file', expected: 'Can add to Google/Outlook calendar' },
        { num: 13, page: 'Video Session', action: 'Joins video call at scheduled time', details: 'Clicks meeting link from email 5 mins early', element: 'Video interface', expected: 'Video connects successfully' },
        { num: 14, page: 'Video Session', action: 'Consults with legal expert/notary', details: 'Document review, consultation, notarization', element: 'Video call', expected: 'Clear audio/video, document sharing works' },
        { num: 15, page: 'Confirmation', action: 'Receives notarized document', details: 'Digital copy with notary signature & seal', element: 'Download button', expected: 'Instant download available' },
        { num: 16, page: 'Delivery', action: 'Receives physical delivery', details: 'Printed notarized document (included in ₹999)', element: 'Courier delivery', expected: 'Document delivered in 3-5 business days' }
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

  // Testing Document Structure
  const testingCategories = [
    {
      category: 'Homepage & Navigation',
      tests: [
        { id: 'HP-001', feature: 'Homepage loads', scenario: 'User visits legaldoji.com', steps: 'Navigate to URL', expected: 'Page loads in <3s, hero visible', priority: 'Critical', status: 'Pass', notes: '' },
        { id: 'HP-002', feature: 'Document categories display', scenario: 'User views document types', steps: 'Check homepage cards', expected: '4 categories visible with icons', priority: 'High', status: 'Pass', notes: '' },
        { id: 'HP-003', feature: 'Navigation menu', scenario: 'User clicks menu items', steps: 'Click each nav link', expected: 'All pages accessible', priority: 'Critical', status: 'Pass', notes: '' },
        { id: 'HP-004', feature: 'Mobile responsiveness', scenario: 'User on mobile device', steps: 'Resize to 375px', expected: 'Mobile menu works, content readable', priority: 'High', status: 'Pass', notes: '' },
        { id: 'HP-005', feature: 'CTA buttons', scenario: 'User clicks "Get Started"', steps: 'Click primary CTA', expected: 'Redirects to create/login', priority: 'Critical', status: 'Pass', notes: '' }
      ]
    },
    {
      category: 'Authentication',
      tests: [
        { id: 'AUTH-001', feature: 'User signup', scenario: 'New user creates account', steps: '1. Click signup 2. Enter details 3. Verify OTP', expected: 'Account created, redirected to dashboard', priority: 'Critical', status: 'Pass', notes: '' },
        { id: 'AUTH-002', feature: 'User login', scenario: 'Existing user logs in', steps: '1. Enter email 2. Enter OTP 3. Submit', expected: 'Login successful, dashboard loads', priority: 'Critical', status: 'Pass', notes: '' },
        { id: 'AUTH-003', feature: 'Guest checkout', scenario: 'User proceeds without login', steps: 'Start document creation', expected: 'Can fill form without auth', priority: 'High', status: 'Pass', notes: '' },
        { id: 'AUTH-004', feature: 'OTP verification', scenario: 'User enters wrong OTP', steps: 'Enter incorrect code', expected: 'Error message, resend option', priority: 'High', status: 'Pass', notes: '' },
        { id: 'AUTH-005', feature: 'Social login', scenario: 'User logs in with Google', steps: 'Click Google login', expected: 'OAuth flow completes', priority: 'Medium', status: 'Pass', notes: '' }
      ]
    },
    {
      category: 'Document Creation',
      tests: [
        { id: 'DOC-001', feature: 'Template selection', scenario: 'User selects rental agreement', steps: '1. Click Property 2. Select Rental', expected: 'Form loads with relevant fields', priority: 'Critical', status: 'Pass', notes: '' },
        { id: 'DOC-002', feature: 'Form filling', scenario: 'User fills document details', steps: 'Enter all required fields', expected: 'Fields validate, no errors', priority: 'Critical', status: 'Pass', notes: '' },
        { id: 'DOC-003', feature: 'Live preview', scenario: 'User enters data', steps: 'Type in form field', expected: 'Preview updates in real-time', priority: 'High', status: 'Pass', notes: '' },
        { id: 'DOC-004', feature: 'Auto-save', scenario: 'User fills form and closes', steps: '1. Fill fields 2. Close browser 3. Return', expected: 'Draft saved, data restored', priority: 'High', status: 'Pass', notes: '' },
        { id: 'DOC-005', feature: 'Field validation', scenario: 'User skips required field', steps: 'Try to proceed without required data', expected: 'Error highlights field', priority: 'High', status: 'Pass', notes: '' },
        { id: 'DOC-006', feature: 'Help tooltips', scenario: 'User hovers over help icon', steps: 'Hover on info icon', expected: 'Tooltip shows explanation', priority: 'Medium', status: 'Pass', notes: '' },
        { id: 'DOC-007', feature: 'Document editing', scenario: 'User edits in preview', steps: 'Click edit in preview', expected: 'Can modify document text', priority: 'High', status: 'Pass', notes: '' },
        { id: 'DOC-008', feature: 'Bottom action buttons', scenario: 'User completes form', steps: 'Scroll to bottom of page', expected: 'Continue to Checkout and Save Draft buttons visible at bottom center (NOT top-right)', priority: 'High', status: 'Pass', notes: 'Buttons positioned at bottom' },
        { id: 'DOC-009', feature: 'No buttons at top-right', scenario: 'User looks for action buttons', steps: 'Check top-right corner', expected: 'No Save Draft or Continue to Checkout buttons at top-right', priority: 'Medium', status: 'Pass', notes: 'Buttons moved to bottom' },
        { id: 'DOC-010', feature: 'Continue to Checkout', scenario: 'User clicks Continue to Checkout', steps: 'Click button at bottom center', expected: 'Proceeds to checkout page', priority: 'Critical', status: 'Pass', notes: '' },
        { id: 'DOC-011', feature: 'Save draft button', scenario: 'User saves without completing', steps: 'Click "Save Draft" at bottom center', expected: 'Draft saved to dashboard', priority: 'Medium', status: 'Pass', notes: '' },
        { id: 'DOC-012', feature: 'No Previous button', scenario: 'User looks for back navigation', steps: 'Check bottom of form for Previous button', expected: 'No Previous button visible', priority: 'Medium', status: 'Pass', notes: 'Previous button removed from UI' }
      ]
    },
    {
      category: 'Document Upload',
      tests: [
        { id: 'UPL-001', feature: 'File upload', scenario: 'User uploads PDF', steps: 'Drag PDF to upload zone', expected: 'File uploads, preview shows', priority: 'Critical', status: 'Pass', notes: '' },
        { id: 'UPL-002', feature: 'Format validation', scenario: 'User uploads invalid format', steps: 'Upload .txt file', expected: 'Error: Only PDF/DOCX allowed', priority: 'High', status: 'Pass', notes: '' },
        { id: 'UPL-003', feature: 'File size limit', scenario: 'User uploads 50MB file', steps: 'Upload large file', expected: 'Error: Max 10MB', priority: 'High', status: 'Fail', notes: 'Need to add size validation' },
        { id: 'UPL-004', feature: 'Upload progress', scenario: 'User uploads file', steps: 'Monitor upload', expected: 'Progress bar shows %', priority: 'Medium', status: 'Pass', notes: '' },
        { id: 'UPL-005', feature: 'Document preview', scenario: 'File uploaded successfully', steps: 'View uploaded doc', expected: 'PDF renders in browser', priority: 'High', status: 'Pass', notes: '' }
      ]
    },
    {
      category: 'Checkout & Payment',
      tests: [
        { id: 'CHK-001', feature: 'Checkout page load', scenario: 'User proceeds to checkout', steps: 'Navigate to checkout from document creation', expected: 'Checkout page loads with summary, NO service selection options visible', priority: 'Critical', status: 'Pass', notes: '' },
        { id: 'CHK-002', feature: 'No service selection options', scenario: 'User views checkout page', steps: 'Check for Video Notarization, E-Stamp, Physical Delivery options', expected: 'NO service selection cards/options visible', priority: 'Critical', status: 'Pass', notes: 'Removed add-ons as per requirements' },
        { id: 'CHK-003', feature: 'Delivery fee ₹149 auto-added', scenario: 'User reviews pricing', steps: 'View checkout price breakdown', expected: 'Delivery fee ₹149 automatically added to calculation', priority: 'Critical', status: 'Pass', notes: '' },
        { id: 'CHK-004', feature: 'Price breakdown', scenario: 'User reviews pricing', steps: 'View checkout summary', expected: 'Base price + Delivery Fee ₹149 shown separately, then total', priority: 'High', status: 'Pass', notes: '' },
        { id: 'CHK-005', feature: 'Coupon code', scenario: 'User applies discount', steps: 'Enter valid coupon', expected: 'Discount applied to total', priority: 'Medium', status: 'Pass', notes: '' },
        { id: 'CHK-006', feature: 'Bottom buttons positioning', scenario: 'User completes checkout form', steps: 'Scroll to bottom of page', expected: 'Continue to Checkout and Save Draft buttons at bottom (centered)', priority: 'High', status: 'Pass', notes: 'Buttons moved from top-right to bottom' },
        { id: 'CHK-007', feature: 'Continue to Checkout button', scenario: 'User ready to pay', steps: 'Click "Continue to Checkout" at bottom', expected: 'Proceeds to payment page', priority: 'Critical', status: 'Pass', notes: '' },
        { id: 'CHK-008', feature: 'Save Draft button', scenario: 'User wants to save progress', steps: 'Click "Save Draft" at bottom', expected: 'Draft saved to dashboard', priority: 'High', status: 'Pass', notes: '' },
        { id: 'CHK-009', feature: 'No previous button', scenario: 'User looks for back navigation', steps: 'Check for previous button at bottom', expected: 'No previous button visible anywhere on page', priority: 'Medium', status: 'Pass', notes: 'Previous button removed' }
      ]
    },
    {
      category: 'Video Consultation Scheduling',
      tests: [
        { id: 'VCS-001', feature: 'Calendar view', scenario: 'User views appointment calendar', steps: 'Navigate to Schedule Consultation page', expected: 'Two months calendar visible with date grid', priority: 'Critical', status: 'Pass', notes: '' },
        { id: 'VCS-002', feature: 'Calendar date selection', scenario: 'User selects available date', steps: 'Click available date in calendar', expected: 'Date highlighted, time slots become available', priority: 'Critical', status: 'Pass', notes: '' },
        { id: 'VCS-003', feature: 'Sunday disabled', scenario: 'User tries to select Sunday', steps: 'Click on Sunday date', expected: 'Sunday dates shown in red, not clickable', priority: 'High', status: 'Pass', notes: '' },
        { id: 'VCS-004', feature: 'Past dates disabled', scenario: 'User views calendar', steps: 'Check previous dates', expected: 'Past dates grayed out and not selectable', priority: 'High', status: 'Pass', notes: '' },
        { id: 'VCS-005', feature: 'Time slot selection', scenario: 'User selects time after choosing date', steps: '1. Select date 2. Click time slot', expected: '9 time slots (9 AM - 6 PM) available', priority: 'Critical', status: 'Pass', notes: '' },
        { id: 'VCS-006', feature: 'Time slots disabled without date', scenario: 'User tries to select time first', steps: 'Try clicking time slot without date', expected: 'Time slots disabled until date selected', priority: 'Medium', status: 'Pass', notes: '' },
        { id: 'VCS-007', feature: 'Personal details form', scenario: 'User fills contact info', steps: 'Enter name, email, phone', expected: 'Form validates all required fields', priority: 'Critical', status: 'Pass', notes: '' },
        { id: 'VCS-008', feature: 'Appointment summary', scenario: 'User completes selection', steps: 'Select date & time', expected: 'Sidebar shows formatted date, time, ₹999 total', priority: 'High', status: 'Pass', notes: '' },
        { id: 'VCS-009', feature: 'Proceed to payment validation', scenario: 'User clicks proceed without completing', steps: 'Click Proceed to Payment button', expected: 'Alert if required fields missing', priority: 'High', status: 'Pass', notes: '' }
      ]
    },
    {
      category: 'Payment',
      tests: [
        { id: 'PAY-001', feature: 'Razorpay integration', scenario: 'User clicks Pay Now', steps: 'Proceed to payment', expected: 'Razorpay modal opens', priority: 'Critical', status: 'Pass', notes: '' },
        { id: 'PAY-002', feature: 'Card payment', scenario: 'User pays with card', steps: '1. Enter card details 2. Submit', expected: 'Payment successful', priority: 'Critical', status: 'Pass', notes: '' },
        { id: 'PAY-003', feature: 'UPI payment', scenario: 'User pays with UPI', steps: 'Select UPI, enter ID', expected: 'Payment successful', priority: 'Critical', status: 'Pass', notes: '' },
        { id: 'PAY-004', feature: 'Payment failure', scenario: 'Payment declined', steps: 'Use test fail card', expected: 'Error message, retry option', priority: 'High', status: 'Pass', notes: '' },
        { id: 'PAY-005', feature: 'Invoice generation', scenario: 'Payment successful', steps: 'Complete payment', expected: 'Invoice auto-generated', priority: 'High', status: 'Pass', notes: '' }
      ]
    },
    {
      category: 'Video Notarization',
      tests: [
        { id: 'VID-001', feature: 'Pre-session tutorial', scenario: 'First-time user', steps: 'Join video session', expected: '30-sec guide plays', priority: 'Medium', status: 'Pass', notes: '' },
        { id: 'VID-002', feature: 'Video connection', scenario: 'User joins scheduled call', steps: 'Click Join Video', expected: 'Twilio connects, video starts', priority: 'Critical', status: 'Pass', notes: '' },
        { id: 'VID-003', feature: 'Camera/mic permission', scenario: 'Browser asks permission', steps: 'Allow camera/mic', expected: 'Permissions granted, video works', priority: 'Critical', status: 'Pass', notes: '' },
        { id: 'VID-004', feature: 'Document sharing', scenario: 'Show document to notary', steps: 'Share screen/document', expected: 'Notary can view document', priority: 'High', status: 'Pass', notes: '' },
        { id: 'VID-005', feature: 'Session recording', scenario: 'Video session in progress', steps: 'Check recording indicator', expected: 'Recording active indicator visible', priority: 'High', status: 'Pass', notes: '' },
        { id: 'VID-006', feature: 'Chat feature', scenario: 'User sends message', steps: 'Type in chat box', expected: 'Message appears for both parties', priority: 'Medium', status: 'Pass', notes: '' },
        { id: 'VID-007', feature: 'End session', scenario: 'Notarization complete', steps: 'Click End Session', expected: 'Session ends, redirects to confirmation', priority: 'High', status: 'Pass', notes: '' }
      ]
    },
    {
      category: 'Dashboard & Document Management',
      tests: [
        { id: 'DASH-001', feature: 'Dashboard load', scenario: 'User logs in', steps: 'Login and view dashboard', expected: 'Dashboard loads, stats visible', priority: 'Critical', status: 'Pass', notes: '' },
        { id: 'DASH-002', feature: 'Document list', scenario: 'View all documents', steps: 'Navigate to My Documents', expected: 'All created docs listed', priority: 'High', status: 'Pass', notes: '' },
        { id: 'DASH-003', feature: 'Download document', scenario: 'User downloads PDF', steps: 'Click download icon', expected: 'PDF downloads immediately', priority: 'Critical', status: 'Pass', notes: '' },
        { id: 'DASH-004', feature: 'Re-order physical', scenario: 'User wants hard copy', steps: 'Click "Re-order Physical"', expected: 'Checkout with delivery option', priority: 'Medium', status: 'Pass', notes: '' },
        { id: 'DASH-005', feature: 'Saved drafts', scenario: 'View incomplete docs', steps: 'Check Drafts section', expected: 'All drafts listed with date', priority: 'Medium', status: 'Pass', notes: '' },
        { id: 'DASH-006', feature: 'Search documents', scenario: 'User searches for doc', steps: 'Enter keyword in search', expected: 'Relevant docs filtered', priority: 'Medium', status: 'Pass', notes: '' },
        { id: 'DASH-007', feature: 'Filter by date', scenario: 'User filters by month', steps: 'Select date range', expected: 'Docs filtered accordingly', priority: 'Low', status: 'Pass', notes: '' }
      ]
    },
    {
      category: 'Order Tracking & Delivery',
      tests: [
        { id: 'TRK-001', feature: 'Order tracking page', scenario: 'User tracks order', steps: 'Click Track Order link', expected: 'Timeline shows current status', priority: 'High', status: 'Pass', notes: '' },
        { id: 'TRK-002', feature: 'Status updates', scenario: 'Order status changes', steps: 'Admin updates status', expected: 'User sees updated status', priority: 'High', status: 'Pass', notes: '' },
        { id: 'TRK-003', feature: 'Courier integration', scenario: 'Order shipped', steps: 'Check tracking number', expected: 'BlueDart/Delhivery link works', priority: 'High', status: 'Fail', notes: 'API integration pending' },
        { id: 'TRK-004', feature: 'Email notifications', scenario: 'Status changes', steps: 'Order progresses', expected: 'Email sent for each milestone', priority: 'Medium', status: 'Pass', notes: '' },
        { id: 'TRK-005', feature: 'Delivery estimate', scenario: 'User checks ETA', steps: 'View order details', expected: 'Estimated date shown', priority: 'Medium', status: 'Pass', notes: '' }
      ]
    },
    {
      category: 'Notary Dashboard',
      tests: [
        { id: 'NOT-001', feature: 'Notary login', scenario: 'Notary accesses dashboard', steps: 'Login with notary credentials', expected: 'Notary dashboard loads', priority: 'Critical', status: 'Pass', notes: '' },
        { id: 'NOT-002', feature: 'View appointments', scenario: 'Check pending requests', steps: 'Navigate to Appointments', expected: 'All requests listed', priority: 'Critical', status: 'Pass', notes: '' },
        { id: 'NOT-003', feature: 'Accept appointment', scenario: 'Notary accepts request', steps: 'Click Accept button', expected: 'Appointment confirmed, user notified', priority: 'Critical', status: 'Pass', notes: '' },
        { id: 'NOT-004', feature: 'Reject appointment', scenario: 'Notary declines', steps: 'Click Reject with reason', expected: 'Request rejected, user notified', priority: 'High', status: 'Pass', notes: '' },
        { id: 'NOT-005', feature: 'Set availability', scenario: 'Update schedule', steps: 'Modify calendar availability', expected: 'Schedule saved, reflected in bookings', priority: 'High', status: 'Pass', notes: '' },
        { id: 'NOT-006', feature: 'Earnings tracking', scenario: 'View income', steps: 'Navigate to Earnings', expected: 'Total and breakdown shown', priority: 'High', status: 'Pass', notes: '' },
        { id: 'NOT-007', feature: 'Performance metrics', scenario: 'Check stats', steps: 'View dashboard home', expected: 'Sessions, ratings, earnings visible', priority: 'Medium', status: 'Pass', notes: '' }
      ]
    },
    {
      category: 'Profile & Settings',
      tests: [
        { id: 'PROF-001', feature: 'Update profile', scenario: 'User changes details', steps: '1. Edit name 2. Save', expected: 'Profile updated successfully', priority: 'Medium', status: 'Pass', notes: '' },
        { id: 'PROF-002', feature: 'KYC upload', scenario: 'User completes KYC', steps: 'Upload Aadhaar/PAN', expected: 'Documents uploaded, status pending', priority: 'High', status: 'Pass', notes: '' },
        { id: 'PROF-003', feature: 'Change password', scenario: 'User updates password', steps: '1. Enter old/new 2. Submit', expected: 'Password changed, re-login required', priority: 'Medium', status: 'Pass', notes: '' },
        { id: 'PROF-004', feature: 'Email verification', scenario: 'User changes email', steps: 'Update email, verify OTP', expected: 'Email updated and verified', priority: 'Medium', status: 'Pass', notes: '' },
        { id: 'PROF-005', feature: 'Saved addresses', scenario: 'Add delivery address', steps: 'Enter address, save', expected: 'Address saved for future use', priority: 'Low', status: 'Pass', notes: '' }
      ]
    },
    {
      category: 'Legal & Compliance Pages',
      tests: [
        { id: 'LEG-001', feature: 'Privacy policy', scenario: 'User reads policy', steps: 'Navigate to Privacy Policy', expected: 'Page loads, content visible', priority: 'Medium', status: 'Pass', notes: '' },
        { id: 'LEG-002', feature: 'Terms & conditions', scenario: 'User reads terms', steps: 'Click T&C link', expected: 'Full terms displayed', priority: 'Medium', status: 'Pass', notes: '' },
        { id: 'LEG-003', feature: 'Refund policy', scenario: 'Check refund terms', steps: 'Navigate to Refund Policy', expected: 'Policy clearly stated', priority: 'Medium', status: 'Pass', notes: '' },
        { id: 'LEG-004', feature: 'Cookie consent', scenario: 'First visit', steps: 'Load homepage', expected: 'Cookie banner appears', priority: 'Low', status: 'Pass', notes: '' }
      ]
    },
    {
      category: 'Support & Help',
      tests: [
        { id: 'SUP-001', feature: 'Contact form', scenario: 'User submits query', steps: '1. Fill form 2. Submit', expected: 'Form submitted, confirmation shown', priority: 'Medium', status: 'Pass', notes: '' },
        { id: 'SUP-002', feature: 'Live chat', scenario: 'User opens chat', steps: 'Click chat icon', expected: 'Chat widget opens', priority: 'High', status: 'Fail', notes: 'Chatbot not integrated yet' },
        { id: 'SUP-003', feature: 'FAQ search', scenario: 'Search for answer', steps: 'Enter question in FAQ search', expected: 'Relevant FAQs shown', priority: 'Medium', status: 'Pass', notes: '' },
        { id: 'SUP-004', feature: 'Ticket system', scenario: 'Submit support ticket', steps: 'Create ticket with issue', expected: 'Ticket created, ID generated', priority: 'Medium', status: 'Pass', notes: '' }
      ]
    },
    {
      category: 'Mobile Responsiveness',
      tests: [
        { id: 'MOB-001', feature: 'Mobile navigation', scenario: 'Access on mobile', steps: 'Open hamburger menu', expected: 'Menu slides in, all links work', priority: 'High', status: 'Pass', notes: '' },
        { id: 'MOB-002', feature: 'Form filling mobile', scenario: 'Create doc on phone', steps: 'Fill form on mobile', expected: 'Fields accessible, keyboard doesn\'t overlap', priority: 'High', status: 'Pass', notes: '' },
        { id: 'MOB-003', feature: 'Mobile payment', scenario: 'Pay on mobile', steps: 'Complete Razorpay on phone', expected: 'Payment flow smooth', priority: 'Critical', status: 'Pass', notes: '' },
        { id: 'MOB-004', feature: 'Video on mobile', scenario: 'Join video call on phone', steps: 'Access video session', expected: 'Camera switches, video works', priority: 'High', status: 'Pass', notes: '' }
      ]
    },
    {
      category: 'Performance & Security',
      tests: [
        { id: 'PERF-001', feature: 'Page load time', scenario: 'Load any page', steps: 'Measure load time', expected: 'Pages load in <3s', priority: 'High', status: 'Pass', notes: '' },
        { id: 'PERF-002', feature: 'Image optimization', scenario: 'Check image sizes', steps: 'Inspect network tab', expected: 'Images compressed, lazy loaded', priority: 'Medium', status: 'Pass', notes: '' },
        { id: 'SEC-001', feature: 'HTTPS encryption', scenario: 'Check connection', steps: 'Verify SSL certificate', expected: 'Site uses HTTPS', priority: 'Critical', status: 'Pass', notes: '' },
        { id: 'SEC-002', feature: 'Data encryption', scenario: 'Payment data', steps: 'Verify payment security', expected: 'All data encrypted', priority: 'Critical', status: 'Pass', notes: '' },
        { id: 'SEC-003', feature: 'Session timeout', scenario: 'Idle for 30 mins', steps: 'Leave session inactive', expected: 'Auto-logout after timeout', priority: 'Medium', status: 'Pass', notes: '' }
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
              <p className="text-sm">Comprehensive test cases covering all features and user flows</p>
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="bg-white/20 p-3 rounded">
                  <div className="text-2xl font-bold">{testingCategories.reduce((acc, cat) => acc + cat.tests.length, 0)}</div>
                  <div className="text-sm">Total Test Cases</div>
                </div>
                <div className="bg-white/20 p-3 rounded">
                  <div className="text-2xl font-bold text-green-300">
                    {testingCategories.reduce((acc, cat) => acc + cat.tests.filter(t => t.status === 'Pass').length, 0)}
                  </div>
                  <div className="text-sm">Passed</div>
                </div>
                <div className="bg-white/20 p-3 rounded">
                  <div className="text-2xl font-bold text-red-300">
                    {testingCategories.reduce((acc, cat) => acc + cat.tests.filter(t => t.status === 'Fail').length, 0)}
                  </div>
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
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Notes</th>
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
                              test.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {test.priority}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-1 rounded font-semibold ${
                              test.status === 'Pass' ? 'bg-green-100 text-green-700' :
                              test.status === 'Fail' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {test.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{test.notes || '-'}</td>
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
                  <div className="flex items-start gap-2">
                    <span className="font-mono text-sm bg-blue-100 px-2 py-1 rounded">Test Steps</span>
                    <span className="text-sm text-gray-600">Step-by-step actions to perform</span>
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
                    <span className="text-sm text-gray-600">Pass | Fail | Pending | Blocked</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-mono text-sm bg-blue-100 px-2 py-1 rounded">Notes</span>
                    <span className="text-sm text-gray-600">Additional comments, bugs, issues</span>
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