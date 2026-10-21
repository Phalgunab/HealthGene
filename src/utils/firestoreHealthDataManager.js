/**
 * Firestore Health Data Manager
 * Provides CRUD operations for all health data collections
 */

import {
  db,
  auth,
} from '../firebase';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  addDoc,
  Timestamp,
} from 'firebase/firestore';

/**
 * Get current user ID
 */
const getCurrentUserId = () => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');
  return user.uid;
};

/**
 * HEALTH PROFILE OPERATIONS
 */

export const healthProfileManager = {
  /**
   * Get user's health profile
   */
  async getProfile() {
    const userId = getCurrentUserId();
    const profileRef = doc(db, 'users', userId, 'health_profile', 'main');
    const profileSnap = await getDoc(profileRef);
    return profileSnap.exists() ? profileSnap.data() : null;
  },

  /**
   * Create or update health profile
   */
  async upsertProfile(profileData) {
    const userId = getCurrentUserId();
    const profileRef = doc(db, 'users', userId, 'health_profile', 'main');

    const data = {
      ...profileData,
      updatedAt: Timestamp.now(),
    };

    if (!profileData.createdAt) {
      data.createdAt = Timestamp.now();
    }

    await setDoc(profileRef, data, { merge: true });
    return data;
  },
};

/**
 * MEDICATION OPERATIONS
 */

export const medicationManager = {
  /**
   * Add a new medication
   */
  async addMedication(medicationData) {
    const userId = getCurrentUserId();
    const medsRef = collection(db, 'users', userId, 'medications');

    const data = {
      ...medicationData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      active: true,
      adherence: [],
    };

    const docRef = await addDoc(medsRef, data);
    return { id: docRef.id, ...data };
  },

  /**
   * Get all medications for user
   */
  async getAllMedications() {
    const userId = getCurrentUserId();
    const medsRef = collection(db, 'users', userId, 'medications');
    const q = query(medsRef, orderBy('createdAt', 'desc'));
    const querySnap = await getDocs(q);

    return querySnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  /**
   * Get active medications only
   */
  async getActiveMedications() {
    const userId = getCurrentUserId();
    const medsRef = collection(db, 'users', userId, 'medications');
    const q = query(medsRef, where('active', '==', true), orderBy('createdAt', 'desc'));
    const querySnap = await getDocs(q);

    return querySnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  /**
   * Get single medication
   */
  async getMedication(medicationId) {
    const userId = getCurrentUserId();
    const medRef = doc(db, 'users', userId, 'medications', medicationId);
    const medSnap = await getDoc(medRef);
    return medSnap.exists() ? { id: medSnap.id, ...medSnap.data() } : null;
  },

  /**
   * Update medication
   */
  async updateMedication(medicationId, updates) {
    const userId = getCurrentUserId();
    const medRef = doc(db, 'users', userId, 'medications', medicationId);

    const data = {
      ...updates,
      updatedAt: Timestamp.now(),
    };

    await updateDoc(medRef, data);
    return data;
  },

  /**
   * Mark medication as taken or not taken
   */
  async logAdherence(medicationId, date, taken) {
    const userId = getCurrentUserId();
    const medRef = doc(db, 'users', userId, 'medications', medicationId);
    const medicationData = await this.getMedication(medicationId);

    const adherence = medicationData.adherence || [];
    const existingIndex = adherence.findIndex(
      a => new Date(a.date).toDateString() === new Date(date).toDateString()
    );

    if (existingIndex >= 0) {
      adherence[existingIndex] = { date: Timestamp.fromDate(new Date(date)), taken };
    } else {
      adherence.push({ date: Timestamp.fromDate(new Date(date)), taken });
    }

    await updateDoc(medRef, {
      adherence: adherence.sort((a, b) => b.date - a.date),
      updatedAt: Timestamp.now(),
    });
  },

  /**
   * Delete medication
   */
  async deleteMedication(medicationId) {
    const userId = getCurrentUserId();
    const medRef = doc(db, 'users', userId, 'medications', medicationId);
    await deleteDoc(medRef);
  },
};

/**
 * ALLERGY OPERATIONS
 */

export const allergyManager = {
  /**
   * Add allergy
   */
  async addAllergy(allergyData) {
    const userId = getCurrentUserId();
    const allergiesRef = collection(db, 'users', userId, 'allergies');

    const data = {
      ...allergyData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      confirmed: false,
    };

    const docRef = await addDoc(allergiesRef, data);
    return { id: docRef.id, ...data };
  },

  /**
   * Get all allergies
   */
  async getAllAllergies() {
    const userId = getCurrentUserId();
    const allergiesRef = collection(db, 'users', userId, 'allergies');
    const q = query(allergiesRef, orderBy('createdAt', 'desc'));
    const querySnap = await getDocs(q);

    return querySnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  /**
   * Get critical allergies (Life-threatening)
   */
  async getCriticalAllergies() {
    const userId = getCurrentUserId();
    const allergiesRef = collection(db, 'users', userId, 'allergies');
    const q = query(
      allergiesRef,
      where('severity', '==', 'Life-threatening'),
      orderBy('createdAt', 'desc')
    );
    const querySnap = await getDocs(q);

    return querySnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  /**
   * Get single allergy
   */
  async getAllergy(allergyId) {
    const userId = getCurrentUserId();
    const allergyRef = doc(db, 'users', userId, 'allergies', allergyId);
    const allergySnap = await getDoc(allergyRef);
    return allergySnap.exists() ? { id: allergySnap.id, ...allergySnap.data() } : null;
  },

  /**
   * Update allergy
   */
  async updateAllergy(allergyId, updates) {
    const userId = getCurrentUserId();
    const allergyRef = doc(db, 'users', userId, 'allergies', allergyId);

    const data = {
      ...updates,
      updatedAt: Timestamp.now(),
    };

    await updateDoc(allergyRef, data);
    return data;
  },

  /**
   * Delete allergy
   */
  async deleteAllergy(allergyId) {
    const userId = getCurrentUserId();
    const allergyRef = doc(db, 'users', userId, 'allergies', allergyId);
    await deleteDoc(allergyRef);
  },
};

/**
 * CHRONIC CONDITION OPERATIONS
 */

export const chronicConditionManager = {
  /**
   * Add chronic condition
   */
  async addCondition(conditionData) {
    const userId = getCurrentUserId();
    const conditionsRef = collection(db, 'users', userId, 'chronic_conditions');

    const data = {
      ...conditionData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      medications: [],
    };

    const docRef = await addDoc(conditionsRef, data);
    return { id: docRef.id, ...data };
  },

  /**
   * Get all chronic conditions
   */
  async getAllConditions() {
    const userId = getCurrentUserId();
    const conditionsRef = collection(db, 'users', userId, 'chronic_conditions');
    const q = query(conditionsRef, orderBy('createdAt', 'desc'));
    const querySnap = await getDocs(q);

    return querySnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  /**
   * Get active conditions
   */
  async getActiveConditions() {
    const userId = getCurrentUserId();
    const conditionsRef = collection(db, 'users', userId, 'chronic_conditions');
    const q = query(
      conditionsRef,
      where('status', '==', 'Active'),
      orderBy('createdAt', 'desc')
    );
    const querySnap = await getDocs(q);

    return querySnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  /**
   * Get single condition
   */
  async getCondition(conditionId) {
    const userId = getCurrentUserId();
    const condRef = doc(db, 'users', userId, 'chronic_conditions', conditionId);
    const condSnap = await getDoc(condRef);
    return condSnap.exists() ? { id: condSnap.id, ...condSnap.data() } : null;
  },

  /**
   * Update condition
   */
  async updateCondition(conditionId, updates) {
    const userId = getCurrentUserId();
    const condRef = doc(db, 'users', userId, 'chronic_conditions', conditionId);

    const data = {
      ...updates,
      updatedAt: Timestamp.now(),
    };

    await updateDoc(condRef, data);
    return data;
  },

  /**
   * Delete condition
   */
  async deleteCondition(conditionId) {
    const userId = getCurrentUserId();
    const condRef = doc(db, 'users', userId, 'chronic_conditions', conditionId);
    await deleteDoc(condRef);
  },
};

/**
 * SURGERY OPERATIONS
 */

export const surgeryManager = {
  /**
   * Add surgery record
   */
  async addSurgery(surgeryData) {
    const userId = getCurrentUserId();
    const surgeriesRef = collection(db, 'users', userId, 'surgeries');

    const data = {
      ...surgeryData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      complications: [],
    };

    const docRef = await addDoc(surgeriesRef, data);
    return { id: docRef.id, ...data };
  },

  /**
   * Get all surgeries
   */
  async getAllSurgeries() {
    const userId = getCurrentUserId();
    const surgeriesRef = collection(db, 'users', userId, 'surgeries');
    const q = query(surgeriesRef, orderBy('date', 'desc'));
    const querySnap = await getDocs(q);

    return querySnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  /**
   * Get single surgery
   */
  async getSurgery(surgeryId) {
    const userId = getCurrentUserId();
    const surgRef = doc(db, 'users', userId, 'surgeries', surgeryId);
    const surgSnap = await getDoc(surgRef);
    return surgSnap.exists() ? { id: surgSnap.id, ...surgSnap.data() } : null;
  },

  /**
   * Update surgery
   */
  async updateSurgery(surgeryId, updates) {
    const userId = getCurrentUserId();
    const surgRef = doc(db, 'users', userId, 'surgeries', surgeryId);

    const data = {
      ...updates,
      updatedAt: Timestamp.now(),
    };

    await updateDoc(surgRef, data);
    return data;
  },

  /**
   * Delete surgery
   */
  async deleteSurgery(surgeryId) {
    const userId = getCurrentUserId();
    const surgRef = doc(db, 'users', userId, 'surgeries', surgeryId);
    await deleteDoc(surgRef);
  },
};

/**
 * APPOINTMENT OPERATIONS
 */

export const appointmentManager = {
  /**
   * Add appointment
   */
  async addAppointment(appointmentData) {
    const userId = getCurrentUserId();
    const appointmentsRef = collection(db, 'users', userId, 'appointments');

    const data = {
      ...appointmentData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      attended: false,
      labOrders: [],
    };

    const docRef = await addDoc(appointmentsRef, data);
    return { id: docRef.id, ...data };
  },

  /**
   * Get all appointments
   */
  async getAllAppointments() {
    const userId = getCurrentUserId();
    const appointmentsRef = collection(db, 'users', userId, 'appointments');
    const q = query(appointmentsRef, orderBy('appointmentDate', 'desc'));
    const querySnap = await getDocs(q);

    return querySnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  /**
   * Get upcoming appointments
   */
  async getUpcomingAppointments() {
    const userId = getCurrentUserId();
    const appointmentsRef = collection(db, 'users', userId, 'appointments');
    const now = Timestamp.now();
    const q = query(
      appointmentsRef,
      where('appointmentDate', '>=', now),
      orderBy('appointmentDate', 'asc')
    );
    const querySnap = await getDocs(q);

    return querySnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  /**
   * Get single appointment
   */
  async getAppointment(appointmentId) {
    const userId = getCurrentUserId();
    const aptRef = doc(db, 'users', userId, 'appointments', appointmentId);
    const aptSnap = await getDoc(aptRef);
    return aptSnap.exists() ? { id: aptSnap.id, ...aptSnap.data() } : null;
  },

  /**
   * Update appointment
   */
  async updateAppointment(appointmentId, updates) {
    const userId = getCurrentUserId();
    const aptRef = doc(db, 'users', userId, 'appointments', appointmentId);

    const data = {
      ...updates,
      updatedAt: Timestamp.now(),
    };

    await updateDoc(aptRef, data);
    return data;
  },

  /**
   * Delete appointment
   */
  async deleteAppointment(appointmentId) {
    const userId = getCurrentUserId();
    const aptRef = doc(db, 'users', userId, 'appointments', appointmentId);
    await deleteDoc(aptRef);
  },
};

/**
 * LAB RESULTS OPERATIONS
 */

export const labResultManager = {
  /**
   * Add lab result
   */
  async addLabResult(resultData) {
    const userId = getCurrentUserId();
    const labsRef = collection(db, 'users', userId, 'lab_results');

    const data = {
      ...resultData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      abnormal: false,
    };

    const docRef = await addDoc(labsRef, data);
    return { id: docRef.id, ...data };
  },

  /**
   * Get all lab results
   */
  async getAllLabResults() {
    const userId = getCurrentUserId();
    const labsRef = collection(db, 'users', userId, 'lab_results');
    const q = query(labsRef, orderBy('testDate', 'desc'));
    const querySnap = await getDocs(q);

    return querySnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  /**
   * Get lab results for a specific test (to see trends)
   */
  async getLabResultsForTest(testName) {
    const userId = getCurrentUserId();
    const labsRef = collection(db, 'users', userId, 'lab_results');
    const q = query(
      labsRef,
      where('testName', '==', testName),
      orderBy('testDate', 'desc')
    );
    const querySnap = await getDocs(q);

    return querySnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  /**
   * Get abnormal results
   */
  async getAbnormalResults() {
    const userId = getCurrentUserId();
    const labsRef = collection(db, 'users', userId, 'lab_results');
    const q = query(
      labsRef,
      where('abnormal', '==', true),
      orderBy('testDate', 'desc')
    );
    const querySnap = await getDocs(q);

    return querySnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  /**
   * Get single lab result
   */
  async getLabResult(resultId) {
    const userId = getCurrentUserId();
    const labRef = doc(db, 'users', userId, 'lab_results', resultId);
    const labSnap = await getDoc(labRef);
    return labSnap.exists() ? { id: labSnap.id, ...labSnap.data() } : null;
  },

  /**
   * Update lab result
   */
  async updateLabResult(resultId, updates) {
    const userId = getCurrentUserId();
    const labRef = doc(db, 'users', userId, 'lab_results', resultId);

    const data = {
      ...updates,
      updatedAt: Timestamp.now(),
    };

    await updateDoc(labRef, data);
    return data;
  },

  /**
   * Delete lab result
   */
  async deleteLabResult(resultId) {
    const userId = getCurrentUserId();
    const labRef = doc(db, 'users', userId, 'lab_results', resultId);
    await deleteDoc(labRef);
  },
};

/**
 * REFERENCE DATA OPERATIONS (common medications, lab tests, etc.)
 */

export const referenceDataManager = {
  /**
   * Get all reference medications
   */
  async getReferenceMedications() {
    const medsRef = collection(db, 'reference_data', 'medications', 'medications');
    const querySnap = await getDocs(medsRef);
    return querySnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  /**
   * Get all reference lab tests
   */
  async getReferenceLabTests() {
    const testsRef = collection(db, 'reference_data', 'lab_tests', 'tests');
    const querySnap = await getDocs(testsRef);
    return querySnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  /**
   * Search reference medications by name
   */
  async searchMedications(searchTerm) {
    const medsRef = collection(db, 'reference_data', 'medications', 'medications');
    const querySnap = await getDocs(medsRef);
    const allMeds = querySnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return allMeds.filter(
      med =>
        med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        med.genericName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  },

  /**
   * Search reference lab tests by name
   */
  async searchLabTests(searchTerm) {
    const testsRef = collection(db, 'reference_data', 'lab_tests', 'tests');
    const querySnap = await getDocs(testsRef);
    const allTests = querySnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return allTests.filter(test =>
      test.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  },
};
