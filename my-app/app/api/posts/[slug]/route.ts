import { postService } from "@/features/posts/services/post.service";
import { ApiResponse } from "@/features/posts/types/api.type";
import { PostDetail } from "@/features/posts/types/post.type";
import { NextRequest, NextResponse } from "next/server";

type routeContext = {params: Promise<{slug:string}>};
// GET /api/posts/:slug

export async function GET(_req: NextRequest, {params}: routeContext){
    const { slug } = await params;
    try{
        const post = await postService.getPostBySlug(slug);
        return NextResponse.json<ApiResponse<PostDetail>>(
            {success: true, message: "Lấy bài viết thành công", data: post}
        )
    } catch (err){
        if (err instanceof Error && err.message === "NOT_FOUND") {
            return NextResponse.json<ApiResponse<null>>(
                { success: false, message: "Không tìm thấy bài viết" },
                { status: 404 }
            );
        }
        return NextResponse.json<ApiResponse<null>>(
            { success: false, message: "Lỗi server" },
            { status: 500 }
        );
    }
}

// PUT /api/posts/:slug
// Body: { title?, content?}  — tất cả optional

export async function PUT(req: NextRequest, {params}: routeContext){
    const { slug } = await params;
    try{
        const body = await req.json();
        const post = await postService.updatePost(slug, body);
        return NextResponse.json<ApiResponse<typeof post>>(
            { success: true, message: "Cập nhật bài viết thành công", data: post},
        )
    } catch (err){
        if (err instanceof Error && err.message === "NOT_FOUND") {
            return NextResponse.json<ApiResponse<null>>(
            { success: false, message: "Không tìm thấy bài viết" },
            { status: 404 }
        );
        }
        return NextResponse.json<ApiResponse<null>>(
            { success: false, message: "Lỗi server" },
            { status: 500 }
        );
    }
}

export async function DELETE(req: NextRequest, {params} : routeContext){
    const { slug } = await params;
    try{
        await postService.deletePost(slug)
        return NextResponse.json<ApiResponse<null>>(
            {success: true, message: "Xóa bài viết thành công",}
        )
    } catch (err) {
        if (err instanceof Error && err.message === "NOT_FOUND") {
        return NextResponse.json<ApiResponse<null>>(
            { success: false, message: "Không tìm thấy bài viết" },
            { status: 404 }
        );
        }
        return NextResponse.json<ApiResponse<null>>(
        { success: false, message: "Lỗi server" },
        { status: 500 }
        );
    }
}