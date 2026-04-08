import styles from "./MainBanner.module.scss";
import Img from "../_ui/Img/Img";

const MainBanner = () => {
  return (
    <div className={styles.MainBanner}>
      <Img src="/images/batumi.jpg" alt="" />
      {/* <h1 className={styles.MainBannerTitle}>
        Арендуй автомобиль и спланируй путешествие по Грузии
      </h1> */}
    </div>
  );
};

export default MainBanner;
