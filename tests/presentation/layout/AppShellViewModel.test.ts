import { describe, expect, it } from "vitest";
import { AppShellViewModel } from "@/presentation/layout/AppShellViewModel";

describe("AppShellViewModel", () => {
  it("starts with the mobile nav closed", () => {
    expect(new AppShellViewModel().getState().mobileNavOpen).toBe(false);
  });

  it("toggles the mobile nav open then closed", () => {
    const vm = new AppShellViewModel();
    vm.toggleMobileNav();
    expect(vm.getState().mobileNavOpen).toBe(true);
    vm.toggleMobileNav();
    expect(vm.getState().mobileNavOpen).toBe(false);
  });

  it("opens and closes explicitly", () => {
    const vm = new AppShellViewModel();
    vm.openMobileNav();
    expect(vm.getState().mobileNavOpen).toBe(true);
    vm.closeMobileNav();
    expect(vm.getState().mobileNavOpen).toBe(false);
  });
});
