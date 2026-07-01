export function EthiopianCornerOrnament({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 38V2H38" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M8 38V8H38" stroke="currentColor" strokeWidth="0.5" strokeLinecap="round" opacity="0.5" />
      <circle cx="2" cy="2" r="2" fill="currentColor" opacity="0.3" />
      <circle cx="38" cy="38" r="2" fill="currentColor" opacity="0.3" />
      <path d="M6 6L10 10M10 6L6 10" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
    </svg>
  );
}

export function EthiopianCornerSet() {
  return (
    <>
      <div className="absolute -top-0.5 -left-0.5 text-ethiopian-gold/40">
        <EthiopianCornerOrnament className="w-10 h-10" />
      </div>
      <div className="absolute -top-0.5 -right-0.5 text-ethiopian-gold/40 rotate-90">
        <EthiopianCornerOrnament className="w-10 h-10" />
      </div>
      <div className="absolute -bottom-0.5 -right-0.5 text-ethiopian-gold/40 rotate-180">
        <EthiopianCornerOrnament className="w-10 h-10" />
      </div>
      <div className="absolute -bottom-0.5 -left-0.5 text-ethiopian-gold/40 -rotate-90">
        <EthiopianCornerOrnament className="w-10 h-10" />
      </div>
    </>
  );
}

export function JebenaIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="24" cy="36" rx="12" ry="4" stroke="currentColor" strokeWidth="1.5" />
      <path d="M24 36V26" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M20 26h8l-2-12h-4l-2 12z" fill="currentColor" opacity="0.15" />
      <path d="M20 26h8l-2-12h-4l-2 12z" stroke="currentColor" strokeWidth="1.2" />
      <path d="M28 14l6-6M20 14l-6-6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M22 14s-1-4 2-4 2 4 2 4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <path d="M25 31c3 0 5-1 5-2" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" opacity="0.5" />
      <path d="M26 33c2.5 0 4-0.8 4-1.5" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" opacity="0.3" />
    </svg>
  );
}

export function MesobIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 6L12 24h24L24 6z" stroke="currentColor" strokeWidth="1.2" fill="currentColor" fillOpacity="0.1" />
      <path d="M24 14l-8 14h16L24 14z" stroke="currentColor" strokeWidth="0.8" fill="currentColor" fillOpacity="0.05" />
      <path d="M24 22l-6 10h12L24 22z" stroke="currentColor" strokeWidth="0.6" fill="currentColor" fillOpacity="0.05" />
      <path d="M8 28c2 3 10 5 16 5s14-2 16-5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M24 33v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M14 38c3.5 2 10 2 10 2s6.5 0 10-2" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <path d="M8 28l-2 4M40 28l2 4" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

export function SpiceIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="24" cy="30" rx="6" ry="10" stroke="currentColor" strokeWidth="1.2" fill="currentColor" fillOpacity="0.1" />
      <path d="M24 8v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M20 14h8" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
      <path d="M22 18l4-4" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" opacity="0.4" />
      <path d="M18 30c0 3.3 2.7 6 6 6" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" opacity="0.5" />
      <circle cx="24" cy="12" r="2" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="0.8" />
    </svg>
  );
}

export function InjeraIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="16" stroke="currentColor" strokeWidth="1.2" fill="currentColor" fillOpacity="0.05" />
      <path d="M24 12v24M12 24h24" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
      <path d="M16 16l16 16M32 16l-16 16" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
      <circle cx="24" cy="24" r="4" stroke="currentColor" strokeWidth="0.8" fill="currentColor" fillOpacity="0.1" />
      <circle cx="24" cy="24" r="10" stroke="currentColor" strokeWidth="0.3" opacity="0.3" />
      <circle cx="24" cy="24" r="13" stroke="currentColor" strokeWidth="0.3" opacity="0.15" strokeDasharray="2 3" />
    </svg>
  );
}

export function CoffeeBeansIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="20" cy="32" rx="8" ry="12" stroke="currentColor" strokeWidth="1.2" fill="currentColor" fillOpacity="0.1" transform="rotate(-15 20 32)" />
      <path d="M20 22c-2 0-4 1-5 3" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" opacity="0.4" />
      <ellipse cx="40" cy="28" rx="7" ry="11" stroke="currentColor" strokeWidth="1.2" fill="currentColor" fillOpacity="0.1" transform="rotate(10 40 28)" />
      <path d="M40 19c-2 0-3.5 1-4.5 2.5" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" opacity="0.4" />
      <ellipse cx="32" cy="44" rx="6" ry="9" stroke="currentColor" strokeWidth="1" fill="currentColor" fillOpacity="0.08" transform="rotate(-5 32 44)" />
      <path d="M12 20c-1 3-1 7 0 9" stroke="currentColor" strokeWidth="0.6" strokeLinecap="round" opacity="0.3" />
      <path d="M50 18c1 3 1 6 0 8" stroke="currentColor" strokeWidth="0.6" strokeLinecap="round" opacity="0.3" />
    </svg>
  );
}

export function SpiceBowlIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 32c0-11 9-20 20-20s20 9 20 20" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.05" />
      <path d="M12 32c0 4 1.5 7.5 4 10l2 6c0.5 2 2 4 6 4h16c4 0 5.5-2 6-4l2-6c2.5-2.5 4-6 4-10" stroke="currentColor" strokeWidth="1.2" fill="currentColor" fillOpacity="0.08" />
      <path d="M28 22h8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
      <ellipse cx="32" cy="24" rx="3" ry="4" stroke="currentColor" strokeWidth="0.8" fill="currentColor" fillOpacity="0.1" />
      <circle cx="24" cy="26" r="1.5" stroke="currentColor" strokeWidth="0.6" fill="currentColor" fillOpacity="0.15" />
      <circle cx="40" cy="26" r="1.5" stroke="currentColor" strokeWidth="0.6" fill="currentColor" fillOpacity="0.15" />
      <path d="M30 38l2-2 2 2-2 2-2-2z" stroke="currentColor" strokeWidth="0.6" fill="currentColor" fillOpacity="0.15" />
    </svg>
  );
}
