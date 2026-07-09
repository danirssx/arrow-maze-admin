import { UsersView } from "@/presentation/user/UsersView";
import { useAdminUsers } from "./useAdminUsers";

/** Protected `/users` route: binds the read-only users view-model to the dumb table. */
export function AdminUsersRoute() {
  const viewModel = useAdminUsers();
  return <UsersView {...viewModel} />;
}
