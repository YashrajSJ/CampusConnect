export default function Loader({ label = "Loading..." }) {
  return (
    <div className="flex items-center justify-center py-16 text-sm text-slate-500">
      <span className="mr-3 inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-[#00072D]" />
      {label}
    </div>
  );
}
