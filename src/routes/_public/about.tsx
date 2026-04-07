import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_public/about")({
  beforeLoad: () => {
    throw redirect({ to: "/lab" });
  },
});
