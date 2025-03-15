import Form from "@/components/onboarding/form";
import { stackServerApp } from "@/lib/stack";
import { redirect } from "next/navigation";

export default async function OnboardingPage() {
  const user = await stackServerApp.getUser({ or: "redirect" });

  if (user.clientReadOnlyMetadata?.onboarded) {
    redirect("/dashboard");
  }

  return (
    <div className="w-full flex flex-col gap-8 items-center min-h-svh justify-center">
      <div className="flex flex-col gap-4 text-center">
        <h1 className="text-2xl font-bold">Welcome to Sylvia 👋</h1>
        <div>
          <p>
            I'm your personal AI job coach, here to help you find your next
            opportunity.
          </p>
          <p>
            To tailor job searches and craft your resume, I need a few details
            from you.
          </p>
        </div>
      </div>

      <div className="w-full max-w-md border border-neutral-200 rounded-md p-4">
        <Form />
      </div>

      <p className="text-sm text-neutral-500">
        🔒 Your information is private and will only be used to find jobs and
        create resumes.
      </p>
    </div>
  );
}
