// features/posts/lib/getPosts.ts
// ✅ Dùng được cả trong Server Component lẫn React Query fetcher

import { post } from "@/app/generated/prisma/browser";
import { ApiResponse } from "@/features/posts/types/api.type";
import { PaginationResult } from "@/features/posts/types/pagination.type";


export interface GetPostsParams {
  page: number;
  limit: number;
}

export type PostsPage = PaginationResult<post>;

export async function getPosts({ page, limit }: GetPostsParams): Promise<PostsPage> {
  // Trong Server Component: dùng absolute URL hoặc internal fetch
  // Trong Client: gọi /api/posts bình thường
  const baseUrl =
    typeof window === "undefined"
      ? process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"
      : "";

  const res = await fetch(`${baseUrl}/api/posts?page=${page}&limit=${limit}`, {
    // Server Component cache: revalidate mỗi 60s
    // Client fetch: không cache (React Query tự quản lý)
    next: typeof window === "undefined" ? { revalidate: 60 } : undefined,
  });

  if (!res.ok) throw new Error(`Lỗi ${res.status}: Không thể tải bài viết`);

  const json: ApiResponse<PostsPage> = await res.json();
  if (!json.success || !json.data) throw new Error(json.message ?? "Lỗi không xác định");

  return json.data;
}