"use client";

// components/lottie-animation.tsx
// Small wrapper around lottie-react so it can be reused on any "empty state"
// page (coming soon, 404, etc). Loads the .json file from /public at runtime
// so nothing needs to be bundled, and shows a soft skeleton while it loads.
//
// Requires: npm install lottie-react

import { useEffect, useState, type ComponentType } from "react";
import dynamic from "next/dynamic";

type LottieAnimationComponentProps = {
  animationData: object;
  loop?: boolean;
  autoplay?: boolean;
  className?: string;
};

// next/dynamic can't infer lottie-react's prop types from a bare
// `import("lottie-react")`, so it falls back to `{}` and rejects
// `animationData` etc. Passing the prop type explicitly and resolving
// `.default` fixes both the "IntrinsicAttributes" and "LoaderComponent"
// overload errors.
const Lottie = dynamic(
  () => import("lottie-react").then((mod) => mod.Lottie),
  { ssr: false }
) as unknown as ComponentType<LottieAnimationComponentProps>;

interface LottieAnimationProps {
  /** Path to the .json file inside /public, e.g. "/lottie/coming-soon.json" */
  path: string;
  className?: string;
  loop?: boolean;
  autoplay?: boolean;
}

export function LottieAnimation({
  path,
  className = "w-full h-full",
  loop = true,
  autoplay = true,
}: LottieAnimationProps) {
  const [animationData, setAnimationData] = useState<object | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch(path)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load animation: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setAnimationData(data);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [path]);

  // Fallback: quiet pulsing circle so the layout doesn't jump if the
  // animation file is missing or still loading.
  if (failed || !animationData) {
    return (
      <div className={`${className} flex items-center justify-center`}>
        <div className="w-16 h-16 rounded-full bg-gray-100 animate-pulse" />
      </div>
    );
  }

  return (
    <Lottie animationData={animationData} loop={loop} autoplay={autoplay} className={className} />
  );
}