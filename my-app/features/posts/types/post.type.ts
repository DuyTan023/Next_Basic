import { Prisma } from "@/app/generated/prisma/client";

// dùng cho khi lấy chi tiết bài bost
export const postDetailArgs = {
  include: {
    user: true,
  },
} satisfies Prisma.postDefaultArgs;

export type PostDetail = Prisma.postGetPayload<
  typeof postDetailArgs
>;
