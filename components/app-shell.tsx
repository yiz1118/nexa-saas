"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Activity, ArrowLeft, ArrowUpRight, BarChart3, BookOpenText, ChevronDown, FileText, LayoutDashboard, Menu, MessageSquareText, Settings2, Sparkles, UsersRound, Workflow, X } from "lucide-react";
import { Brand } from "@/components/brand";
import { useWorkspace } from "@/components/workspace-provider";
import { Skeleton } from "@/components/ui";

const items = [
  { href: "/app", label: "Overview", icon: LayoutDashboard },
  { href: "/app/documents", label: "Documents", icon: FileText },
  { href: "/app/knowledge", label: "Knowledge base", icon: BookOpenText },
  { href: "/app/chat", label: "AI chat", icon: MessageSquareText },
  { href: "/app/workflows", label: "Workflows", icon: Workflow },
  { href: "/app/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/app/team", label: "Team", icon: UsersRound },
  { href: "/app/settings", label: "Settings", icon: Settings2 },
];
function subscribeViewport(callback: () => void) {
  const media = window.matchMedia("(max-width: 768px)");
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}
export function AppShell({ children }: { children: React.ReactNode }) {
  const path = usePathname(); const { state, ready, storageIssue, reset } = useWorkspace(); const [open, setOpen] = useState(false); const firstLink = useRef<HTMLAnchorElement>(null); const menuButton = useRef<HTMLButtonElement>(null);
  const sidebar = useRef<HTMLElement>(null);
  const mobile = useSyncExternalStore(subscribeViewport, () => window.matchMedia("(max-width: 768px)").matches, () => false);
  useEffect(() => { if (open) firstLink.current?.focus(); }, [open]);
  useEffect(() => {
    if (!open || !mobile) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setOpen(false); requestAnimationFrame(() => menuButton.current?.focus()); }
      if (event.key === "Tab") {
        const focusable = Array.from(sidebar.current?.querySelectorAll<HTMLElement>("a,button:not([disabled])") ?? []);
        const first = focusable[0]; const last = focusable.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    window.addEventListener("keydown", close);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener("keydown", close); };
  }, [open, mobile]);
  const title = items.find(item => item.href === path)?.label ?? "Workspace";
  return <div className="app-shell"><a href="#main-content" className="skip-link">Skip to content</a>{open && <button className="sidebar-backdrop" type="button" onClick={() => setOpen(false)} aria-label="Close navigation"/>}<aside ref={sidebar} inert={mobile && !open} role={mobile && open ? "dialog" : undefined} aria-modal={mobile && open ? true : undefined} className={`app-sidebar ${open ? "sidebar-open" : ""}`} aria-label="Workspace navigation"><div className="app-sidebar-top"><Brand dark/><button type="button" className="sidebar-close icon-button" onClick={() => setOpen(false)} aria-label="Close navigation"><X size={19}/></button></div><div className="workspace-switch"><div className="workspace-icon">N</div><div><strong>{ready ? state.workspace : "Loading workspace"}</strong><span>Concept workspace</span></div><ChevronDown size={15} aria-hidden="true"/></div><div className="sidebar-label">WORKSPACE</div><nav className="app-nav" aria-label="App navigation">{items.slice(0, 6).map((item, index) => <Link ref={index === 0 ? firstLink : undefined} key={item.href} href={item.href} onClick={() => setOpen(false)} className={path === item.href ? "active" : ""} aria-current={path === item.href ? "page" : undefined} aria-label={item.label}><item.icon size={18} strokeWidth={1.8}/>{item.label}{item.label === "AI chat" && <span className="nav-sparkle" aria-hidden="true"><Sparkles size={12}/></span>}</Link>)}</nav><div className="sidebar-label manage-label">MANAGE</div><nav className="app-nav" aria-label="Management navigation">{items.slice(6).map(item => <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className={path === item.href ? "active" : ""} aria-current={path === item.href ? "page" : undefined} aria-label={item.label}><item.icon size={18} strokeWidth={1.8}/>{item.label}</Link>)}</nav><div className="sidebar-spacer"/><div className="sidebar-tip"><div><Activity size={17}/><span>DEMO MODE</span></div><p>Explore a fictional workspace. AI responses and workflow runs are prepared examples.</p><Link href="/product">About the concept <span className="sidebar-concept-arrow" aria-hidden="true"><ArrowUpRight size={12} strokeWidth={1.8} aria-hidden="true"/></span></Link></div><div className="sidebar-profile"><div className="avatar avatar-teal">{state.name.split(" ").map(part => part[0]).slice(0, 2).join("").toUpperCase()}</div><div><strong>{state.name}</strong><span>Local demo visitor</span></div><span className="profile-dot"/></div></aside><div className="app-main-column" inert={mobile && open}><header className="app-topbar"><div><button ref={menuButton} type="button" className="mobile-menu icon-button" onClick={() => setOpen(true)} aria-label="Open navigation" aria-expanded={open}><Menu size={20}/></button><span className="topbar-breadcrumb">Workspace <span>/</span> <strong>{title}</strong></span></div><div className="topbar-right"><span className="topbar-concept">CONCEPT PROJECT</span><Link href="/" className="topbar-website"><ArrowLeft size={14}/> Website</Link><div className="avatar avatar-small avatar-teal" aria-hidden="true">{state.name[0]}</div></div></header>{storageIssue && <div className="storage-banner" role="alert"><strong>{storageIssue === "invalid" ? "Saved demo data needs a reset." : "Browser storage is unavailable."}</strong><span>{storageIssue === "invalid" ? "Your saved state could not be loaded. Reset to recover the sample workspace." : "Changes remain available only during this visit."}</span>{storageIssue === "invalid" && <button type="button" onClick={reset}>Reset demo</button>}</div>}<main id="main-content" className="app-content">{ready ? children : <div className="app-loading" aria-label="Loading workspace"><Skeleton width="32%"/><Skeleton width="60%"/><Skeleton/><Skeleton/></div>}</main><footer className="app-footer">NEXA CONCEPT PROJECT · {state.documents.length} DOCUMENTS IN THIS BROWSER <span>Sample data · Local changes</span></footer></div></div>;
}


