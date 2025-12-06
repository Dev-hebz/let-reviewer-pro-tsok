# 🔥 FIREBASE CODE UPDATES - STEP BY STEP

Hebz, follow these steps to update `src/app/page.tsx` with Firebase!

---

## ✅ **STEP 1: Update Imports (Top of file)**

**Find this (around line 1-9):**
```javascript
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { 
  Award, TrendingUp, Clock, Target, Brain, CheckCircle2, XCircle,
  PlayCircle, User, LogOut, Trophy, Flame, Trash2, Key, Shield
} from 'lucide-react';
```

**Replace with:**
```javascript
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { 
  Award, TrendingUp, Clock, Target, Brain, CheckCircle2, XCircle,
  PlayCircle, User, LogOut, Trophy, Flame, Trash2, Key, Shield
} from 'lucide-react';

// Firebase imports
import {
  getAdminData,
  updateAdminPassword,
  getExaminee,
  getAllExaminees,
  createExaminee,
  updateExaminee,
  deleteExaminee,
  addSession
} from '@/lib/firebaseService';
```

---

## ✅ **STEP 2: Remove DEFAULT_ADMIN and getAdminData**

**Find and DELETE these lines (around line 11 and 55-60):**
```javascript
const DEFAULT_ADMIN = { email: 'admin@tsok.com', password: 'admin123', name: 'TSOK Admin' };

// ... later in the code ...

const getAdminData = () => {
  const stored = localStorage.getItem('adminData');
  if (stored) return JSON.parse(stored);
  localStorage.setItem('adminData', JSON.stringify(DEFAULT_ADMIN));
  return DEFAULT_ADMIN;
};
```

**DELETE BOTH!** (We're using Firebase functions now)

---

## ✅ **STEP 3: Add Loading State**

**Find the useState declarations (around line 14-23):**
```javascript
export default function LETReviewerApp() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('select-role');
  // ... more states ...
```

**Add this NEW state AFTER the existing ones:**
```javascript
  const [loading, setLoading] = useState(false);
```

---

## ✅ **STEP 4: Update handleExamineeLogin**

**Find handleExamineeLogin function (around line 128-143):**

**OLD CODE:**
```javascript
const handleExamineeLogin = (email, name, category) => {
  const userData = { email, name, role: 'examinee', category };
  setUser(userData);
  
  const userProgress = JSON.parse(localStorage.getItem('userProgress') || '{}');
  if (!userProgress[email]) {
    userProgress[email] = {
      name, email, role: 'examinee', category,
      sessions: [], streak: 0, totalTimeSpent: 0,
      lastActive: new Date().toISOString(),
      registeredDate: new Date().toISOString()
    };
    localStorage.setItem('userProgress', JSON.stringify(userProgress));
  }
  setView('subject-selection');
};
```

**NEW CODE (Replace entire function):**
```javascript
const handleExamineeLogin = async (email, name, category) => {
  setLoading(true);
  try {
    const userData = { email, name, role: 'examinee', category };
    
    // Check if examinee exists in Firebase
    const existingExaminee = await getExaminee(email);
    
    if (!existingExaminee) {
      // Create new examinee in Firebase
      await createExaminee(email, {
        name, 
        role: 'examinee', 
        category
      });
    }
    
    setUser(userData);
    setView('subject-selection');
  } catch (error) {
    console.error('Error during examinee login:', error);
    alert('Login failed. Please try again.');
  } finally {
    setLoading(false);
  }
};
```

---

## ✅ **STEP 5: Update handleAdminLogin**

**Find handleAdminLogin function (around line 145-157):**

**OLD CODE:**
```javascript
const handleAdminLogin = (email, password) => {
  const adminData = getAdminData();
  if (email === adminData.email && password === adminData.password) {
    setUser({ email: adminData.email, name: adminData.name, role: 'admin' });
    setView('admin-dashboard');
  } else {
    alert('Invalid credentials');
  }
};
```

**NEW CODE (Replace entire function):**
```javascript
const handleAdminLogin = async (email, password) => {
  setLoading(true);
  try {
    const adminData = await getAdminData();
    
    if (email === adminData.email && password === adminData.password) {
      setUser({ email: adminData.email, name: adminData.name, role: 'admin' });
      setView('admin-dashboard');
    } else {
      alert('Invalid credentials');
    }
  } catch (error) {
    console.error('Error during admin login:', error);
    alert('Login failed. Please try again.');
  } finally {
    setLoading(false);
  }
};
```

---

## ✅ **STEP 6: Update saveQuizResults**

**Find saveQuizResults function (around line 102-123):**

**OLD CODE:**
```javascript
const saveQuizResults = (results) => {
  const userProgress = JSON.parse(localStorage.getItem('userProgress') || '{}');
  const userEmail = user.email;
  
  if (!userProgress[userEmail]) {
    userProgress[userEmail] = {
      name: user.name, email: userEmail, role: 'examinee',
      category: user.category, sessions: [], streak: 0,
      totalTimeSpent: 0, lastActive: new Date().toISOString(),
      registeredDate: new Date().toISOString()
    };
  }
  
  userProgress[userEmail].sessions.push({
    subject: selectedSubject.name,
    category: selectedCategory,
    score: results.score,
    total: results.total,
    percentage: results.percentage,
    date: new Date().toISOString(),
    timeSpent: results.timeSpent,
    correctAnswers: results.correctAnswers,
    wrongAnswers: results.wrongAnswers
  });
  
  // Update streak and time
  const today = new Date().toDateString();
  const lastActive = userProgress[userEmail].lastActive 
    ? new Date(userProgress[userEmail].lastActive).toDateString() 
    : null;
  
  if (lastActive !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (lastActive === yesterday.toDateString()) {
      userProgress[userEmail].streak += 1;
    } else if (lastActive !== today) {
      userProgress[userEmail].streak = 1;
    }
  }
  
  userProgress[userEmail].totalTimeSpent += results.timeSpent;
  userProgress[userEmail].lastActive = new Date().toISOString();
  
  localStorage.setItem('userProgress', JSON.stringify(userProgress));
};
```

**NEW CODE (Replace entire function):**
```javascript
const saveQuizResults = async (results) => {
  setLoading(true);
  try {
    const sessionData = {
      subject: selectedSubject.name,
      category: selectedCategory,
      score: results.score,
      total: results.total,
      percentage: results.percentage,
      date: new Date().toISOString(),
      timeSpent: results.timeSpent,
      correctAnswers: results.correctAnswers,
      wrongAnswers: results.wrongAnswers
    };
    
    await addSession(user.email, sessionData);
  } catch (error) {
    console.error('Error saving quiz results:', error);
    alert('Failed to save results. Please try again.');
  } finally {
    setLoading(false);
  }
};
```

---

## ✅ **STEP 7: Update handleSubmit**

**Find handleSubmit function (around line 93-100):**

**OLD CODE:**
```javascript
const handleSubmit = () => {
  setQuizEndTime(new Date());
  const results = getQuizResults();
  saveQuizResults(results);
  setShowResults(true);
};
```

**NEW CODE (Replace entire function):**
```javascript
const handleSubmit = async () => {
  setQuizEndTime(new Date());
  const results = getQuizResults();
  await saveQuizResults(results);
  setShowResults(true);
};
```

---

## ✅ **STEP 8: Update AdminDashboard Component**

This is the BIG one! The AdminDashboard needs to load data from Firebase.

**Find AdminDashboard function (around line 590):**

**Find this part:**
```javascript
function AdminDashboard({ onLogout, onChangePassword, onDeleteExaminee }) {
  const [activeTab, setActiveTab] = useState('all');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [examineeToDelete, setExamineeToDelete] = useState(null);

  const userProgress = JSON.parse(localStorage.getItem('userProgress') || '{}');
  const examinees = Object.values(userProgress).filter(u => u.role === 'examinee');
```

**Replace the entire AdminDashboard function with this:**

```javascript
function AdminDashboard({ onLogout, onChangePassword, onDeleteExaminee }) {
  const [activeTab, setActiveTab] = useState('all');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [examineeToDelete, setExamineeToDelete] = useState(null);
  const [examinees, setExaminees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load examinees from Firebase
  useEffect(() => {
    const loadExaminees = async () => {
      setLoading(true);
      try {
        const allExaminees = await getAllExaminees();
        const examineesList = Object.values(allExaminees).filter(u => u.role === 'examinee');
        setExaminees(examineesList);
      } catch (error) {
        console.error('Error loading examinees:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadExaminees();
  }, []);

  // Rest of the function stays the same...
  // (Keep all the other code in AdminDashboard)
```

**Then find where it says:**
```javascript
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-7xl mx-auto">
```

**Add loading check BEFORE the return:**
```javascript
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-2xl font-bold text-green-900">Loading...</div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-7xl mx-auto">
```

---

## ✅ **STEP 9: Update handleDeleteExaminee**

**Find handleDeleteExaminee function (around line 165):**

**OLD CODE:**
```javascript
const handleDeleteExaminee = (email) => {
  if (window.confirm(`Are you sure you want to delete ${email}?`)) {
    const userProgress = JSON.parse(localStorage.getItem('userProgress') || '{}');
    delete userProgress[email];
    localStorage.setItem('userProgress', JSON.stringify(userProgress));
  }
};
```

**NEW CODE (Replace entire function):**
```javascript
const handleDeleteExaminee = async (email) => {
  setLoading(true);
  try {
    await deleteExaminee(email);
    alert('Examinee deleted successfully!');
    // Refresh the page to reload data
    window.location.reload();
  } catch (error) {
    console.error('Error deleting examinee:', error);
    alert('Failed to delete examinee. Please try again.');
  } finally {
    setLoading(false);
  }
};
```

---

## ✅ **STEP 10: Update PasswordChangeModal**

**Find PasswordChangeModal component (around line 740):**

**Find the handleChangePassword function inside PasswordChangeModal:**

**OLD CODE:**
```javascript
const handleChangePassword = () => {
  if (!currentPassword || !newPassword || !confirmPassword) {
    alert('Please fill in all fields');
    return;
  }
  if (newPassword !== confirmPassword) {
    alert('New passwords do not match');
    return;
  }
  if (newPassword.length < 6) {
    alert('Password must be at least 6 characters');
    return;
  }
  
  const adminData = getAdminData();
  if (currentPassword !== adminData.password) {
    alert('Current password is incorrect');
    return;
  }
  
  adminData.password = newPassword;
  localStorage.setItem('adminData', JSON.stringify(adminData));
  alert('Password changed successfully!');
  onClose();
};
```

**NEW CODE (Replace entire function):**
```javascript
const handleChangePassword = async () => {
  if (!currentPassword || !newPassword || !confirmPassword) {
    alert('Please fill in all fields');
    return;
  }
  if (newPassword !== confirmPassword) {
    alert('New passwords do not match');
    return;
  }
  if (newPassword.length < 6) {
    alert('Password must be at least 6 characters');
    return;
  }
  
  try {
    const adminData = await getAdminData();
    if (currentPassword !== adminData.password) {
      alert('Current password is incorrect');
      return;
    }
    
    await updateAdminPassword(newPassword);
    alert('Password changed successfully!');
    onClose();
  } catch (error) {
    console.error('Error changing password:', error);
    alert('Failed to change password. Please try again.');
  }
};
```

---

## ✅ **STEP 11: Update SubjectSelectionView**

**Find SubjectSelectionView component (around line 392):**

**Find this line:**
```javascript
{JSON.parse(localStorage.getItem('userProgress') || '{}')[user.email]?.streak || 0}
```

**Replace with:**
```javascript
0
```

**NOTE:** We'll add a proper streak display later with Firebase, but for now set it to 0.

---

## 🎯 **THAT'S ALL THE CODE CHANGES!**

**Summary of what we changed:**
1. ✅ Added Firebase imports
2. ✅ Removed localStorage DEFAULT_ADMIN
3. ✅ Added loading state
4. ✅ Made handleExamineeLogin async (Firebase)
5. ✅ Made handleAdminLogin async (Firebase)
6. ✅ Made saveQuizResults async (Firebase)
7. ✅ Made handleSubmit async
8. ✅ Updated AdminDashboard to load from Firebase
9. ✅ Made handleDeleteExaminee async (Firebase)
10. ✅ Made password change async (Firebase)
11. ✅ Simplified streak display

**All localStorage replaced with Firebase!** 🔥

---

## 📝 **NEXT STEPS:**

After making these changes:

1. Create `.env.local` file
2. Add your Firebase config
3. Test locally
4. Deploy to Vercel

**I'll help you with each step!** ✅
