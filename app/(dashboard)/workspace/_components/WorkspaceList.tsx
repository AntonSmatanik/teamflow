"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { orpc } from "@/lib/orpc";
import { cn } from "@/lib/utils";
import { LoginLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { useSuspenseQuery } from "@tanstack/react-query";

const colorCombinations = [
  "bg-blue-500 hover:bg-blue-600 text-white",
  "bg-green-500 hover:bg-green-600 text-white",
  "bg-purple-500 hover:bg-purple-600 text-white",
  "bg-red-500 hover:bg-red-600 text-white",
  "bg-yellow-500 hover:bg-yellow-600 text-white",
  "bg-indigo-500 hover:bg-indigo-600 text-white",
  "bg-pink-500 hover:bg-pink-600 text-white",
];

const getWorkspaceColor = (id: string) => {
  const charSum = id
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);

  const colorIndex = charSum % colorCombinations.length;
  return colorCombinations[colorIndex];
};

export const WorkspaceList = () => {
  const {
    data: { workspaces, currentWorkSpace },
  } = useSuspenseQuery(orpc.workspace.list.queryOptions());

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-2">
        {workspaces.map((ws) => {
          const isActive = ws.id === currentWorkSpace.orgCode;

          return (
            <Tooltip key={ws.id}>
              <TooltipTrigger asChild>
                <LoginLink orgCode={ws.id}>
                  <Button
                    size="icon"
                    className={cn(
                      "size-12 transition-all duration-200",
                      getWorkspaceColor(ws.id),
                      isActive ? "rounded-lg" : "rounded-xl hover:rounded-lg",
                    )}
                  >
                    <span className="text-sm font-semibold">{ws.avatar}</span>
                  </Button>
                </LoginLink>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>
                  {ws.name} {isActive && "(Current)"}
                </p>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
};

export default WorkspaceList;
