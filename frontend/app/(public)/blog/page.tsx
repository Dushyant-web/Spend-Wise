import Link from "next/link";
import { ArrowRight, Calendar, Clock } from "lucide-react";
import { POSTS } from "./posts";

export const metadata = {
  title: "Blog — SpendWise AI",
  description: "Engineering, design, and research notes from the team building SpendWise.",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function BlogIndexPage() {
  const [feature, ...rest] = POSTS;

  return (
    <>
      <section className="pt-32 pb-12 px-4 sm:px-6 text-center relative">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[300px] rounded-full bg-[#A78BFA]/8 blur-[120px]" />
        </div>
        <div className="relative max-w-3xl mx-auto">
          <p className="text-[#A78BFA] text-sm font-semibold uppercase tracking-widest mb-3">
            The blog
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-5">
            Notes from the{" "}
            <span className="bg-gradient-to-r from-[#A78BFA] to-[#00D4AA] bg-clip-text text-transparent">
              SpendWise team.
            </span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Engineering deep-dives, design rationale, and what we learn from our users.
          </p>
        </div>
      </section>

      <section className="px-4 sm:px-6 pb-16">
        <div className="max-w-6xl mx-auto">
          {/* Featured */}
          <Link
            href={`/blog/${feature.slug}`}
            className="group block rounded-3xl border border-white/[0.08] bg-[#13131A] overflow-hidden hover:border-white/[0.16] transition-colors"
          >
            <div className="grid md:grid-cols-[1.1fr,1fr]">
              <div
                className={`relative aspect-[16/9] md:aspect-auto bg-gradient-to-br ${feature.cover.gradient} flex items-center justify-center`}
              >
                <span className="text-7xl">{feature.cover.emoji}</span>
                <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-transparent" />
              </div>
              <div className="p-8 sm:p-10 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-4">
                  <span
                    className="text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full"
                    style={{
                      color: feature.tagColor,
                      backgroundColor: `${feature.tagColor}15`,
                    }}
                  >
                    {feature.tag}
                  </span>
                  <span className="text-xs text-gray-500 flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" />
                    {formatDate(feature.date)}
                  </span>
                  <span className="text-xs text-gray-500 flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    {feature.readTime}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 group-hover:text-[#A78BFA] transition-colors">
                  {feature.title}
                </h2>
                <p className="text-gray-400 leading-relaxed mb-6">
                  {feature.excerpt}
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs"
                    style={{
                      background: `linear-gradient(135deg, ${feature.tagColor}, ${feature.tagColor}80)`,
                    }}
                  >
                    {feature.author.initials}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{feature.author.name}</p>
                    <p className="text-gray-500 text-xs">{feature.author.role}</p>
                  </div>
                  <ArrowRight className="ml-auto w-4 h-4 text-gray-400 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            </div>
          </Link>

          {/* Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-10">
            {rest.map((p) => (
              <Link
                key={p.slug}
                href={`/blog/${p.slug}`}
                className="group rounded-2xl border border-white/[0.06] bg-[#13131A] overflow-hidden hover:border-white/[0.16] transition-colors"
              >
                <div
                  className={`relative aspect-[16/10] bg-gradient-to-br ${p.cover.gradient} flex items-center justify-center`}
                >
                  <span className="text-5xl">{p.cover.emoji}</span>
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-transparent" />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
                      style={{
                        color: p.tagColor,
                        backgroundColor: `${p.tagColor}15`,
                      }}
                    >
                      {p.tag}
                    </span>
                    <span className="text-[10px] text-gray-500">
                      {formatDate(p.date)} · {p.readTime}
                    </span>
                  </div>
                  <h3 className="text-white font-bold text-lg leading-snug mb-2 group-hover:text-[#A78BFA] transition-colors">
                    {p.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">
                    {p.excerpt}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
