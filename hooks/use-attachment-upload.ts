"use client";

import { useCallback, useMemo, useState } from "react";

const useAttachmentUpload = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [stagedUrl, setStagedUrl] = useState<string | null>(null);
  const [isUploading, setUploading] = useState(false);

  const onUploaded = useCallback((url: string) => {
    setStagedUrl(url);
    setUploading(false);
    setIsOpen(false);
  }, []);

  const clear = useCallback(() => {
    setStagedUrl(null);
    setUploading(false);
  }, []);

  return useMemo(
    () => ({
      isOpen,
      setIsOpen,
      onUploaded,
      stagedUrl,
      isUploading,
      clear,
    }),
    [isOpen, setIsOpen, onUploaded, stagedUrl, isUploading, clear],
  );
};

export default useAttachmentUpload;

export type UseAttachmentUploadReturn = ReturnType<typeof useAttachmentUpload>;
