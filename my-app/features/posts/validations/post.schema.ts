import { z } from "zod";


// đinh nghĩa các quy tắc của các thuộc tính post dùng trong update và create
export const createPostSchema = z.object({
    userId: z
        .number()
        .int()
        .positive(),
    title: z
        .string()
        .trim()
        .min(3)
        .max(255),
    body: z
        .string()
        .min(10),
    slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9-]+$/)
});

export const updatePostSchema =
  createPostSchema;

export type CreatePostInput =
  z.infer<typeof createPostSchema>;

export type UpdatePostInput =
  z.infer<typeof updatePostSchema>;