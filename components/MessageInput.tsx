import * as React from "react";
import { MdSend } from "react-icons/md";
import { useSession } from "next-auth/react";

import { Button, Textarea } from "./ui";
import { cn } from "@/lib/utils";
import { IconSize } from "@/utils";
import { useSocket } from "@/providers";
import { useGroupStore } from "@/hooks";

const MessageInput = () => {
  const [message, setMessage] = React.useState<string>("");

  const { activeGroup } = useGroupStore();
  const { data: session } = useSession();
  const { sendMessage } = useSocket();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      activeGroup?.id === undefined ||
      activeGroup?.id === null ||
      !session?.user?.id
    )
      return;
    sendMessage({ room_id: activeGroup.id, message, sent_by: session.user.id });
    setMessage("");
  };

  React.useEffect(() => {
    const isScrollable = (el: HTMLTextAreaElement): boolean => {
      return (
        el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight
      );
    };

    const MAX_ROW = 3;
    const textarea = document.getElementById(
      "message-text-area"
    ) as HTMLTextAreaElement;

    const handleInput = (e: Event) => {
      const el = e.target as HTMLTextAreaElement;
      if (!el) return;

      if (isScrollable(el) && MAX_ROW > el.rows) {
        el.rows = el.rows + 1;
      }
      if (!el.value) {
        el.rows = 1;
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const el = e.target as HTMLTextAreaElement;
      if (!el) return;

      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
      }
    };

    if (textarea) {
      textarea.addEventListener("input", handleInput);
      textarea.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      if (textarea) {
        textarea.removeEventListener("input", handleInput);
        textarea.removeEventListener("keydown", handleKeyDown);
      }
    };
  }, [message]);

  return (
    <form onSubmit={handleSubmit} className="relative flex items-center">
      <Textarea
        placeholder="Message..."
        id="message-text-area"
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        className={cn(
          "min-h-10 max-h-28 resize-none",
          message.length > 0 && "pr-12"
        )}
        rows={1}
      />
      <Button
        variant="ghost"
        type="submit"
        size="icon"
        className={cn(
          "absolute right-1 top-1/2 -translate-y-1/2 transform rounded-full",
          message.length <= 0 && "hidden"
        )}
      >
        <MdSend className="text-primary" size={IconSize} />
      </Button>
    </form>
  );
};

export default MessageInput;
