import { motion } from "framer-motion";
import { staggerContainer } from "./animations";

type Props = React.PropsWithChildren<{
  className?: string;
  stagger?: number;
  once?: boolean;
  amount?: number;
}>;

export default function Stagger({
  className,
  stagger = 0.12,
  once = true,
  amount = 0.2,
  children,
}: Props) {
  return (
    <motion.section
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={staggerContainer(stagger)}
    >
      {children}
    </motion.section>
  );
}
