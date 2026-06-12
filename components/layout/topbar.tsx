import { MobileNav } from "@/components/layout/mobile-nav";
import { SignOutButton } from "@/components/layout/sign-out-button";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export function Topbar({ userEmail }: { userEmail?: string | null }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border bg-card/80 px-4 backdrop-blur sm:px-6">
      <div className="flex items-center gap-3">
        <MobileNav />
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <ThemeToggle />
        {userEmail && (
          <span className="hidden max-w-[180px] truncate text-sm text-muted-foreground sm:inline">
            {userEmail}
          </span>
        )}
        <SignOutButton />
      </div>
    </header>
  );
}
