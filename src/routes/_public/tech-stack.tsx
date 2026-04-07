import { createFileRoute } from "@tanstack/react-router";
import theme from "@theme";

export const Route = createFileRoute("/_public/tech-stack")({
  component: TechStackPage,
});

function TechStackPage() {
  return <theme.TechStackPage />;
}
