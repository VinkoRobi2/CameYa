export const EmployerDashboardHeader = () => {
  return (
    <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
          Panel para empleadores
        </p>
        <h1 className="text-lg md:text-xl font-semibold">
          Mi perfil y publicaciones
        </h1>
        <p className="text-xs md:text-sm text-slate-400">
          Revisa la información de tu empresa y gestiona tus ofertas flash.
        </p>
      </div>
      <button
        type="button"
        className="mt-2 inline-flex items-center justify-center rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-primary/90 md:mt-0"
      >
        Crear nueva publicación
      </button>
    </div>
  );
};
