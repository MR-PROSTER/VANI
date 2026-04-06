import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import LandingPage from './(landing)/page'

export default async function Home() {


    const cookieStore = await cookies();
    const selectedDomain = cookieStore.get("selected_domain")?.value;

    // If domain already selected, redirect to home page
    if (selectedDomain === "healthcare" || selectedDomain === "finance") {
        redirect("/home");
    }

    // Otherwise show landing page
    return <LandingPage />;
}
