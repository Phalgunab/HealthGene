/**
 * Admin Setup Script
 * This script initializes demo admin credentials in Firestore
 * Run this once to set up the admin collection
 */

import { db } from './firebase.js';
import { collection, doc, setDoc } from 'firebase/firestore';

/**
 * Create initial admin user in Firestore
 * NOTE: In production, use proper password hashing (bcrypt) instead of storing plain text
 */
export const initializeAdminUser = async () => {
  try {
    const adminsRef = collection(db, 'admins');
    
    // Create demo admin
    await setDoc(doc(adminsRef, 'admin_001'), {
      email: 'admin@healthgene.com',
      name: 'System Administrator',
      password: 'AdminPass123!', // TODO: Replace with hashed password in production
      role: 'admin',
      permissions: ['provider_verification', 'view_reports', 'manage_admins', 'system_settings'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'active',
      lastLogin: null
    });
    
    console.log('✅ Admin user initialized successfully');
    console.log('Demo credentials:');
    console.log('  Email: admin@healthgene.com');
    console.log('  Password: AdminPass123!');
    
    return true;
  } catch (error) {
    console.error('❌ Error initializing admin user:', error);
    return false;
  }
};

/**
 * Set up Firestore security rules for admin panel
 * These rules should be applied in Firestore Console
 */
export const getSecurityRules = () => {
  return `
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Admin collection - only admins can read/write
    match /admins/{adminId} {
      allow read, write: if request.auth.uid != null && 
                           exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }
    
    // Providers collection - admins can read/write, providers can read own
    match /providers/{providerId} {
      allow read: if request.auth.uid == providerId || 
                    exists(/databases/$(database)/documents/admins/$(request.auth.uid));
      allow write: if exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }
    
    // Admin audits - only admins can read/write
    match /adminAudits/{auditId} {
      allow read, write: if exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }
    
    // Users collection - patients can read/write own
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
      
      // Provider access within users
      match /providerAccess/{accessId} {
        allow read: if request.auth.uid == userId;
        allow write: if request.auth.uid == userId;
      }
    }
  }
}
`;
};

// Run initialization if this script is executed directly
if (import.meta.url.endsWith(process.argv[1])) {
  initializeAdminUser();
}
