import { useEffect, useRef, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { FuwariCommentSection } from "./comment-section";

interface DeferredCommentSectionProps {
  postId: number;
  className?: string;
}

export function DeferredCommentSection({
  postId,
  className,
}: DeferredCommentSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const node = containerRef.current;

    if (!node || shouldRender) {
      return;
    }

    if (typeof IntersectionObserver === "undefined") {
      setShouldRender(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        if (!entry?.isIntersecting) {
          return;
        }

        setShouldRender(true);
        observer.unobserve(node);
      },
      { rootMargin: "600px" },
    );

    observer.observe(node);

    return () => {
      observer.unobserve(node);
      observer.disconnect();
    };
  }, [shouldRender]);

  return (
    <div ref={containerRef} className={className}>
      {shouldRender ? (
        <FuwariCommentSection postId={postId} />
      ) : (
        <div className="min-h-[200px]">
          <FuwariCommentSectionSkeleton />
        </div>
      )}
    </div>
  );
}

function FuwariCommentSectionSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-7 w-24 rounded-lg" />
      <Skeleton className="h-32 w-full rounded-(--fuwari-radius-large)" />
      <div className="space-y-0">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              "py-6 flex gap-4 border-b border-black/5 dark:border-white/5",
            )}
          >
            <Skeleton className="w-9 h-9 rounded-full shrink-0" />
            <div className="flex-1 space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-20 rounded" />
                <Skeleton className="h-3 w-16 rounded" />
              </div>
              <div className="space-y-1.5">
                <Skeleton className="h-3.5 w-full rounded" />
                <Skeleton className="h-3.5 w-3/4 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
