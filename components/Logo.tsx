export default function Logo({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      {/* Timeline icon — ascending nodes connected by a line */}
      <svg width="72" height="28" viewBox="0 0 72 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Connecting line */}
        <polyline
          points="6,22 20,16 36,10 52,13 66,4"
          stroke="white"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeOpacity="0.45"
        />
        {/* Nodes — fade in from left (past) to right (present) */}
        <circle cx="6"  cy="22" r="3"   fill="white" fillOpacity="0.25" />
        <circle cx="20" cy="16" r="3"   fill="white" fillOpacity="0.45" />
        <circle cx="36" cy="10" r="3"   fill="white" fillOpacity="0.65" />
        <circle cx="52" cy="13" r="3"   fill="white" fillOpacity="0.82" />
        <circle cx="66" cy="4"  r="3.5" fill="white" fillOpacity="1"    />
      </svg>

      {/* Wordmark */}
      <span className="text-white font-black text-xl tracking-tight leading-none">
        OlderThanDirt
      </span>
    </div>
  );
}
