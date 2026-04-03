import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/home/Hero";
import BookingSection from "@/components/booking/BookingSection";
import { getBookingAvailability } from "@/actions/booking";
import { getVehicles } from "@/actions/admin";

export const dynamic = 'force-dynamic';

export default async function Home() {
  const vehiclesResponse = await getVehicles();
  const mainVehicle = vehiclesResponse.success && vehiclesResponse.vehicles && vehiclesResponse.vehicles.length > 0
    ? vehiclesResponse.vehicles[0]
    : undefined;

  const availability = await getBookingAvailability(mainVehicle?.id);

  return (
    <main className="min-h-screen relative bg-darkbg text-white selection:bg-alpine selection:text-white">
      <Header />
      <Hero vehicle={mainVehicle} />
      <BookingSection availability={availability} vehicle={mainVehicle} />
      <Footer />
    </main>
  );
}

