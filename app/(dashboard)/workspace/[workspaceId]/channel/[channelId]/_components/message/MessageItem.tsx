import SafeContent from "@/components/rich-text-editor/SafeContent";
import { getAvatar } from "@/lib/get-avatar";
import { orpc } from "@/lib/orpc";
import { MessageListItem } from "@/lib/types";
import { useThread } from "@/providers/ThreadProvider";
import { useQueryClient } from "@tanstack/react-query";
import { MessagesSquare } from "lucide-react";
import Image from "next/image";
import { useCallback, useState } from "react";
import ReactionsBar from "../reaction/ReactionsBar";
import MessageHoverToolbar from "../toolbar";
import { EditMessage } from "../toolbar/EditMessage";

type MessageItemProps = {
  currentUserId: string;
  message: MessageListItem;
};

const MessageItem = ({ currentUserId, message }: MessageItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const { openThread } = useThread();
  const queryClient = useQueryClient();

  const prefetchThread = useCallback(() => {
    const options = orpc.message.thread.list.queryOptions({
      input: { messageId: message.id },
    });

    queryClient.prefetchQuery({ ...options, staleTime: 60_000 }).catch(() => {
      // Handle prefetch error if needed
    });
  }, [message.id, queryClient]);

  return (
    <div className="flex space-x-3 relative p-3 rounded-lg group hover:bg-muted/50">
      <Image
        src={getAvatar(message.authorAvatar, message.authorEmail)}
        alt={message.authorName}
        className="size-8 rounded-lg"
        width={32}
        height={32}
      />
      <div className="flex-1 space-y-1 min-w-0">
        <div className="flex items-center gap-x-2">
          <p className="font-medium leading-none">{message.authorName}</p>
          <p className="text-xs text-muted-foreground leading-none">
            {new Intl.DateTimeFormat("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }).format(message.createdAt)}{" "}
            {new Intl.DateTimeFormat("en-GB", {
              hour12: false,
              hour: "2-digit",
              minute: "2-digit",
            }).format(message.createdAt)}
          </p>
        </div>

        {isEditing ? (
          <EditMessage
            message={message}
            onCancel={() => setIsEditing(false)}
            onSave={() => setIsEditing(false)}
          />
        ) : (
          <>
            <SafeContent
              className="text-sm wrap-break-word prose max-w-none dark:prose-invert"
              content={JSON.parse(message.content)}
            />

            {message.imageUrl && (
              <div className="mt-3">
                <Image
                  src={message.imageUrl}
                  alt="Attachment"
                  width={300}
                  height={300}
                  className="rounded-md max-h-320 w-auto object-contain"
                />
              </div>
            )}

            <ReactionsBar
              messageId={message.id}
              reactions={message.reactions}
            />

            {message.replyCount > 0 && (
              <button
                type="button"
                className="mt-1 inline-flex gap-1.5 text-xs text-muted-foreground items-center 
                hover:text-foreground focus-visible:outline-none focus-visible:ring-1 cursor-pointer"
                onClick={() => openThread(message.id)}
                onMouseEnter={prefetchThread}
                onFocus={prefetchThread}
              >
                <MessagesSquare className="size-3.5" />
                <span>
                  {message.replyCount}{" "}
                  {message.replyCount === 1 ? "Reply" : "Replies"}
                </span>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                  View Thread
                </span>
              </button>
            )}
          </>
        )}
      </div>

      <MessageHoverToolbar
        canEdit={message.authorId === currentUserId}
        onEdit={() => setIsEditing(true)}
        messageId={message.id}
      />
    </div>
  );
};

export default MessageItem;
