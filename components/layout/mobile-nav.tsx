"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export function MobileNav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="flex h-10 w-10 items-center justify-center rounded-lg text-foreground hover:bg-muted lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {open
        ? createPortal(
            <div className="fixed inset-0 z-[100] lg:hidden">
              <div
                className="fixed inset-0 bg-black/55"
                onClick={() => setOpen(false)}
                aria-hidden="true"
              />
              <aside
                role="dialog"
                aria-modal="true"
                aria-label="Navigation menu"
                className="fixed inset-y-0 left-0 z-[101] flex h-[100dvh] w-80 max-w-[86vw] flex-col border-r border-border bg-card text-card-foreground shadow-2xl"
              >
                <Sidebar onNavigate={() => setOpen(false)} />
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
                >
                  <X className="h-5 w-5" />
                </button>
              </aside>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
