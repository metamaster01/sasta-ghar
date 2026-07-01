import AboutSection from "@/components/AboutSection";
import AdvertisementSection from "@/components/Advertisementsection";
import TestimonialSection from "@/components/TestimonialSection";
import NewsletterSection from "@/components/NewsletterSection";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";

export default function page() {
  return (
    <div>
      <Navbar />
      <HeroSection />
      <AboutSection />
      <AdvertisementSection />
      <TestimonialSection />
      <NewsletterSection />
      <Footer />
    </div>
  )
}


