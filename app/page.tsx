"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

/**
 * DR. COSTI HOUSE OF BEAUTY — MAIN SITE WIREFRAME
 * Immersive, Netflix-style hub that aggregates all Houses, Academy, and Shop.
 * - Sticky navigation (desktop + mobile floating bottom nav)
 * - Hero autoplay trailer with rotating taglines
 * - Sections per Strategic Framework & IA
 * - Reusable Netflix-style Row & TeaserCard primitives
 * - Unified luxury footer
 */

// ————————————————————————————
// Shared primitives (Rows + Teaser Cards)
// ————————————————————————————
export function Row({ title, dark = false, children }: { title: string; dark?: boolean; children: React.ReactNode }) {
  const rowRef = useRef<HTMLDivElement | null>(null);
  const scrollBy = (dir: number) => () => {
    const el = rowRef.current;
    if (!el) return;
    const amount = Math.min(720, el.clientWidth * 0.9);
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  };
  return (
    <section className={`py-14 px-6 ${dark ? "bg-[#18483D] text-[#F8F4ED]" : "bg-[#F8F4ED] text-[#18483D]"}`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-3xl md:text-4xl font-serif tracking-[0.015em] ${dark ? "text-[#F8F4ED]" : "text-[#18483D]"}`}>{title}</h2>
          <div className="hidden md:flex gap-2">
            <button aria-label="Prev" onClick={scrollBy(-1)} className={`h-8 w-8 rounded-full border ${dark ? "border-[#F8F4ED]/30 hover:border-[#F8F4ED]" : "border-[#18483D]/30 hover:border-[#18483D]"} grid place-items-center`}>‹</button>
            <button aria-label="Next" onClick={scrollBy(1)} className={`h-8 w-8 rounded-full border ${dark ? "border-[#F8F4ED]/30 hover:border-[#F8F4ED]" : "border-[#18483D]/30 hover:border-[#18483D]"} grid place-items-center`}>›</button>
          </div>
        </div>
        <div ref={rowRef} className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-[#C6A77B]/60 hover:scrollbar-thumb-[#18483D]/80 snap-x snap-mandatory">
          {children}
        </div>
      </div>
    </section>
  );
}

export function TeaserCard({ title, teaser, poster, desc, cta }: { title: string; teaser: string; poster: string; desc?: string; cta?: string }) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const el = cardRef.current;
    if (!el || !videoRef.current) return;
    const io = new IntersectionObserver(([entry]) => {
      if (!videoRef.current) return;
      if (entry.isIntersecting && !hovered) videoRef.current.play().catch(() => {});
      else if (!hovered) videoRef.current.pause();
    }, { threshold: 0.6 });
    io.observe(el);
    return () => io.disconnect();
  }, [hovered]);

  const onEnter = () => {
    setHovered(true);
    const vid = videoRef.current; if (vid) { vid.currentTime = 0; vid.play().catch(() => {}); }
  };
  const onLeave = () => { setHovered(false); videoRef.current?.pause(); };

  return (
    <div ref={cardRef} onMouseEnter={onEnter} onMouseLeave={onLeave} className="group relative min-w-[280px] w-[280px] aspect-[16/9] rounded-2xl shadow-lg overflow-hidden transition-transform snap-start hover:scale-110 hover:z-20 bg-[#D8C2A0]">
      <video ref={videoRef} src={teaser} poster={poster} muted loop playsInline className="absolute inset-0 h-full w-full object-cover opacity-85 group-hover:opacity-100 transition-opacity" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <h3 className="text-lg md:text-xl font-serif text-[#F8F4ED] drop-shadow">{title}</h3>
        {desc && <p className="text-xs md:text-sm text-[#F8F4ED]/90 line-clamp-2 group-hover:line-clamp-none group-hover:whitespace-normal">{desc}</p>}
        <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
          {cta && <button className="px-3 py-1 text-xs rounded bg-[#2E5E56] text-[#F8F4ED]">{cta}</button>}
          <button className="px-3 py-1 text-xs rounded border border-[#F8F4ED]/70 text-[#F8F4ED]">Details</button>
        </div>
      </div>
    </div>
  );
}

// ————————————————————————————
// Sticky Nav + Mobile Bottom Nav
// ————————————————————————————
function StickyNav() {
  return (
    <header className="fixed top-0 left-0 right-0 z-40 backdrop-blur bg-[#F8F4ED]/80 border-b border-[#D8C2A0]">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-6">
          <div className="font-serif text-xl tracking-[0.015em] text-[#18483D]">Dr. Costi House of Beauty</div>
          <nav className="hidden md:flex items-center gap-5 text-[#18483D] text-sm">
            <a className="hover:underline underline-offset-4" href="#home">Home</a>
            <a className="hover:underline underline-offset-4" href="#experience">The Experience</a>
            <div className="relative group">
              <button className="hover:underline underline-offset-4">Our Houses ▾</button>
              <div className="absolute hidden group-hover:block bg-white shadow-xl rounded-lg mt-2 p-3 text-[#18483D]">
                <a className="block px-3 py-1 hover:bg-[#F8F4ED] rounded" href="#facials">Facials</a>
                <a className="block px-3 py-1 hover:bg-[#F8F4ED] rounded" href="#skin">Skin & Cosmetics</a>
                <a className="block px-3 py-1 hover:bg-[#F8F4ED] rounded" href="#slimming">Slimming & Body</a>
                <a className="block px-3 py-1 hover:bg-[#F8F4ED] rounded" href="#wellness">Wellness</a>
                <a className="block px-3 py-1 hover:bg-[#F8F4ED] rounded" href="#academy">The Academy</a>
                <a className="block px-3 py-1 hover:bg-[#F8F4ED] rounded" href="#shop">Shop</a>
              </div>
            </div>
            <a className="hover:underline underline-offset-4" href="#academy">The Academy</a>
            <a className="hover:underline underline-offset-4" href="#shop">Shop</a>
            <a className="hover:underline underline-offset-4" href="#journal">Journal</a>
            <a className="hover:underline underline-offset-4" href="#concierge">Concierge Access (VIP)</a>
          </nav>
        </div>
        <div className="hidden md:flex items-center gap-4">
          <Button className="bg-[#2E5E56] text-[#F8F4ED]">Book Now</Button>
          <select className="text-sm bg-transparent border border-[#D8C2A0] rounded px-2 py-1 text-[#18483D]"><option>EN</option><option>AR</option></select>
          <button className="text-sm text-[#18483D] hover:underline">Log In / My Profile</button>
        </div>
        <div className="md:hidden">
          <Button className="bg-[#2E5E56] text-[#F8F4ED]">Book</Button>
        </div>
      </div>
    </header>
  );
}

function MobileBottomNav() {
  return (
    <nav className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 bg-white/90 shadow-2xl rounded-2xl px-4 py-2 flex gap-4 text-[#18483D] md:hidden">
      {[
        {label: "Home", href: "#home"},
        {label: "Book", href: "#book"},
        {label: "Shop", href: "#shop"},
        {label: "AI Skin Test", href: "#ai"},
        {label: "Profile", href: "#profile"},
      ].map((i) => (
        <a key={i.label} href={i.href} className="text-sm">{i.label}</a>
      ))}
    </nav>
  );
}

// ————————————————————————————
// Page
// ————————————————————————————
export default function MainSite() {
  // Rotating tagline
  const taglines = [
    "Where Science Enhances Beauty",
    "Your Face, Your Formula",
    "Luxury Wellness, Redefined",
  ];
  const [ti, setTi] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTi((p) => (p + 1) % taglines.length), 2800);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="bg-[#F8F4ED] text-[#18483D] font-sans">
      <StickyNav />
      <MobileBottomNav />

      {/* HERO */}
      <section id="home" className="relative h-screen w-full overflow-hidden">
        <video src="/teasers/main-hero.mp4" poster="/images/main-hero.jpg" autoPlay loop muted playsInline className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-black/35" />
        <div className="relative z-10 h-full max-w-7xl mx-auto flex flex-col justify-center px-6">
          <h1 className="text-5xl md:text-6xl font-serif tracking-[0.015em] text-[#F8F4ED]">Dr. Costi House of Beauty</h1>
          <p className="mt-4 text-xl md:text-2xl text-[#F8F4ED] opacity-90">{taglines[ti]}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button className="bg-[#2E5E56] text-[#F8F4ED]">Book Your Consultation</Button>
            <Button className="bg-[#C6A77B] text-[#18483D]">Explore Our Houses</Button>
          </div>
        </div>
      </section>

      {/* The Dr. Costi Experience */}
      <Row title="The Dr. Costi Experience">
        {[
          {title: "Expertise", teaser: "/teasers/exp-expertise.mp4", poster: "/images/exp-expertise.jpg", desc: "Board-certified dermatology mastery.", cta: "Learn"},
          {title: "Personalization", teaser: "/teasers/exp-personalization.mp4", poster: "/images/exp-personalization.jpg", desc: "Your face, your protocol.", cta: "See How"},
          {title: "Innovation", teaser: "/teasers/exp-innovation.mp4", poster: "/images/exp-innovation.jpg", desc: "AI diagnostics, advanced lasers.", cta: "Explore"},
          {title: "Luxury", teaser: "/teasers/exp-luxury.mp4", poster: "/images/exp-luxury.jpg", desc: "Cinematic, discreet, seamless.", cta: "Inside"},
          {title: "Results", teaser: "/teasers/exp-results.mp4", poster: "/images/exp-results.jpg", desc: "Natural, refined transformations.", cta: "View"},
        ].map((card, i) => (
          <TeaserCard key={i} {...card} />
        ))}
      </Row>

      {/* Explore Our Houses – circular wheel replacement in Netflix rows */}
      <Row title="Explore Our Houses" dark>
        {[
          {title: "House of Facials", teaser: "/teasers/house-facials.mp4", poster: "/images/house-facials.jpg", desc: "Rituals of renewal.", cta: "Enter"},
          {title: "House of Skin & Cosmetics", teaser: "/teasers/house-skin.mp4", poster: "/images/house-skin.jpg", desc: "Where dermatology becomes desire.", cta: "Enter"},
          {title: "House of Slimming & Body", teaser: "/teasers/house-slimming.mp4", poster: "/images/house-slimming.jpg", desc: "Sculpted strength.", cta: "Enter"},
          {title: "House of Wellness", teaser: "/teasers/house-wellness.mp4", poster: "/images/house-wellness.jpg", desc: "Longevity, curated.", cta: "Enter"},
          {title: "The Academy", teaser: "/teasers/house-academy.mp4", poster: "/images/house-academy.jpg", desc: "Learn with leaders.", cta: "Apply"},
          {title: "Shop", teaser: "/teasers/house-shop.mp4", poster: "/images/house-shop.jpg", desc: "Luxury skincare & wellness.", cta: "Shop"},
        ].map((card, i) => (
          <TeaserCard key={i} {...card} />
        ))}
      </Row>

      {/* Signature Treatments */}
      <Row title="Signature Treatments">
        {[
          {title: "3D Facial Sculpting", teaser: "/teasers/sig-3d.mp4", poster: "/images/sig-3d.jpg", desc: "Architectural definition.", cta: "Discover"},
          {title: "Baby Eye Lift", teaser: "/teasers/sig-eye.mp4", poster: "/images/sig-eye.jpg", desc: "Fresh eyes, discreet.", cta: "Discover"},
          {title: "Advanced Liquid Facelift", teaser: "/teasers/sig-alf.mp4", poster: "/images/sig-alf.jpg", desc: "Regenerative layering.", cta: "Discover"},
          {title: "Thin Skin Protocol", teaser: "/teasers/sig-thin.mp4", poster: "/images/sig-thin.jpg", desc: "Fragility to strength.", cta: "Discover"},
        ].map((card, i) => (
          <TeaserCard key={i} {...card} />
        ))}
      </Row>

      {/* E-commerce Integration */}
      <Row title="Skincare Shop – Editor's Picks" dark>
        {[
          {title: "Radiance Serum", teaser: "/teasers/prod-serum.mp4", poster: "/images/prod-serum.jpg", desc: "Glow that lasts.", cta: "Add"},
          {title: "Repair Cream", teaser: "/teasers/prod-cream.mp4", poster: "/images/prod-cream.jpg", desc: "Barrier first.", cta: "Add"},
          {title: "NAD⁺ Complex", teaser: "/teasers/prod-nad.mp4", poster: "/images/prod-nad.jpg", desc: "Longevity in a bottle.", cta: "Add"},
          {title: "SPF Veil", teaser: "/teasers/prod-spf.mp4", poster: "/images/prod-spf.jpg", desc: "Invisible defense.", cta: "Add"},
        ].map((card, i) => (
          <TeaserCard key={i} {...card} />
        ))}
        <div className="max-w-7xl mx-auto px-6 mt-4">
          <a href="#ai" className="text-sm underline text-[#F8F4ED] bg-[#2E5E56] px-3 py-2 rounded">Which Product is Right for Me?</a>
        </div>
      </Row>

      {/* Testimonials & Transformations */}
      <Row title="Testimonials & Transformations">
        {[
          {title: "Before/After — Sculpt", teaser: "/teasers/ba-sculpt.mp4", poster: "/images/ba-sculpt.jpg", desc: "Definition without excess.", cta: "View"},
          {title: "Interview (Obscured)", teaser: "/teasers/interview.mp4", poster: "/images/interview.jpg", desc: "Discreet stories.", cta: "Play"},
          {title: "Skin Clarity", teaser: "/teasers/ba-clarity.mp4", poster: "/images/ba-clarity.jpg", desc: "Acne to confidence.", cta: "View"},
        ].map((card, i) => (
          <TeaserCard key={i} {...card} />
        ))}
      </Row>

      {/* Global Reach & Concierge */}
      <Row title="Global Reach & Concierge" dark>
        {[
          {title: "Beirut HQ", teaser: "/teasers/map-beirut.mp4", poster: "/images/map-beirut.jpg", desc: "Sama Beirut, Petro Trad St.", cta: "Locate"},
          {title: "Expansion Roadmap", teaser: "/teasers/map-global.mp4", poster: "/images/map-global.jpg", desc: "GCC & EU focus.", cta: "See"},
          {title: "VIP Membership", teaser: "/teasers/vip.mp4", poster: "/images/vip.jpg", desc: "Become a member.", cta: "Apply"},
          {title: "Private Access", teaser: "/teasers/private.mp4", poster: "/images/private.jpg", desc: "Invite-only concierge.", cta: "Request"},
        ].map((card, i) => (
          <TeaserCard key={i} {...card} />
        ))}
      </Row>

      {/* Educational Leadership – Academy */}
      <Row title="Educational Leadership — The Academy">
        {[
          {title: "Most Enrolled Course", teaser: "/teasers/academy-course.mp4", poster: "/images/academy-course.jpg", desc: "Hands-on aesthetics.", cta: "Apply"},
          {title: "Programs", teaser: "/teasers/academy-programs.mp4", poster: "/images/academy-programs.jpg", desc: "Skincare, Aesthetics, Business.", cta: "Explore"},
          {title: "Hybrid Learning", teaser: "/teasers/academy-hybrid.mp4", poster: "/images/academy-hybrid.jpg", desc: "Clinic + digital.", cta: "Learn"},
          {title: "Global Partners", teaser: "/teasers/academy-partners.mp4", poster: "/images/academy-partners.jpg", desc: "Collaborations worldwide.", cta: "See"},
        ].map((card, i) => (
          <TeaserCard key={i} {...card} />
        ))}
      </Row>

      {/* Footer */}
      <footer className="py-12 px-8 bg-[#18483D] text-[#F8F4ED] text-sm">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-serif text-lg">Sitemap</h3>
            <ul className="mt-2 space-y-1">
              {["Home","The Experience","Our Houses","The Academy","Shop","Journal","Concierge","Book Now"].map((l)=> (
                <li key={l} className="hover:underline underline-offset-4 cursor-pointer">{l}</li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-serif text-lg">Stay in Touch</h3>
            <form className="mt-2 flex gap-2">
              <input className="bg-white/90 text-[#18483D] rounded px-3 py-2 w-full" placeholder="Your email" />
              <Button className="bg-[#C6A77B] text-[#18483D]">Join</Button>
            </form>
            <div className="mt-3 flex gap-3 text-sm">
              <a className="hover:underline cursor-pointer">Instagram</a>
              <a className="hover:underline cursor-pointer">Facebook</a>
              <a className="hover:underline cursor-pointer">LinkedIn</a>
            </div>
          </div>
          <div>
            <h3 className="font-serif text-lg">Legal</h3>
            <ul className="mt-2 space-y-1">
              <li className="hover:underline underline-offset-4 cursor-pointer">Privacy</li>
              <li className="hover:underline underline-offset-4 cursor-pointer">Terms</li>
              <li className="hover:underline underline-offset-4 cursor-pointer">Cookies</li>
            </ul>
          </div>
          <div>
            <h3 className="font-serif text-lg">Contact</h3>
            <p className="mt-2">📍 Sama Beirut, 12th floor, Petro Trad street, Achrafieh, Beirut, Lebanon</p>
            <p className="mt-1">📞 <a href="tel:+96170838567" className="underline">+961 70 838 567</a> / <a href="https://wa.me/96170838567" className="underline">WhatsApp</a></p>
            <p className="mt-1">🌐 <a href="https://www.drcostihouseofbeauty.com" className="underline">www.drcostihouseofbeauty.com</a></p>
            <p className="mt-1">✉️ <a href="mailto:info@drcostihouseofbeauty.com" className="underline">info@drcostihouseofbeauty.com</a></p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-8 text-center opacity-80">Crafted by Dr. Costi for those who demand more.</div>
      </footer>
    </div>
  );
}
