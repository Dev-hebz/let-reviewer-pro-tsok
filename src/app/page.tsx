"use client";

import { useState, useEffect } from "react";

// -------------------- DEFAULT ADMIN --------------------
const DEFAULT_ADMIN = {
  email: "admin@tsok.com",
  password: "admin123",
  name: "TSOK Admin",
};

// -------------------- DUMMY SUBJECTS --------------------
const SUBJECTS = [
  { id: "prof-ed", name: "Professional Education" },
  { id: "gen-ed", name: "General Education" },
  { id: "major-ed", name: "Major Education" },
];

// -------------------- DUMMY QUESTIONS --------------------
const QUESTIONS: any = {
  "prof-ed": [
    { q: "What is the main purpose of assessment?", a: "To measure learning" },
  ],
  "gen-ed": [
    { q: "Capital of the Philippines?", a: "Manila" },
  ],
  "major-ed": [
    { q: "Another name for pedagogy?", a: "Teaching" },
  ],
};

//-----------------------------------------------------------
// COMPONENT: Role Selection
//-----------------------------------------------------------
function RoleSelectionView({ setView }: any) {
  return (
    <div className="flex flex-col items-center gap-6 p-10">
      <h1 className="text-3xl font-bold text-blue-700">LET Reviewer</h1>
      <button
        onClick={() => setView("examinee-login")}
        className="bg-blue-600 text-white px-6 py-3 rounded-xl w-60"
      >
        I am an Examinee
      </button>
      <button
        onClick={() => setView("admin-login")}
        className="bg-gray-700 text-white px-6 py-3 rounded-xl w-60"
      >
        Admin Login
      </button>
    </div>
  );
}

//-----------------------------------------------------------
// COMPONENT: Examinee Login
//-----------------------------------------------------------
function ExamineeLoginView({ setView, setUser }: any) {
  const [name, setName] = useState("");

  const login = () => {
    if (!name.trim()) return alert("Enter name");
    setUser({ role: "examinee", name });
    setView("select-subject");
  };

  return (
    <div className="p-10 flex flex-col gap-4 max-w-md mx-auto">
      <h2 className="text-2xl font-bold">Examinee Login</h2>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter your name"
        className="border p-3 rounded-xl"
      />
      <button onClick={login} className="bg-blue-600 text-white p-3 rounded-xl">
        Continue
      </button>
    </div>
  );
}

//-----------------------------------------------------------
// COMPONENT: Admin Login
//-----------------------------------------------------------
function AdminLoginView({ setView, setUser }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = () => {
    if (email === DEFAULT_ADMIN.email && password === DEFAULT_ADMIN.password) {
      setUser({ role: "admin", name: DEFAULT_ADMIN.name });
      setView("admin-dashboard");
    } else alert("Invalid admin credentials");
  };

  return (
    <div className="p-10 flex flex-col gap-4 max-w-md mx-auto">
      <h2 className="text-2xl font-bold">Admin Login</h2>
      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border p-3 rounded-xl"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border p-3 rounded-xl"
      />
      <button onClick={login} className="bg-gray-800 text-white p-3 rounded-xl">
        Login
      </button>
    </div>
  );
}

//-----------------------------------------------------------
// COMPONENT: Subject Selection
//-----------------------------------------------------------
function SubjectSelectionView({ setView, setSelectedSubject }: any) {
  return (
    <div className="p-10 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Select Subject</h2>
      <div className="flex flex-col gap-4">
        {SUBJECTS.map((s) => (
          <button
            key={s.id}
            onClick={() => {
              setSelectedSubject(s.id);
              setView("quiz");
            }}
            className="bg-blue-600 text-white p-4 rounded-xl"
          >
            {s.name}
          </button>
        ))}
      </div>
    </div>
  );
}

//-----------------------------------------------------------
// COMPONENT: Quiz
//-----------------------------------------------------------
function QuizView({ subject, setView, setScore }: any) {
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");

  const qlist = QUESTIONS[subject];
  const q = qlist[index];

  const submit = () => {
    if (!answer.trim()) return alert("Enter answer");
    if (answer.toLowerCase() === q.a.toLowerCase()) setScore((s: number) => s + 1);

    if (index + 1 >= qlist.length) setView("results");
    else {
      setAnswer("");
      setIndex(index + 1);
    }
  };

  return (
    <div className="p-10 max-w-xl mx-auto flex flex-col gap-4">
      <h2 className="text-xl font-bold">Question {index + 1}</h2>
      <p className="p-4 bg-gray-100 rounded-xl">{q.q}</p>
      <input
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        placeholder="Type your answer"
        className="border p-3 rounded-xl"
      />
      <button onClick={submit} className="bg-blue-600 text-white p-3 rounded-xl">
        Submit
      </button>
    </div>
  );
}

//-----------------------------------------------------------
// COMPONENT: Results
//-----------------------------------------------------------
function ResultsView({ score, setView }: any) {
  return (
    <div className="p-10 max-w-xl mx-auto text-center">
      <h2 className="text-3xl font-bold">Results</h2>
      <p className="mt-4 text-xl">Your Score: {score}</p>
      <button
        onClick={() => setView("select-role")}
        className="mt-6 bg-blue-600 text-white p-3 rounded-xl"
      >
        Back to Menu
      </button>
    </div>
  );
}

//-----------------------------------------------------------
// COMPONENT: Admin Dashboard
//-----------------------------------------------------------
function AdminDashboard({ user }: any) {
  return (
    <div className="p-10 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold">Admin Dashboard</h2>
      <p className="mt-2">Welcome, {user.name}</p>
      <div className="mt-6 p-6 bg-gray-100 rounded-xl">
        <p className="text-gray-700">More admin features coming soon…</p>
      </div>
    </div>
  );
}

//-----------------------------------------------------------
// MAIN PAGE EXPORT
//-----------------------------------------------------------
export default function LETReviewerApp() {
  const [user, setUser] = useState<any>(null);
  const [view, setView] = useState("select-role");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [score, setScore] = useState(0);

  return (
    <div className="min-h-screen bg-white">
      {view === "select-role" && <RoleSelectionView setView={setView} />}
      {view === "examinee-login" && (
        <ExamineeLoginView setView={setView} setUser={setUser} />
      )}
      {view === "admin-login" && (
        <AdminLoginView setView={setView} setUser={setUser} />
      )}
      {view === "select-subject" && (
        <SubjectSelectionView
          setView={setView}
          setSelectedSubject={setSelectedSubject}
        />
      )}
      {view === "quiz" && (
        <QuizView subject={selectedSubject} setView={setView} setScore={setScore} />
      )}
      {view === "results" && <ResultsView score={score} setView={setView} />}
      {view === "admin-dashboard" && <AdminDashboard user={user} />}
