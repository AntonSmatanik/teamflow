import SafeContent from "@/components/rich-text-editor/SafeContent";
import { MessageListItem } from "@/lib/types";
import Image from "next/image";

type ThreadReplyProps = {
  message: MessageListItem;
};

const ThreadReply = ({ message }: ThreadReplyProps) => {
  return (
    <div className="flex space-x-3 p-3 hover:bg-muted/30 rounded-lg">
      <Image
        src={message.authorAvatar}
        alt={message.authorName}
        width={32}
        height={32}
        className="size-8 rounded-full shrink-0 mt-1"
      />
      <div className="flex-1 space-y-1 min-w-0">
        <div className="flex items-center space-x-2">
          <span className="font-medium text-sm">{message.authorName}</span>
          <span className="text-xs text-muted-foreground ">
            {new Intl.DateTimeFormat("sk-SK", {
              dateStyle: "short",
              timeStyle: "short",
            }).format(message.createdAt)}
          </span>
        </div>

        <SafeContent
          className="text-sm break-words prose dark:prose-invert max-w-none marker:text-primary"
          content={JSON.parse(message.content)}
        />

        {message.imageUrl && (
          <div className="mt-2">
            <Image
              src={message.imageUrl}
              alt="Message attachment"
              width={512}
              height={512}
              className="rounded-md max-h-320 w-auto object-contain"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ThreadReply;
