import { useSyncExternalStore } from "react";
import type { ObservableViewModel } from "@/presentation/view-models/ObservableViewModel";

/** Binds a component to an `ObservableViewModel`'s state via `useSyncExternalStore`. */
export function useViewModelState<TState>(viewModel: ObservableViewModel<TState>): TState {
  return useSyncExternalStore(viewModel.subscribe, viewModel.getState);
}
