import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { ExternalLink } from "lucide-react";

// Importa las imágenes
import EspolLogo from "../../assets/images/landing/espol.webp"
import UCSGLogo from "../../assets/images/landing/UCSG.png"
import UGLogo from "../../assets/images/landing/UG.png"
import UCGLogo from "../../assets/images/landing/UCG.png"
import UEESLogo from "../../assets/images/landing/UEES.jpg"
import EcotecLogo from "../../assets/images/landing/ecotec.png"
import ULVRLogo from "../../assets/images/landing/ulvr.jpg"
import UTEGLogo from "../../assets/images/landing/UTEG.jpg"
import ITBLogo from "../../assets/images/landing/ITB.png"
import UALogo from "../../assets/images/landing/UArtes.png" 
import UAELogo from "../../assets/images/landing/UAE.png" 
import UPSLogo from "../../assets/images/landing/UPS.jpg"
import UMETLogo from "../../assets/images/landing/UMET.png"


type Uni = {
  name: string;
  acronym?: string;
  website: string;
  logo?: string;
};

const UNIVERSITIES: Uni[] = [
  { name: "Escuela Superior Politécnica del Litoral", acronym: "ESPOL", website: "https://www.espol.edu.ec", logo: EspolLogo, },
  { name: "Universidad de Guayaquil", acronym: "UG", website: "https://www.ug.edu.ec", logo: UGLogo, },
  { name: "Universidad Católica de Santiago de Guayaquil", acronym: "UCSG", website: "https://www.ucsg.edu.ec", logo: UCSGLogo, },
  { name: "Universidad de Especialidades Espíritu Santo", acronym: "UEES", website: "https://www.uees.edu.ec", logo: UEESLogo },
  { name: "Universidad Casa Grande", acronym: "UCG", website: "https://www.casagrande.edu.ec", logo: UCGLogo },
  { name: "Universidad ECOTEC", acronym: "ECOTEC", website: "https://www.ecotec.edu.ec", logo: EcotecLogo },
  { name: "Universidad Laica Vicente Rocafuerte", acronym: "ULVR", website: "https://www.ulvr.edu.ec", logo: ULVRLogo },
  { name: "Universidad Tecnológica Empresarial de Guayaquil", acronym: "UTEG", website: "https://www.uteg.edu.ec", logo: UTEGLogo },
  { name: "Instituto Tecnológico Bolivariano", acronym: "ITB", website: "https://www.itb.edu.ec", logo: ITBLogo },
  { name: "Universidad de las Artes", acronym: "UArtes", website: "https://www.uartes.edu.ec", logo: UALogo },
  { name: "Universidad Agraria del Ecuador", acronym: "UAE", website: "https://www.uagraria.edu.ec", logo: UAELogo },
  { name: "Universidad Politécnica Salesiana (Campus Guayaquil)", acronym: "UPS", website: "https://www.ups.edu.ec", logo: UPSLogo },
  { name: "Universidad Metropolitana", acronym: "UMET", website: "https://www.umet.edu.ec", logo: UMETLogo }
];

const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.05 * i, duration: 0.35, ease: EASE_OUT },
  }),
};

export default function Universities() {
  return (
    <section id="universities" className="py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl md:text-4xl font-semibold tracking-tight">
            Universidades en Guayaquil
          </h2>
          <p className="mt-2 text-sm md:text-base text-foreground-light/70 dark:text-foreground-dark/70">
            Alianzas y verificación pensadas para estudiantes y empleadores de la ciudad.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {UNIVERSITIES.map((u, idx) => (
            <motion.a
              key={u.name}
              href={u.website}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 rounded-2xl border border-primary/10 bg-background-light/60 dark:bg-background-dark/60 p-4 hover:border-primary/30 hover:bg-primary/5 transition-colors"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={itemVariants}
              custom={idx}
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-primary/20 overflow-hidden bg-white">
                {u.logo ? (
                  <img src={u.logo} alt={u.acronym} className="h-10 w-10 object-contain" />
                ) : (
                  <span className="text-sm font-semibold">{u.acronym ?? "UNI"}</span>
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold leading-tight">{u.name}</h3>
                <div className="mt-1 flex items-center gap-2 text-sm text-primary">
                  <span className="underline-offset-2 group-hover:underline">Sitio web</span>
                  <ExternalLink className="h-4 w-4 opacity-80" />
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
