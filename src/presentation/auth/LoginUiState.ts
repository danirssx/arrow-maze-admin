export type LoginStatus = "idle" | "submitting" | "error";

export interface LoginUiState {
  email: string;
  password: string;
  status: LoginStatus;
  errorMessage: string | null;
}

export const initialLoginUiState: LoginUiState = {
  email: "",
  password: "",
  status: "idle",
  errorMessage: null,
};
