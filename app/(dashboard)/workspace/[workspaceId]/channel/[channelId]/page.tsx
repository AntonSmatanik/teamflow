"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { orpc } from "@/lib/orpc";
import ThreadProvider, { useThread } from "@/providers/ThreadProvider";
import { KindeUser } from "@kinde-oss/kinde-auth-nextjs";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import ChannelHeader from "./_components/ChannelHeader";
import MessageInputForm from "./_components/message/MessageInputForm";
import MessageList from "./_components/MessageList";
import ThreadSidebar from "./_components/thread/ThreadSidebar";

const ChannelContent = () => {
  const { channelId } = useParams<{ channelId: string }>();
  const { data, isLoading, error } = useQuery(
    orpc.channel.get.queryOptions({ input: { channelId } }),
  );

  const { isThreadOpen } = useThread();

  if (error) {
    return <div>Error loading channel</div>;
  }

  return (
    <div className="flex h-screen w-full">
      <div className="flex flex-col flex-1 min-w-0">
        {isLoading ? (
          <div className="flex items-center justify-between h-14 px-4 border-b">
            <Skeleton className="h-6 w-40" />
            <div className="flex items-center space-x-2">
              <Skeleton className="h-8 w-28" />
              <Skeleton className="h-8 w-30" />
              <Skeleton className="h-8 w-10" />
            </div>
          </div>
        ) : (
          <ChannelHeader channelName={data?.channelName} />
        )}

        <div className="flex-1 overflow-hidden mb-4">
          <MessageList />
        </div>

        <div className="border-t bg-background p-4">
          <MessageInputForm
            channelId={channelId}
            user={data?.currentUser as KindeUser<Record<string, unknown>>}
          />
        </div>
      </div>

      {isThreadOpen && (
        <ThreadSidebar
          user={data?.currentUser as KindeUser<Record<string, unknown>>}
        />
      )}
    </div>
  );
};

const ChannelPage = () => (
  <ThreadProvider>
    <ChannelContent />
  </ThreadProvider>
);

export default ChannelPage;
