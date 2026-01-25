# LegalDoji - E-Notary Platform

A comprehensive Next.js application for creating, notarizing, and managing legal documents online in India.

## Features

### Public Pages
- **Homepage** - Hero section, document categories, how it works, pricing, testimonials, and FAQs
- **Services/Document Library** - Browse 50+ legal document templates with search and filters
- **Pricing** - Transparent pricing plans (Basic, Standard, Premium) with detailed comparison
- **About** - Mission, vision, statistics, and why choose us
- **Contact** - Contact form, live chat, and support information
- **How It Works** - Step-by-step guide and video tutorials
- **Join as Notary** - Information for notaries to join the platform

### Authentication
- **Login** - Email/Phone OTP login with social authentication
- **Signup** - Multi-step registration with email and phone verification

### User Dashboard
- **Dashboard Home** - Overview with stats, quick actions, recent documents, and active orders
- **Create Document** - Guided form with live preview and auto-save
- **Upload Document** - Drag & drop file upload for existing documents
- **My Documents** - List all documents with filters and search
- **Checkout** - Service selection (notarization, e-stamp, delivery) with price breakdown
- **Payment** - Razorpay integration for secure payments
- **Track Order** - Real-time order tracking with status updates
- **Profile Settings** - Manage profile, KYC, addresses, and preferences

### Key Features
- 🎨 Modern, responsive UI with Tailwind CSS
- 📱 Mobile-friendly design
- 🔒 Secure authentication with OTP verification
- 📄 Live document preview
- 💾 Auto-save functionality
- 🎯 Multi-step forms with progress indicators
- 💳 Payment gateway integration ready
- 📦 Order tracking system
- 🔍 Advanced search and filters
- ⚡ Fast and optimized

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Fonts:** Inter (Google Fonts)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. **Install Dependencies**

```bash
npm install
```

2. **Run Development Server**

```bash
npm run dev
```

3. **Open Browser**

Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
E-notary/
├── app/                          # Next.js App Router pages
│   ├── about/                    # About page
│   ├── contact/                  # Contact page
│   ├── dashboard/                # User dashboard
│   │   ├── checkout/             # Checkout page
│   │   ├── create/               # Create document page
│   │   └── page.tsx              # Dashboard home
│   ├── login/                    # Login page
│   ├── pricing/                  # Pricing page
│   ├── services/                 # Services/Document library
│   ├── signup/                   # Signup page
│   ├── layout.tsx                # Root layout with header/footer
│   ├── globals.css               # Global styles
│   └── page.tsx                  # Homepage
├── components/                   # Reusable components
│   ├── Header.tsx                # Navigation header
│   └── Footer.tsx                # Site footer
├── public/                       # Static assets
├── package.json                  # Dependencies
├── tailwind.config.js            # Tailwind configuration
├── tsconfig.json                 # TypeScript configuration
└── README.md                     # This file
```

## Pages Overview

### Homepage (/)
- Hero section with CTAs
- 4 document categories
- How it works (3 steps)
- Pricing cards
- Trust indicators
- Testimonials
- FAQ accordion

### Services (/services)
- 15+ document templates
- Category filters
- Search functionality
- Template previews
- Price display

### Pricing (/pricing)
- 3 pricing tiers
- Feature comparison table
- Add-on services
- Pricing FAQs
- Money-back guarantee

### Login (/login)
- Email/Phone toggle
- OTP verification
- Social login (Google)
- Remember me option

### Signup (/signup)
- 3-step registration
- Progress indicator
- Email/Phone verification
- Password creation
- Terms acceptance

### Dashboard (/dashboard)
- Statistics cards
- Quick actions
- Recent documents
- Active orders
- Saved drafts alert

### Create Document (/dashboard/create)
- Multi-step form (4 steps)
- Live document preview
- Auto-save indicator
- Field-level help
- Progress bar

### Checkout (/dashboard/checkout)
- Document summary
- Service selection cards
- Coupon code input
- Price breakdown
- Order summary

## Customization

### Colors

Edit `tailwind.config.js` to change the primary color scheme:

```js
colors: {
  primary: {
    // Your color palette
  }
}
```

### Content

- Update company information in `components/Footer.tsx`
- Modify document templates in `app/services/page.tsx`
- Edit pricing plans in `app/pricing/page.tsx`

## Features to Implement

To make this a production-ready application, you'll need to add:

1. **Backend Integration**
   - User authentication (Firebase, Auth0, or custom)
   - Database (PostgreSQL, MongoDB)
   - Payment gateway (Razorpay)
   - Video calling (Twilio, Agora)

2. **State Management**
   - Context API or Redux for global state
   - Form state management (React Hook Form)

3. **API Integration**
   - RESTful API or GraphQL
   - Document generation
   - E-stamp integration
   - Courier tracking APIs

4. **Additional Features**
   - Real-time notifications
   - File upload to cloud storage
   - PDF generation
   - Email/SMS notifications
   - Admin dashboard
   - Notary dashboard

## Contributing

This is a demo project created for showcasing the LegalDoji platform design. Feel free to use it as a template for your own projects.

## License

MIT License - Feel free to use this project for personal or commercial purposes.

## Support

For questions or issues, please contact:
- Email: support@legaldoji.com
- Phone: +91 123-456-7890

---

**Built with ❤️ using Next.js and Tailwind CSS**
