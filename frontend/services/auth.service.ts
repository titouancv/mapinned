import { authClient } from "@/lib/auth-client";

export const authService = {
  signIn: async () => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "http://localhost:3000",
    });
  },

  signOut: async () => {
    await authClient.signOut();
  },

  useSession: () => {
    return authClient.useSession();
  },
};
