import Header from "@/src/components/_layout/Header/Header";
import MainBanner from "@/src/components/MainBanner/MainBanner";
import CarsSection from "@/src/components/Cars/CarsSection";
import TravelSection from "@/src/components/Travel/TravelSection";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <MainBanner />
        <CarsSection />
        {/* <TravelSection /> */}
        <div style={{ height: "1000px" }}></div>
      </main>
    </>
  );
}
