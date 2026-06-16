// features/posts/hooks/usePosts.ts

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useEffect } from "react";
import { getPosts, PostsPage } from "@/features/posts/lib/getPosts";

export const postsQueryKey = (page: number, limit: number) =>
  ["posts", { page, limit }] as const;

interface UsePostsOptions {
  initialData: PostsPage;
  limit: number;
}

export function usePosts({ initialData, limit }: UsePostsOptions) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  // ✅ Đọc page từ URL — giữ trạng thái khi reload / share link
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));

  const { data, isFetching, isError, error, isPlaceholderData } = useQuery<PostsPage>({
    queryKey: postsQueryKey(page, limit),
    queryFn: () => getPosts({ page, limit }),

    // ✅ Page 1 dùng data từ Server Component — không fetch lại lần đầu
    initialData: page === 1 ? initialData : undefined,
    initialDataUpdatedAt: page === 1 ? Date.now() : undefined,

    // Giữ data cũ hiển thị trong khi fetch page mới (tránh flash trắng)
    placeholderData: (prev) => prev,

    staleTime: 60_000,        // 60s trước khi coi là stale
    gcTime: 5 * 60_000,       // Giữ cache 5 phút
    refetchOnWindowFocus: false,
  });

  // ✅ Prefetch page tiếp theo khi user đang ở page hiện tại
  useEffect(() => {
    const totalPages = data?.totalPages ?? 1;
    if (page < totalPages) {
      queryClient.prefetchQuery({
        queryKey: postsQueryKey(page + 1, limit),
        queryFn: () => getPosts({ page: page + 1, limit }),
        staleTime: 60_000,
      });
    }
  }, [page, data?.totalPages, limit, queryClient]);

  // ✅ Thay đổi page = cập nhật URL (có thể Back/Forward)
  const setPage = useCallback(
    (nextPage: number) => {
      const params = new URLSearchParams(searchParams.toString());
      if (nextPage === 1) {
        params.delete("page");
      } else {
        params.set("page", String(nextPage));
      }
      // Scroll lên đầu danh sách khi chuyển trang
      router.push(`${pathname}?${params.toString()}`, { scroll: true });
    },
    [router, pathname, searchParams]
  );

  return {
    posts: data?.data ?? [],
    total: data?.total ?? 0,
    totalPages: data?.totalPages ?? 1,
    page,
    setPage,
    isFetching,
    isTransitioning: isPlaceholderData && isFetching,
    isError,
    error: error instanceof Error ? error.message : "Lỗi không xác định",
  };
}