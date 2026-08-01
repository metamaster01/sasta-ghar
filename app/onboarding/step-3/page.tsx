import type { Metadata } from "next";
import { OnboardingStep3Page } from "@/components/onboarding/OnboardingPages";
 
export const metadata: Metadata = {
  title: "Choose Your Plan — Sastaghar",
  description: "Select the right plan for your property business.",
};
 
export default function Step3() {
  return <OnboardingStep3Page />;
}