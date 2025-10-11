import { motion } from "framer-motion";
import { fadeUp } from "./animations";

type Props = React.PropsWithChildren<{
  as?: keyof React.JSX.IntrinsicElements;
  variants?: typeof fadeUp;
  className?: string;
  once?: boolean;
  amount?: number; // 0..1
}>;

export default function Reveal({
  as: Tag = "div",
  variants = fadeUp,
  className,
  once = true,
  amount = 0.2,
  children,
}: Props) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={variants}
    >
      {/* @ts-ignore: Tag dynamic */}
      <Tag>{children}</Tag>
    </motion.div>
  );
}
