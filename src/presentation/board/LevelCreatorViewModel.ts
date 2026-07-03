import { reviewLevelJson, type LevelJsonReview } from "@/application/board/reviewLevelJson";
import { ObservableViewModel } from "@/presentation/view-models/ObservableViewModel";

export interface LevelCreatorUiState {
  jsonText: string;
  review: LevelJsonReview;
}

/**
 * MVVM ViewModel for the level creator. Holds the pasted/uploaded text and the derived
 * review (parse + shape validation via the application layer). Submit emits the parsed value
 * to the caller only when the review is valid — the actual server create/publish is AD-06.
 */
export class LevelCreatorViewModel extends ObservableViewModel<LevelCreatorUiState> {
  constructor(private readonly onSubmit: (value: unknown) => void) {
    super({ jsonText: "", review: reviewLevelJson("") });
  }

  /** Update from the textarea or a loaded file's text. */
  setJsonText(text: string): void {
    this.setState({ jsonText: text, review: reviewLevelJson(text) });
  }

  canSubmit(): boolean {
    return this.getState().review.status === "valid";
  }

  /** The value to preview: the parsed JSON when valid, otherwise null. */
  previewSource(): unknown {
    const { review } = this.getState();
    return review.status === "valid" ? review.value : null;
  }

  submit(): void {
    const { review } = this.getState();
    if (review.status === "valid") {
      this.onSubmit(review.value);
    }
  }
}
