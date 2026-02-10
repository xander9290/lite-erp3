import { useRef } from "react";
import { useSession } from "next-auth/react";
import { Session } from "next-auth";

export function sessionStore() {
  const { data: session } = useSession();
  const snapshot = useRef<{
    user: Session["user"] | undefined;
    uid: string | undefined;
  } | null>(null);

  if (!snapshot.current && session) {
    snapshot.current = {
      user: session.user || undefined,
      uid: session.user?.id || undefined,
    };
  }

  return snapshot.current;
}
