import { authRouter } from "./auth-router";
import { createRouter, publicQuery } from "./middleware";
import { rideRouter } from "./rideRouter";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  rides: rideRouter,
});

export type AppRouter = typeof appRouter;
