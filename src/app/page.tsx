'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { 
  Award, TrendingUp, Clock, Target, Brain, CheckCircle2, XCircle,
  PlayCircle, User, LogOut, Trophy, Flame, Trash2, Key, Shield
} from 'lucide-react';

const DEFAULT_ADMIN = { email: 'admin@tsok.com', password: 'admin123', name: 'TSOK Admin' };

export default function LETReviewerApp() {
  const [user, setUser] = useState<any>(null);
  const [view, setView] = useState<string>('select-role');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [quizStartTime, setQuizStartTime] = useState<Date | null>(null);
  const [quizEndTime, setQuizEndTime] = useState<Date | null>(null);
  const [showResults, setShowResults] = useState<boolean>(false);

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

  const getAdminData = () => {
  if (typeof window === "undefined") return DEFAULT_ADMIN;
  const stored = localStorage.getItem('adminData');
  if (stored) return JSON.parse(stored);
  localStorage.setItem('adminData', JSON.stringify(DEFAULT_ADMIN));
  return DEFAULT_ADMIN;
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

  const handleSubmit = () => {
    setQuizEndTime(new Date());
    setShowResults(true);
    
    let correct = 0;
    questions.forEach((q, index) => {
      if (userAnswers[index] === q.correctAnswer) correct++;
    });

    const timeSpent = Math.floor((new Date().getTime() - (quizStartTime?.getTime() || 0)) / 1000 / 60);
    const accuracy = (correct / questions.length * 100).toFixed(2);
    
    const userProgress = JSON.parse(localStorage.getItem('userProgress') || '{}');
    if (!userProgress[user.email]) {
      userProgress[user.email] = { sessions: [], streak: 0, totalTimeSpent: 0 };
    }

    userProgress[user.email].sessions.push({
      date: new Date().toISOString(),
      subject: selectedSubject.name,
      correctAnswers: correct,
      accuracy: accuracy,
      timeSpent: timeSpent
    });

    userProgress[user.email].lastActive = new Date().toISOString();
    userProgress[user.email].totalTimeSpent = (userProgress[user.email].totalTimeSpent || 0) + timeSpent;
    localStorage.setItem('userProgress', JSON.stringify(userProgress));
  };

  const handleExamineeLogin = (email: string, name: string, category: string) => {
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

  const handleAdminLogin = (email: string, password: string) => {
    const adminData = getAdminData();
    if (email === adminData.email && password === adminData.password) {
      setUser({ email: adminData.email, name: adminData.name, role: 'admin' });
      setView('admin-dashboard');
      return true;
    }
    return false;
  };

  const handleLogout = () => {
   setUser(null);
    setView('select-role');
    setSelectedCategory(null);
    setSelectedSubject(null);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setQuizStartTime(null);
    setQuizEndTime(null);
    setShowResults(false);
  };

  const startQuiz = (category: string, subject: any) => {
    setSelectedCategory(category);
    setSelectedSubject(subject);
    loadQuestions(subject.file);
    setView('quiz');
  };

  const backToSubjects = () => {
    setView('subject-selection');
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setShowResults(false);
  };

  const getQuizResults = () => {
    if (!showResults) return null;
    let correct = 0;
    questions.forEach((q, index) => {
      if (userAnswers[index] === q.correctAnswer) correct++;
    });
    const timeSpent = (quizEndTime && quizStartTime) ? Math.floor((quizEndTime.getTime() - quizStartTime.getTime()) / 1000 / 60) : 0;
    const accuracy = (correct / questions.length * 100).toFixed(2);
    return { correct, total: questions.length, accuracy, timeSpent };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <header className="bg-gradient-to-r from-green-700 via-green-600 to-emerald-700 text-white shadow-2xl border-b-4 border-green-800">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
              <Image src="/logo.png" alt="TSOK" width={50} height={50} className="rounded-full" />
            </motion.div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">LET Reviewer Pro</h1>
              <p className="text-sm text-green-100 font-medium">TSOK - Teachers Specialists Organization International Kuwait</p>
            </div>
          </div>
          {user && (
            <div className="flex items-center space-x-4">
              <div className="text-right hidden md:block">
                <p className="font-bold text-lg">{user.name}</p>
                <p className="text-sm text-green-100">{user.role === 'admin' ? 'Administrator' : 'Examinee'}</p>
              </div>
              <button onClick={handleLogout} className="bg-white text-green-900 px-4 py-2 rounded-xl font-bold hover:bg-green-50 transition-all shadow-lg flex items-center space-x-2">
                <LogOut className="w-4 h-4" /><span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {view === 'select-role' && <RoleSelectionView onSelectRole={setView} />}
          {view === 'examinee-login' && <ExamineeLoginView onLogin={handleExamineeLogin} categories={categories} />}
          {view === 'admin-login' && <AdminLoginView onLogin={handleAdminLogin} onBack={() => setView('select-role')} />}
          {view === 'subject-selection' && (
            <SubjectSelectionView categories={categories} onStartQuiz={startQuiz} user={user} />
          )}
          {view === 'quiz' && !showResults && questions.length > 0 && (
            <QuizView question={questions[currentQuestionIndex]} questionIndex={currentQuestionIndex} totalQuestions={questions.length}
              userAnswer={userAnswers[currentQuestionIndex]} onAnswer={handleAnswer} onNext={handleNext}
              onPrevious={handlePrevious} onSubmit={handleSubmit} onBack={backToSubjects} />
          )}
          {view === 'quiz' && showResults && (
            <ResultsView results={getQuizResults()} questions={questions} userAnswers={userAnswers} onBack={backToSubjects} />
          )}
          {view === 'admin-dashboard' && <AdminDashboard user={user} />}
        </AnimatePresence>
      </main>

      <footer className="bg-gradient-to-r from-green-900 via-green-800 to-emerald-800 text-white py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <Image src="/logo.png" alt="TSOK" width={60} height={60} className="rounded-full mx-auto mb-4" />
          <p className="text-lg font-bold">LET Reviewer Pro</p>
          <p className="text-green-200 text-sm mt-2">Developed by <span className="font-black">Godmisoft</span> for TSOK</p>
          <p className="text-green-600 text-xs mt-4">© 2024 TSOK. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function RoleSelectionView({ onSelectRole }: { onSelectRole: (role: string) => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-4xl mx-auto">
      <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-green-200">
        <div className="text-center mb-8">
          <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }} className="inline-block mb-6">
            <Image src="/logo.png" alt="TSOK" width={120} height={120} className="rounded-full mx-auto shadow-xl" />
          </motion.div>
          <h2 className="text-4xl font-black text-gray-800 mb-2">Welcome to LET Reviewer Pro!</h2>
          <p className="text-gray-600 text-lg">Select your role to continue</p>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <motion.button whileHover={{ scale: 1.02, y: -5 }} whileTap={{ scale: 0.98 }}
            onClick={() => onSelectRole('examinee-login')}
            className="bg-gradient-to-br from-green-600 to-green-700 text-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all">
            <User className="w-16 h-16 mx-auto mb-4" />
            <h3 className="text-2xl font-black mb-2">Examinee</h3>
            <p className="text-green-100">Take quizzes and track your progress</p>
          </motion.button>
          <motion.button whileHover={{ scale: 1.02, y: -5 }} whileTap={{ scale: 0.98 }}
            onClick={() => onSelectRole('admin-login')}
            className="bg-gradient-to-br from-green-500 to-green-700 text-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all">
            <Shield className="w-16 h-16 mx-auto mb-4" />
            <h3 className="text-2xl font-black mb-2">Administrator</h3>
            <p className="text-gray-100">Manage examinees and view analytics</p>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

function ExamineeLoginView({ onLogin, categories }: { onLogin: (email: string, name: string, category: string) => void, categories: any }) {
  const [email, setEmail] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [category, setCategory] = useState<string>('elementary');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) {
      alert('Please fill in all required fields');
      return;
    }
    onLogin(email, name, category);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-md mx-auto">
      <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-green-200">
        <div className="text-center mb-8">
          <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 2, repeat: Infinity }} className="inline-block mb-4">
            <Image src="/logo.png" alt="TSOK" width={80} height={80} className="rounded-full mx-auto" />
          </motion.div>
          <h2 className="text-3xl font-black text-gray-800 mb-2">Examinee Login</h2>
          <p className="text-gray-600">Enter your information to start</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-green-200 focus:border-green-500 focus:outline-none transition-colors"
              placeholder="Juan Dela Cruz" required />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-green-200 focus:border-green-500 focus:outline-none transition-colors"
              placeholder="juan@example.com" required />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-green-200 focus:border-green-500 focus:outline-none transition-colors">
              <option value="elementary">Elementary</option>
              <option value="secondary">Secondary</option>
            </select>
          </div>
          <button type="submit"
            className="w-full bg-gradient-to-r from-green-700 to-emerald-800 text-white py-4 rounded-xl font-black text-lg hover:from-green-800 hover:to-emerald-900 transition-all shadow-lg hover:shadow-xl transform hover:scale-105">
            Start Reviewing
          </button>
        </form>
      </div>
    </motion.div>
  );
}

function AdminLoginView({ onLogin, onBack }) {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = onLogin(email, password);
    if (!success) setError('Invalid email or password');
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-md mx-auto">
      <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-green-200">
        <div className="text-center mb-8">
          <Shield className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-3xl font-black text-gray-800 mb-2">Admin Login</h2>
          <p className="text-gray-600">Secure access for administrators</p>
        </div>
        {error && <div className="bg-red-100 border-2 border-red-300 text-red-700 px-4 py-3 rounded-xl mb-6">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Admin Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-green-200 focus:border-green-500 focus:outline-none transition-colors"
              placeholder="admin@tsok.com" required />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-green-200 focus:border-green-500 focus:outline-none transition-colors"
              placeholder="Enter password" required />
          </div>
          <div className="flex space-x-3">
            <button type="button" onClick={onBack}
              className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-300 transition-all">Back</button>
            <button type="submit"
              className="flex-1 bg-gradient-to-r from-green-700 to-emerald-800 text-white py-3 rounded-xl font-black hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg">
              Login
            </button>
          </div>
        </form>
        <div className="mt-6 p-4 bg-green-100 rounded-xl">
          <p className="text-xs text-gray-600 text-center">
            Default: <span className="font-bold">admin@tsok.com</span> / <span className="font-bold">admin123</span>
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function SubjectSelectionView({ categories, onStartQuiz, user }) {
  const userCategory = user.category;
  const categoryData = categories[userCategory];
  const allSubjects = [...categoryData.subjects];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-6xl mx-auto">
      <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-green-200 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-black text-gray-800">Choose Your Subject</h2>
            <p className="text-gray-600 mt-2">{categoryData.name}</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="flex items-center space-x-2 text-green-900">
                <Flame className="w-6 h-6" />
                <span className="text-2xl font-black">
                  {JSON.parse(localStorage.getItem('userProgress') || '{}')[user.email]?.streak || 0}
                </span>
              </div>
              <p className="text-xs text-gray-600">Day Streak</p>
            </div>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {allSubjects.map((subject) => (
            <motion.div key={subject.id} whileHover={{ scale: 1.02, y: -5 }} whileTap={{ scale: 0.98 }}
              onClick={() => onStartQuiz(userCategory, subject)}
              className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl p-6 cursor-pointer border-3 border-green-300 hover:border-green-500 transition-all shadow-lg hover:shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-black text-gray-800">{subject.name}</h3>
                <PlayCircle className="w-10 h-10 text-green-900" />
              </div>
              <p className="text-gray-700 font-medium">150 practice questions</p>
              <div className="mt-4 flex items-center text-sm text-gray-600">
                <Clock className="w-4 h-4 mr-2" />
                <span>~90 minutes</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function QuizView({ question, questionIndex, totalQuestions, userAnswer, onAnswer, onNext, onPrevious, onSubmit, onBack }) {
  const progress = ((questionIndex + 1) / totalQuestions * 100).toFixed(1);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-4xl mx-auto">
      <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-green-200">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-bold text-gray-700">Question {questionIndex + 1} of {totalQuestions}</span>
            <span className="text-sm font-bold text-green-900">{progress}% Complete</span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500" />
          </div>
        </div>
        <div className="mb-8">
          <div className="flex items-start space-x-3 mb-6">
            <div className="bg-green-100 rounded-xl p-3">
              <Brain className="w-6 h-6 text-green-900" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-green-900 mb-2">{question.topic}</p>
              <h3 className="text-2xl font-bold text-gray-800">{question.question}</h3>
            </div>
          </div>
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <motion.button key={index} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                onClick={() => onAnswer(index)}
                className={`w-full text-left p-5 rounded-2xl border-3 transition-all font-medium text-lg ${
                  userAnswer === index
                    ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-green-600 shadow-lg'
                    : 'bg-green-50 border-green-200 hover:border-green-400 hover:bg-green-50'
                }`}>
                <div className="flex items-center space-x-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black ${
                    userAnswer === index ? 'bg-white text-green-900' : 'bg-gray-300 text-gray-600'
                  }`}>
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span>{option}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
        <div className="flex justify-between items-center">
          <button onClick={onBack}
            className="px-6 py-3 rounded-xl border-2 border-green-200 font-bold text-gray-700 hover:bg-green-100 transition-all">
            Exit Quiz
          </button>
          <div className="flex space-x-3">
            <button onClick={onPrevious} disabled={questionIndex === 0}
              className="px-6 py-3 rounded-xl bg-gray-200 font-bold text-gray-700 hover:bg-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              Previous
            </button>
            {questionIndex < totalQuestions - 1 ? (
              <button onClick={onNext}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-green-700 to-emerald-800 text-white font-bold hover:from-green-800 hover:to-emerald-900 transition-all shadow-lg">
                Next
              </button>
            ) : (
              <button onClick={onSubmit}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-black hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg text-lg">
                Submit Quiz
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ResultsView({ results, questions, userAnswers, onBack }) {
  const { correct, total, accuracy, timeSpent } = results;
  const isPassed = accuracy >= 75;

  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="max-w-4xl mx-auto">
      <div className={`rounded-3xl shadow-2xl p-8 border-4 mb-8 ${isPassed 
        ? 'bg-gradient-to-br from-green-100 to-emerald-100 border-green-400'
        : 'bg-gradient-to-br from-red-100 to-pink-100 border-red-400'}`}>
        <div className="text-center mb-8">
          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: 3 }} className="inline-block mb-4">
            {isPassed ? <Trophy className="w-24 h-24 text-green-600 mx-auto" /> : <Target className="w-24 h-24 text-red-600 mx-auto" />}
          </motion.div>
          <h2 className="text-4xl font-black text-gray-800 mb-2">{isPassed ? 'Congratulations!' : 'Keep Practicing!'}</h2>
          <p className="text-xl text-gray-700 font-medium">You scored {accuracy}%</p>
        </div>
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
            <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-black text-gray-800">{correct}</p>
            <p className="text-sm text-gray-600 font-medium">Correct</p>
          </div>
          <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
            <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
            <p className="text-3xl font-black text-gray-800">{total - correct}</p>
            <p className="text-sm text-gray-600 font-medium">Wrong</p>
          </div>
          <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
            <Target className="w-8 h-8 text-green-900 mx-auto mb-2" />
            <p className="text-3xl font-black text-gray-800">{accuracy}%</p>
            <p className="text-sm text-gray-600 font-medium">Accuracy</p>
          </div>
          <div className="bg-white rounded-2xl p-6 text-center shadow-lg">
            <Clock className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <p className="text-3xl font-black text-gray-800">{timeSpent}</p>
            <p className="text-sm text-gray-600 font-medium">Minutes</p>
          </div>
        </div>
        <button onClick={onBack}
          className="w-full bg-gradient-to-r from-green-700 to-emerald-800 text-white py-4 rounded-2xl font-black text-lg hover:from-green-800 hover:to-emerald-900 transition-all shadow-lg">
          Back to Subjects
        </button>
      </div>
      <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-green-200">
        <h3 className="text-2xl font-black text-gray-800 mb-6">Answer Review</h3>
        <div className="space-y-6 max-h-[600px] overflow-y-auto pr-4">
          {questions.map((q, index) => {
            const isCorrect = userAnswers[index] === q.correctAnswer;
            return (
              <div key={q.id} className={`p-6 rounded-2xl border-3 ${isCorrect ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
                <div className="flex items-start space-x-3 mb-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-white ${isCorrect ? 'bg-green-600' : 'bg-red-600'}`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-800 mb-2">{q.question}</p>
                    <p className="text-sm text-gray-600 mb-2"><span className="font-bold">Your answer:</span> {q.options[userAnswers[index]] || 'Not answered'}</p>
                    {!isCorrect && <p className="text-sm text-green-700 font-bold">Correct answer: {q.options[q.correctAnswer]}</p>}
                    <p className="text-sm text-gray-700 mt-2 italic">{q.explanation}</p>
                  </div>
                  {isCorrect ? <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" /> : <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

function AdminDashboard({ user }) {
  const [activeTab, setActiveTab] = useState<string>('examinees');
  const [examinees, setExaminees] = useState<any[]>([]);
  const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [selectedExaminee, setSelectedExaminee] = useState<any>(null);

  useEffect(() => { loadExaminees(); }, []);

  const loadExaminees = () => {
    const userProgress = JSON.parse(localStorage.getItem('userProgress') || '{}');
    const examineeList = Object.values(userProgress).filter(u => u.role !== 'admin');
    setExaminees(examineeList);
  };

  const deleteExaminee = (examineeEmail: string) => {
    if (confirm(`Delete ${selectedExaminee?.name}?`)) {
      const userProgress = JSON.parse(localStorage.getItem('userProgress') || '{}');
      delete userProgress[examineeEmail];
      localStorage.setItem('userProgress', JSON.stringify(userProgress));
      loadExaminees();
      setShowDeleteModal(false);
      setSelectedExaminee(null);
    }
  };

  const getExamineeStatus = (examinee: any) => {
    if (!examinee.lastActive) return { status: 'Not Studying', color: 'red' };
    const daysSinceActive = Math.floor((new Date().getTime() - new Date(examinee.lastActive).getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceActive === 0) return { status: 'Active', color: 'green' };
    if (daysSinceActive <= 3) return { status: 'Occasionally Active', color: 'yellow' };
    return { status: 'Not Studying', color: 'red' };
  };

  const getAverageAccuracy = (examinee: any) => {
    if (!examinee.sessions || examinee.sessions.length === 0) return 0;
    const total = examinee.sessions.reduce((sum: number, s: any) => sum + parseFloat(s.accuracy || s.percentage || 0), 0);
    return (total / examinee.sessions.length).toFixed(2);
  };

  const topExaminees = [...examinees].sort((a: any, b: any) => Number(getAverageAccuracy(b)) - Number(getAverageAccuracy(a))).slice(0, 10);
  const inactiveExaminees = examinees.filter((s: any) => getExamineeStatus(s).status === 'Not Studying');

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-green-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-black text-gray-800">Admin Dashboard</h2>
          <button onClick={() => setShowPasswordModal(true)}
            className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-gray-700 transition-all">
            <Key className="w-4 h-4" /><span>Change Password</span>
          </button>
        </div>
        <div className="flex space-x-2 mb-8 border-b-2 border-gray-200">
          {['examinees', 'top', 'inactive'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 font-bold rounded-t-xl transition-all ${activeTab === tab ? 'bg-gray-600 text-white' : 'text-gray-600 hover:bg-green-100'}`}>
              {tab === 'examinees' && 'All Examinees'}
              {tab === 'top' && 'Top Performers'}
              {tab === 'inactive' && 'Inactive Examinees'}
            </button>
          ))}
        </div>

        {activeTab === 'examinees' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-green-100 border-b-2 border-green-200">
                  <th className="px-4 py-3 text-left font-black text-gray-700">Name</th>
                  <th className="px-4 py-3 text-left font-black text-gray-700">Email</th>
                  <th className="px-4 py-3 text-left font-black text-gray-700">Category</th>
                  <th className="px-4 py-3 text-left font-black text-gray-700">Status</th>
                  <th className="px-4 py-3 text-left font-black text-gray-700">Accuracy</th>
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
                const daysSinceActive = Math.floor((new Date() - new Date(examinee.lastActive)) / (1000 * 60 * 60 * 24));
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
  );
}

function PasswordChangeModal({ onClose }) {
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const adminData = JSON.parse(localStorage.getItem('adminData') || '{}');
    if (currentPassword !== adminData.password) { setError('Current password is incorrect'); return; }
    if (newPassword.length < 6) { setError('New password must be at least 6 characters'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return; }
    adminData.password = newPassword;
    localStorage.setItem('adminData', JSON.stringify(adminData));
    alert('Password changed successfully!');
    onClose();
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
            <button type="button" onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-300 transition-all">Cancel</button>
            <button type="submit"
              className="flex-1 bg-gray-600 text-white py-3 rounded-xl font-bold hover:bg-gray-700 transition-all">Change Password</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
