import { post } from "@/app/generated/prisma/browser";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiResponse } from "@/features/posts/types/api.type";
import { PaginationResult } from "@/features/posts/types/pagination.type";
import { ArrowRight, Calendar, FileText, User } from "lucide-react";
import { unstable_cache } from "next/cache";
import Link from "next/link";
import { Suspense } from "react";

// ─── fetch helpers ───────────────────────────────────────────────────────────

async function fetchPosts(page: number, limit: number) {
  const res = await fetch(
    `http://localhost:3000/api/posts?page=${page}&limit=${limit}`,
    {
      next: {
        revalidate: 60, // ISR: làm mới mỗi 60 giây
        tags: ["posts"], // tag để revalidateTag("posts")
      },
    },
  );

  if (!res.ok) throw new Error("Không thể tải danh sách bài viết");

  const json: ApiResponse<PaginationResult<post & { user: { name: string } }>> =
    await res.json();

  if (!json.success || !json.data) throw new Error(json.message);
  return json.data;
}

// Wrap bằng unstable_cache để cache ở tầng server (tránh fetch lại khi re-render)
const getCachedPosts = unstable_cache(
  (page: number, limit: number) => fetchPosts(page, limit),
  ["posts-list"],
  { revalidate: 60, tags: ["posts"] },
);

// ─── pagination helper ───────────────────────────────────────────────────────

function buildPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "...", total];
  if (current >= total - 3)
    return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "...", current - 1, current, current + 1, "...", total];
}

// ─── sub-components ──────────────────────────────────────────────────────────

function PostCard({ post }: { post: post }) {
  const date = new Date(post.create_at).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <Link
      href={`/posts/${post.slug}`}
      className="group block border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 bg-white dark:bg-zinc-900 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-md transition-all duration-200"
    >
      {/* title */}
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 line-clamp-2 leading-snug mb-3 transition-colors">
        {post.title}
      </h2>

      {/* excerpt */}
      <p className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-3 leading-relaxed mb-5">
        {post.body}
      </p>

      {/* meta */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-zinc-400 dark:text-zinc-500">
          <span className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" />
            {post.slug}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {date}
          </span>
        </div>
        <ArrowRight className="w-4 h-4 text-zinc-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all duration-200" />
      </div>
    </Link>
  );
}

function PostListSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div className="flex w-full max-w-xs flex-col gap-7" key={i}>
          <div className="flex flex-col gap-3">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-full" />
          </div>
          <div className="flex flex-col gap-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-full" />
          </div>
          <Skeleton className="h-8 w-24" />
        </div>
      ))}
    </div>
  );
}

// ─── main async section ───────────────────────────────────────────────────────

async function PostsSection({ page, limit }: { page: number; limit: number }) {
  const data = await getCachedPosts(page, limit);
  const totalPages = Math.ceil(data.total / limit);
  const pages = buildPageNumbers(page, totalPages);

  if (data.data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <FileText className="w-12 h-12 text-zinc-300 dark:text-zinc-600 mb-4" />
        <p className="text-zinc-500 dark:text-zinc-400 text-sm">
          Chưa có bài viết nào.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.data.map((post) => (
          <PostCard
            key={post.id}
            post={post as post & { user: { name: string } }}
          />
        ))}
      </div>

      {/* info + pagination */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-zinc-400 dark:text-zinc-500 order-2 sm:order-1">
          Hiển thị {(page - 1) * limit + 1}–{Math.min(page * limit, data.total)}{" "}
          trong tổng số{" "}
          <span className="font-medium text-zinc-600 dark:text-zinc-300">
            {data.total}
          </span>{" "}
          bài viết
        </p>

        {totalPages > 1 && (
          <div className="order-1 sm:order-2">
            <Pagination>
              <PaginationContent>
                {/* prev */}
                <PaginationItem>
                  <PaginationPrevious
                    href={page > 1 ? `?page=${page - 1}&limit=${limit}` : "#"}
                    aria-disabled={page <= 1}
                    className={
                      page <= 1 ? "pointer-events-none opacity-40" : undefined
                    }
                  />
                </PaginationItem>

                {/* page numbers */}
                {pages.map((p, idx) =>
                  p === "..." ? (
                    <PaginationItem key={`ellipsis-${idx}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={p}>
                      <PaginationLink
                        href={`?page=${p}&limit=${limit}`}
                        isActive={p === page}
                      >
                        {p}
                      </PaginationLink>
                    </PaginationItem>
                  ),
                )}

                {/* next */}
                <PaginationItem>
                  <PaginationNext
                    href={
                      page < totalPages
                        ? `?page=${page + 1}&limit=${limit}`
                        : "#"
                    }
                    aria-disabled={page >= totalPages}
                    className={
                      page >= totalPages
                        ? "pointer-events-none opacity-40"
                        : undefined
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </>
  );
}

// ─── page ─────────────────────────────────────────────────────────────────────

interface PageProps {
  searchParams: Promise<{ page?: string; limit?: string }>;
}

export default async function PostsPage({ searchParams }: PageProps) {
  const { page: pageStr, limit: limitStr } = await searchParams;
  const page = Math.max(1, Number(pageStr ?? 1));
  const limit = Math.max(1, Math.min(50, Number(limitStr ?? 2)));

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* header */}
        <div className="mb-10">
          <p className="text-xs font-medium tracking-widest uppercase text-indigo-500 mb-2">
            Blog
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Bài viết
          </h1>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400 text-sm">
            Tổng hợp các bài viết mới nhất từ cộng đồng.
          </p>
        </div>

        {/* content */}
        <Suspense fallback={<PostListSkeleton />}>
          <PostsSection page={page} limit={limit} />
        </Suspense>
      </div>
    </main>
  );
}
