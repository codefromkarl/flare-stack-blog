import { Link, useRouteContext } from "@tanstack/react-router";
import {
  resolveSocialHref,
  SOCIAL_PLATFORMS,
} from "@/features/config/utils/social-platforms";
import { m } from "@/paraglide/messages";

export function Footer() {
  const { siteConfig } = useRouteContext({ from: "__root__" });
  const github = siteConfig.social.find(
    (link) => link.platform === "github" && link.url,
  );
  const email = siteConfig.social.find(
    (link) => link.platform === "email" && link.url,
  );

  return (
    <footer className="py-16 mt-24">
      <div className="max-w-3xl mx-auto px-6 md:px-0 flex flex-col items-center gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          {github && (
            <>
              <a
                href={resolveSocialHref(github.platform, github.url)}
                target="_blank"
                rel="noreferrer"
                className="hover:text-foreground transition-colors"
              >
                {SOCIAL_PLATFORMS.github.label}
              </a>
              <span className="opacity-40">|</span>
            </>
          )}
          {email && (
            <>
              <a
                href={resolveSocialHref(email.platform, email.url)}
                className="hover:text-foreground transition-colors"
              >
                {SOCIAL_PLATFORMS.email.label}
              </a>
              <span className="opacity-40">|</span>
            </>
          )}
          <Link
            to="/tech-stack"
            className="hover:text-foreground transition-colors"
          >
            {m.nav_tech_stack()}
          </Link>
        </div>

        <div className="text-center space-y-1">
          <p>
            {m.footer_copyright({
              year: new Date().getFullYear().toString(),
              author: siteConfig.author,
            })}
          </p>
          <p>{m.footer_tagline()}</p>
        </div>
      </div>
    </footer>
  );
}
