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
import { updateDocumentAccess, getDocument } from "@/lib/actions/rooms.actions";

// Define UserType explicitly
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
  const [userType, setUserType] = useState<UserType>("viewer"); // Ensure correct type
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
      userType: userType as UserType,
      updatedBy: user.info,
    });

    setCollaborators((prev) => [
      ...(Array.isArray(prev) ? prev : []),
      { email, userType },
    ]);

    setEmail(""); // 🔹 Clears email field after successful invite

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
      <DialogContent className="shad-dialog w-full max-w-lg mx-auto p-6 flex flex-col items-center">
        {/* Header - Centered Text */}
        <DialogHeader className="text-center w-full">
          <DialogTitle className="text-lg font-semibold text-white">
            Manage who can view this project
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-300">
            Select which users can view and edit this document.
          </DialogDescription>
        </DialogHeader>

        {/* Email Input Section - Fully Centered */}
        <div className="w-full flex flex-col items-center mt-4">
          <Label htmlFor="email" className="text-sm text-gray-300">
            Email Address
          </Label>
          <div className="w-full flex flex-col sm:flex-row items-center gap-3 mt-2">
            <div className="flex items-center bg-dark-400 rounded-md w-full max-w-sm overflow-hidden">
              <Input
                id="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-transparent text-center truncate"
              />
              <UserTypeSelector userType={userType} setUserType={setUserType} />
            </div>
            <Button
              type="submit"
              onClick={shareDocumentHandler}
              className="gradient-blue h-10 px-4 whitespace-nowrap"
              disabled={loading}
            >
              {loading ? "Sending..." : "Invite"}
            </Button>
          </div>
        </div>

        {/* Collaborators List - Also Centered */}
        <div className="mt-4 space-y-2 w-full flex flex-col items-center">
          <ul className="flex flex-col w-full max-w-sm">
            {collaborators.length > 0 ? (
              collaborators.map((collaborator) => (
                <Collaborator
                  key={collaborator.id}
                  roomId={roomId}
                  email={collaborator.email}
                  creatorId={creatorId}
                  collaborator={collaborator}
                  user={user.info}
                  setCollaborators={setCollaborators}
                />
              ))
            ) : (
              <p className="text-center text-gray-400">
                No collaborators found.
              </p>
            )}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal;
