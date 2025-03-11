"use client";
import React, { useEffect, useRef, useState } from "react";
import { RoomProvider } from "@liveblocks/react";
import { ClientSideSuspense } from "@liveblocks/react";
import Header from "@/components/Header";
import { Editor } from "@/components/ui/editor/Editor";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import ActiveCollaborators from "./ActiveCollaborators";
import { Input } from "./ui/input";
import Image from "next/image";
import { updateDocument } from "@/lib/actions/rooms.actions";
import Loader from "./Loader";
import ShareModal from "./ShareModal";
const CollaborativeRoom = ({
  roomId,
  roomMetadata,
  users,
  currentUserType,
}: CollaborativeRoomProps) => {
  // const currentUserType = "editor";
  const [editing, setediting] = useState(false);
  const [loading, setloading] = useState(false);
  const [documenttitle, setdocumenttitle] = useState(roomMetadata.title);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null); // ✅ Correct ref type

  const updateTitleHandler = async (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      setloading(true);
      try {
        if (documenttitle !== roomMetadata.title) {
          //upate the title
          const updatedDocument = await updateDocument(roomId, documenttitle);
          if (updatedDocument) {
            setediting(false);
          }
        }
      } catch (error) {
        console.log(error);
      }
      setloading(false);
    }
  };
  useEffect(() => {
    const handleclickoutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setediting(false);
        updateDocument(roomId, documenttitle);
      }

      document.addEventListener("mousedown", handleclickoutside);
      return () => {
        document.removeEventListener("mousedown", handleclickoutside);
      };
    };
  }, [documenttitle]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  return (
    <RoomProvider id={roomId}>
      <ClientSideSuspense fallback={<Loader />}>
        <div className="collaborative-room">
          <Header>
            <div
              ref={containerRef}
              className="flex w-fit items-center justify-center gap-2"
            >
              {editing && !loading ? (
                <Input
                  type="text"
                  value={documenttitle}
                  ref={inputRef}
                  placeholder="Enter title"
                  onChange={(e) => setdocumenttitle(e.target.value)}
                  onKeyDown={updateTitleHandler}
                  disabled={!editing}
                  className="document-title-input"
                />
              ) : (
                <>
                  <p className="document-title">{documenttitle}</p>
                </>
              )}
              {currentUserType === "editor" && !editing && (
                <Image
                  src="/assets/icons/edit.svg"
                  alt="edit"
                  width={24}
                  height={24}
                  onClick={() => setediting(true)}
                  className="pointer"
                />
              )}
              {currentUserType !== "editor" && !editing && (
                <p className="view-only-tag">View Only</p>
              )}

              {loading && <p className="text-sm text-gray-400">saving...</p>}
            </div>
            <div className="flex w-full flex-1 justify-end gap-2 sm:gap-3">
              <ActiveCollaborators />
              <ShareModal
                roomId={roomId}
                collaborators={users}
                creatorId={roomMetadata.creatorId}
                currentUserType={currentUserType}
              />
              <SignedOut>
                <SignInButton />
                <SignUpButton />
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </div>
          </Header>
          <Editor roomId={roomId} currentUserType={currentUserType} />
        </div>
      </ClientSideSuspense>
    </RoomProvider>
  );
};

export default CollaborativeRoom;
