/** Trazo manuscrito de la firma. El color sale de `currentColor`. Decorativo: el nombre va en texto al lado. */
export function HandSignature({ className, strokeWidth = 1.5 }: { className?: string; strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 170 44" className={className} aria-hidden="true" focusable="false">
      <path
        d="M4,34 C10,10 18,6 20,22 C22,36 14,40 16,28 C19,12 30,8 32,24 C33,32 36,34 40,24 C44,14 48,14 50,26 C52,36 58,30 62,20 C66,10 70,12 70,24 C70,34 78,30 84,22 C92,12 100,16 104,24 C110,34 122,24 132,18 C142,12 150,14 164,20"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
