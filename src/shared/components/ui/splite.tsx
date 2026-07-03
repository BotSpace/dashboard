"use client";

import { Component, Suspense, lazy, type ReactNode } from "react";

const Spline = lazy(() => import("@splinetool/react-spline"));

interface SplineSceneProps {
  scene: string;
  className?: string;
}

// ponytail: decorative 3D hero — a failed fetch of the external Spline scene/runtime
// must never crash the page. Error boundaries have to be class components; this is
// the minimum one that swallows the error and renders nothing.
class SplineBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export function SplineScene({ scene, className }: SplineSceneProps) {
  return (
    <SplineBoundary>
      <Suspense
        fallback={
          <div className="flex h-full w-full items-center justify-center">
            <span className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white/80" />
          </div>
        }
      >
        <Spline scene={scene} className={className} />
      </Suspense>
    </SplineBoundary>
  );
}
