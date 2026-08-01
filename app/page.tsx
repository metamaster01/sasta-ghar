import AboutSection from "@/components/AboutSection";
import AdvertisementSection from "@/components/Advertisementsection";
import TestimonialSection from "@/components/TestimonialSection";
import NewsletterSection from "@/components/NewsletterSection";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import WhyChooseSastaghar from "@/components/WhyChooseSastaghar";
import PropertyGallery from "@/components/PropertyGallery";
import FeaturedProperties from "@/components/FeaturedProperties";

export default function page() {
  return (
    <div>
      <Navbar />
      <HeroSection />
      <AboutSection />
      <FeaturedProperties />
      <AdvertisementSection />
      <TestimonialSection />
      <WhyChooseSastaghar />
      <PropertyGallery />
      <NewsletterSection />
      <Footer />
    </div>
  )
}


