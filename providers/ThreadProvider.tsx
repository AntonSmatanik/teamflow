"use client";

import { createContext, ReactNode, useContext, useState } from "react";

type ThreadContextType = {
  selectedThreadId: string | null;
  openThread: (messageId: string) => void;
  closeThread: () => void;
  toggleThread: (messageId: string) => void;
  isThreadOpen: boolean;
};

const ThreadContext = createContext<ThreadContextType>({
  selectedThreadId: null,
  openThread: () => {},
  closeThread: () => {},
  toggleThread: () => {},
  isThreadOpen: false,
});

const ThreadProvider = ({ children }: { children: ReactNode }) => {
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [isThreadOpen, setIsThreadOpen] = useState(false);

  const openThread = (messageId: string) => {
    setSelectedThreadId(messageId);
    setIsThreadOpen(true);
  };

  const closeThread = () => {
    setSelectedThreadId(null);
    setIsThreadOpen(false);
  };

  const toggleThread = (messageId: string) => {
    if (selectedThreadId === messageId && isThreadOpen) {
      closeThread();
    } else {
      openThread(messageId);
    }
  };

  return (
    <ThreadContext
      value={{
        selectedThreadId,
        openThread,
        closeThread,
        toggleThread,
        isThreadOpen,
      }}
    >
      {children}
    </ThreadContext>
  );
};

export default ThreadProvider;

export const useThread = () => {
  const context = useContext(ThreadContext);

  if (!context) {
    throw new Error("useThread must be used within a ThreadProvider");
  }

  return context;
};
