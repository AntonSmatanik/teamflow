"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getAvatar } from "@/lib/get-avatar";
import { orpc } from "@/lib/orpc";
import { useSuspenseQuery } from "@tanstack/react-query";
import Image from "next/image";

const WorkspaceMembersList = () => {
  const {
    data: { members },
  } = useSuspenseQuery(orpc.channel.list.queryOptions());

  return (
    <div className="space-y-0.5 py-1">
      {members.map((member) => (
        <div
          key={member.id}
          className="flex items-center px-3 py-2 transition-colors cursor-pointer space-x-3
        hover:bg-accent"
        >
          <div className="relative">
            <Avatar className="size-8 relative">
              <Image
                src={getAvatar(member.picture ?? null, member.email!)}
                alt={member.full_name || member.email!}
                className="object-cover"
                fill
              />
              <AvatarFallback>
                {member.full_name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{member.full_name}</p>
            <p className="text-xs text-muted-foreground truncate">
              {member.email}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default WorkspaceMembersList;
