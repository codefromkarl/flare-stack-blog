import { useEffect, useRef, useState } from "react";
import { CommentSection } from "./comment-section";
import { CommentSectionSkeleton } from "./comment-section-skeleton";

interface DeferredCommentSectionProps {
  postId: number;
  className?: string;
}

export const DeferredCommentSection = ({
  postId,
  className,
}: DeferredCommentSectionProps) => {
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
    <div ref={containerRef}>
      {shouldRender ? (
        <CommentSection postId={postId} className={className} />
      ) : (
        <div className="min-h-[200px]">
          <CommentSectionSkeleton className={className} />
        </div>
      )}
    </div>
  );
};
