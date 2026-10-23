import { SignIn } from "@clerk/clerk-react";
import { GraduationCap } from "lucide-react";

export default function SignInPage() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-[#00072D] p-10 text-white lg:flex">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <GraduationCap className="text-amber-400" /> CampusConnect
        </div>
        <div>
          <h1 className="text-4xl font-semibold leading-tight">Find teammates who match your skills.</h1>
          <p className="mt-4 max-w-md text-slate-300">
            Create projects, browse open teams, and join campus collaborations — built for students.
          </p>
        </div>
        <p className="text-sm text-slate-400">A simple campus collaboration platform.</p>
      </div>
      <div className="flex items-center justify-center p-6">
        <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" fallbackRedirectUrl="/dashboard" />
      </div>
    </div>
  );
}
