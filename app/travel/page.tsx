import Header from "@/src/components/_layout/Header/Header";
import TravelCalculatorPage from "@/src/components/Travel/TravelCalculatorPage";

export const metadata = {
  title: "Калькулятор путешествий | ERAMOTORS",
  description: "Рассчитайте стоимость поездки по Грузии на арендованном автомобиле",
};

export default function TravelPage() {
  return (
    <>
      <Header />
      <main>
        <TravelCalculatorPage />
      </main>
    </>
  );
}
