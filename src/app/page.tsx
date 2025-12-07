'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  Award, TrendingUp, Clock, Target, Brain, CheckCircle2, XCircle,
  PlayCircle, User, LogOut, Trophy, Flame, Trash2, Key, Shield
} from 'lucide-react';

// ============ FIREBASE IMPORTS ============
import {
  getAdminData,
  updateAdminPassword,
  getExaminee,
  getAllExaminees,
  createExaminee,
  updateExaminee,
  deleteExaminee as deleteExamineeFromDB,
  addSession,
  getExamineeSessions,
  checkExamineeExists
} from '@/lib/firebaseService';

const DEFAULT_ADMIN = { email: 'admin@tsok.com', password: 'admin123', name: 'TSOK Admin' };

export default function LETReviewerApp() {
  const [user, setUser] = useState<any>(null);
  const [view, setView] = useState<string>('select-role');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [selectedSpecialization, setSelectedSpecialization] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [quizStartTime, setQuizStartTime] = useState<Date | null>(null);
  const [quizEndTime, setQuizEndTime] = useState<Date | null>(null);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const categories = {
    elementary: {
      name: 'Elementary',
      hasSpecialization: false,
      subjects: [
        { id: 'gen-ed', name: 'General Education', file: 'elementary-general-education.json' },
        { id: 'prof-ed', name: 'Professional Education', file: 'elementary-professional-education.json' },
        { id: 'general-elem', name: 'General Elementary', file: 'elementary-general-elementary.json' },
        { id: 'early-childhood', name: 'Early Childhood Education', file: 'elementary-early-childhood.json' },
        { id: 'sped', name: 'Special Education (SPED)', file: 'elementary-sped.json' }
      ]
    },
    secondary: {
      name: 'Secondary',
      hasSpecialization: false,
      subjects: [
        { id: 'gen-ed', name: 'General Education', file: 'secondary-general-education.json' },
        { id: 'prof-ed', name: 'Professional Education', file: 'secondary-professional-education.json' },
        { id: 'english', name: 'English', file: 'secondary-english.json' },
        { id: 'filipino', name: 'Filipino', file: 'secondary-filipino.json' },
        { id: 'mathematics', name: 'Mathematics', file: 'secondary-mathematics.json' },
        { id: 'science', name: 'Science / General Science', file: 'secondary-science.json' },
        { id: 'social-studies', name: 'Social Studies / Social Science', file: 'secondary-social-studies.json' },
        { id: 'mapeh', name: 'MAPEH', file: 'secondary-mapeh.json' },
        { id: 'tle', name: 'TLE', file: 'secondary-tle.json' },
        { id: 'values-ed', name: 'Values Education', file: 'secondary-values-education.json' }
      ]
    }
  };

  const loadQuestions = async (filename: string) => {
    try {
      const response = await fetch(`/data/${filename}`);
      const data = await response.json();
      const allQuestions: any[] = [];
      data.topics.forEach((topic: any) => {
        topic.questions.forEach((q: any) => allQuestions.push({ ...q, topic: topic.name }));
      });
      const shuffled = allQuestions.sort(() => Math.random() - 0.5).slice(0, 150);
      setQuestions(shuffled);
      setCurrentQuestionIndex(0);
      setUserAnswers([]);
      setQuizStartTime(new Date());
      setQuizEndTime(null);
      setShowResults(false);
    } catch (error) {
      console.error('Error loading questions:', error);
      alert('Failed to load questions. Please try again.');
    }
  };

  const handleAnswer = (answerIndex: number) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setUserAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) setCurrentQuestionIndex(currentQuestionIndex + 1);
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) setCurrentQuestionIndex(currentQuestionIndex - 1);
  };

  // ============ FIREBASE: SUBMIT QUIZ ============
  const handleSubmit = async () => {
    setQuizEndTime(new Date());
    setShowResults(true);

    let correct = 0;
    questions.forEach((q, index) => {
      if (userAnswers[index] === q.correctAnswer) correct++;
    });

    const timeSpent = quizStartTime ? Math.floor((new Date().getTime() - quizStartTime.getTime()) / 1000 / 60) : 0;
    const accuracy = questions.length ? (correct / questions.length * 100).toFixed(2) : '0.00';

    // Save to Firebase
    if (user && user.email && user.role === 'examinee') {
      try {
        setLoading(true);
        await addSession(user.email, {
          date: new Date().toISOString(),
          subject: selectedSubject?.name || 'Unknown',
          correctAnswers: correct,
          accuracy: parseFloat(accuracy),
          timeSpent: timeSpent
        });
        setLoading(false);
      } catch (err) {
        console.error('Error saving progress to Firebase:', err);
        setLoading(false);
      }
    }
  };

  // ============ FIREBASE: EXAMINEE LOGIN ============
  const handleExamineeLogin = async (email: string, name: string, category: string) => {
    try {
      setLoading(true);
      
      // Check if examinee exists
      const exists = await checkExamineeExists(email);
      
      if (!exists) {
        // Create new examinee
        await createExaminee(email, {
          name,
          category,
          role: 'examinee'
        });
      }

      // Set user state
      setUser({ email, name, role: 'examinee', category });
      setView('subject-selection');
      setLoading(false);
    } catch (err) {
      console.error('Error logging in examinee:', err);
      alert('Login failed. Please try again.');
      setLoading(false);
    }
  };

  // ============ FIREBASE: ADMIN LOGIN ============
  const handleAdminLogin = async (email: string, password: string) => {
    try {
      setLoading(true);
      const adminData = await getAdminData();
      
      if (email === adminData.email && password === adminData.password) {
        setUser({ email: adminData.email, name: adminData.name, role: 'admin' });
        setView('admin-dashboard');
      } else {
        alert('Invalid admin credentials');
      }
      setLoading(false);
    } catch (err) {
      console.error('Error logging in admin:', err);
      alert('Admin login failed. Please try again.');
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setView('select-role');
    setSelectedCategory(null);
    setSelectedSubject(null);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setShowResults(false);
  };

  const startQuiz = () => {
    if (selectedSubject) {
      loadQuestions(selectedSubject.file);
      setView('quiz');
    }
  };

  const backToSubjects = () => {
    setView('subject-selection');
    setSelectedSubject(null);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setShowResults(false);
  };

  const retryQuiz = () => {
    if (selectedSubject) {
      loadQuestions(selectedSubject.file);
      setShowResults(false);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;
  const answered = userAnswers.filter((a) => a !== undefined).length;

  // ============ SELECT ROLE VIEW ============
  if (view === 'select-role') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-800 to-green-700 flex items-center justify-center p-4">
        {loading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="text-white text-2xl font-bold">Loading...</div>
          </div>
        )}
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}
          className="max-w-6xl w-full">
          <div className="text-center mb-12">
            <motion.div initial={{ y: -50 }} animate={{ y: 0 }} transition={{ type: 'spring', stiffness: 100 }}>
              <Image src="/logo.png" alt="TSOK Logo" width={150} height={150} className="mx-auto mb-6" />
            </motion.div>
            <h1 className="text-5xl md:text-6xl font-black text-white mb-4 drop-shadow-lg">LET Reviewer Pro</h1>
            <p className="text-xl text-green-100 font-semibold">Teachers Specialists Organization Kuwait (TSOK)</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <RoleCard title="Examinee" description="Take practice tests and track your progress" icon={<User className="w-16 h-16" />}
              onClick={() => setView('examinee-login')} gradientFrom="from-blue-500" gradientTo="to-cyan-600" />
            <RoleCard title="Admin" description="Manage examinees and view analytics" icon={<Shield className="w-16 h-16" />}
              onClick={() => setView('admin-login')} gradientFrom="from-purple-500" gradientTo="to-pink-600" />
          </div>
        </motion.div>
      </div>
    );
  }

  // ============ EXAMINEE LOGIN VIEW ============
  if (view === 'examinee-login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-800 to-green-700 flex items-center justify-center p-4">
        {loading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="text-white text-2xl font-bold">Loading...</div>
          </div>
        )}
        <ExamineeLoginForm onSubmit={handleExamineeLogin} onBack={() => setView('select-role')} />
      </div>
    );
  }

  // ============ ADMIN LOGIN VIEW ============
  if (view === 'admin-login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-800 to-green-700 flex items-center justify-center p-4">
        {loading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="text-white text-2xl font-bold">Loading...</div>
          </div>
        )}
        <AdminLoginForm onSubmit={handleAdminLogin} onBack={() => setView('select-role')} />
      </div>
    );
  }

  // ============ ADMIN DASHBOARD ============
  if (view === 'admin-dashboard' && user?.role === 'admin') {
    return <AdminDashboard user={user} onLogout={handleLogout} />;
  }

  // ============ SUBJECT SELECTION ============
  if (view === 'subject-selection') {
    const category = user?.category;
    const categoryData = category ? categories[category as keyof typeof categories] : null;

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-800 to-green-700 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <UserHeader user={user} onLogout={handleLogout} />

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl shadow-2xl p-8 mb-8">
            <h2 className="text-3xl font-black text-gray-800 mb-6">Select a Subject</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryData?.subjects.map((subject) => (
                <SubjectCard key={subject.id} subject={subject} onClick={() => { setSelectedSubject(subject); setView('quiz-info'); }} />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // ============ QUIZ INFO ============
  if (view === 'quiz-info' && selectedSubject) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-800 to-green-700 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full">
          <div className="text-center mb-8">
            <Brain className="w-20 h-20 text-green-600 mx-auto mb-4" />
            <h2 className="text-4xl font-black text-gray-800 mb-2">{selectedSubject.name}</h2>
            <p className="text-gray-600">Get ready for your practice test!</p>
          </div>

          <div className="space-y-6 mb-8">
            <InfoItem icon={<Target className="w-8 h-8 text-green-600" />} label="Questions" value="150 questions" />
            <InfoItem icon={<Clock className="w-8 h-8 text-green-600" />} label="Time" value="Unlimited" />
            <InfoItem icon={<Award className="w-8 h-8 text-green-600" />} label="Format" value="Multiple Choice" />
          </div>

          <div className="flex space-x-4">
            <button onClick={backToSubjects}
              className="flex-1 bg-gray-200 text-gray-700 py-4 rounded-2xl font-bold text-lg hover:bg-gray-300 transition-all">
              Back
            </button>
            <button onClick={startQuiz}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-2xl font-bold text-lg hover:from-green-700 hover:to-emerald-700 transition-all flex items-center justify-center">
              <PlayCircle className="w-6 h-6 mr-2" />
              Start Quiz
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ============ QUIZ VIEW ============
  if (view === 'quiz' && !showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-800 to-green-700 p-4 md:p-8">
        {loading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="text-white text-2xl font-bold">Saving...</div>
          </div>
        )}
        <div className="max-w-4xl mx-auto">
          <QuizHeader progress={progress} answered={answered} total={questions.length} onBack={backToSubjects} />

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-3xl shadow-2xl p-8 mb-8">
            {currentQuestion && (
              <QuestionCard question={currentQuestion} questionNumber={currentQuestionIndex + 1} selectedAnswer={userAnswers[currentQuestionIndex]}
                onAnswer={handleAnswer} />
            )}
          </motion.div>

          <NavigationControls currentIndex={currentQuestionIndex} totalQuestions={questions.length} onPrevious={handlePrevious}
            onNext={handleNext} onSubmit={handleSubmit} answeredCount={answered} />
        </div>
      </div>
    );
  }

  // ============ RESULTS VIEW ============
  if (showResults) {
    const correctCount = questions.filter((q, i) => userAnswers[i] === q.correctAnswer).length;
    const accuracy = questions.length > 0 ? (correctCount / questions.length * 100).toFixed(2) : '0';
    const timeSpent = quizStartTime && quizEndTime ? Math.floor((quizEndTime.getTime() - quizStartTime.getTime()) / 1000 / 60) : 0;

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-800 to-green-700 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <ResultsView accuracy={parseFloat(accuracy)} correctCount={correctCount} totalQuestions={questions.length} timeSpent={timeSpent}
            questions={questions} userAnswers={userAnswers} onRetry={retryQuiz} onBackToSubjects={backToSubjects} />
        </div>
      </div>
    );
  }

  return null;
}

// ============ COMPONENT DEFINITIONS ============

function RoleCard({ title, description, icon, onClick, gradientFrom, gradientTo }: any) {
  return (
    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onClick}
      className={`bg-gradient-to-br ${gradientFrom} ${gradientTo} rounded-3xl p-8 shadow-2xl text-white transition-all hover:shadow-3xl`}>
      <div className="flex flex-col items-center text-center">
        <div className="mb-6">{icon}</div>
        <h3 className="text-3xl font-black mb-3">{title}</h3>
        <p className="text-lg opacity-90">{description}</p>
      </div>
    </motion.button>
  );
}

function ExamineeLoginForm({ onSubmit, onBack }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('elementary');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email) {
      onSubmit(email.toLowerCase().trim(), name.trim(), category);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
      <div className="text-center mb-8">
        <User className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h2 className="text-3xl font-black text-gray-800">Examinee Login</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-green-200 focus:border-green-500 focus:outline-none"
            placeholder="Juan Dela Cruz" required />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-green-200 focus:border-green-500 focus:outline-none"
            placeholder="juan@example.com" required />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-green-200 focus:border-green-500 focus:outline-none">
            <option value="elementary">Elementary</option>
            <option value="secondary">Secondary</option>
          </select>
        </div>

        <div className="flex space-x-3">
          <button type="button" onClick={onBack}
            className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-300 transition-all">
            Back
          </button>
          <button type="submit"
            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 transition-all">
            Continue
          </button>
        </div>
      </form>
    </motion.div>
  );
}

function AdminLoginForm({ onSubmit, onBack }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(email, password);
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
      <div className="text-center mb-8">
        <Shield className="w-16 h-16 text-purple-600 mx-auto mb-4" />
        <h2 className="text-3xl font-black text-gray-800">Admin Login</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-500 focus:outline-none"
            placeholder="admin@tsok.com" required />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-500 focus:outline-none"
            placeholder="••••••••" required />
        </div>

        <div className="flex space-x-3">
          <button type="button" onClick={onBack}
            className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-300 transition-all">
            Back
          </button>
          <button type="submit"
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all">
            Login
          </button>
        </div>
      </form>
    </motion.div>
  );
}

function UserHeader({ user, onLogout }: any) {
  return (
    <div className="flex justify-between items-center mb-8 bg-white rounded-2xl p-6 shadow-lg">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-full flex items-center justify-center">
          <User className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-lg font-black text-gray-800">{user?.name}</p>
          <p className="text-sm text-gray-600">{user?.email}</p>
        </div>
      </div>
      <button onClick={onLogout}
        className="flex items-center space-x-2 bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition-all">
        <LogOut className="w-5 h-5" />
        <span>Logout</span>
      </button>
    </div>
  );
}

function SubjectCard({ subject, onClick }: any) {
  return (
    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onClick}
      className="bg-gradient-to-br from-green-100 to-emerald-100 p-6 rounded-2xl border-2 border-green-300 hover:border-green-500 transition-all text-left">
      <h3 className="text-xl font-black text-gray-800 mb-2">{subject.name}</h3>
      <p className="text-sm text-gray-600">150 practice questions</p>
    </motion.button>
  );
}

function InfoItem({ icon, label, value }: any) {
  return (
    <div className="flex items-center space-x-4 bg-gray-50 p-4 rounded-xl">
      {icon}
      <div>
        <p className="text-sm text-gray-600">{label}</p>
        <p className="text-lg font-black text-gray-800">{value}</p>
      </div>
    </div>
  );
}

function QuizHeader({ progress, answered, total, onBack }: any) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-black text-gray-800">Practice Test</h2>
        <button onClick={onBack}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-xl font-bold hover:bg-gray-300 transition-all">
          Exit
        </button>
      </div>
      <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
        <span>Progress: {answered}/{total} answered</span>
        <span>{progress.toFixed(0)}% complete</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }}
          className="bg-gradient-to-r from-green-600 to-emerald-600 h-3 rounded-full" />
      </div>
    </div>
  );
}

function QuestionCard({ question, questionNumber, selectedAnswer, onAnswer }: any) {
  return (
    <div>
      <div className="mb-6">
        <span className="text-sm font-bold text-green-600">Question {questionNumber}</span>
        <h3 className="text-2xl font-black text-gray-800 mt-2">{question.question}</h3>
        <p className="text-sm text-gray-500 mt-2">Topic: {question.topic}</p>
      </div>

      <div className="space-y-3">
        {question.options.map((option: string, index: number) => (
          <button key={index} onClick={() => onAnswer(index)}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
              selectedAnswer === index
                ? 'border-green-500 bg-green-50 font-bold'
                : 'border-gray-200 hover:border-green-300 hover:bg-gray-50'
            }`}>
            <span className="font-bold text-green-600 mr-3">{String.fromCharCode(65 + index)}.</span>
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

function NavigationControls({ currentIndex, totalQuestions, onPrevious, onNext, onSubmit, answeredCount }: any) {
  return (
    <div className="flex justify-between items-center">
      <button onClick={onPrevious} disabled={currentIndex === 0}
        className="bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
        Previous
      </button>

      <span className="text-white font-bold">
        Question {currentIndex + 1} of {totalQuestions}
      </span>

      {currentIndex === totalQuestions - 1 ? (
        <button onClick={onSubmit}
          className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 transition-all">
          Submit Test
        </button>
      ) : (
        <button onClick={onNext}
          className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:from-green-700 hover:to-emerald-700 transition-all">
          Next
        </button>
      )}
    </div>
  );
}

function ResultsView({ accuracy, correctCount, totalQuestions, timeSpent, questions, userAnswers, onRetry, onBackToSubjects }: any) {
  const [showReview, setShowReview] = useState(false);

  return (
    <div>
      <div className="bg-white rounded-3xl shadow-2xl p-8 mb-8">
        <div className="text-center mb-8">
          <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-4xl font-black text-gray-800 mb-2">Test Completed!</h2>
          <p className="text-gray-600">Here are your results</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <ResultCard icon={<Award className="w-10 h-10 text-green-600" />} label="Accuracy" value={`${accuracy}%`} />
          <ResultCard icon={<CheckCircle2 className="w-10 h-10 text-green-600" />} label="Correct Answers"
            value={`${correctCount}/${totalQuestions}`} />
          <ResultCard icon={<Clock className="w-10 h-10 text-green-600" />} label="Time Spent" value={`${timeSpent} min`} />
        </div>

        <div className="flex space-x-4">
          <button onClick={onBackToSubjects}
            className="flex-1 bg-gray-200 text-gray-700 py-4 rounded-2xl font-bold text-lg hover:bg-gray-300 transition-all">
            Back to Subjects
          </button>
          <button onClick={() => setShowReview(!showReview)}
            className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all">
            {showReview ? 'Hide Review' : 'Review Answers'}
          </button>
          <button onClick={onRetry}
            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 rounded-2xl font-bold text-lg hover:from-green-700 hover:to-emerald-700 transition-all">
            Retry Quiz
          </button>
        </div>
      </div>

      {showReview && (
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <h3 className="text-2xl font-black text-gray-800 mb-6">Answer Review</h3>
          <div className="space-y-6">
            {questions.map((q: any, index: number) => {
              const userAnswer = userAnswers[index];
              const isCorrect = userAnswer === q.correctAnswer;

              return (
                <div key={index} className={`p-6 rounded-2xl border-2 ${
                  isCorrect ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'
                }`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <span className="text-sm font-bold text-gray-600">Question {index + 1}</span>
                      <h4 className="text-lg font-black text-gray-800 mt-1">{q.question}</h4>
                    </div>
                    {isCorrect ? (
                      <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                    )}
                  </div>

                  <div className="space-y-2">
                    {q.options.map((option: string, optIndex: number) => {
                      const isUserAnswer = userAnswer === optIndex;
                      const isCorrectAnswer = q.correctAnswer === optIndex;

                      return (
                        <div key={optIndex} className={`p-3 rounded-xl ${
                          isCorrectAnswer ? 'bg-green-100 border-2 border-green-500' :
                          isUserAnswer ? 'bg-red-100 border-2 border-red-500' :
                          'bg-white border border-gray-200'
                        }`}>
                          <span className="font-bold mr-2">{String.fromCharCode(65 + optIndex)}.</span>
                          {option}
                          {isCorrectAnswer && <span className="ml-2 text-green-600 font-bold">✓ Correct</span>}
                          {isUserAnswer && !isCorrectAnswer && <span className="ml-2 text-red-600 font-bold">✗ Your Answer</span>}
                        </div>
                      );
                    })}
                  </div>

                  {q.explanation && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <p className="text-sm font-bold text-blue-900 mb-1">Explanation:</p>
                      <p className="text-sm text-blue-800">{q.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function ResultCard({ icon, label, value }: any) {
  return (
    <div className="bg-gradient-to-br from-green-100 to-emerald-100 p-6 rounded-2xl border-2 border-green-300 text-center">
      <div className="flex justify-center mb-3">{icon}</div>
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="text-3xl font-black text-gray-800">{value}</p>
    </div>
  );
}

// ============ ADMIN DASHBOARD ============
function AdminDashboard({ user, onLogout }: any) {
  const [activeTab, setActiveTab] = useState('all');
  const [examinees, setExaminees] = useState<any[]>([]);
  const [selectedExaminee, setSelectedExaminee] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadExaminees();
  }, []);

  const loadExaminees = async () => {
    try {
      setLoading(true);
      const data = await getAllExaminees();
      const examineesList = Object.values(data);
      setExaminees(examineesList);
      setLoading(false);
    } catch (err) {
      console.error('Error loading examinees:', err);
      setLoading(false);
    }
  };

  const deleteExaminee = async (email: string) => {
    try {
      setLoading(true);
      await deleteExamineeFromDB(email);
      await loadExaminees();
      setShowDeleteModal(false);
      setSelectedExaminee(null);
      setLoading(false);
      alert('Examinee deleted successfully');
    } catch (err) {
      console.error('Error deleting examinee:', err);
      alert('Failed to delete examinee');
      setLoading(false);
    }
  };

  const getExamineeStatus = (examinee: any) => {
    if (!examinee.lastActive) return { status: 'Inactive', color: 'red' };
    const daysSince = Math.floor((new Date().getTime() - new Date(examinee.lastActive).getTime()) / (1000 * 60 * 60 * 24));
    if (daysSince <= 3) return { status: 'Active', color: 'green' };
    if (daysSince <= 7) return { status: 'Moderate', color: 'yellow' };
    return { status: 'Inactive', color: 'red' };
  };

  const getAverageAccuracy = (examinee: any) => {
    if (!examinee.sessions || examinee.sessions.length === 0) return '0.00';
    const total = examinee.sessions.reduce((sum: number, s: any) => sum + parseFloat(s.accuracy || 0), 0);
    return (total / examinee.sessions.length).toFixed(2);
  };

  const topExaminees = [...examinees]
    .filter(e => e.sessions && e.sessions.length > 0)
    .sort((a, b) => parseFloat(getAverageAccuracy(b)) - parseFloat(getAverageAccuracy(a)))
    .slice(0, 10);

  const inactiveExaminees = examinees.filter(e => {
    if (!e.lastActive) return true;
    const daysSince = Math.floor((new Date().getTime() - new Date(e.lastActive).getTime()) / (1000 * 60 * 60 * 24));
    return daysSince > 7;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-800 to-green-700 p-4 md:p-8">
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="text-white text-2xl font-bold">Loading...</div>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8 bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-lg font-black text-gray-800">{user?.name}</p>
              <p className="text-sm text-gray-600">Administrator</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button onClick={() => setShowPasswordModal(true)}
              className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-gray-700 transition-all">
              <Key className="w-5 h-5" />
              <span>Change Password</span>
            </button>
            <button onClick={onLogout}
              className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-red-700 transition-all">
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <h2 className="text-3xl font-black text-gray-800 mb-6">Examinee Management</h2>

          <div className="flex space-x-2 mb-6 border-b-2 border-gray-200">
            <TabButton active={activeTab === 'all'} onClick={() => setActiveTab('all')} label={`All (${examinees.length})`} />
            <TabButton active={activeTab === 'top'} onClick={() => setActiveTab('top')} label="Top Performers" />
            <TabButton active={activeTab === 'inactive'} onClick={() => setActiveTab('inactive')} label={`Inactive (${inactiveExaminees.length})`} />
          </div>

          {activeTab === 'all' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-green-100">
                  <tr>
                    <th className="px-4 py-3 text-left font-black text-gray-700">Name</th>
                    <th className="px-4 py-3 text-left font-black text-gray-700">Email</th>
                    <th className="px-4 py-3 text-left font-black text-gray-700">Category</th>
                    <th className="px-4 py-3 text-left font-black text-gray-700">Status</th>
                    <th className="px-4 py-3 text-left font-black text-gray-700">Avg Accuracy</th>
                    <th className="px-4 py-3 text-left font-black text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {examinees.map((examinee, index) => {
                    const status = getExamineeStatus(examinee);
                    return (
                      <tr key={index} className="border-b border-gray-200 hover:bg-green-50">
                        <td className="px-4 py-4 font-medium text-gray-800">{examinee.name}</td>
                        <td className="px-4 py-4 text-gray-600">{examinee.email}</td>
                        <td className="px-4 py-4 text-gray-600">
                          {examinee.category === 'elementary' ? 'Elementary' : 'Secondary'}
                        </td>
                        <td className="px-4 py-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                            status.color === 'green' ? 'bg-green-100 text-green-700' :
                            status.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>{status.status}</span>
                        </td>
                        <td className="px-4 py-4 font-bold text-green-900">{getAverageAccuracy(examinee)}%</td>
                        <td className="px-4 py-4">
                          <button onClick={() => { setSelectedExaminee(examinee); setShowDeleteModal(true); }}
                            className="text-red-600 hover:text-red-800 transition-colors">
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'top' && (
            <div className="space-y-4">
              {topExaminees.map((examinee, index) => (
                <motion.div key={index} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-6 bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl border-2 border-green-300">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-white text-xl ${
                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-600' : 'bg-green-800'
                    }`}>{index + 1}</div>
                    <div>
                      <p className="font-black text-gray-800 text-lg">{examinee.name}</p>
                      <p className="text-sm text-gray-600">{examinee.category === 'elementary' ? 'Elementary' : 'Secondary'}</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-black text-green-900">{getAverageAccuracy(examinee)}%</p>
                    <p className="text-xs text-gray-600">Accuracy</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {activeTab === 'inactive' && (
            <div className="space-y-4">
              {inactiveExaminees.length === 0 ? (
                <div className="text-center py-12">
                  <Trophy className="w-16 h-16 text-green-600 mx-auto mb-4" />
                  <p className="text-xl font-bold text-gray-800">All examinees are active!</p>
                </div>
              ) : (
                inactiveExaminees.map((examinee, index) => {
                  const daysSinceActive =
                    Math.floor(
                      (new Date().getTime() - new Date(examinee.lastActive).getTime()) /
                        (1000 * 60 * 60 * 24)
                    );
                  return (
                    <div key={index} className="flex items-center justify-between p-6 bg-red-50 rounded-2xl border-2 border-red-300">
                      <div>
                        <p className="font-black text-gray-800 text-lg">{examinee.name}</p>
                        <p className="text-sm text-gray-600">{examinee.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-red-600 font-bold">No activity for {daysSinceActive} days</p>
                        <p className="text-sm text-gray-600">Last: {new Date(examinee.lastActive).toLocaleDateString()}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {showPasswordModal && <PasswordChangeModal onClose={() => setShowPasswordModal(false)} />}

        {showDeleteModal && selectedExaminee && (
          <div className="fixed inset-0 bg-green-900 bg-opacity-50 flex items-center justify-center z-50">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl p-8 max-w-md mx-4">
              <h3 className="text-2xl font-black text-gray-800 mb-4">Delete Examinee?</h3>
              <p className="text-gray-600 mb-6">Delete <span className="font-bold">{selectedExaminee.name}</span>? Cannot be undone.</p>
              <div className="flex space-x-3">
                <button onClick={() => { setShowDeleteModal(false); setSelectedExaminee(null); }}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-300 transition-all">Cancel</button>
                <button onClick={() => deleteExaminee(selectedExaminee.email)}
                  className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition-all">Delete</button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, label }: any) {
  return (
    <button onClick={onClick}
      className={`px-6 py-3 font-bold transition-all ${
        active ? 'text-green-600 border-b-4 border-green-600' : 'text-gray-600 hover:text-green-600'
      }`}>
      {label}
    </button>
  );
}

function PasswordChangeModal({ onClose }: { onClose: () => void }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      setLoading(true);
      const adminData = await getAdminData();
      
      if (currentPassword !== adminData.password) {
        setError('Current password is incorrect');
        setLoading(false);
        return;
      }
      
      if (newPassword.length < 6) {
        setError('New password must be at least 6 characters');
        setLoading(false);
        return;
      }
      
      if (newPassword !== confirmPassword) {
        setError('Passwords do not match');
        setLoading(false);
        return;
      }
      
      const success = await updateAdminPassword(newPassword);
      
      if (success) {
        alert('Password changed successfully!');
        onClose();
      } else {
        setError('Failed to change password');
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error changing password:', err);
      setError('Failed to change password.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-green-900 bg-opacity-50 flex items-center justify-center z-50">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl p-8 max-w-md mx-4 w-full">
        <h3 className="text-2xl font-black text-gray-800 mb-6">Change Password</h3>
        {error && <div className="bg-red-100 border-2 border-red-300 text-red-700 px-4 py-3 rounded-xl mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Current Password</label>
            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-green-200 focus:border-green-500 focus:outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">New Password</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-green-200 focus:border-green-500 focus:outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Confirm New Password</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-green-200 focus:border-green-500 focus:outline-none" required />
          </div>
          <div className="flex space-x-3">
            <button type="button" onClick={onClose} disabled={loading}
              className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-300 transition-all disabled:opacity-50">Cancel</button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-gray-600 text-white py-3 rounded-xl font-bold hover:bg-gray-700 transition-all disabled:opacity-50">
              {loading ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
