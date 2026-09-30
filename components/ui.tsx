"use client";
import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";
import { usePanelMotion } from "@/components/motion";

export function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "teal" | "amber" | "red" | "blue" }) { return <span className={`badge badge-${tone}`}>{children}</span>; }
export function EmptyState({ icon, title, body, action }: { icon?: React.ReactNode; title: string; body: string; action?: React.ReactNode }) { return <div className="empty-state"><div className="empty-icon" aria-hidden="true">{icon}</div><h3>{title}</h3><p>{body}</p>{action}</div>; }
export function Modal({ title, open, onClose, children }: { title: string; open: boolean; onClose: () => void; children: React.ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { const dialog = ref.current; if (!dialog) return; if (open && !dialog.open) dialog.showModal(); else if (!open && dialog.open) dialog.close(); }, [open]);
  return <dialog className="modal" ref={ref} onClose={onClose} onKeyDown={event => {
    if (event.key !== "Tab") return;
    const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex="0"]'));
    const first = controls[0]; const last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  }} onClick={event => { if (event.target === ref.current) onClose(); }} aria-label={title}><div className="modal-head"><h2>{title}</h2><button type="button" className="icon-button" onClick={onClose} aria-label="Close dialog"><X size={18}/></button></div>{children}</dialog>;
}
export function SectionHeading({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: React.ReactNode }) { return <div className="section-heading"><div>{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h1>{title}</h1>{description && <p>{description}</p>}</div>{action}</div>; }
export function Skeleton({ width = "100%" }: { width?: string }) { return <div className="skeleton" style={{ width }} aria-hidden="true"/>; }

export function Tabs<T extends string | number>({ options, value, onChange, label, children, trailing, headerClassName = "tabs-head" }: {
  options: { value: T; label: string }[]; value: T; onChange: (value: T) => void;
  label: string; children: React.ReactNode; trailing?: React.ReactNode; headerClassName?: string;
}) {
  const id = useId();
  const controls = useRef<(HTMLButtonElement | null)[]>([]);
  const panel = useRef<HTMLDivElement>(null);
  usePanelMotion(panel, value);
  return <><div className={headerClassName}><div className="segmented" role="tablist" aria-label={label}>
    {options.map((option, index) => <button key={option.value} ref={element => { controls.current[index] = element; }} type="button" role="tab"
      id={`${id}-tab-${option.value}`} aria-controls={`${id}-panel`} aria-selected={value === option.value}
      tabIndex={value === option.value ? 0 : -1} className={value === option.value ? "selected" : ""}
      onClick={() => onChange(option.value)} onKeyDown={event => {
        let next = index;
        if (event.key === "ArrowRight") next = (index + 1) % options.length;
        else if (event.key === "ArrowLeft") next = (index - 1 + options.length) % options.length;
        else if (event.key === "Home") next = 0;
        else if (event.key === "End") next = options.length - 1;
        else return;
        event.preventDefault();
        onChange(options[next].value);
        controls.current[next]?.focus();
      }}>{option.label}</button>)}
  </div>{trailing}</div><div ref={panel} role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-tab-${value}`} tabIndex={0}>{children}</div></>;
}
