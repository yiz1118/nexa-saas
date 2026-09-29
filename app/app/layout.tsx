import type { Metadata } from "next";
import { WorkspaceProvider } from "@/components/workspace-provider";
import { AppShell } from "@/components/app-shell";
export const metadata: Metadata = { title: "Workspace demo" };
export default function Layout({ children }: { children: React.ReactNode }) { return <WorkspaceProvider><AppShell>{children}</AppShell></WorkspaceProvider>; }
