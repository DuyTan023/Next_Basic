// "use server";

// import { revalidateTag } from "next/cache";

// /**
//  * Gọi sau khi tạo / cập nhật / xóa bài viết để xóa cache.
//  *
//  * Ví dụ dùng trong Server Action hoặc Route Handler:
//  *   await revalidatePosts();          // xóa toàn bộ list
//  *   await revalidatePost("my-slug");  // xóa 1 bài cụ thể
//  */
// export async function revalidatePosts() {
//   revalidateTag("posts");
// }

// export async function revalidatePost(slug: string) {
//   revalidateTag(`post-${slug}`);
//   revalidateTag("posts"); // đồng thời làm mới list
// }
