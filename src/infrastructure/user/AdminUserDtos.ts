/** Backend wraps responses in `{ status:"success", data }` (ApiResponsePresenter). */
export interface ApiEnvelope<T> {
  status: "success";
  data: T;
}

export interface AdminUserDto {
  userId: string;
  email: string;
  username: string;
  role: string;
  status: string;
  createdAt: string;
}

export interface AdminUsersListData {
  users: AdminUserDto[];
  page: number;
  limit: number;
  total: number;
}
