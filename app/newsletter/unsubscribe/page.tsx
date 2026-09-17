// app/newsletter/unsubscribe/page.tsx

import { Suspense } from "react";
import PageHero from "@/components/shared/PageHero";
import UnsubscribeClient from "./UnsubscribeClient";

export const metadata = {
  title: "Unsubscribe | PropertyLink",
};

export default function UnsubscribePage() {
  return (
    <>
      <PageHero eyebrow="Newsletter" title="Unsubscribe" />
      <Suspense
        fallback={
          <div className="text-center py-16 text-gray-400 text-sm" style={{ fontFamily: "Poppins, sans-serif" }}>
            Loading…
          </div>
        }
      >
        <UnsubscribeClient />
      </Suspense>
    </>
  );
}