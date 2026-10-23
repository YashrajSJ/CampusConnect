import { useState } from "react";
import { Check, Search, X } from "lucide-react";
import { PREDEFINED_SKILLS, SKILL_CATEGORIES } from "../constants/skills.js";

export default function SkillPicker({ selected = [], onChange }) {
  const [filterText, setFilterText] = useState("");

  function toggle(skill) {
    if (selected.includes(skill)) {
      onChange(selected.filter((s) => s !== skill));
    } else {
      onChange([...selected, skill]);
    }
  }

  function clearAll() {
    onChange([]);
  }

  const matchesSearch = (skill) =>
    !filterText || skill.toLowerCase().includes(filterText.toLowerCase().trim());

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
      {/* Top row: search & selected count */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Search skills..."
            className="w-full rounded-xl border border-slate-200 bg-white py-1.5 pl-8 pr-2.5 text-xs outline-none focus:border-slate-400"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600">
            {selected.length} selected
          </span>
          {selected.length > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="text-[11px] font-medium text-rose-600 hover:text-rose-800"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Grouped Skills */}
      <div className="space-y-3">
        {Object.entries(SKILL_CATEGORIES).map(([category, skills]) => {
          const visibleSkills = skills.filter(matchesSearch);
          if (visibleSkills.length === 0) return null;

          return (
            <div key={category} className="space-y-1.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {category}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {visibleSkills.map((skill) => {
                  const active = selected.includes(skill);
                  return (
                    <button
                      type="button"
                      key={skill}
                      onClick={() => toggle(skill)}
                      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition ${
                        active
                          ? "border-[#00072D] bg-[#00072D] text-white shadow-sm"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      {active && <Check size={11} strokeWidth={3} className="text-amber-300" />}
                      {skill}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
