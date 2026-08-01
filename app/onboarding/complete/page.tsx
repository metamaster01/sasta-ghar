import type { Metadata } from "next";
import { OnboardingCompletePage } from "@/components/onboarding/OnboardingPages";
 
export const metadata: Metadata = {
  title: "Welcome to Sastaghar!",
  description: "Your agent account is ready.",
};
 
export default function Complete() {
  return <OnboardingCompletePage />;
}