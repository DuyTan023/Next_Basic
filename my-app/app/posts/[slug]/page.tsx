import { ApiResponse } from "@/features/posts/types/api.type";
import { PostDetail } from "@/features/posts/types/post.type";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";
import { unstable_cache } from "next/cache";
import Link from "next/link";
import { notFound } from "next/navigation";

// ─── fetch helper ─────────────────────────────────────────────────────────────

async function fetchPost(slug: string): Promise<PostDetail> {
  const res = await fetch(`http://localhost:3000/api/posts/${slug}`, {
    next: {
      revalidate: 120, // ISR: làm mới mỗi 2 phút
      tags: [`post-${slug}`, "posts"], // revalidateTag("posts") hoặc revalidateTag(`post-${slug}`)
    },
  });

  if (res.status === 404) notFound();
  if (!res.ok) throw new Error("Không thể tải bài viết");

  const json: ApiResponse<PostDetail> = await res.json();
  if (!json.success || !json.data) notFound();
  return json.data;
}

const getCachedPost = unstable_cache(
  (slug: string) => fetchPost(slug),
  ["post-detail"],
  { revalidate: 120, tags: ["posts"] },
);

// ─── metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  try {
    const post = await getCachedPost(slug);
    return {
      title: post.title,
      description: post.body.slice(0, 160),
    };
  } catch {
    return { title: "Bài viết" };
  }
}

// ─── reading-time estimate ────────────────────────────────────────────────────

function readingTime(text: string) {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

// ─── page ─────────────────────────────────────────────────────────────────────

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getCachedPost(slug);

  const date = new Date(post.create_at).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const minutes = readingTime(post.body);

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        {/* back */}
        <Link
          href="/posts"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors mb-10 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Tất cả bài viết
        </Link>

        {/* article */}
        <article>
          {/* eyebrow */}
          <p className="text-xs font-medium tracking-widest uppercase text-indigo-500 mb-3">
            Bài viết
          </p>

          {/* title */}
          <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-zinc-100 leading-tight tracking-tight mb-6">
            {post.title}
          </h1>

          {/* meta bar */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-zinc-400 dark:text-zinc-500 pb-8 border-b border-zinc-200 dark:border-zinc-800 mb-10">
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4" />
              <span className="text-zinc-600 dark:text-zinc-300 font-medium">
                {post.user?.name ?? "Ẩn danh"}
              </span>
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {date}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {minutes} phút đọc
            </span>
          </div>

          {/* body */}
          <div className="prose prose-zinc dark:prose-invert max-w-none prose-p:leading-relaxed prose-headings:font-semibold prose-headings:tracking-tight prose-a:text-indigo-600 dark:prose-a:text-indigo-400 prose-a:no-underline hover:prose-a:underline">
            {post.body
              .split("\n")
              .map((paragraph, i) =>
                paragraph.trim() ? <p key={i}>{paragraph}</p> : <br key={i} />,
              )}
          </div>
        </article>

        {/* footer nav */}
        <div className="mt-16 pt-8 border-t border-zinc-200 dark:border-zinc-800">
          <Link
            href="/posts"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại danh sách
          </Link>
        </div>
      </div>
    </main>
  );
}
