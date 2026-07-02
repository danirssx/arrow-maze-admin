import type { ReactNode } from "react";
import { useViewModelState } from "@/presentation/hooks/useViewModelState";
import type { NavSection } from "@/presentation/navigation/adminSections";
import type { AppShellViewModel } from "./AppShellViewModel";

interface AppShellProps {
  brandName: string;
  username: string;
  sections: readonly NavSection[];
  activeSectionId: string | null;
  onNavigate: (path: string) => void;
  onLogout: () => void;
  viewModel: AppShellViewModel;
  children: ReactNode;
}

/**
 * MVVM view — the authenticated admin shell (brand, nav, identity + logout, routed
 * content). Dumb: identity and every action arrive as props/callbacks; the only state it
 * reads is the responsive nav drawer from the ViewModel. Holds no auth or navigation rules.
 */
export function AppShell({
  brandName,
  username,
  sections,
  activeSectionId,
  onNavigate,
  onLogout,
  viewModel,
  children,
}: AppShellProps) {
  const { mobileNavOpen } = useViewModelState(viewModel);

  const selectSection = (path: string) => {
    onNavigate(path);
    viewModel.closeMobileNav();
  };

  return (
    <div className="min-h-full bg-background text-text-primary">
      <header className="flex items-center gap-3 border-b border-border-soft bg-background-card px-4 py-3">
        <button
          type="button"
          data-testid="nav-toggle"
          aria-label="Toggle navigation"
          aria-expanded={mobileNavOpen}
          onClick={() => viewModel.toggleMobileNav()}
          className="rounded-lg border border-border-soft px-3 py-1 text-text-secondary md:hidden"
        >
          ☰
        </button>
        <span className="text-lg font-black" data-testid="brand">
          {brandName}
        </span>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-sm text-text-secondary" data-testid="admin-username">
            {username}
          </span>
          <button
            type="button"
            data-testid="logout-button"
            onClick={onLogout}
            className="rounded-xl border border-border-soft px-4 py-2 text-sm font-bold text-text-secondary active:opacity-80"
          >
            Sign out
          </button>
        </div>
      </header>

      <div className="flex">
        <nav
          data-testid="admin-nav"
          className={`${mobileNavOpen ? "block" : "hidden"} w-full border-b border-border-soft bg-background-card p-3 md:block md:w-56 md:border-b-0 md:border-r`}
        >
          <ul className="flex flex-col gap-1">
            {sections.map((section) => {
              const isActive = section.id === activeSectionId;
              return (
                <li key={section.id}>
                  <button
                    type="button"
                    data-testid={`nav-${section.id}`}
                    aria-current={isActive ? "page" : undefined}
                    onClick={() => selectSection(section.path)}
                    className={`w-full rounded-xl px-3 py-2 text-left text-sm font-semibold ${
                      isActive
                        ? "bg-primary-700 text-text-inverse"
                        : "text-text-secondary hover:bg-background-soft"
                    }`}
                  >
                    {section.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <main className="flex-1 p-6" data-testid="admin-content">
          {children}
        </main>
      </div>
    </div>
  );
}
