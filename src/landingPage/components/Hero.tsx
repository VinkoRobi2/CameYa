import heroVideo from "../../assets/videos/students.mp4";
import { useNavigate } from "react-router-dom";
import { motion, type Variants } from "framer-motion";

export default function Hero() {
  const navigate = useNavigate();

  const handleBuscarCameYo = () => {
    navigate("/register/student");
  };

  const handlePublicarCameYo = () => {
    navigate("/register/employer");
  };

  // Tupla de easing tipada para que TS la acepte como Easing
  const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

  // Variantes de animación para el hero (se ejecutan al montar, no por scroll)
  const containerVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.45,
        ease: EASE_OUT,
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 18 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: EASE_OUT,
      },
    },
  };

  return (
    <section className="relative flex items-center justify-center min-h-[80vh] py-20 overflow-hidden">
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src={heroVideo}
        autoPlay
        loop
        muted
        playsInline
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70" />

      <motion.div
        className="relative z-10 text-center text-white px-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          variants={itemVariants}
          className="font-display text-5xl md:text-6xl font-semibold leading-tight tracking-tight"
        >
          El trabajo flash que necesitas,
          <br />
          cuando lo necesitas.
        </motion.h1>

        <motion.p
          variants={itemVariants}
          className="mt-4 text-lg max-w-2xl mx-auto text-gray-200"
        >
          Conecta estudiantes y jóvenes con empleos de corta duración:
          rápido, seguro, flexible y joven.
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="mt-8 flex justify-center gap-4 flex-wrap"
        >
          <button
            onClick={handleBuscarCameYo}
            className="h-12 px-6 rounded-full bg-primary text-white font-semibold hover:opacity-90 transition-opacity"
          >
            Buscar CameYo
          </button>
          <button
            onClick={handlePublicarCameYo}
            className="h-12 px-6 rounded-full bg-white text-black font-semibold hover:bg-gray-200 transition-colors"
          >
            Publicar CameYo
          </button>
        </motion.div>
      </motion.div>
    </section>
  );
}
