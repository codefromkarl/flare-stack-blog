import { Link, useRouteContext } from "@tanstack/react-router";
import { Search, UserIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { Skeleton } from "@/components/ui/skeleton";
import type { NavOption, UserInfo } from "@/features/theme/contract/layouts";
import { m } from "@/paraglide/messages";
import { LanguageSwitcher } from "./language-switcher";

interface NavbarProps {
  navOptions: Array<NavOption>;
  onMenuClick: () => void;
  isLoading?: boolean;
  user?: UserInfo;
}
export function Navbar({
  onMenuClick,
  user,
  navOptions,
  isLoading,
}: NavbarProps) {
  const { siteConfig } = useRouteContext({ from: "__root__" });
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-background/80 backdrop-blur-xl border-b border-border/40 shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-3xl mx-auto w-full px-6 md:px-0 flex items-center justify-between h-16">
          {/* Left: Brand */}
          <Link to="/" className="group select-none flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-brand text-brand-foreground flex items-center justify-center text-xs font-bold font-mono">
              K
            </span>
            <span className="font-serif text-lg font-bold tracking-tight text-foreground transition-colors group-hover:text-brand">
              {siteConfig.theme.default.navBarName}
            </span>
          </Link>

          {/* Center: Main Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navOptions.map((option) => (
              <Link
                key={option.id}
                to={option.to}
                className="relative px-3 py-1.5 text-[13px] font-medium text-muted-foreground/80 hover:text-foreground transition-colors rounded-md hover:bg-brand-subtle"
                activeProps={{
                  className: "!text-brand bg-brand-subtle",
                }}
              >
                {option.label}
              </Link>
            ))}
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <LanguageSwitcher className="text-muted-foreground hover:text-foreground h-8 w-8" />
            <Link
              to="/search"
              className="text-muted-foreground hover:text-foreground h-8 w-8 flex items-center justify-center transition-colors rounded-md hover:bg-brand-subtle"
              aria-label={m.nav_search()}
            >
              <Search
                size={16}
                strokeWidth={1.5}
                style={{ viewTransitionName: "search-input" }}
              />
            </Link>

            {/* Profile / Menu Toggle */}
            <div className="flex items-center gap-2 pl-2 border-l border-border/40 ml-1">
              <div className="hidden md:flex items-center">
                {isLoading ? (
                  <Skeleton className="w-8 h-8 rounded-full" />
                ) : (
                  <div className="flex items-center gap-3 animate-in fade-in">
                    {user ? (
                      <>
                        <Link
                          to="/profile"
                          className="w-8 h-8 rounded-full overflow-hidden border border-border/60 hover:border-brand transition-colors relative z-10"
                          style={{ viewTransitionName: "user-avatar" }}
                        >
                          {user.image ? (
                            <img
                              src={user.image}
                              alt={user.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-brand-muted flex items-center justify-center">
                              <UserIcon
                                size={14}
                                className="text-brand-foreground"
                              />
                            </div>
                          )}
                        </Link>
                      </>
                    ) : (
                      <Link
                        to="/login"
                        className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-md hover:bg-brand-subtle"
                      >
                        {m.nav_login()}
                      </Link>
                    )}
                  </div>
                )}
              </div>

              <button
                className="w-8 h-8 flex flex-col items-center justify-center gap-1.5 group lg:hidden rounded-md hover:bg-brand-subtle transition-colors"
                onClick={onMenuClick}
                aria-label={m.common_open_menu()}
                type="button"
              >
                <div className="w-5 h-px bg-foreground transition-all group-hover:w-3"></div>
                <div className="w-5 h-px bg-foreground transition-all group-hover:w-6"></div>
              </button>
            </div>
          </div>
        </div>
      </header>
      {/* Spacer for fixed header */}
      <div className="h-16" />
    </>
  );
}
