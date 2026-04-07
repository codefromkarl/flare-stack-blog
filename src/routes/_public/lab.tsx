import { createFileRoute } from "@tanstack/react-router";
import theme from "@theme";

export const Route = createFileRoute("/_public/lab")({
  component: LabPage,
});

function LabPage() {
  return <theme.AboutPage />;
}
