"use client";

import { PanelLeftIcon } from "lucide-react";
import Image from "next/image";
import { memo } from "react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import type { VisibilityType } from "./visibility-selector";

type ChatHeaderProps = {
  chatId: string;
  selectedVisibilityType: VisibilityType;
  isReadonly: boolean;
};

function PureChatHeader(_props: ChatHeaderProps) {
  const { state, toggleSidebar, isMobile } = useSidebar();

  if (state === "collapsed" && !isMobile) {
    return null;
  }

  return (
    <header className="sticky top-0 flex h-14 items-center gap-2 bg-sidebar px-3">
      <Button
        className="md:hidden"
        onClick={toggleSidebar}
        size="icon-sm"
        variant="ghost"
      >
        <PanelLeftIcon className="size-4" />
      </Button>

      <Image
        alt="Kzcoder"
        className="size-8 object-contain md:ml-auto"
        height={32}
        src="/kzcoder-logo-alien.png"
        width={32}
      />
    </header>
  );
}

export const ChatHeader = memo(
  PureChatHeader,
  (prevProps, nextProps) =>
    prevProps.chatId === nextProps.chatId &&
    prevProps.selectedVisibilityType === nextProps.selectedVisibilityType &&
    prevProps.isReadonly === nextProps.isReadonly
);
