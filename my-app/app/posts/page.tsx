// app/posts/page.tsx
// ✅ Server Component — chạy trên server, fetch page 1 trước

import { Suspense } from "react";
import { PostsClient } from "@/features/posts/components/PostsClient";
import { getPosts } from "@/features/posts/lib/getPosts";
import { PostsPageSkeleton } from "@/features/posts/components/PostsSkeleton";

const LIMIT = 10;

export const metadata = {
  title: "Danh sách bài viết",
};

export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  // Server luôn render page 1 để hydrate nhanh
  // Client sẽ đọc URL để hiển thị đúng page
  const initialData = await getPosts({ page: 1, limit: LIMIT });

  return (
    <Suspense fallback={<PostsPageSkeleton />}>
      <PostsClient initialData={initialData} limit={LIMIT} />
    </Suspense>
  );
}