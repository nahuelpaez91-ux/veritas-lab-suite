export function Monogram({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} role="img" aria-label="ANP">
      <circle cx="20" cy="20" r="18.5" fill="none" stroke="var(--color-accent)" strokeWidth="2" />
      <circle cx="20" cy="20" r="14.5" fill="none" stroke="var(--color-accent)" strokeWidth="0.75" strokeDasharray="2 2" />
      <text
        x="20"
        y="24"
        textAnchor="middle"
        fontSize="11"
        fontWeight="700"
        fill="currentColor"
        fontFamily="var(--font-mono)"
      >
        ANP
      </text>
    </svg>
  );
}
