"use client";

// features/posts/components/PostsClient.tsx
// ✅ Client Component — nhận initialData từ Server, React Query quản lý cache

import { useRef, useEffect } from "react";
import Link from "next/link";
import { PostsPage } from "@/features/posts/lib/getPosts";
import { usePosts } from "@/features/posts/hooks/usePosts";
import { PostsSkeleton } from "./PostsSkeleton";
import { Pagination } from "./Pagination"

interface PostsClientProps {
  initialData: PostsPage;
  limit: number;
}

export function PostsClient({ initialData, limit }: PostsClientProps) {
  const { posts, total, totalPages, page, setPage, isFetching, isTransitioning, isError, error } =
    usePosts({ initialData, limit });

  // ✅ Scroll Restoration: lưu vị trí scroll khi rời trang
  const listRef = useRef<HTMLDivElement>(null);
  useScrollRestoration(page);

  return (
    <>
      <style>{styles}</style>

      <header className="page-header">
        <div className="header-inner">
          <div>
            <p className="header-label">Bài viết</p>
            <h1 className="header-title">Danh sách bài viết</h1>
          </div>
          <div className="header-right">
            {!isError && (
              <p className="header-count">
                {total} bài viết
                {isFetching && <span className="fetching-dot" />}
              </p>
            )}
          </div>
        </div>
      </header>

      <main className="page-body" ref={listRef}>
        {isError && (
          <div className="error-box">
            <span className="error-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* Skeleton chỉ hiện khi chưa có data lần đầu */}
        {!posts.length && !isError && <PostsSkeleton count={limit} />}

        {/* ✅ Data cũ hiện mờ khi đang transition sang page mới */}
        {posts.length > 0 && (
          <div className={`post-list${isTransitioning ? " is-transitioning" : ""}`}>
            {posts.map((post, idx) => (
              <div key={post.id}>
                <Link href={`/posts/${post.slug}`} className="post-card">
                  <div className="post-meta">
                    <span className="post-date">{formatDate(String(post.create_at))}</span>
                    <span className="post-dot" />
                    <span className="post-tag">Bài viết</span>
                  </div>
                  <h2 className="post-title">{post.title}</h2>
                  <p className="post-excerpt">{getExcerpt(post.body)}</p>
                  <div className="post-footer">
                    <span className="post-slug">/{post.slug}</span>
                    <span className="read-more">Đọc tiếp →</span>
                  </div>
                </Link>
                {idx < posts.length - 1 && <div className="post-divider" />}
              </div>
            ))}
          </div>
        )}

        {posts.length === 0 && !isError && !isFetching && (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <p className="empty-title">Chưa có bài viết nào</p>
            <p className="empty-desc">Các bài viết sẽ xuất hiện ở đây sau khi được tạo.</p>
          </div>
        )}

        {totalPages > 1 && (
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        )}
      </main>
    </>
  );
}

// ─── Scroll Restoration ────────────────────────────────────────────────────────
// Lưu scrollY theo page key, phục hồi khi quay lại bằng Back/Forward
function useScrollRestoration(page: number) {
  const scrollKey = `posts-scroll-${page}`;

  useEffect(() => {
    // Phục hồi vị trí cũ nếu có (Back navigation)
    const saved = sessionStorage.getItem(scrollKey);
    if (saved) {
      requestAnimationFrame(() => window.scrollTo(0, Number(saved)));
    } else {
      window.scrollTo(0, 0);
    }

    // Lưu vị trí khi rời đi
    const save = () => sessionStorage.setItem(scrollKey, String(window.scrollY));
    window.addEventListener("scrollend", save, { passive: true });
    return () => window.removeEventListener("scrollend", save);
  }, [page, scrollKey]);
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getExcerpt(content: string, maxLen = 150) {
  const plain = content.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
  return plain.length > maxLen ? plain.slice(0, maxLen) + "…" : plain;
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
    background: #f8f9fb;
    color: #1a1a2e;
    min-height: 100vh;
  }

  .page-header {
    background: #fff;
    border-bottom: 1px solid #e8eaed;
    padding: 0 24px;
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .header-inner {
    max-width: 860px;
    margin: 0 auto;
    padding: 32px 0 28px;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
  }

  .header-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #5b6af0;
    margin-bottom: 8px;
  }

  .header-title {
    font-size: clamp(28px, 5vw, 40px);
    font-weight: 800;
    color: #0f0f23;
    letter-spacing: -0.02em;
    line-height: 1.1;
  }

  .header-right { display: flex; align-items: center; gap: 12px; padding-bottom: 6px; }

  .header-count {
    font-size: 14px;
    color: #6b7280;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  /* Dot nhỏ chỉ báo background fetching */
  .fetching-dot {
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #5b6af0;
    animation: pulse 1s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }

  .page-body {
    max-width: 860px;
    margin: 0 auto;
    padding: 40px 24px 80px;
  }

  /* Transition: mờ list cũ khi fetch page mới */
  .post-list {
    display: flex;
    flex-direction: column;
    gap: 2px;
    transition: opacity 0.2s ease;
  }

  .post-list.is-transitioning { opacity: 0.5; pointer-events: none; }

  .error-box {
    background: #fff1f1;
    border: 1px solid #fca5a5;
    border-radius: 10px;
    padding: 20px 24px;
    display: flex;
    gap: 12px;
    align-items: center;
    color: #b91c1c;
    margin-bottom: 24px;
  }

  .error-icon { font-size: 20px; flex-shrink: 0; }

  .post-card {
    background: #fff;
    border-radius: 12px;
    padding: 28px 32px;
    text-decoration: none;
    color: inherit;
    display: block;
    transition: box-shadow 0.18s ease, transform 0.18s ease;
    border: 1px solid #e8eaed;
  }

  .post-card:hover {
    box-shadow: 0 4px 24px rgba(91, 106, 240, 0.1);
    transform: translateY(-2px);
    border-color: #c7cdfb;
  }

  .post-meta {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 12px;
  }

  .post-date { font-size: 12px; color: #9ca3af; font-variant-numeric: tabular-nums; }
  .post-dot { width: 3px; height: 3px; border-radius: 50%; background: #d1d5db; flex-shrink: 0; }
  .post-tag {
    font-size: 11px; font-weight: 600; color: #5b6af0; background: #eef0fd;
    padding: 2px 8px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.06em;
  }

  .post-title {
    font-size: 19px; font-weight: 700; color: #0f0f23;
    line-height: 1.35; margin-bottom: 10px; letter-spacing: -0.01em;
  }

  .post-card:hover .post-title { color: #5b6af0; }

  .post-excerpt { font-size: 14px; color: #6b7280; line-height: 1.65; margin-bottom: 16px; }

  .post-footer { display: flex; align-items: center; justify-content: space-between; }

  .post-slug { font-size: 12px; color: #9ca3af; font-family: 'Fira Code', 'Courier New', monospace; }
  .read-more { font-size: 13px; font-weight: 600; color: #5b6af0; display: flex; align-items: center; gap: 4px; }

  .post-divider { height: 1px; background: transparent; margin: 4px 0; }

  .empty-state { text-align: center; padding: 80px 24px; color: #9ca3af; }
  .empty-icon { font-size: 48px; margin-bottom: 16px; }
  .empty-title { font-size: 18px; font-weight: 600; color: #374151; margin-bottom: 8px; }
  .empty-desc { font-size: 14px; }

  @media (max-width: 600px) {
    .post-card { padding: 20px; }
    .post-footer { flex-direction: column; align-items: flex-start; gap: 8px; }
  }
`;