# HealthGene - Family Medical Documentation Platform

A comprehensive healthcare platform for family medical documentation, provider management, and patient care coordination.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

## 📋 Project Structure

```
src/
├── components/        # React components
├── utils/            # Utility functions
├── config/           # Configuration files
├── styles/           # Global styles
└── App.jsx           # Main app component
```

## 🔧 Tech Stack

- **Frontend**: React 18+ with Vite
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Hosting**: Firebase Hosting
- **Styling**: CSS3 with responsive design

## 🌐 Live Application

- **Production**: https://myfamilyhealth-fe7b5.web.app
- **Status**: ✅ Live & Operational

## 📦 Features

- Provider authentication and registration
- Patient access management
- Provider dashboard with analytics
- Real-time messaging system
- Patient report generation
- Comprehensive audit logging
- Mobile-responsive design

## 🔐 Environment Configuration

Create a `.env.local` file with Firebase configuration:

```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run linter
- `npm run test` - Run tests

## 🚀 Deployment

The application is automatically deployed to Firebase Hosting via GitHub Actions on every push to the main branch.

### Manual Deployment

```bash
# Build the project
npm run build

# Deploy to Firebase
firebase deploy
```

## 📄 Documentation

- **API Reference**: See `docs/API.md`
- **Component Documentation**: See component files
- **Configuration**: See `src/config/`

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request

## 📞 Support

For issues and feature requests, please open an issue on GitHub.

## 📜 License

This project is licensed under the MIT License.

---

**Current Version**: 5.0.0  
**Last Updated**: October 21, 2026  
**Status**: Production Ready ✅
