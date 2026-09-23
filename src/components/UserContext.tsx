"use client";

import { createContext, useContext } from "react";
import type { Session } from "@supabase/supabase-js";
import type { Employee } from "@/types";

export interface CurrentUser {
  session: Session | null;
  employee: Employee | null;
  /** 편집(수정) 권한 여부 — false 면 보기 전용 */
  canEdit: boolean;
}

const UserContext = createContext<CurrentUser>({
  session: null,
  employee: null,
  canEdit: false,
});

export function UserProvider({
  value,
  children,
}: {
  value: CurrentUser;
  children: React.ReactNode;
}) {
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  return useContext(UserContext);
}
