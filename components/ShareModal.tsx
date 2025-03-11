"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { useSelf } from "@liveblocks/react/suspense";
import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import Image from "next/image";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import UserTypeSelector from "./UserTypeSelector";
import Collaborator from "./Collaborator";
import { updateDocumentAccess } from "@/lib/actions/rooms.actions";

// Define UserType explicitly and ensure it's consistent
type UserType = "viewer" | "editor" | "owner";

// Define a type for collaborators
interface CollaboratorType {
  id: string;
  email: string;
  userType: UserType;
}

interface ShareModalProps {
  roomId: string;
  collaborators: CollaboratorType[];
  creatorId: string;
  currentUserType: UserType;
}

const ShareModal: React.FC<ShareModalProps> = ({
  roomId,
  collaborators: initialCollaborators,
  creatorId,
  currentUserType,
}) => {
  const user = useSelf();

  const [open, setOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [userType, setUserType] = useState<UserType>("viewer"); // Ensure valid UserType
  const [collaborators, setCollaborators] =
    useState<CollaboratorType[]>(initialCollaborators);

  useEffect(() => {
    console.log("Updated collaborators:", collaborators);
  }, [collaborators]);

  const shareDocumentHandler = async () => {
    if (!email) return;

    setLoading(true);

    await updateDocumentAccess({
      roomId,
      email,
      userType,
      updatedBy: user.info,
    });

    setCollaborators((prev) => [
      ...(Array.isArray(prev) ? prev : []),
      { id: crypto.randomUUID(), email, userType }, // Ensure 'id' is included
    ]);

    setEmail("");

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button
          className="gradient-blue flex h-9 gap-1 px-4"
          disabled={currentUserType !== "editor"}
        >
          <Image
            src="/assets/icons/share.svg"
            alt="share"
            width={20}
            height={20}
            className="min-w-4 md:size-5"
          />
          <p className="mr-1 hidden sm:block">Share</p>
        </Button>
      </DialogTrigger>
      <DialogContent className="shad-dialog w-full max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="text-center sm:text-left">
            Manage who can view this project
          </DialogTitle>
          <DialogDescription className="text-center sm:text-left">
            Select which users can view and edit this document
          </DialogDescription>
        </DialogHeader>

        <Label htmlFor="email" className="mt-6 text-blue-100">
          Email address
        </Label>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex flex-1 min-w-0 rounded-md bg-dark-400">
            <Input
              id="email"
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="share-input truncate-email"
            />
            <UserTypeSelector userType={userType} setUserType={setUserType} />
          </div>
          <Button
            type="submit"
            onClick={shareDocumentHandler}
            className="gradient-blue flex h-full gap-1 px-5"
            disabled={loading}
          >
            {loading ? "Sending..." : "Invite"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal;
