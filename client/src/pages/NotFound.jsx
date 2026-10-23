import { Link } from "react-router-dom";
import { GraduationCap, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
      <div className="text-center">
        {/* Logo */}
        <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#00072D] text-amber-400 shadow-md">
          <GraduationCap size={32} />
        </span>

        {/* 404 text */}
        <p className="mt-6 text-8xl font-black text-slate-200 select-none">404</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">Page not found</h1>
        <p className="mt-2 text-slate-500">
          The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Actions */}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-xl bg-[#00072D] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#0a1744] transition-colors shadow-sm"
          >
            <Home size={16} className="text-amber-400" />
            Go to Dashboard
          </Link>
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Browse Projects
          </Link>
        </div>
      </div>
    </div>
  );
}
