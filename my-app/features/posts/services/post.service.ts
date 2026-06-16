import { post } from "@/app/generated/prisma/client";
import { postRepository } from "../repository/post.repository";
import { CreatePostInput, PaginationResult, UpdatePostInput } from "../types/pagination.type";
import { PostDetail } from "../types/post.type";


type GetPostsParams = {
  page?: number;
  limit?: number;
};


// trang service gọi các Repository.
export const postService = {
    getPost : async ({page = 1, limit= 10}: GetPostsParams):Promise<PaginationResult<post>> =>{
        try{
            const {posts, total} = await postRepository.findMany({page, limit});
            return{
                data: posts,
                total: total,
                page: page,
                limit: limit,
                totalPages: Math.ceil(total / limit),
            }
        } catch {
            throw new Error("Không thể lấy danh sách bài viết");
        }
    },

    getPostBySlug: async (slug: string):Promise<PostDetail> =>{
        try{
            const post  = await postRepository.findBySlug(slug)
            if (!post) throw new Error("NOT_FOUND");
            return post;
        } catch (err){
            if (err instanceof Error && err.message === "NOT_FOUND") throw err;
            throw new Error("Không thể lấy bài viết theo slug");
        }
    },

    createPost: async (input : CreatePostInput): Promise<post> =>{
        try{
            const existing  = await postRepository.findBySlug(input.slug);
            if (existing) throw new Error("SLUG_EXISTS");
            return await postRepository.create(input);
        }catch (err) {
            if (err instanceof Error && err.message === "SLUG_EXISTS") throw err;
            throw new Error("Không thể tạo bài viết");
        }
    },

    updatePost: async (slug:string, input: UpdatePostInput): Promise<post> =>{
        try{
            const existing  = await postRepository.findBySlug(slug);
            if (existing) throw new Error("SLUG_EXISTS");
            return await postRepository.updateBySlug(slug, input);
        } catch (err) {
            if (err instanceof Error && err.message === "SLUG_EXISTS") throw err;
            throw new Error("Không thể cập nhật bài viết");
        }
    },

    deletePost: async (slug: string): Promise<post> =>{
        try{
            const existing  = await postRepository.findBySlug(slug);
            if (existing) throw new Error("SLUG_EXISTS");
            return postRepository.deleteBySlug(slug)
        } catch (err) {
            if (err instanceof Error && err.message === "SLUG_EXISTS") throw err;
            throw new Error("Không thể xóa bài viết");
        }
    }
}
