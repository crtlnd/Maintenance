# Casey Uptime - Modern Maintenance Management

A comprehensive maintenance management application built with React, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Smart Asset Management** - Track equipment, machinery, and infrastructure
- **Preventive Maintenance** - Automated scheduling and task management  
- **AI-Powered Insights** - Predictive analytics and recommendations
- **FMEA & Risk Analysis** - Built-in failure mode analysis tools
- **Service Provider Network** - Connect with qualified maintenance professionals
- **Multi-User Support** - Customer, service provider, and admin interfaces

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn package manager
- Git

## 🛠️ Setup Instructions

### 1. Clone or Download the Project

If you have the project files from Figma Make:
```bash
# Create a new directory
mkdir casey-uptime
cd casey-uptime

# Copy all your exported files here
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Handle Image Assets

Replace all `figma:asset` imports with actual image files:

1. Create a `public/assets` directory
2. Download the Casey Uptime logo and save it as `public/assets/casey-uptime-logo.png`
3. Update imports in your files:

```typescript
// Change this:
import caseyUptimeLogo from 'figma:asset/b0281f1af0d4ecb0182aeab92b8439ecbadd5431.png';

// To this:
import caseyUptimeLogo from '/assets/casey-uptime-logo.png';
```

### 4. Start Development Server

```bash
npm run dev
```

The application will open at `http://localhost:3000`

### 5. Build for Production

```bash
npm run build
```

## 🌐 Deployment Options

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to [Vercel](https://vercel.com)
3. Deploy automatically

### Netlify
1. Build the project: `npm run build`
2. Upload the `dist` folder to [Netlify](https://netlify.com)

### Other Platforms
- **GitHub Pages**: For static hosting
- **Firebase Hosting**: Google's hosting platform
- **AWS S3 + CloudFront**: Enterprise-grade hosting

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file for environment-specific settings:

```env
VITE_API_URL=https://your-api-url.com
VITE_STRIPE_PUBLIC_KEY=your_stripe_public_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Authentication

The current implementation uses mock localStorage authentication. For production:

1. Replace with a real auth service (Auth0, Supabase, Firebase)
2. Update `src/utils/auth.tsx` with proper JWT handling
3. Add secure token storage

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── auth/           # Authentication components
│   ├── dialogs/        # Modal dialogs
│   └── views/          # Main application views
├── data/               # Initial data and mocks
├── styles/             # Global styles and CSS
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── App.tsx             # Main application component
```

## 🎨 Styling

- **Tailwind CSS v4** for utility-first styling
- **shadcn/ui** for consistent component library
- **Custom CSS variables** for theming
- **Dark mode support** built-in

## 🔒 Security Notes

- Replace mock authentication with production-ready solution
- Add proper API key management
- Implement HTTPS in production
- Add input validation and sanitization

## 📊 Performance

- **Code splitting** with lazy loading
- **Image optimization** recommended
- **Bundle analysis** available with `npm run build`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For questions or support:
- Create an issue in the repository
- Check the documentation in `/docs`
- Review the component library in `/components/ui`

## 📄 License

This project is proprietary software. All rights reserved.