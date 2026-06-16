"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ApiResponse } from "@/features/posts/types/api.type";
import { post } from "@/app/generated/prisma/browser";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function readingTime(content: string) {
  const words = content.replace(/<[^>]*>/g, "").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function SkeletonDetail() {
  return (
    <div className="skeleton-wrapper">
      <div className="sk-back" />
      <div className="sk-tag" />
      <div className="sk-title" />
      <div className="sk-title med" />
      <div className="sk-meta" />
      <div className="sk-divider" />
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="sk-line"
          style={{ width: `${70 + Math.random() * 30}%` }}
        />
      ))}
    </div>
  );
}

export default function PostDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    async function fetchPost() {
      setLoading(true);
      setError(null);
      try {
        // Dùng slug để lọc; nếu bạn có endpoint /api/posts/:slug thì thay ở đây
        const res = await fetch(`/api/posts/${slug}`);
        if (res.status === 404) throw new Error("NOT_FOUND");
        const json: ApiResponse<post> = await res.json();
        if (!json.success || !json.data) throw new Error(json.message);
        setPost(json.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Lỗi tải bài viết");
      } finally {
        setLoading(false);
      }
    }

    fetchPost();
  }, [slug]);

  const isNotFound = error === "NOT_FOUND";

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
          background: #f8f9fb;
          color: #1a1a2e;
          min-height: 100vh;
        }

        /* Progress bar */
        .read-progress {
          position: fixed;
          top: 0; left: 0;
          height: 3px;
          background: linear-gradient(90deg, #5b6af0, #8b5cf6);
          z-index: 50;
          transition: width 0.1s linear;
        }

        /* Top nav */
        .top-nav {
          position: sticky;
          top: 0;
          background: rgba(248, 249, 251, 0.9);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1px solid #e8eaed;
          z-index: 40;
          padding: 0 24px;
        }

        .nav-inner {
          max-width: 760px;
          margin: 0 auto;
          height: 52px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .back-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          font-weight: 500;
          color: #5b6af0;
          text-decoration: none;
          padding: 6px 10px;
          border-radius: 8px;
          transition: background 0.15s;
        }

        .back-btn:hover { background: #eef0fd; }

        .nav-title {
          font-size: 14px;
          font-weight: 600;
          color: #374151;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          flex: 1;
          text-align: center;
          opacity: 0;
          transition: opacity 0.2s;
        }

        .nav-title.visible { opacity: 1; }

        .nav-spacer { width: 80px; }

        /* Main layout */
        .page-wrapper {
          max-width: 760px;
          margin: 0 auto;
          padding: 48px 24px 100px;
        }

        /* Article header */
        .article-header {
          margin-bottom: 40px;
        }

        .article-tags {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 20px;
        }

        .article-tag {
          font-size: 11px;
          font-weight: 700;
          color: #5b6af0;
          background: #eef0fd;
          padding: 4px 10px;
          border-radius: 20px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .article-title {
          font-size: clamp(26px, 5vw, 42px);
          font-weight: 800;
          color: #0f0f23;
          line-height: 1.2;
          letter-spacing: -0.025em;
          margin-bottom: 24px;
        }

        .article-meta {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #6b7280;
        }

        .meta-icon { font-size: 14px; }

        .meta-divider {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #d1d5db;
        }

        .article-slug-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 12px;
          color: #9ca3af;
          background: #f3f4f6;
          padding: 3px 10px;
          border-radius: 6px;
          font-family: 'Fira Code', 'Courier New', monospace;
        }

        /* Divider */
        .article-hr {
          border: none;
          border-top: 2px solid #e8eaed;
          margin: 32px 0;
        }

        /* Content */
        .article-content {
          font-size: 17px;
          line-height: 1.8;
          color: #374151;
        }

        .article-content p {
          margin-bottom: 1.4em;
        }

        .article-content h2 {
          font-size: 24px;
          font-weight: 700;
          color: #0f0f23;
          margin: 2em 0 0.6em;
          letter-spacing: -0.01em;
        }

        .article-content h3 {
          font-size: 20px;
          font-weight: 600;
          color: #1f2937;
          margin: 1.6em 0 0.5em;
        }

        .article-content a {
          color: #5b6af0;
          text-decoration: underline;
          text-underline-offset: 3px;
        }

        .article-content code {
          background: #f3f4f6;
          border-radius: 4px;
          padding: 2px 6px;
          font-family: 'Fira Code', 'Courier New', monospace;
          font-size: 15px;
          color: #7c3aed;
        }

        .article-content pre {
          background: #1e1e2e;
          color: #cdd6f4;
          border-radius: 10px;
          padding: 20px;
          overflow-x: auto;
          margin: 1.5em 0;
          font-size: 14px;
          line-height: 1.7;
        }

        .article-content blockquote {
          border-left: 4px solid #5b6af0;
          padding-left: 20px;
          color: #6b7280;
          font-style: italic;
          margin: 1.5em 0;
        }

        .article-content ul, .article-content ol {
          padding-left: 24px;
          margin-bottom: 1.4em;
        }

        .article-content li { margin-bottom: 0.4em; }

        /* Footer */
        .article-footer {
          margin-top: 60px;
          padding-top: 32px;
          border-top: 1px solid #e8eaed;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }

        .footer-info {
          font-size: 13px;
          color: #9ca3af;
        }

        .footer-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          font-weight: 600;
          color: #5b6af0;
          text-decoration: none;
          padding: 10px 18px;
          border: 2px solid #5b6af0;
          border-radius: 8px;
          transition: all 0.15s;
        }

        .footer-link:hover {
          background: #5b6af0;
          color: #fff;
        }

        /* Error / 404 */
        .state-box {
          text-align: center;
          padding: 80px 24px;
        }

        .state-icon { font-size: 56px; margin-bottom: 20px; }

        .state-title {
          font-size: 22px;
          font-weight: 700;
          color: #0f0f23;
          margin-bottom: 10px;
        }

        .state-desc {
          font-size: 15px;
          color: #6b7280;
          margin-bottom: 28px;
          line-height: 1.6;
        }

        .state-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
          font-weight: 600;
          color: #fff;
          background: #5b6af0;
          padding: 10px 20px;
          border-radius: 8px;
          text-decoration: none;
          border: none;
          cursor: pointer;
          font-family: inherit;
          transition: background 0.15s;
        }

        .state-btn:hover { background: #4a59e8; }

        /* Skeleton */
        .skeleton-wrapper {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding-top: 12px;
        }

        @keyframes shimmer {
          0% { background-position: -600px 0; }
          100% { background-position: 600px 0; }
        }

        .sk-back, .sk-tag, .sk-title, .sk-meta, .sk-divider, .sk-line {
          border-radius: 6px;
          background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
          background-size: 600px 100%;
          animation: shimmer 1.4s infinite;
        }

        .sk-back { width: 80px; height: 18px; border-radius: 20px; margin-bottom: 4px; }
        .sk-tag  { width: 70px; height: 22px; border-radius: 20px; margin-top: 12px; }
        .sk-title { width: 90%; height: 38px; margin-top: 8px; }
        .sk-title.med { width: 60%; height: 38px; }
        .sk-meta { width: 220px; height: 16px; margin-top: 4px; }
        .sk-divider { width: 100%; height: 2px; margin: 12px 0 8px; }
        .sk-line { height: 16px; }

        @media (max-width: 600px) {
          .page-wrapper { padding: 32px 16px 80px; }
          .article-footer { flex-direction: column; align-items: flex-start; }
        }
      `}</style>

      <ReadProgress />

      <nav className="top-nav">
        <div className="nav-inner">
          <Link href="/posts" className="back-btn">
            ← Danh sách
          </Link>
          <span
            className={`nav-title${post ? " visible" : ""}`}
            title={post?.title}
          >
            {post?.title}
          </span>
          <div className="nav-spacer" />
        </div>
      </nav>

      <main className="page-wrapper">
        {loading && <SkeletonDetail />}

        {!loading && isNotFound && (
          <div className="state-box">
            <div className="state-icon">🔍</div>
            <h1 className="state-title">Không tìm thấy bài viết</h1>
            <p className="state-desc">
              Bài viết <code style={{ background: "#f3f4f6", padding: "2px 6px", borderRadius: 4 }}>/{slug}</code> không tồn tại hoặc đã bị xoá.
            </p>
            <Link href="/posts" className="state-btn">← Quay lại danh sách</Link>
          </div>
        )}

        {!loading && error && !isNotFound && (
          <div className="state-box">
            <div className="state-icon">⚠️</div>
            <h1 className="state-title">Đã xảy ra lỗi</h1>
            <p className="state-desc">{error}</p>
            <button className="state-btn" onClick={() => window.location.reload()}>
              Thử lại
            </button>
          </div>
        )}

        {!loading && !error && post && (
          <article>
            <header className="article-header">
              <div className="article-tags">
                <span className="article-tag">Bài viết</span>
              </div>

              <h1 className="article-title">{post.title}</h1>

              <div className="article-meta">
                <span className="meta-item">
                  <span className="meta-icon">📅</span>
                  {formatDate(String (post.create_at))}
                </span>
                <span className="meta-divider" />
                <span className="meta-item">
                  <span className="meta-icon">⏱</span>
                  {readingTime(post.body)} phút đọc
                </span>
                <span className="meta-divider" />
                <span className="article-slug-badge">
                  <span>🔗</span>/{post.slug}
                </span>
              </div>
            </header>

            <hr className="article-hr" />

            <div
              className="article-content"
              dangerouslySetInnerHTML={{ __html: post.body }}
            />

            <footer className="article-footer">
              <p className="footer-info">
                Cập nhật lần cuối: {formatDate( String (post.create_at))}
              </p>
              <Link href="/posts" className="footer-link">
                ← Xem tất cả bài viết
              </Link>
            </footer>
          </article>
        )}
      </main>
    </>
  );
}

// Read progress bar
function ReadProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function handleScroll() {
      const el = document.documentElement;
      const scrolled = el.scrollTop;
      const total = el.scrollHeight - el.clientHeight;
      setProgress(total > 0 ? (scrolled / total) * 100 : 0);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return <div className="read-progress" style={{ width: `${progress}%` }} />;
}