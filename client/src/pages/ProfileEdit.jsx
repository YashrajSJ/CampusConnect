import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Sparkles } from "lucide-react";
import api from "../api/client.js";
import SkillPicker from "../components/SkillPicker.jsx";
import Loader from "../components/Loader.jsx";
import { PROJECT_ROLES, YEAR_OPTIONS } from "../constants/skills.js";

const emptyForm = {
  name: "",
  college: "",
  branch: "",
  year: "",
  headline: "",
  bio: "",
  preferredRoles: [],
  isOpenToCollaborate: true,
  commitment: "5-10 hrs/week",
  skills: [],
  interests: "",
  github: "",
  linkedin: "",
};

export default function ProfileEdit() {
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/users/me")
      .then((res) => {
        const user = res.data.user;
        setForm({
          name: user.name || "",
          college: user.college || "",
          branch: user.branch || "",
          year: user.year || "",
          headline: user.headline || "",
          bio: user.bio || "",
          preferredRoles: Array.isArray(user.preferredRoles) ? user.preferredRoles : [],
          isOpenToCollaborate:
            user.isOpenToCollaborate !== undefined ? user.isOpenToCollaborate : true,
          commitment: user.commitment || "5-10 hrs/week",
          skills: user.skills || [],
          interests: (user.interests || []).join(", "),
          github: user.github || "",
          linkedin: user.linkedin || "",
        });
      })
      .catch((err) => setError(err.response?.data?.message || "Failed to load profile"))
      .finally(() => setLoading(false));
  }, []);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleRole(role) {
    setForm((prev) => {
      const roles = prev.preferredRoles.includes(role)
        ? prev.preferredRoles.filter((r) => r !== role)
        : [...prev.preferredRoles, role];
      return { ...prev, preferredRoles: roles };
    });
  }

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.put("/users/profile", {
        ...form,
        interests: form.interests,
      });
      navigate("/profile");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Loader label="Loading profile..." />;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          to="/profile"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#00072D] hover:text-[#0a1744]"
        >
          <ArrowLeft size={13} /> Back to profile
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Edit Developer Profile
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Build your student identity so team leads know who you are and what you love building.
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="space-y-6 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm"
      >
        {error && (
          <p className="rounded-xl bg-rose-50 p-3 text-xs font-medium text-rose-700">
            {error}
          </p>
        )}

        {/* Section 1: Academic & Basics */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            1. Basic Information
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Full Name" value={form.name} onChange={(v) => update("name", v)} />
            <Input
              label="Headline / Tagline"
              value={form.headline}
              placeholder="e.g. MERN Stack Enthusiast · Exploring AI"
              onChange={(v) => update("headline", v)}
            />
            <Input
              label="College Name"
              value={form.college}
              placeholder="e.g. Delhi Technological University"
              onChange={(v) => update("college", v)}
            />
            <Input
              label="Branch"
              value={form.branch}
              placeholder="e.g. Computer Science, ECE, IT"
              onChange={(v) => update("branch", v)}
            />
          </div>

          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-slate-700">Year / Batch</span>
            <select
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300"
              value={form.year}
              onChange={(e) => update("year", e.target.value)}
            >
              <option value="">Select current year</option>
              {YEAR_OPTIONS.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-slate-700">
              Bio / About Me
            </span>
            <textarea
              rows={3}
              placeholder="Tell other students about projects you've built, hackathons you've participated in, or technologies you're currently learning..."
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300"
              value={form.bio}
              onChange={(e) => update("bio", e.target.value)}
            />
          </label>
        </div>

        {/* Section 2: Roles & Collaboration Preferences */}
        <div className="space-y-4 border-t border-slate-100 pt-5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            2. Collaboration Preferences
          </h2>

          <div>
            <span className="mb-1.5 block text-xs font-semibold text-slate-700">
              Preferred Roles (select all that apply)
            </span>
            <div className="flex flex-wrap gap-1.5">
              {PROJECT_ROLES.map((role) => {
                const active = form.preferredRoles.includes(role);
                return (
                  <button
                    type="button"
                    key={role}
                    onClick={() => toggleRole(role)}
                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition ${
                      active
                        ? "border-[#00072D] bg-[#00072D] text-white"
                        : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {active && <Check size={11} strokeWidth={3} className="text-amber-300" />}
                    {role}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Availability / Commitment"
              value={form.commitment}
              placeholder="e.g. 5–10 hrs/week, Weekend hackathons"
              onChange={(v) => update("commitment", v)}
            />

            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 mt-4 sm:mt-0">
              <input
                id="isOpenCollab"
                type="checkbox"
                className="h-4 w-4 accent-[#00072D]"
                checked={form.isOpenToCollaborate}
                onChange={(e) => update("isOpenToCollaborate", e.target.checked)}
              />
              <label htmlFor="isOpenCollab" className="cursor-pointer text-xs font-medium text-slate-700">
                Open to joining new projects right now
              </label>
            </div>
          </div>
        </div>

        {/* Section 3: Technical Skills */}
        <div className="space-y-3 border-t border-slate-100 pt-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              3. Technical Skills
            </h2>
            <span className="text-xs text-slate-400">Used for project matching %</span>
          </div>
          <SkillPicker
            selected={form.skills}
            onChange={(skills) => update("skills", skills)}
          />
        </div>

        {/* Section 4: Social Links & Interests */}
        <div className="space-y-4 border-t border-slate-100 pt-5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            4. Links & Extra Interests
          </h2>
          <Input
            label="Interests (comma separated)"
            value={form.interests}
            placeholder="e.g. Hackathons, Open Source, AI research, System Design"
            onChange={(v) => update("interests", v)}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="GitHub Profile URL"
              value={form.github}
              placeholder="https://github.com/username"
              onChange={(v) => update("github", v)}
            />
            <Input
              label="LinkedIn Profile URL"
              value={form.linkedin}
              placeholder="https://linkedin.com/in/username"
              onChange={(v) => update("linkedin", v)}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-5">
          <Link
            to="/profile"
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-[#00072D] px-5 py-2 text-xs font-semibold text-white hover:bg-[#0a1744] disabled:opacity-60 transition shadow-sm"
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Input({ label, value, onChange, placeholder }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-slate-700">{label}</span>
      <input
        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
