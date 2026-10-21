/**
 * Admin Management Utilities
 * Handles provider verification, approval, and admin auditing
 */

import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  setDoc,
  deleteDoc,
  writeBatch,
  serverTimestamp,
  orderBy,
  limit,
  startAfter,
  getDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Fetch all pending providers needing verification
 */
export const getPendingProviders = async () => {
  try {
    const q = query(
      collection(db, 'providers'),
      where('status', '==', 'pending_verification'),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching pending providers:', error);
    throw new Error('Failed to fetch pending providers');
  }
};

/**
 * Fetch all providers with a specific status
 */
export const getProvidersByStatus = async (status) => {
  try {
    const q = query(
      collection(db, 'providers'),
      where('status', '==', status),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error(`Error fetching providers with status ${status}:`, error);
    throw new Error(`Failed to fetch providers with status ${status}`);
  }
};

/**
 * Fetch all providers with pagination
 */
export const getAllProviders = async (pageSize = 10, lastProvider = null) => {
  try {
    let q;
    if (lastProvider) {
      q = query(
        collection(db, 'providers'),
        orderBy('createdAt', 'desc'),
        startAfter(lastProvider.createdAt),
        limit(pageSize)
      );
    } else {
      q = query(
        collection(db, 'providers'),
        orderBy('createdAt', 'desc'),
        limit(pageSize)
      );
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching all providers:', error);
    throw new Error('Failed to fetch providers');
  }
};

/**
 * Get provider details by UID
 */
export const getProviderDetails = async (uid) => {
  try {
    const docRef = doc(db, 'providers', uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        uid: docSnap.id,
        ...docSnap.data()
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching provider details:', error);
    throw new Error('Failed to fetch provider details');
  }
};

/**
 * Approve a provider (change status to verified)
 */
export const approveProvider = async (uid, approvedBy, notes = '') => {
  try {
    const batch = writeBatch(db);

    // Update provider status
    const providerRef = doc(db, 'providers', uid);
    batch.update(providerRef, {
      status: 'verified',
      verifiedAt: serverTimestamp(),
      verificationNotes: notes,
      approvedBy: approvedBy,
      updatedAt: serverTimestamp()
    });

    // Log to audit trail
    const auditRef = doc(collection(db, 'adminAudits'));
    batch.set(auditRef, {
      action: 'provider_approved',
      providerUid: uid,
      approvedBy: approvedBy,
      notes: notes,
      timestamp: serverTimestamp(),
      status: 'verified'
    });

    await batch.commit();
    return {
      success: true,
      message: 'Provider approved successfully'
    };
  } catch (error) {
    console.error('Error approving provider:', error);
    throw new Error('Failed to approve provider');
  }
};

/**
 * Reject a provider
 */
export const rejectProvider = async (uid, rejectedBy, reason) => {
  try {
    const batch = writeBatch(db);

    // Update provider status
    const providerRef = doc(db, 'providers', uid);
    batch.update(providerRef, {
      status: 'rejected',
      rejectedAt: serverTimestamp(),
      rejectionReason: reason,
      rejectedBy: rejectedBy,
      updatedAt: serverTimestamp()
    });

    // Log to audit trail
    const auditRef = doc(collection(db, 'adminAudits'));
    batch.set(auditRef, {
      action: 'provider_rejected',
      providerUid: uid,
      rejectedBy: rejectedBy,
      reason: reason,
      timestamp: serverTimestamp(),
      status: 'rejected'
    });

    await batch.commit();
    return {
      success: true,
      message: 'Provider rejected successfully'
    };
  } catch (error) {
    console.error('Error rejecting provider:', error);
    throw new Error('Failed to reject provider');
  }
};

/**
 * Get admin audit trail
 */
export const getAdminAuditTrail = async (limit_ = 50) => {
  try {
    const q = query(
      collection(db, 'adminAudits'),
      orderBy('timestamp', 'desc'),
      limit(limit_)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate?.() || doc.data().timestamp
    }));
  } catch (error) {
    console.error('Error fetching audit trail:', error);
    throw new Error('Failed to fetch audit trail');
  }
};

/**
 * Search providers by name, email, or license
 */
export const searchProviders = async (searchTerm) => {
  try {
    const q = query(
      collection(db, 'providers'),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    
    const results = snapshot.docs
      .map(doc => ({
        uid: doc.id,
        ...doc.data()
      }))
      .filter(provider => {
        const term = searchTerm.toLowerCase();
        return (
          provider.fullName?.toLowerCase().includes(term) ||
          provider.email?.toLowerCase().includes(term) ||
          provider.licenseNumber?.toLowerCase().includes(term) ||
          provider.hospitalName?.toLowerCase().includes(term)
        );
      });

    return results;
  } catch (error) {
    console.error('Error searching providers:', error);
    throw new Error('Failed to search providers');
  }
};

/**
 * Get admin dashboard statistics
 */
export const getAdminStats = async () => {
  try {
    const allProvidersQ = query(collection(db, 'providers'));
    const allProviders = await getDocs(allProvidersQ);
    
    let pending = 0;
    let verified = 0;
    let rejected = 0;
    let total = allProviders.size;

    allProviders.forEach(doc => {
      const status = doc.data().status;
      if (status === 'pending_verification') pending++;
      else if (status === 'verified') verified++;
      else if (status === 'rejected') rejected++;
    });

    return {
      total,
      pending,
      verified,
      rejected,
      percentageVerified: total > 0 ? Math.round((verified / total) * 100) : 0,
      percentagePending: total > 0 ? Math.round((pending / total) * 100) : 0
    };
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    throw new Error('Failed to fetch admin statistics');
  }
};

/**
 * Check if user is an admin (can be verified via custom claims or admin collection)
 */
export const isUserAdmin = async (uid) => {
  try {
    // Check if user exists in admins collection
    const adminRef = doc(db, 'admins', uid);
    const adminSnap = await getDoc(adminRef);
    return adminSnap.exists();
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

/**
 * Get provider verification progress stats
 */
export const getVerificationStats = async () => {
  try {
    const stats = await getAdminStats();
    const auditTrail = await getAdminAuditTrail(100);

    const approvalRate = auditTrail.filter(a => a.action === 'provider_approved').length;
    const rejectionRate = auditTrail.filter(a => a.action === 'provider_rejected').length;

    return {
      ...stats,
      recentApprovalsCount: approvalRate,
      recentRejectionsCount: rejectionRate,
      avgProcessingTime: '24-48 hours' // Could be calculated from timestamps
    };
  } catch (error) {
    console.error('Error fetching verification stats:', error);
    throw new Error('Failed to fetch verification statistics');
  }
};

/**
 * Export provider data (for reporting/compliance)
 */
export const exportProviderData = async (status = null) => {
  try {
    let providers;
    if (status) {
      providers = await getProvidersByStatus(status);
    } else {
      const q = query(collection(db, 'providers'));
      const snapshot = await getDocs(q);
      providers = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      }));
    }

    return {
      exportDate: new Date().toISOString(),
      totalCount: providers.length,
      data: providers.map(p => ({
        uid: p.uid,
        fullName: p.fullName,
        email: p.email,
        specialization: p.specialization,
        licenseNumber: p.licenseNumber,
        hospitalName: p.hospitalName,
        status: p.status,
        createdAt: p.createdAt,
        verifiedAt: p.verifiedAt || 'N/A',
        rejectionReason: p.rejectionReason || 'N/A'
      }))
    };
  } catch (error) {
    console.error('Error exporting provider data:', error);
    throw new Error('Failed to export provider data');
  }
};
