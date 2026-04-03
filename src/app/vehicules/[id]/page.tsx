import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/home/Hero";
import BookingSection from "@/components/booking/BookingSection";
import { getBookingAvailability } from "@/actions/booking";
import { getVehicleById } from "@/actions/admin";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function VehiclePage({ params }: PageProps) {
  const { id } = await params;
  
  const [vehicleResponse, availability] = await Promise.all([
    getVehicleById(id),
    getBookingAvailability(id)
  ]);

  if (!vehicleResponse.success || !vehicleResponse.vehicle) {
    notFound();
  }

  const vehicle = vehicleResponse.vehicle;

  return (
    <main className="min-h-screen relative bg-darkbg text-white selection:bg-alpine selection:text-white">
      <Header />
      <Hero vehicle={vehicle} />
      <BookingSection availability={availability} vehicle={vehicle} />
      <Footer />
    </main>
  );
}
