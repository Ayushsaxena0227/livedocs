import { useThreads } from "@liveblocks/react";
import { useIsThreadActive } from "@liveblocks/react-lexical";
import { Composer, Thread } from "@liveblocks/react-ui";
import React from "react";
import { cn } from "@/lib/utils";

const ThreadWrapper = ({ thread }: ThreadWrapperProps) => {
  const isactive = useIsThreadActive(thread.id);
  return (
    <Thread
      thread={thread}
      data-state={isactive ? "active" : null}
      className={cn(
        "commnent-thread border",
        isactive && "!border-blue-500 shadow-md",
        thread.resolved && "opacity-40"
      )}
    />
  );
};

const Commnets = () => {
  const { threads } = useThreads();
  return (
    <div className="comments-container">
      <Composer className="comment-composer" />
      {threads?.map((thread) => (
        <ThreadWrapper key={thread.id} thread={thread} />
      ))}
    </div>
  );
};

export default Commnets;
