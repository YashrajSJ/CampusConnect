import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  Info,
  Lock,
  Plus,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import api from "../api/client.js";
import SkillPicker from "../components/SkillPicker.jsx";
import ProjectCard from "../components/ProjectCard.jsx";
import {
  COLLABORATION_MODES,
  PROJECT_CATEGORIES,
  PROJECT_ROLES,
  PROJECT_STAGES,
} from "../constants/skills.js";

export default function CreateProject() {
  const navigate = useNavigate();
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: PROJECT_CATEGORIES[0],
    targetRole: PROJECT_ROLES[0],
    stage: PROJECT_STAGES[1], // "Planning"
    mode: COLLABORATION_MODES[0], // "Hybrid"
    commitment: "5-10 hrs/week",
    requiredSkills: [],
    teamSize: 4,
    existingMembersCount: 0,
    deadline: "",
    whatsappNumber: "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("Please provide a project title");
      return;
    }
    if (!form.description.trim()) {
      setError("Please provide a description of the project");
      return;
    }
    if (!form.deadline) {
      setError("Please set an application deadline");
      return;
    }
    if (new Date(form.deadline) <= new Date()) {
      setError("Deadline must be a future date");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const res = await api.post("/projects", form);
      navigate(`/projects/${res.data.project._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create project");
    } finally {
      setSaving(false);
    }
  }

  // Virtual project object for live preview
  const previewProject = {
    _id: "preview-id",
    title: form.title || "Your Project Title Here",
    description:
      form.description ||
      "Brief description explaining what you are building, the problem it solves, and how teammates will collaborate.",
    category: form.category,
    targetRole: form.targetRole,
    stage: form.stage,
    mode: form.mode,
    requiredSkills: form.requiredSkills,
    teamSize: Number(form.teamSize) || 4,
    existingMembersCount: Number(form.existingMembersCount) || 0,
    members: [{}], // creator slot
    isOpen: true,
    deadline: form.deadline ? new Date(form.deadline) : new Date(Date.now() + 86400000 * 7),
    creatorId: { name: "You" },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          to="/projects"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#00072D] hover:text-[#0a1744]"
        >
          <ArrowLeft size={13} /> Back to projects
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Create a New Project
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Find student teammates by posting your project idea, required skills, and team roles.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Form Column (7 of 12) */}
        <form onSubmit={onSubmit} className="space-y-6 lg:col-span-7 xl:col-span-8">
          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-700">
              {error}
            </div>
          )}

          {/* Section 1: Project Overview */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#00072D] text-xs font-bold text-white">
                1
              </span>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                Project Overview
              </h2>
            </div>

            {/* Title */}
            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700">
                  Project Title *
                </label>
                <span className="text-[11px] text-slate-400">
                  {form.title.length}/80
                </span>
              </div>
              <input
                required
                maxLength={80}
                placeholder="e.g. Campus Ride Share App, Hackathon AI Health Assistant"
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
              />
            </div>

            {/* Category & Stage */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Category *
                </label>
                <select
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 cursor-pointer"
                  value={form.category}
                  onChange={(e) => update("category", e.target.value)}
                >
                  {PROJECT_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Current Stage
                </label>
                <select
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 cursor-pointer"
                  value={form.stage}
                  onChange={(e) => update("stage", e.target.value)}
                >
                  {PROJECT_STAGES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Detailed Description *
              </label>
              <textarea
                required
                rows={4}
                placeholder="Describe what your project does, what problem it solves, what progress you've made, and what parts you need help building..."
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition"
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
              />
              <p className="mt-1 text-[11px] text-slate-400">
                Tip: Clear descriptions receive 3x more relevant applicants.
              </p>
            </div>
          </div>

          {/* Section 2: Team Requirements */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#00072D] text-xs font-bold text-white">
                2
              </span>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                Team & Skill Requirements
              </h2>
            </div>

            {/* Target Role Recruited */}
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Primary Role Needed *
              </label>
              <select
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 cursor-pointer"
                value={form.targetRole}
                onChange={(e) => update("targetRole", e.target.value)}
              >
                {PROJECT_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            {/* Required Skills Picker */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Required Technical Skills
                </label>
                <span className="text-[11px] text-slate-400">
                  Applicants will be scored on these
                </span>
              </div>
              <SkillPicker
                selected={form.requiredSkills}
                onChange={(skills) => update("requiredSkills", skills)}
              />
            </div>

            {/* Team Size & Offline Members */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Total Team Size *
                </label>
                <input
                  required
                  type="number"
                  min={2}
                  max={20}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  value={form.teamSize}
                  onChange={(e) => update("teamSize", e.target.value)}
                />
                <p className="mt-1 text-[11px] text-slate-400">
                  Total member slots including you (minimum 2).
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Offline Friends Already on Team
                </label>
                <input
                  type="number"
                  min={0}
                  max={Math.max(0, Number(form.teamSize) - 1)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  value={form.existingMembersCount}
                  onChange={(e) => update("existingMembersCount", e.target.value)}
                />
                <p className="mt-1 text-[11px] text-slate-400">
                  Classmates who agreed offline (reserves slots).
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Logistics & Contact */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#00072D] text-xs font-bold text-white">
                3
              </span>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
                Logistics & Team Contact
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {/* Deadline */}
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Application Deadline *
                </label>
                <input
                  required
                  type="date"
                  min={tomorrowStr}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  value={form.deadline}
                  onChange={(e) => update("deadline", e.target.value)}
                />
              </div>

              {/* Collaboration Mode */}
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Collaboration Mode
                </label>
                <select
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 cursor-pointer"
                  value={form.mode}
                  onChange={(e) => update("mode", e.target.value)}
                >
                  {COLLABORATION_MODES.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              {/* Time Commitment */}
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Expected Commitment
                </label>
                <input
                  placeholder="e.g. 5-8 hrs/week"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  value={form.commitment}
                  onChange={(e) => update("commitment", e.target.value)}
                />
              </div>
            </div>

            {/* WhatsApp Group Contact */}
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                WhatsApp Group / Phone Number (Optional)
              </label>
              <input
                type="tel"
                placeholder="e.g. +91 98765 43210 or chat link"
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                value={form.whatsappNumber}
                onChange={(e) => update("whatsappNumber", e.target.value)}
              />
              <p className="mt-1 text-[11px] text-emerald-700 flex items-center gap-1 font-medium">
                <ShieldCheck size={13} />
                Privacy Protected: Only revealed to applicants after you accept them into the team.
              </p>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              to="/projects"
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-[#00072D] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#0a1744] disabled:opacity-60 transition shadow-sm"
            >
              {saving ? "Publishing Project..." : "Publish Project"}
            </button>
          </div>
        </form>

        {/* Live Preview Column (5 of 12) */}
        <div className="space-y-4 lg:col-span-5 xl:col-span-4">
          <div className="sticky top-24 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Eye size={14} className="text-amber-500" /> Live Card Preview
              </span>
              <span className="text-[10px] font-normal text-slate-400 lowercase">
                updates in real-time
              </span>
            </div>

            <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-2">
              <ProjectCard project={previewProject} />
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-3.5 text-xs text-slate-500 space-y-1">
              <p className="font-semibold text-slate-700 flex items-center gap-1">
                <Info size={12} className="text-amber-500" /> Creator Guarantee:
              </p>
              <p className="text-[11px] leading-relaxed">
                As the project creator, you will automatically be added as the team lead. You can review all join requests before accepting any candidate.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
