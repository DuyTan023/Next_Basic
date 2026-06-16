// GET /api/posts?page=1&limit=10

import { post } from "@/app/generated/prisma/browser";
import { postService } from "@/features/posts/services/post.service";
import { ApiResponse } from "@/features/posts/types/api.type";
import { PaginationResult } from "@/features/posts/types/pagination.type";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req:NextRequest){
    try{
        const {searchParams} = new URL(req.url)
        const page = Number(searchParams.get("page") ?? 1);
        const limit = Number(searchParams.get("limit") ?? 10);
        const posts = await postService.getPost({page, limit});
        return NextResponse.json<ApiResponse<PaginationResult<post>>>({
            success: true,
            message: "Lấy danh sách bài viết thành công",
            data: posts
        })
    } catch(err){
        return NextResponse.json<ApiResponse<null>>(
                { success: false, message: "Lỗi server" },
                { status: 500 }
        )
    }
}


// POST /api/posts
// Body: { title, slug, content, userId}
export async function POST(req: NextRequest){
    try{
        const body = await req.json();
        const post  = await postService.createPost(body);

        return NextResponse.json<ApiResponse<typeof post>>(
            { success: true, message: "Tạo bài viết thành công", data: post },
            { status: 201 }
        )
    } catch (err){

        if (err instanceof Error && err.message === "SLUG_EXISTS") {
        return NextResponse.json<ApiResponse<null>>(
            { success: false, message: "Slug đã tồn tại" },
            { status: 409 } // 409 Conflict
        );
        }
        return NextResponse.json<ApiResponse<null>>(
            { success: false, message: "Lỗi server" },
            { status: 500 },
    )}
}