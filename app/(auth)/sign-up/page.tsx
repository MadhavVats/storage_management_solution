import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <SignUp 
        appearance={{
          elements: {
            formButtonPrimary: "bg-brand hover:bg-brand-600 text-white",
            card: "shadow-lg",
            headerTitle: "text-2xl font-semibold text-gray-900",
            headerSubtitle: "text-gray-600",
            socialButtonsBlockButton: "border border-gray-300 hover:bg-gray-50",
            socialButtonsBlockButtonText: "text-gray-700",
            formFieldInput: "border border-gray-300 focus:border-brand focus:ring-brand",
            footerActionLink: "text-brand hover:text-brand-600"
          }
        }}
      />
    </div>
  );
}
