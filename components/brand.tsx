import Link from "next/link";

export function Brand({ dark = false }: { dark?: boolean }) {
  return <Link href="/" className={`brand ${dark ? "brand-dark" : ""}`} aria-label="NEXA home">
    <span className="brand-symbol" aria-hidden="true"><span/><span/><span/><span/></span><span>NEXA</span>
  </Link>;
}
