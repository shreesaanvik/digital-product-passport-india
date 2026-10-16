import { Suspense } from "react";
import { HomeExperience } from "@/components/HomeExperience";
import { PHONE_PAGE_ID } from "@/lib/appScrollLock";

export default function Page() {
  return (
    <Suspense
      fallback={
        <main id={PHONE_PAGE_ID} className="mx-auto max-w-lg px-4 py-8 text-center text-fm-muted">
          Loading
        </main>
      }
    >
      <HomeExperience />
    </Suspense>
  );
}
