export function PawLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 13c-2.5 0-4.5 1.5-5.5 3.5-.6 1.2-.2 2.5.8 3.3 1.2 1 2.8 1.2 4.7 1.2s3.5-.2 4.7-1.2c1-.8 1.4-2.1.8-3.3-1-2-3-3.5-5.5-3.5z" />
      <ellipse cx="7.5" cy="9" rx="2" ry="2.5" />
      <ellipse cx="16.5" cy="9" rx="2" ry="2.5" />
      <ellipse cx="4.5" cy="13" rx="1.7" ry="2.2" />
      <ellipse cx="19.5" cy="13" rx="1.7" ry="2.2" />
    </svg>
  );
}
