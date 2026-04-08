import styles from "./Img.module.scss";

const Img = ({ src, alt, className }: { src: string, alt: string, className?: string }) => {
  return <img src={src} alt={alt} className={className ? `${styles.Img} ${className}` : styles.Img} />;
}

export default Img;