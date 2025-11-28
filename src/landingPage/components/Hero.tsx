import heroVideo from "../../assets/videos/students.mp4";
import Reveal from "../../ui/Reveal";
import { useNavigate } from "react-router-dom";

export default function Hero() {
  const navigate = useNavigate();

  const handleBuscarCameYo = () => {
    navigate("/register/student");
  };

  const handlePublicarCameYo = () => {
    navigate("/register/employer");
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

      <div className="relative z-10 text-center text-white px-4">
        <Reveal>
          <h1 className="font-display text-5xl md:text-6xl font-semibold leading-tight tracking-tight">
            El trabajo flash que necesitas,<br /> cuando lo necesitas.
          </h1>
        </Reveal>
        <Reveal>
          <p className="mt-4 text-lg max-w-2xl mx-auto text-gray-200">
            Conecta estudiantes y jóvenes con empleos de corta duración: rápido, seguro,
            flexible y joven.
          </p>
        </Reveal>
        <div className="mt-8 flex justify-center gap-4 flex-wrap">
          <Reveal>
            <button
              onClick={handleBuscarCameYo}
              className="h-12 px-6 rounded-full bg-primary text-white font-semibold hover:opacity-90 transition-opacity"
            >
              Buscar CameYo
            </button>
          </Reveal>
          <Reveal>
            <button
              onClick={handlePublicarCameYo}
              className="h-12 px-6 rounded-full bg-white text-black font-semibold hover:bg-gray-200 transition-colors"
            >
              Publicar CameYo
            </button>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
