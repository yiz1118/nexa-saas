import type { Metadata } from "next";
import { AuthPage } from "@/components/marketing-forms";
export const metadata: Metadata = { title: "Create demo workspace" };
export default function Page() { return <AuthPage mode="signup"/>; }
