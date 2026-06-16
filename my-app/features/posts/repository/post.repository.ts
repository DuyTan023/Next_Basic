import { prisma } from "@/lib/prisma";
import { PostDetail, postDetailArgs } from "../types/post.type";
import { post } from "@/app/generated/prisma/browser";
import { CreatePostInput, UpdatePostInput } from "../types/pagination.type";


// Kiểu tham số phân trang — tách ra để tái sử dụng
type FindManyParams = {
  page?: number; //vị trí page
  limit?: number; // giới hạn số lượng mẫu tin mỗi page
};

// Kiểu trả về findMany kèm total để tính phân trang
type FindManyResult = {
  posts: post[];
  total: number;
};

export const postRepository = {

    //lấy danh sách bài viết với type là post mặc định của prisma
    findMany: async ({page = 1, limit = 10}: FindManyParams):Promise<FindManyResult> => {
        const skip = (page-1)*limit;

        // Dùng $transaction để chạy 2 query cùng lúc, tránh race condition
        const [posts, total] = await prisma.$transaction([
            prisma.post.findMany({skip, take:limit}),
            prisma.post.count()
       ])
        return {posts, total}
    },

    //lấy chi tiết bài viết với type là postDetail được định nghĩa chưa thông tin user
    findBySlug: async (slug: string): Promise<PostDetail | null> => {
        return await prisma.post.findFirst({
            where: { slug },
            ... postDetailArgs
        });
    },

      // ✅ Tạo bài viết — connect user qua userId
    create: async (input: CreatePostInput): Promise<post> => {
        const { userId, ...rest } = input;
        return await prisma.post.create({
            data: {
                ...rest,
                user: { connect: { id: userId } }, // Prisma relation connect
            },
        });
    },

      // ✅ Cập nhật theo slug (slug là định danh URL, id là định danh DB)
    updateBySlug: async (slug: string, input: UpdatePostInput): Promise<post> => {
        return await prisma.post.update({
            where: {slug},
            data: input,
        })
    },

    // ✅ Xóa theo slug
    deleteBySlug: async (slug: string): Promise<post> => {
        return await prisma.post.delete({
            where: { slug },
        });
    },
};
