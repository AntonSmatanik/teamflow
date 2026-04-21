import z from "zod";

export function transformChannelName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace spaces with dashes
    .replace(/[^a-z0-9-]/g, "") // Remove special characters (keep only letters, numbers, and dashes)
    .replace(/-+/g, "-") // Replace multiple consecutive dashes with single dash
    .replace(/^-|-$/g, ""); // Remove leading/trailing dashes
}

export const ChannelNameSchema = z.object({
  name: z
    .string()
    .min(2, "Channel must be at least 2 characters")
    .max(50, "Channel name must be at most 50 characters")
    .transform((val, ctx) => {
      const transformed = transformChannelName(val);

      if (transformed.length < 2) {
        ctx.addIssue({
          code: "custom",
          message:
            "Channel must contain at least 2 characters after transformation",
        });

        return z.NEVER;
      }

      return transformed;
    }),
});

export type ChannelNameSchemaType = z.infer<typeof ChannelNameSchema>;
