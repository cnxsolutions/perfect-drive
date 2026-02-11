import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/home/Hero";
import BookingSection from "@/components/booking/BookingSection";
import { getBookingAvailability } from "@/actions/booking";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const availability = await getBookingAvailability();

  return (
    <main className="min-h-screen relative bg-darkbg text-white selection:bg-alpine selection:text-white">
      <Header />
      <Hero />
      <BookingSection availability={availability} />
      <Footer />
    </main>
  );
}

