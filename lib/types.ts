import { InfiniteData } from "@tanstack/react-query";
import { Message } from "./generated/prisma/client";

export type MessagePage = {
  items: MessageListItem[];
  nextCursor?: string;
};

export type InfiniteMessages = InfiniteData<MessagePage>;

export type MessageListItem = Message & {
  replyCount: number;
  // reactions: GroupReactionSchemaType[];
};
