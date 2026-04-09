const Img = ({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) => (
  <img
    src={src}
    alt={alt}
    className={className ?? "h-full w-full object-cover"}
  />
);

export default Img;
