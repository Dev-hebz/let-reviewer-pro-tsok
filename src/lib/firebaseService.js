import { db } from './firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query,
  orderBy 
} from 'firebase/firestore';

// ==================== ADMIN FUNCTIONS ====================

export const getAdminData = async () => {
  try {
    const adminDoc = await getDoc(doc(db, 'admins', 'admin@tsok.com'));
    if (adminDoc.exists()) {
      return adminDoc.data();
    } else {
      // Create default admin if doesn't exist
      const defaultAdmin = { 
        email: 'admin@tsok.com', 
        password: 'admin123', 
        name: 'TSOK Admin' 
      };
      await setDoc(doc(db, 'admins', 'admin@tsok.com'), defaultAdmin);
      return defaultAdmin;
    }
  } catch (error) {
    console.error('Error getting admin data:', error);
    return { email: 'admin@tsok.com', password: 'admin123', name: 'TSOK Admin' };
  }
};

export const updateAdminPassword = async (newPassword) => {
  try {
    await updateDoc(doc(db, 'admins', 'admin@tsok.com'), {
      password: newPassword
    });
    return true;
  } catch (error) {
    console.error('Error updating admin password:', error);
    return false;
  }
};

// ==================== EXAMINEE FUNCTIONS ====================

export const getExaminee = async (email) => {
  try {
    const examineeDoc = await getDoc(doc(db, 'examinees', email));
    if (examineeDoc.exists()) {
      return examineeDoc.data();
    }
    return null;
  } catch (error) {
    console.error('Error getting examinee:', error);
    return null;
  }
};

export const getAllExaminees = async () => {
  try {
    const examineesSnapshot = await getDocs(collection(db, 'examinees'));
    const examinees = {};
    examineesSnapshot.forEach((doc) => {
      examinees[doc.id] = doc.data();
    });
    return examinees;
  } catch (error) {
    console.error('Error getting all examinees:', error);
    return {};
  }
};

export const createExaminee = async (email, examineeData) => {
  try {
    await setDoc(doc(db, 'examinees', email), {
      ...examineeData,
      email,
      sessions: [],
      streak: 0,
      totalTimeSpent: 0,
      lastActive: new Date().toISOString(),
      registeredDate: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('Error creating examinee:', error);
    return false;
  }
};

export const updateExaminee = async (email, updates) => {
  try {
    await updateDoc(doc(db, 'examinees', email), {
      ...updates,
      lastActive: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('Error updating examinee:', error);
    return false;
  }
};

export const deleteExaminee = async (email) => {
  try {
    // Delete examinee document
    await deleteDoc(doc(db, 'examinees', email));
    
    // Delete all sessions for this examinee
    const sessionsSnapshot = await getDocs(collection(db, 'sessions'));
    const deletePromises = [];
    sessionsSnapshot.forEach((sessionDoc) => {
      if (sessionDoc.data().examineeEmail === email) {
        deletePromises.push(deleteDoc(doc(db, 'sessions', sessionDoc.id)));
      }
    });
    await Promise.all(deletePromises);
    
    return true;
  } catch (error) {
    console.error('Error deleting examinee:', error);
    return false;
  }
};

// ==================== SESSION FUNCTIONS ====================

export const addSession = async (email, sessionData) => {
  try {
    // Get current examinee data
    const examinee = await getExaminee(email);
    if (!examinee) return false;

    // Create session document
    const sessionId = `${email}_${Date.now()}`;
    await setDoc(doc(db, 'sessions', sessionId), {
      ...sessionData,
      examineeEmail: email,
      timestamp: new Date().toISOString()
    });

    // Update examinee's sessions array
    const updatedSessions = [...(examinee.sessions || []), sessionData];
    
    // Calculate new streak
    const today = new Date().toDateString();
    const lastActive = examinee.lastActive ? new Date(examinee.lastActive).toDateString() : null;
    let newStreak = examinee.streak || 0;
    
    if (lastActive !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (lastActive === yesterday.toDateString()) {
        newStreak += 1;
      } else if (lastActive !== today) {
        newStreak = 1;
      }
    }

    // Update examinee document
    await updateDoc(doc(db, 'examinees', email), {
      sessions: updatedSessions,
      streak: newStreak,
      totalTimeSpent: (examinee.totalTimeSpent || 0) + (sessionData.timeSpent || 0),
      lastActive: new Date().toISOString()
    });

    return true;
  } catch (error) {
    console.error('Error adding session:', error);
    return false;
  }
};

export const getExamineeSessions = async (email) => {
  try {
    const examinee = await getExaminee(email);
    return examinee?.sessions || [];
  } catch (error) {
    console.error('Error getting examinee sessions:', error);
    return [];
  }
};

// ==================== UTILITY FUNCTIONS ====================

export const checkExamineeExists = async (email) => {
  try {
    const examinee = await getExaminee(email);
    return examinee !== null;
  } catch (error) {
    console.error('Error checking examinee:', error);
    return false;
  }
};
