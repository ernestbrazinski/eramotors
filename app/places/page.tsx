import Header from "@/src/components/_layout/Header/Header";
import PlacesSection from "@/src/components/Places/PlacesSection";

export const metadata = {
  title: "Места | ERAMOTORS",
  description: "Популярные направления для путешествий по Грузии на арендованном автомобиле",
};

export default function PlacesPage() {
  return (
    <>
      <Header />
      <main>
        <PlacesSection />
      </main>
    </>
  );
}
