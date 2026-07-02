import { ObservableViewModel } from "@/presentation/view-models/ObservableViewModel";
import { initialAppShellUiState, type AppShellUiState } from "./AppShellUiState";

/**
 * MVVM ViewModel for the app shell. Owns the only view state the route does not: whether
 * the responsive (mobile) nav drawer is open. Holds no navigation, identity, or auth rules.
 */
export class AppShellViewModel extends ObservableViewModel<AppShellUiState> {
  constructor() {
    super(initialAppShellUiState);
  }

  openMobileNav(): void {
    this.setState({ ...this.getState(), mobileNavOpen: true });
  }

  closeMobileNav(): void {
    this.setState({ ...this.getState(), mobileNavOpen: false });
  }

  toggleMobileNav(): void {
    this.setState({ ...this.getState(), mobileNavOpen: !this.getState().mobileNavOpen });
  }
}
