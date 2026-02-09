import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/home/Hero";
import BookingSection from "@/components/booking/BookingSection";
import { getUnavailableDates } from "@/actions/booking";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const blockedDates = await getUnavailableDates();

  return (
    <main className="min-h-screen relative bg-darkbg text-white selection:bg-alpine selection:text-white">
      <Header />
      <Hero />
      <BookingSection blockedDates={blockedDates} />
      <Footer />
    </main>
  );
}
