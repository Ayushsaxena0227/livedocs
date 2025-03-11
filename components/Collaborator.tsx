import Image from "next/image";
import React, { useState } from "react";
import UserTypeSelector from "./UserTypeSelector";
import { Button } from "./ui/button";
import {
  removeCollaborator,
  updateDocumentAccess,
} from "@/lib/actions/rooms.actions";

const Collaborator = ({
  roomId,
  creatorId,
  collaborator,
  email,
  user,
  setCollaborators,
}: CollaboratorProps) => {
  const [userType, setUserType] = useState(collaborator.userType || "viewer");
  const [loading, setloading] = useState(false);
  const sharedDocumentHandler = async (type: string) => {
    setloading(true);
    await updateDocumentAccess({
      roomId,
      email,
      userType: type as UserType,
      updatedBy: user,
    });
    setloading(false);
  };
  const removeCollaboratorHandler = async (email: string) => {
    setloading(true);

    await removeCollaborator({ roomId, email });

    setCollaborators((prev) => prev.filter((collab) => collab.email !== email)); // ✅ Update state in ShareModal

    setloading(false);
  };

  return (
    <li className="flex item-center justify-between gap-2 py-3">
      <div className="flex gap-2 ">
        <Image
          src={collaborator.avatar}
          alt={collaborator.name}
          width={36}
          height={36}
          className="size-9 rounded-full"
        />
        <p className="line-clamp-1 text-sm font-semibold leading-4 text-white">
          {collaborator.name}
          <span className="text-10-regular pl-2 text-blue-100">
            {loading && "updating..."}
          </span>
        </p>
        <p className="text-sm font-light text-blue-100">{collaborator.email}</p>
      </div>
      {creatorId === collaborator.id ? (
        <p className="text-sm text-blue-100">Owner</p>
      ) : (
        <div className="flex items-center">
          <UserTypeSelector
            userType={userType as UserType}
            setUserType={setUserType || "viewer"}
            onClickHandler={sharedDocumentHandler}
          />
          <Button
            type="button"
            onClick={() => {
              removeCollaboratorHandler(collaborator.email);
            }}
          >
            Remove
          </Button>
        </div>
      )}
    </li>
  );
};

export default Collaborator;
