
//kiểu dữ liệu để load ra màng hình có phân trang khi load ra sẽ load phần data[T]
export type PaginationResult<T> = {
    data: T[]; 
    total: number;
    page: number;
    limit: number;
    totalPages: number
} 

// --- Input tạo bài viết mới ---
// Omit loại bỏ các field tự sinh (id, createdAt, updatedAt)
export type CreatePostInput = {
    userId: number; // liên kết với user tạo bài
    title: string;
    content: string;
    slug: string;
};


// --- Input cập nhật bài viết ---
// Partial<> giúp tất cả field đều optional → chỉ cần truyền field muốn sửa
// Omit loại bỏ slug để tránh đổi slug (ảnh hưởng SEO/URL)
export type UpdatePostInput = Partial<Omit<CreatePostInput, "slug" | "userId">>;