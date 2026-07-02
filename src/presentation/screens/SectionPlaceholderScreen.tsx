interface SectionPlaceholderScreenProps {
  title: string;
}

/**
 * MVVM view — temporary section body. Dumb placeholder replaced by the real screens in
 * AD-03 (levels), AD-08 (leaderboard) and AD-09 (users).
 */
export function SectionPlaceholderScreen({ title }: SectionPlaceholderScreenProps) {
  return (
    <section data-testid="section-placeholder">
      <h1 className="text-2xl font-black text-text-primary" data-testid="section-title">
        {title}
      </h1>
      <p className="mt-2 text-sm text-text-secondary">This section arrives in a later ticket.</p>
    </section>
  );
}
