import { useEffect, useRef } from "react";

/**
 * Magnetic hover effect — the element follows the cursor slightly,
 * then springs back to its original position on mouse leave.
 * Based on React Bits magnetic effect pattern.
 */
export function useMagnetic(selector: string, strength = 0.15) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = document.querySelector(selector) as HTMLElement | null;
    if (!el) return;
    ref.current = el;

    const handleMouse = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      el.style.transition = "transform 0.1s ease-out";
      el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
    };

    const handleLeave = () => {
      el.style.transition = "transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)";
      el.style.transform = "translate(0px, 0px)";
    };

    el.addEventListener("mousemove", handleMouse);
    el.addEventListener("mouseleave", handleLeave);

    return () => {
      el.removeEventListener("mousemove", handleMouse);
      el.removeEventListener("mouseleave", handleLeave);
    };
  }, [selector, strength]);
}
