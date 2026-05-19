import { Link } from "@tanstack/react-router";
import { Clock, Pin } from "lucide-react";
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
      <div
        className={cn(
          "group rounded-xl border border-border/30 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-brand/20 hover:shadow-lg hover:shadow-brand/5 hover:-translate-y-0.5",
          compact ? "p-5 md:p-6" : "p-6 md:p-8",
        )}
      >
        <Link to="/post/$slug" params={{ slug: post.slug }} className="block">
          <div className="flex flex-col gap-3">
            {/* Metadata Row */}
            <div
              className={cn(
                "flex flex-wrap items-center justify-between gap-3",
                compact ? "text-[11px]" : "text-xs",
              )}
            >
              {post.tags && post.tags.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {post.tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="px-2 py-0.5 rounded-full bg-brand-subtle text-brand text-[11px] font-medium whitespace-nowrap transition-colors group-hover:bg-brand group-hover:text-brand-foreground"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="opacity-0 select-none">.</span>
              )}

              <time
                dateTime={post.publishedAt?.toISOString()}
                className="whitespace-nowrap text-right text-muted-foreground/60 font-mono"
              >
                {formatDate(post.publishedAt)}
              </time>
            </div>

            <h3
              className={cn(
                "font-serif font-medium text-foreground group-hover:text-brand transition-colors duration-300 flex items-center gap-3",
                compact
                  ? "text-[1.1rem] md:text-[1.12rem] leading-7"
                  : "text-xl md:text-2xl",
              )}
              style={{ viewTransitionName: `post-title-${post.slug}` }}
            >
              {pinned && (
                <Pin
                  size={18}
                  className="text-brand shrink-0"
                  strokeWidth={1.5}
                />
              )}
              <span className="line-clamp-2">{post.title}</span>
            </h3>

            <p
              className={cn(
                "text-muted-foreground font-light leading-relaxed max-w-2xl line-clamp-2 font-sans group-hover:text-muted-foreground/80 transition-colors",
                compact ? "text-[13.5px] leading-6" : "text-sm md:text-[15px]",
              )}
            >
              {post.summary}
            </p>

            {/* Bottom meta */}
            <div className="flex items-center gap-4 text-muted-foreground/50 text-[11px] font-mono mt-1">
              {post.readTimeInMinutes && (
                <span className="flex items-center gap-1">
                  <Clock size={12} strokeWidth={1.5} />
                  {post.readTimeInMinutes} 分钟
                </span>
              )}
            </div>
          </div>
        </Link>
      </div>
    );
  },
);

PostItem.displayName = "PostItem";
