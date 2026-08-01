import type { Metadata } from "next";
import { OnboardingStep2Page } from "@/components/onboarding/OnboardingPages";
 
export const metadata: Metadata = {
  title: "Verification — Sastaghar",
  description: "Get your agent profile verified on Sastaghar.",
};
 
export default function Step2() {
  return <OnboardingStep2Page />;
}