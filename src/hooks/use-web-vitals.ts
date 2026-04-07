import { useEffect } from "react";

export function useWebVitals() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const reportWebVital = async () => {
      try {
        const { onCLS, onLCP, onINP, onFCP } = await import("web-vitals");

        const reportMetric = (metric: {
          name: string;
          value: number;
          rating: string;
          id: string;
          navigationType: string;
        }) => {
          console.log(
            JSON.stringify({
              message: "web-vital",
              metric: metric.name,
              value: Math.round(
                metric.name === "CLS" ? metric.value * 1000 : metric.value,
              ),
              rating: metric.rating,
              navigationType: metric.navigationType,
            }),
          );

          const umami = (
            window as Window & {
              umami?: {
                track: (name: string, data: Record<string, unknown>) => void;
              };
            }
          ).umami;
          if (umami) {
            umami.track(metric.name, {
              value: metric.value,
              rating: metric.rating,
              navigationType: metric.navigationType,
            });
          }
        };

        onCLS(reportMetric);
        onLCP(reportMetric);
        onINP(reportMetric);
        onFCP(reportMetric);
      } catch {
        // web-vitals not available
      }
    };

    void reportWebVital();
  }, []);
}
