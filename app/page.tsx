import AboutSection from "@/components/AboutSection";
import AdvertisementSection from "@/components/Advertisementsection";
import TestimonialSection from "@/components/TestimonialSection";
import NewsletterSection from "@/components/NewsletterSection";

// import Footer from "@/components/Footer";
// import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import WhyChooseSastaghar from "@/components/WhyChooseSastaghar";
import PropertyGallery from "@/components/PropertyGallery";
import FeaturedProperties from "@/components/FeaturedProperties";
import BlogPreview from "@/components/BlogPreview";
import PopularCities from "@/components/PopularCities";
import { createServerSupabaseClient } from "@/lib/supabase/server";

// ── Fetch featured properties (server-side) ──────────────────
async function getFeaturedProperties() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .rpc("search_properties", {
      p_limit:  8,
      p_offset: 0,
      p_sort:   "featured_first",
    });
  return data ?? [];
}

// ── Fetch latest blog posts ───────────────────────────────────
async function getLatestBlogs() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("id, title, slug, excerpt, cover_image_url, category, published_at")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(3);
  return data ?? [];
}


export default async function page() {

  const [featuredProperties, blogs] = await Promise.all([
    getFeaturedProperties(),
    getLatestBlogs(),
  ]);
  return (
    <div>
      {/* <Navbar /> */}
      <HeroSection />
      <FeaturedProperties />
      <PopularCities />
      <AboutSection />
      <AdvertisementSection />
      <WhyChooseSastaghar />
      <BlogPreview posts={blogs} />
      <TestimonialSection />
      <PropertyGallery />
      <NewsletterSection />
      {/* <Footer /> */}
    </div>
  )
}


