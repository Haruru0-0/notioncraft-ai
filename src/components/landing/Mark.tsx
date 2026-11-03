/** A type slug: a block of metal type with the letter N cut out of it. */
export default function Mark({ className, inverted = false }: { className?: string; inverted?: boolean }) {
  return (
    <svg viewBox="0 0 32 32" role="img" aria-label="NotionCraft" className={className}>
      <rect x="1" y="1" width="30" height="30" rx="2" fill={inverted ? "#1d36c9" : "#f7f7f2"} />
      <path d="M9 24V8h3.2l7.6 10.4V8H23v16h-3.2L12.2 13.6V24z" fill={inverted ? "#f7f7f2" : "#1d36c9"} />
    </svg>
  );
}
