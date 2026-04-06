import { SignIn } from "@clerk/nextjs";

export default function Page() {
    return (
        <div className="text-blue-400 h-screen w-full flex items-center justify-center">
            <SignIn
                routing="path"
                path="/sign-in"
                signUpUrl="/sign-up"
                forceRedirectUrl="/home"
                fallbackRedirectUrl="/home"
                signUpForceRedirectUrl="/home"
                signUpFallbackRedirectUrl="/home"
                appearance={{
                    variables: {
                        colorPrimary: "#14b8a6", // green
                        colorBackground: "#1a1a1a", // dark bg
                        colorText: "#ffffff",
                        borderRadius: "12px",
                    },
                    elements: {
                        card: "bg-[#1a1a1a] shadow-2xl border ",
                        headerTitle: "text-2xl font-bold text-white",
                        headerSubtitle: "text-white",
                        formButtonPrimary:
                            "bg-green-500 hover:bg-green-600 text-white font-semibold",
                        formFieldInput:
                            "bg-zinc-800 border border-zinc-700 text-white focus:ring-2 focus:ring-green-500",
                        socialButtonsBlockButton:
                            "bg-zinc-800 hover:bg-zinc-700 border border-zinc-700",
                        footerActionLink: "text-white hover:text-green-300",
                    },
                }}
            />
        </div>
    );
}

