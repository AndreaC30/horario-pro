/**
 * Guided tour overlay: dims the page except the target, with next/back/skip.
 */
import { useCallback, useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";

import type { TourStep } from "../../lib/tour-steps";
import {
  tourMeasureTarget,
  tourScrollLockDisable,
  tourScrollLockEnable,
  tourScrollToTarget,
  tourWaitForTarget,
} from "../../lib/tour-scroll-lock";
import { Button } from "../ui/Button";

type Props = {
  steps: TourStep[];
  onComplete: () => void;
  onSkip: () => void;
  /** Navigate so the step target is mounted. */
  onEnsurePath?: (path: string) => void;
};

type SpotlightRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

function TourSpotlightOverlay({
  rect,
  onDismiss,
}: {
  rect: SpotlightRect | null;
  onDismiss: () => void;
}) {
  const dim = "absolute bg-background/55 backdrop-blur-[1px]";

  if (!rect) {
    return <div className={`inset-0 ${dim}`} aria-hidden onClick={onDismiss} />;
  }

  const { top, left, width, height } = rect;
  const bottom = top + height;
  const right = left + width;

  return (
    <>
      <div className={dim} style={{ top: 0, left: 0, right: 0, height: top }} onClick={onDismiss} />
      <div className={dim} style={{ top, left: 0, width: left, height }} onClick={onDismiss} />
      <div className={dim} style={{ top, left: right, right: 0, height }} onClick={onDismiss} />
      <div className={dim} style={{ top: bottom, left: 0, right: 0, bottom: 0 }} onClick={onDismiss} />
    </>
  );
}

export function GuidedTour({ steps, onComplete, onSkip, onEnsurePath }: Props) {
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<SpotlightRect | null>(null);
  const [scrolling, setScrolling] = useState(false);

  const step = steps[index];
  const isLast = index >= steps.length - 1;

  const goNext = useCallback(() => {
    if (isLast) onComplete();
    else setIndex((i) => i + 1);
  }, [isLast, onComplete]);

  const goPrev = useCallback(() => {
    setIndex((i) => Math.max(0, i - 1));
  }, []);

  const finishSkip = useCallback(() => {
    tourScrollLockDisable();
    onSkip();
  }, [onSkip]);

  const finishComplete = useCallback(() => {
    tourScrollLockDisable();
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    tourScrollLockEnable();
    return () => tourScrollLockDisable();
  }, []);

  useEffect(() => {
    if (!step) return;

    let cancelled = false;
    setRect(null);
    setScrolling(true);

    void (async () => {
      if (step.path && onEnsurePath) {
        onEnsurePath(step.path);
        await new Promise((r) => requestAnimationFrame(r));
        await tourWaitForTarget(step.target);
      }
      if (cancelled) return;
      await tourScrollToTarget(step.target);
      if (cancelled) return;
      await new Promise((r) => requestAnimationFrame(r));
      await new Promise((r) => requestAnimationFrame(r));
      setRect(tourMeasureTarget(step.target));
      setScrolling(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [step, onEnsurePath]);

  useEffect(() => {
    function onResize() {
      if (step) setRect(tourMeasureTarget(step.target));
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [step]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        finishSkip();
      } else if (e.key === "Enter" && !scrolling) {
        e.preventDefault();
        goNext();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [finishSkip, goNext, scrolling]);

  if (!step) return null;

  return (
    <div
      className="fixed inset-0 z-[90] isolate"
      style={{ width: "100vw", height: "100dvh" }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="guided-tour-title"
      aria-describedby="guided-tour-body"
    >
      <TourSpotlightOverlay rect={scrolling ? null : rect} onDismiss={finishSkip} />

      {rect && !scrolling ? (
        <div
          className="pointer-events-auto absolute z-[1]"
          style={{
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
          }}
          aria-hidden
        />
      ) : null}

      {rect && !scrolling ? (
        <div
          className="pointer-events-none absolute z-[2] rounded-xl ring-2 ring-primary shadow-[0_0_0_1px_rgb(59_130_246_/_0.35),0_0_24px_rgb(59_130_246_/_0.2)]"
          style={{
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
          }}
          aria-hidden
        />
      ) : null}

      <div
        data-guided-tour-controls
        className="absolute inset-x-3 bottom-[max(4.75rem,calc(3.75rem+env(safe-area-inset-bottom)))] z-[3] mx-auto max-h-[42vh] max-w-md overflow-y-auto rounded-2xl border border-border bg-surface p-4 shadow-2xl sm:inset-x-4 sm:p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-2">
          <p className="font-mono text-xs font-medium text-primary">
            {index + 1} / {steps.length}
            {scrolling ? " · Moviendo vista…" : ""}
          </p>
          <button
            type="button"
            onClick={finishSkip}
            className="shrink-0 rounded-lg p-1.5 text-text-muted transition-colors hover:bg-surface-elevated hover:text-text-primary"
            aria-label="Cerrar guía"
          >
            <IoClose className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <h2 id="guided-tour-title" className="mt-1.5 font-display text-lg font-bold text-text-primary">
          {step.title}
        </h2>
        <p id="guided-tour-body" className="mt-1.5 text-sm leading-relaxed text-text-secondary">
          {step.body}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            type="button"
            onClick={isLast ? finishComplete : goNext}
            disabled={scrolling}
            className="min-w-[7rem] flex-1"
          >
            {isLast ? "Listo" : "Siguiente"}
          </Button>
          {index > 0 ? (
            <Button type="button" variant="secondary" onClick={goPrev} disabled={scrolling}>
              Atrás
            </Button>
          ) : null}
          <Button type="button" variant="ghost" onClick={finishSkip}>
            Omitir
          </Button>
        </div>
      </div>
    </div>
  );
}
