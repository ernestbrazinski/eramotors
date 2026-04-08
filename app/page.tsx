import Header from "@/src/components/_layout/Header/Header";
import MainBanner from "@/src/components/MainBanner/MainBanner";
import CarsSection from "@/src/components/Cars/CarsSection";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <MainBanner />
        <CarsSection />
      </main>
    </>
  );
}
