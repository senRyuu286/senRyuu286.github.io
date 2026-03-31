import type React from "react";

export const scrollToSection = (
  targetId: string,
  setScrolled: (value: boolean) => void,
  isScrolling: React.MutableRefObject<boolean>,
) => {
  const target = document.querySelector(targetId);
  if (!target) return;

  window.dispatchEvent(new CustomEvent("navbar-collapse"));
  setScrolled(true);
  isScrolling.current = true;

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const navbarOffset = 72;
      const elementPosition =
        target.getBoundingClientRect().top + window.scrollY;

      window.scrollTo({
        top: elementPosition - navbarOffset,
        behavior: "smooth",
      });

      setTimeout(() => {
        isScrolling.current = false;
        window.dispatchEvent(new CustomEvent("navbar-unlock"));
      }, 800);
    });
  });
};