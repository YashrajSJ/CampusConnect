import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import api from "../api/client.js";
import SkillPicker from "../components/SkillPicker.jsx";
import Loader from "../components/Loader.jsx";
import {
  COLLABORATION_MODES,
  PROJECT_CATEGORIES,
  PROJECT_ROLES,
  PROJECT_STAGES,
} from "../constants/skills.js";

export default function EditProject() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: PROJECT_CATEGORIES[0],
    targetRole: PROJECT_ROLES[0],
    stage: PROJECT_STAGES[0],
    mode: COLLABORATION_MODES[0],
    commitment: "5-10 hrs/week",
    requiredSkills: [],
    teamSize: 4,
    existingMembersCount: 0,
    deadline: "",
    whatsappNumber: "",
    isOpen: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/projects/${id}`)
      .then((res) => {
        const p = res.data.project;
        setForm({
          title: p.title || "",
          description: p.description || "",
          category: p.category || PROJECT_CATEGORIES[0],
          targetRole: p.targetRole || PROJECT_ROLES[0],
          stage: p.stage || PROJECT_STAGES[0],
          mode: p.mode || COLLABORATION_MODES[0],
          commitment: p.commitment || "5-10 hrs/week",
          requiredSkills: p.requiredSkills || [],
          teamSize: p.teamSize || 4,
          existingMembersCount: p.existingMembersCount || 0,
          deadline: p.deadline ? new Date(p.deadline).toISOString().split("T")[0] : "",
          whatsappNumber: p.whatsappNumber || "",
          isOpen: p.isOpen ?? true,
        });
      })
      .catch((err) => setError(err.response?.data?.message || "Failed to load project"))
      .finally(() => setLoading(false));
  }, [id]);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.put(`/projects/${id}`, form);
      navigate(`/projects/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update project");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Loader label="Loading project settings..." />;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          to={`/projects/${id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#00072D] hover:text-[#0a1744]"
        >
          <ArrowLeft size={13} /> Back to project
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Edit Project Settings
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Update your project requirements, open roles, or manage team recruitment status.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-700">
            {error}
          </div>
        )}

        {/* Section 1: Overview */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#00072D] text-xs font-bold text-white">
              1
            </span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
              Project Overview
            </h2>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Project Title *
            </label>
            <input
              required
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
            />
          </div>

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

          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Description *
            </label>
            <textarea
              required
              rows={4}
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
            />
          </div>
        </div>

        {/* Section 2: Requirements */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#00072D] text-xs font-bold text-white">
              2
            </span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
              Team Requirements
            </h2>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">
              Primary Role Recruited
            </label>
            <select
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 cursor-pointer"
              value={form.targetRole}
              onChange={(e) => update("targetRole", e.target.value)}
            >
              {PROJECT_ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Required Skills
            </label>
            <SkillPicker
              selected={form.requiredSkills}
              onChange={(skills) => update("requiredSkills", skills)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Team Size *
              </label>
              <input
                required
                type="number"
                min={2}
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                value={form.teamSize}
                onChange={(e) => update("teamSize", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Offline Members Already Recruited
              </label>
              <input
                type="number"
                min={0}
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                value={form.existingMembersCount}
                onChange={(e) => update("existingMembersCount", e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Section 3: Logistics & Status */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#00072D] text-xs font-bold text-white">
              3
            </span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
              Logistics & Status
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Deadline
              </label>
              <input
                required
                type="date"
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                value={form.deadline}
                onChange={(e) => update("deadline", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Mode
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

            <div>
              <label className="block text-xs font-semibold text-slate-700">
                Commitment
              </label>
              <input
                className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                value={form.commitment}
                onChange={(e) => update("commitment", e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700">
              WhatsApp Group Number
            </label>
            <input
              type="tel"
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              value={form.whatsappNumber}
              onChange={(e) => update("whatsappNumber", e.target.value)}
            />
            <p className="mt-1 text-[11px] text-emerald-700 flex items-center gap-1 font-medium">
              <ShieldCheck size={13} />
              Only visible to team members.
            </p>
          </div>

          {/* Toggle recruitment status */}
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
            <input
              id="isOpenToggle"
              type="checkbox"
              className="h-4 w-4 accent-[#00072D]"
              checked={form.isOpen}
              onChange={(e) => update("isOpen", e.target.checked)}
            />
            <div>
              <label htmlFor="isOpenToggle" className="cursor-pointer text-xs font-bold text-slate-800">
                Open to new applications
              </label>
              <p className="text-[11px] text-slate-500">
                Uncheck this to pause new join requests without deleting the project.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            to={`/projects/${id}`}
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-[#00072D] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#0a1744] disabled:opacity-60 transition shadow-sm"
          >
            {saving ? "Saving Changes..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
