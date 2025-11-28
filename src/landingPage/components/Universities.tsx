import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { ExternalLink } from "lucide-react";

// Importa las imágenes
import EspolLogo from "../../assets/images/landing/espol.webp";
import UCSGLogo from "../../assets/images/landing/UCSG.png";
import UGLogo from "../../assets/images/landing/UG.png";
import UCGLogo from "../../assets/images/landing/UCG.png";
import UEESLogo from "../../assets/images/landing/UEES.jpg";
import EcotecLogo from "../../assets/images/landing/ecotec.png";
import ULVRLogo from "../../assets/images/landing/ulvr.jpg";
import UTEGLogo from "../../assets/images/landing/UTEG.jpg";
import ITBLogo from "../../assets/images/landing/ITB.png";
import UALogo from "../../assets/images/landing/UArtes.png";
import UAELogo from "../../assets/images/landing/UAE.png";
import UPSLogo from "../../assets/images/landing/UPS.jpg";
import UMETLogo from "../../assets/images/landing/UMET.png";

type Uni = {
  name: string;
  acronym?: string;
  website: string;
  logo?: string;
};

const UNIVERSITIES: Uni[] = [
  { name: "Escuela Superior Politécnica del Litoral", acronym: "ESPOL", website: "https://www.espol.edu.ec", logo: EspolLogo },
  { name: "Universidad de Guayaquil", acronym: "UG", website: "https://www.ug.edu.ec", logo: UGLogo },
  { name: "Universidad Católica de Santiago de Guayaquil", acronym: "UCSG", website: "https://www.ucsg.edu.ec", logo: UCSGLogo },
  { name: "Universidad de Especialidades Espíritu Santo", acronym: "UEES", website: "https://www.uees.edu.ec", logo: UEESLogo },
  { name: "Universidad Casa Grande", acronym: "UCG", website: "https://www.casagrande.edu.ec", logo: UCGLogo },
  { name: "Universidad ECOTEC", acronym: "ECOTEC", website: "https://www.ecotec.edu.ec", logo: EcotecLogo },
  { name: "Universidad Laica Vicente Rocafuerte", acronym: "ULVR", website: "https://www.ulvr.edu.ec", logo: ULVRLogo },
  { name: "Universidad Tecnológica Empresarial de Guayaquil", acronym: "UTEG", website: "https://www.uteg.edu.ec", logo: UTEGLogo },
  { name: "Instituto Tecnológico Bolivariano", acronym: "ITB", website: "https://www.itb.edu.ec", logo: ITBLogo },
  { name: "Universidad de las Artes", acronym: "UArtes", website: "https://www.uartes.edu.ec", logo: UALogo },
  { name: "Universidad Agraria del Ecuador", acronym: "UAE", website: "https://www.uagraria.edu.ec", logo: UAELogo },
  { name: "Universidad Politécnica Salesiana (Campus Guayaquil)", acronym: "UPS", website: "https://www.ups.edu.ec", logo: UPSLogo },
  { name: "Universidad Metropolitana", acronym: "UMET", website: "https://www.umet.edu.ec", logo: UMETLogo },
];

// Variantes de animación
const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: EASE_OUT },
  },
};

export default function Universities() {
  // Solo usamos ESPOL para mostrarla, pero el resto queda listo en UNIVERSITIES
  const espolUni = UNIVERSITIES.find((u) => u.acronym === "ESPOL");

  if (!espolUni) return null;

  return (
    <section id="universities" className="py-20">
      <div className="mx-auto max-w-4xl px-6">
        <div className="text-center mb-10 space-y-2">
          <h2 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">
            Dónde funciona CameYa
          </h2>
          <p className="text-sm md:text-base text-foreground-light/70 dark:text-foreground-dark/70">
            Por el momento, CameYa está disponible de forma exclusiva para
            estudiantes de:
          </p>
        </div>

        <motion.a
          href={espolUni.website}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-4 rounded-2xl border border-primary/40 bg-primary/5 hover:border-primary/60 hover:bg-primary/10 p-5 transition-colors"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={cardVariants}
        >
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-primary/20 overflow-hidden bg-white">
            {espolUni.logo ? (
              <img
                src={espolUni.logo}
                alt={espolUni.acronym}
                className="h-12 w-12 object-contain"
              />
            ) : (
              <span className="text-sm font-semibold">
                {espolUni.acronym ?? "ESPOL"}
              </span>
            )}
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base md:text-lg font-semibold leading-tight">
                {espolUni.name}
              </h3>
              <span className="rounded-full bg-primary/10 px-2 py-[2px] text-[11px] font-semibold uppercase text-primary">
                Exclusivo por ahora
              </span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-sm text-primary">
              <span className="underline-offset-2 group-hover:underline">
                Sitio web
              </span>
              <ExternalLink className="h-4 w-4 opacity-80" />
            </div>
            <p className="mt-3 text-xs md:text-sm text-foreground-light/70 dark:text-foreground-dark/70">
              Estamos construyendo CameYa empezando por el ecosistema
              universitario de ESPOL.
            </p>
          </div>
        </motion.a>
      </div>
    </section>
  );
}
