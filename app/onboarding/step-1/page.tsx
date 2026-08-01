import type { Metadata } from "next";
import { OnboardingStep1Page } from "@/components/onboarding/OnboardingPages";
 
export const metadata: Metadata = {
  title: "Professional Details — Sastaghar",
  description: "Complete your agent profile setup on Sastaghar.",
};
 
export default function Step1() {
  return <OnboardingStep1Page />;
}