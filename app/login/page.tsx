import type { Metadata } from "next";
import { AuthPage } from "@/components/marketing-forms";
export const metadata: Metadata = { title: "Log in to demo" };
export default function Page() { return <AuthPage mode="login"/>; }
