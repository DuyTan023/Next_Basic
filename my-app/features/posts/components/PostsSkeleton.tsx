// features/posts/components/PostsSkeleton.tsx

function SkeletonCard() {
  return (
    <div className="post-skeleton">
      <div className="skeleton-meta" />
      <div className="skeleton-title" />
      <div className="skeleton-title short" />
      <div className="skeleton-excerpt" />
      <div className="skeleton-excerpt short" />
      <style>{skeletonStyles}</style>
    </div>
  );
}

export function PostsSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

// Dùng trong Suspense fallback của Server Component
export function PostsPageSkeleton() {
  return (
    <>
      <style>{skeletonStyles}</style>
      <header className="page-header">
        <div className="header-inner">
          <div>
            <div className="skeleton-label" />
            <div className="skeleton-heading" />
          </div>
        </div>
      </header>
      <main className="page-body">
        <PostsSkeleton count={5} />
      </main>
    </>
  );
}

const skeletonStyles = `
  @keyframes shimmer {
    0% { background-position: -600px 0; }
    100% { background-position: 600px 0; }
  }

  .post-skeleton {
    background: #fff;
    border-radius: 12px;
    padding: 28px 32px;
    border: 1px solid #e8eaed;
    margin-bottom: 2px;
  }

  .skeleton-meta, .skeleton-title, .skeleton-excerpt,
  .skeleton-label, .skeleton-heading {
    border-radius: 6px;
    background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
    background-size: 600px 100%;
    animation: shimmer 1.4s infinite;
    margin-bottom: 10px;
  }

  .skeleton-meta    { width: 140px; height: 14px; margin-bottom: 14px; }
  .skeleton-title   { width: 80%; height: 22px; }
  .skeleton-title.short { width: 55%; }
  .skeleton-excerpt { width: 100%; height: 14px; margin-bottom: 8px; }
  .skeleton-excerpt.short { width: 70%; }
  .skeleton-label   { width: 60px; height: 12px; margin-bottom: 10px; }
  .skeleton-heading { width: 260px; height: 36px; }
`;