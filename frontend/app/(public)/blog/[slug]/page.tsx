import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { POSTS, getPostBySlug } from "../posts";
import CTA from "@/components/landing/CTA";

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Post not found" };
  return {
    title: `${post.title} — SpendWise AI`,
    description: post.excerpt,
  };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const others = POSTS.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <>
      <article className="pt-32 pb-16 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            All articles
          </Link>

          <div className="flex items-center gap-3 mb-5">
            <span
              className="text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full"
              style={{
                color: post.tagColor,
                backgroundColor: `${post.tagColor}15`,
              }}
            >
              {post.tag}
            </span>
            <span className="text-xs text-gray-500 flex items-center gap-1.5">
              <Calendar className="w-3 h-3" />
              {formatDate(post.date)}
            </span>
            <span className="text-xs text-gray-500 flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              {post.readTime}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight leading-[1.15] mb-6">
            {post.title}
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed mb-8">
            {post.excerpt}
          </p>

          <div className="flex items-center gap-3 pb-8 border-b border-white/[0.06]">
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold text-sm"
              style={{
                background: `linear-gradient(135deg, ${post.tagColor}, ${post.tagColor}80)`,
              }}
            >
              {post.author.initials}
            </div>
            <div>
              <p className="text-white text-sm font-semibold">{post.author.name}</p>
              <p className="text-gray-500 text-xs">{post.author.role}</p>
            </div>
          </div>

          <div
            className={`mt-10 mb-12 aspect-[16/9] rounded-3xl bg-gradient-to-br ${post.cover.gradient} flex items-center justify-center relative overflow-hidden`}
          >
            <span className="text-8xl">{post.cover.emoji}</span>
            <div className="absolute inset-0 bg-gradient-to-tr from-black/30 via-transparent to-transparent" />
          </div>

          <div className="prose-content space-y-6">
            {post.body.map((block, i) => {
              if (block.type === "p") {
                return (
                  <p
                    key={i}
                    className="text-gray-300 text-lg leading-[1.8]"
                  >
                    {block.content as string}
                  </p>
                );
              }
              if (block.type === "h2") {
                return (
                  <h2
                    key={i}
                    className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-12 mb-2"
                  >
                    {block.content as string}
                  </h2>
                );
              }
              if (block.type === "h3") {
                return (
                  <h3
                    key={i}
                    className="text-xl font-bold text-white tracking-tight mt-8 mb-1"
                  >
                    {block.content as string}
                  </h3>
                );
              }
              if (block.type === "ul") {
                return (
                  <ul key={i} className="space-y-2 pl-1">
                    {(block.content as string[]).map((item, j) => (
                      <li
                        key={j}
                        className="text-gray-300 text-lg leading-relaxed flex gap-3"
                      >
                        <span
                          className="flex-shrink-0 mt-3 w-1.5 h-1.5 rounded-full"
                          style={{ background: post.tagColor }}
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                );
              }
              if (block.type === "quote") {
                return (
                  <blockquote
                    key={i}
                    className="border-l-2 pl-6 py-2 my-8 italic text-xl text-white leading-relaxed"
                    style={{ borderColor: post.tagColor }}
                  >
                    {block.content as string}
                  </blockquote>
                );
              }
              return null;
            })}
          </div>
        </div>
      </article>

      <section className="py-16 px-4 sm:px-6 border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-8">Keep reading</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {others.map((p) => (
              <Link
                key={p.slug}
                href={`/blog/${p.slug}`}
                className="group rounded-2xl border border-white/[0.06] bg-[#13131A] overflow-hidden hover:border-white/[0.16] transition-colors"
              >
                <div
                  className={`relative aspect-[16/10] bg-gradient-to-br ${p.cover.gradient} flex items-center justify-center`}
                >
                  <span className="text-5xl">{p.cover.emoji}</span>
                </div>
                <div className="p-5">
                  <span
                    className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
                    style={{
                      color: p.tagColor,
                      backgroundColor: `${p.tagColor}15`,
                    }}
                  >
                    {p.tag}
                  </span>
                  <h3 className="text-white font-bold mt-3 leading-snug group-hover:text-[#A78BFA] transition-colors">
                    {p.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CTA />
    </>
  );
}
