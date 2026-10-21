# MyFamilyHealth - Personal Health Records Platform

A secure, privacy-first web application for organizing and managing family health records. Built with React, Firebase, and a focus on data protection and HIPAA compliance.

## 🏥 Features

- 📋 **Health Record Management:** Store medical documents, scan results, and appointment notes
- 👨‍👩‍👧 **Family Profiles:** Manage health records for multiple family members
- 📸 **Document Scanning:** OCR-powered scanning of medical documents
- 🔒 **End-to-End Encryption:** Secure storage of sensitive health data
- 📱 **Responsive Design:** Works on desktop, tablet, and mobile devices
- 🌐 **Offline Support:** Access records even without internet connection
- 🔐 **HIPAA Ready:** Designed with healthcare compliance in mind

## ⚠️ Important Disclaimers

**This application is NOT:**
- A substitute for professional medical advice
- A HIPAA Business Associate by default (BAA required)
- Intended for clinical use or patient care delivery
- A replacement for electronic health record (EHR) systems

**MyFamilyHealth is designed for personal health record organization only.**

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ (download from [nodejs.org](https://nodejs.org/))
- npm 7+
- Firebase account (create free at [firebase.google.com](https://firebase.google.com))

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Phalgunab/HealthGene.git
   cd HealthGene
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Firebase credentials
   ```
   See [ENVIRONMENT_SETUP.md](./ENVIRONMENT_SETUP.md) for detailed instructions.

4. **Start development server:**
   ```bash
   npm run dev
   ```

5. **Open in browser:**
   ```
   http://localhost:5173
   ```

## 📁 Project Structure

```
healthgene/
├── src/
│   ├── components/          # React components (to be refactored)
│   ├── utils/
│   │   ├── security.js      # XSS protection & sanitization
│   │   ├── rateLimiter.js   # Rate limiting & throttling
│   │   └── ...
│   ├── main.jsx             # Main app component
│   ├── firebase.js          # Firebase configuration
│   ├── styles.css           # Global styles
│   └── index.html           # HTML entry point
├── docs/
│   ├── PRIVACY_POLICY.md    # Privacy & data practices
│   ├── TERMS_OF_SERVICE.md  # Legal terms
│   └── ...
├── firestore.rules          # Firestore security rules
├── .env.example             # Environment variables template
├── .gitignore               # Git ignore rules
├── package.json             # Dependencies & scripts
└── vite.config.js           # Vite configuration
```

## 🔐 Security

### Data Protection
- **Encryption in Transit:** All data uses HTTPS/TLS 1.2+
- **Encryption at Rest:** Firebase uses AES encryption
- **Client-Side Security:** XSS protection with DOMPurify
- **Rate Limiting:** Protection against brute-force attacks
- **Access Controls:** Firestore rules enforce user-level access

### Best Practices
- Never commit `.env.local` (secrets protected by .gitignore)
- Use strong, unique passwords for Firebase accounts
- Enable two-factor authentication on Firebase Console
- Regularly audit Firestore access logs
- Review security rules before production deployment

### Security Checklist
- [ ] Secrets in environment variables only
- [ ] Firestore rules deployed and tested
- [ ] HTTPS enforced in production
- [ ] Rate limiting implemented for API calls
- [ ] XSS protection enabled on all user input
- [ ] Session timeouts configured
- [ ] Privacy Policy and Terms are published
- [ ] Data retention policy documented
- [ ] Breach notification procedures in place

## 📋 Configuration

### Firestore Rules

Security rules are defined in `firestore.rules`. Key features:
- User-level access control
- Document size validation
- Timestamp validation
- Rate limiting protection

Deploy rules:
```bash
firebase deploy --only firestore:rules
```

### Environment Variables

Required environment variables (see `.env.example`):
```
VITE_FIREBASE_API_KEY          # Firebase API key
VITE_FIREBASE_AUTH_DOMAIN      # Firebase auth domain
VITE_FIREBASE_PROJECT_ID       # Firebase project ID
VITE_FIREBASE_STORAGE_BUCKET   # Storage bucket name
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_FIREBASE_MEASUREMENT_ID
```

## 🏥 HIPAA Considerations

### HIPAA Compliance
If you intend to use this application with protected health information (PHI) in the United States:

1. **Execute a Business Associate Agreement (BAA)** with Firebase
2. **Implement end-to-end encryption** for PHI at rest
3. **Maintain audit logs** of all PHI access
4. **Establish access controls** for multi-user scenarios
5. **Document security procedures** and train staff

Contact: hipaa@myfamilyhealth.app for BAA support

### Not HIPAA Compliant By Default
Without a BAA, this application does NOT meet HIPAA requirements. It is suitable for personal health record organization only.

## 📜 Privacy & Legal

### Privacy Policy
- Defined in: `docs/PRIVACY_POLICY.md`
- Covers: Data collection, use, storage, sharing, and user rights
- Compliant with: GDPR, CCPA, and general privacy standards
- **Note:** Should be reviewed by healthcare privacy attorney

### Terms of Service
- Defined in: `docs/TERMS_OF_SERVICE.md`
- Covers: Usage terms, disclaimers, liability limitations
- Includes: Medical disclaimer (not professional advice)
- **Note:** Should be reviewed by healthcare attorney

### User Rights
Users can:
- **Export data:** Download personal health records in standard format
- **Delete account:** Remove all data within 30 days
- **Access data:** Request copy of stored information
- **Correct data:** Edit health records anytime

## 🧪 Testing

### Manual Testing
```bash
# Run development server
npm run dev

# Test in browser
# - Create account and sign in
# - Add health records
# - Upload documents
# - Export records
# - Delete account
```

### Automated Testing (Coming Soon)
```bash
npm test         # Run unit tests
npm run e2e      # Run end-to-end tests
npm run lint     # Run linter
```

## 🚢 Deployment

### Production Build
```bash
npm run build    # Create optimized build
npm run preview  # Test production build locally
```

### Deployment Options

**Option 1: GitHub Pages (Current)**
```bash
npm run deploy   # Deploy to GitHub Pages
```

**Option 2: Firebase Hosting**
```bash
firebase deploy --only hosting
```

**Option 3: Vercel, Netlify, or other hosts**
See platform-specific documentation.

### Production Checklist
- [ ] `.env` configured with production values
- [ ] Firebase rules deployed to production
- [ ] Privacy Policy published and accessible
- [ ] Terms of Service published and accessible
- [ ] HTTPS enforced
- [ ] CORS configured if needed
- [ ] Error monitoring enabled (Sentry, etc.)
- [ ] Performance monitoring enabled
- [ ] Backup strategy documented
- [ ] Incident response plan documented

## 📱 Mobile App Development

### Current Status
This is a **web application**. To submit to Apple App Store and Google Play Store:

1. Choose platform strategy:
   - **React Native** (recommended for long-term)
   - **Capacitor** (fastest path to market)
   - **Flutter** (alternative, requires rewrite)

2. Implement native features:
   - Camera/photo library access
   - Biometric authentication
   - Push notifications
   - Local storage

3. Follow platform guidelines:
   - iOS: App Store Review Guidelines
   - Android: Google Play Policies

See [APPSTORE_PLAYSTORE_REVIEW.md](./APPSTORE_PLAYSTORE_REVIEW.md) for detailed platform requirements.

## 🐛 Troubleshooting

### Firebase Configuration Missing
```
Error: "Firebase configuration missing"
```
**Solution:** Ensure `.env.local` exists and contains all required Firebase keys. Restart dev server.

### Authentication Not Working
```
Error: "Authentication not configured"
```
**Solution:** Go to Firebase Console → Authentication → Sign-in method. Enable at least one method (Google recommended).

### Can't Write to Firestore
```
Error: "User doesn't have permission to write"
```
**Solution:** Check Firestore rules are deployed. Verify user is authenticated. Check rule syntax in `firestore.rules`.

### Document Upload Failed
```
Error: "File processing error"
```
**Solution:** Check file size < 25MB. Ensure format is PDF or supported image. Check browser console for details.

## 📚 Documentation

- [Environment Setup](./ENVIRONMENT_SETUP.md) - Configure Firebase & environment
- [Privacy Policy](./docs/PRIVACY_POLICY.md) - Data handling practices
- [Terms of Service](./docs/TERMS_OF_SERVICE.md) - Legal terms
- [App Store Review](./APPSTORE_PLAYSTORE_REVIEW.md) - Submission checklist
- [Security Best Practices](./docs/SECURITY.md) - Coming soon

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Quality Standards
- Use ESLint for code style
- Write meaningful commit messages
- Add comments for complex logic
- Test changes before submitting PR
- Never commit secrets or credentials

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

## 🆘 Support

**For Technical Issues:**
- Check [Troubleshooting](#-troubleshooting) section
- Review [Firebase Documentation](https://firebase.google.com/docs)
- Open GitHub Issue with detailed description

**For Legal/Privacy Questions:**
- Email: legal@myfamilyhealth.app
- See [Privacy Policy](./docs/PRIVACY_POLICY.md)

**For HIPAA Compliance:**
- Email: hipaa@myfamilyhealth.app
- Reference: Business Associate Agreement (BAA)

**For Security Issues:**
- Email: security@myfamilyhealth.app
- Do NOT open public issues for security vulnerabilities

## ⚖️ Legal Notice

This software is provided "AS IS" without warranty of any kind. Users are responsible for:
- Accuracy of health information entered
- Compliance with applicable laws and regulations
- Data security and protection
- Obtaining necessary consents from family members

**This application is NOT a substitute for professional medical advice.** Always consult qualified healthcare providers for medical decisions.

## 🚀 Roadmap

### Planned Features
- [ ] End-to-end encryption for PHI
- [ ] Biometric authentication (Touch ID, Face ID)
- [ ] Push notifications for reminders
- [ ] Integration with major EHR systems
- [ ] FHIR format export/import
- [ ] Multi-language support
- [ ] Mobile apps (iOS/Android)
- [ ] Offline mode improvements
- [ ] Advanced search and filtering
- [ ] Care team collaboration (with permissions)

### Development Priorities
1. Complete Phase 1: Security fixes ✅ (in progress)
2. Complete Phase 2: Compliance & privacy
3. Complete Phase 3: Code refactoring
4. Complete Phase 4: Mobile app development
5. Complete Phase 5: Testing & QA

## 📊 Project Status

| Area | Status | Notes |
|------|--------|-------|
| Web Platform | ✅ Working | Needs refactoring |
| Security | 🔄 Improving | Phase 1 in progress |
| Privacy | 🔄 Improving | Phase 2 in progress |
| Mobile (iOS) | ⏳ Planned | Phase 4 |
| Mobile (Android) | ⏳ Planned | Phase 4 |
| Testing | ⏳ Planned | Phase 5 |

## 🙏 Acknowledgments

Built with:
- [React](https://react.dev) - UI framework
- [Firebase](https://firebase.google.com) - Backend services
- [Vite](https://vitejs.dev) - Build tool
- [Lucide React](https://lucide.dev) - Icons
- [Tesseract.js](https://tesseract.projectnaptha.com/) - OCR

## 📞 Contact

- **Website:** [myfamilyhealth.app](https://myfamilyhealth.app)
- **Email:** info@myfamilyhealth.app
- **GitHub:** [Phalgunab/HealthGene](https://github.com/Phalgunab/HealthGene)
- **Issues:** [GitHub Issues](https://github.com/Phalgunab/HealthGene/issues)

---

**Version:** 1.0.0-beta  
**Last Updated:** October 2026  
**Status:** 🔄 Active Development

---

**⚠️ DISCLAIMER:** This application is in active development. Use at your own risk. Always maintain backups of important health information. Consult healthcare professionals for medical decisions.
