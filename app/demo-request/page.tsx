import type { Metadata } from "next";
import { DemoRequestPage } from "@/components/marketing-forms";
export const metadata: Metadata = { title: "Request a demo" };
export default function Page() { return <DemoRequestPage/>; }
