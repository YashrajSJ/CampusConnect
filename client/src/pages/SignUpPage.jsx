import { SignUp } from "@clerk/clerk-react";
import { GraduationCap } from "lucide-react";

export default function SignUpPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-[#00072D] p-10 text-white lg:flex">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <GraduationCap className="text-amber-400" /> CampusConnect
        </div>

        <div className="space-y-6 my-auto">
          <div className="overflow-hidden rounded-2xl border border-white/10 shadow-xl">
            <img
              src="/campus-banner.png"
              alt="CampusConnect Banner"
              className="w-full h-auto object-cover"
            />
          </div>
          <div>
            <h1 className="text-4xl font-semibold leading-tight">Join a campus project in minutes.</h1>
            <p className="mt-4 max-w-md text-slate-300">
              Sign up with Clerk, complete your skill profile, and start collaborating.
            </p>
          </div>
        </div>

        <p className="text-sm text-slate-400">No passwords stored in MongoDB.</p>
      </div>
      <div className="flex items-center justify-center p-6">
        <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" fallbackRedirectUrl="/dashboard" />
      </div>
    </div>
  );
}
