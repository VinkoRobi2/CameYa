import type { UserRatingSummary } from "../../common/types";
import { RatingStars } from "../../common/components/RatingStars";
import { EmptyState } from "../../common/components/EmptyState";

type EmployerProfile = {
  name: string;
  sector: string;
  location: string;
  description: string;
  rating: UserRatingSummary;
};

type EmployerPostStatus = "ACTIVO" | "FINALIZADO";

type EmployerPost = {
  id: string | number;
  title: string;
  publishedAgoLabel: string;
  status: EmployerPostStatus;
};

interface EmployerProfileOverviewProps {
  profile: EmployerProfile;
  posts: EmployerPost[];
  onEditProfile?: () => void;
  onOpenPost?: (postId: EmployerPost["id"]) => void;
}

export const EmployerProfileOverview = ({
  profile,
  posts,
  onEditProfile,
  onOpenPost,
}: EmployerProfileOverviewProps) => {
  const initials = profile.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");

  return (
    <div className="flex flex-col gap-6">
      {/* Card de encabezado de empresa */}
      <section className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="flex flex-1 items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/15 text-2xl font-semibold text-primary md:h-24 md:w-24">
            {initials || "🏢"}
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-semibold md:text-2xl">
              {profile.name}
            </h2>
            <p className="text-sm text-slate-500">
              {profile.sector} · {profile.location}
            </p>
            <RatingStars rating={profile.rating} size="sm" />
          </div>
        </div>
        <button
          type="button"
          onClick={onEditProfile}
          className="inline-flex items-center justify-center self-start rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-xs font-semibold text-primary transition hover:bg-primary hover:text-white md:self-center"
        >
          Editar perfil
        </button>
      </section>

      {/* Descripción de la empresa */}
      <section className="rounded-2xl border border-border bg-background-light/70 px-4 py-4 text-sm leading-relaxed dark:bg-background-dark/70 md:px-5 md:py-5">
        <h3 className="mb-2 text-base font-semibold">
          Descripción de la empresa
        </h3>
        <p className="text-slate-400">{profile.description}</p>
      </section>

      {/* Publicaciones anteriores */}
      <section className="rounded-2xl border border-border bg-background-light/70 px-4 py-4 dark:bg-background-dark/70 md:px-5 md:py-5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h3 className="text-base font-semibold">
            Publicaciones anteriores
          </h3>
          {posts.length > 0 && (
            <button
              type="button"
              className="text-xs font-medium text-primary hover:underline"
            >
              Ver todas
            </button>
          )}
        </div>

        {posts.length === 0 ? (
          <EmptyState
            title="Aún no tienes publicaciones"
            description="Cuando publiques trabajos, podrás ver aquí el historial de ofertas creadas y su estado."
          />
        ) : (
          <div className="divide-y divide-border">
            {posts.map((post) => (
              <article
                key={post.id}
                className="flex flex-col gap-3 py-3 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="text-sm font-medium">{post.title}</p>
                  <p className="text-xs text-slate-400">
                    {post.publishedAgoLabel}
                  </p>
                </div>
                <div className="flex items-center gap-3 md:justify-end">
                  <span
                    className={[
                      "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
                      post.status === "FINALIZADO"
                        ? "border border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                        : "border border-sky-500/40 bg-sky-500/10 text-sky-300",
                    ].join(" ")}
                  >
                    {post.status === "FINALIZADO" ? "Finalizado" : "Activo"}
                  </span>
                  <button
                    type="button"
                    onClick={() => onOpenPost?.(post.id)}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Ver publicación
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
