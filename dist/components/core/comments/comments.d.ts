import type { CommentsProps } from '../../../types/comments';
import { z } from 'zod/v3';
export declare const createPresignedURLsSchema: z.ZodArray<
  z.ZodObject<
    {
      fileName: z.ZodString;
      fileType: z.ZodString;
    },
    'strip',
    z.ZodTypeAny,
    {
      fileName: string;
      fileType: string;
    },
    {
      fileName: string;
      fileType: string;
    }
  >,
  'many'
>;
export type CreatePresignedURLsInput = z.infer<typeof createPresignedURLsSchema>;
export declare function Comments({
  context,
  contextId,
  title,
  enableEmojiReactions,
  enableLike,
  enableAttachments,
  className,
}: CommentsProps): import('react/jsx-runtime').JSX.Element;
//# sourceMappingURL=comments.d.ts.map
