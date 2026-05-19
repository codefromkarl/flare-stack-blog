import { Link } from "@tanstack/react-router";
import { Pin } from "lucide-react";
import { memo } from "react";
import type { PostItem as PostItemType } from "@/features/posts/schema/posts.schema";
import { cn, formatDate } from "@/lib/utils";

interface PostItemProps {
  post: PostItemType;
  pinned?: boolean;
  compact?: boolean;
}

export const PostItem = memo(
  ({ post, pinned, compact = false }: PostItemProps) => {
    return (
      <div className="group border-b border-border/40 last:border-0">
        <Link
          to="/post/$slug"
          params={{ slug: post.slug }}
          className={cn(
            "block transition-all duration-300",
            compact ? "py-6 md:py-7" : "py-8 md:py-10",
          )}
        >
          <div className="flex flex-col gap-3">
            {/* Metadata Row */}
            <div
              className={cn(
                "flex flex-wrap items-center justify-between gap-3 font-mono tracking-wider text-muted-foreground/60",
                compact ? "text-[11px]" : "text-xs",
              )}
            >
              {post.tags && post.tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="text-muted-foreground/60 whitespace-nowrap"
                    >
                      #{tag.name}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="opacity-0 select-none">.</span>
              )}

              <time
                dateTime={post.publishedAt?.toISOString()}
                className="whitespace-nowrap text-right opacity-70"
              >
                {formatDate(post.publishedAt)}
              </time>
            </div>

            <h3
              className={cn(
                "font-serif font-medium text-foreground/95 group-hover:text-foreground/75 transition-colors duration-300 flex items-center gap-3",
                compact
                  ? "text-[1.1rem] md:text-[1.12rem] leading-7"
                  : "text-2xl md:text-3xl",
              )}
              style={{ viewTransitionName: `post-title-${post.slug}` }}
            >
              {pinned && (
                <Pin
                  size={22}
                  className="text-muted-foreground/50 fill-muted"
                  strokeWidth={1.5}
                />
              )}
              <span className="line-clamp-2">{post.title}</span>
            </h3>

            <p
              className={cn(
                "text-muted-foreground font-light leading-relaxed max-w-2xl line-clamp-2 font-sans mt-1 group-hover:text-muted-foreground/80",
                compact ? "text-[13.5px] leading-6" : "text-sm md:text-base",
              )}
            >
              {post.summary}
            </p>
          </div>
        </Link>
      </div>
    );
  },
);

PostItem.displayName = "PostItem";
