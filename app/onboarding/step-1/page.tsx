import type { Metadata } from "next";
import { OnboardingStep1Page } from "@/components/onboarding/OnboardingPages";
 
export const metadata: Metadata = {
  title: "Professional Details — PropertyLink",
  description: "Complete your agent profile setup on PropertyLink.",
};
 
export default function Step1() {
  return <OnboardingStep1Page />;
}