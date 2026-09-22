import { lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./layouts/AppLayout.jsx";
import Landing from "./pages/Landing.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import NotFound from "./pages/NotFound.jsx";
import Login from "./pages/Login.jsx";


// Heavier pages (markdown + KaTeX, charts, upload) load on demand.
const Tutor = lazy(() => import("./pages/Tutor.jsx"));
const Materials = lazy(() => import("./pages/Materials.jsx"));
const Quiz = lazy(() => import("./pages/Quiz.jsx"));
const Progress = lazy(() => import("./pages/Progress.jsx"));
const Exams = lazy(() => import("./pages/Exams.jsx"));
const Settings = lazy(() => import("./pages/Settings.jsx"));

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tutor" element={<Tutor />} />
        <Route path="/materials" element={<Materials />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/exams" element={<Exams />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      <Route path="/home" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
