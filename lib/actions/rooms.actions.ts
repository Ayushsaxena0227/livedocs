"use server";
import { nanoid } from "nanoid";
import { liveblocks } from "../liveblocks";
import { getAccessType, parseStringify } from "../utils";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Title } from "@radix-ui/react-dialog";
import {
  AccessType,
  CreateDocumentParams,
  RoomAccesses,
  ShareDocumentParams,
} from "@/types";
export const createDocument = async ({
  userId,
  email,
}: CreateDocumentParams) => {
  const roomId = nanoid();
  try {
    const metadata = {
      creatorId: userId,
      email,
      title: "Untitled",
    };
    const usersAccesses: RoomAccesses = {
      [email]: ["room:write"],
    };
    const room = await liveblocks.createRoom(roomId, {
      metadata,
      usersAccesses,
      // defaultAccesses: ["room:write"], //for time being we did derfault access to room:write
      defaultAccesses: [],
    });
    revalidatePath("/");
    return parseStringify(room);
  } catch (error) {
    console.log(`Error happened while Creating Room ${error}`);
  }
};

export const getDocument = async ({
  roomId,
  userId,
}: {
  roomId: string;
  userId: string;
}) => {
  try {
    const room = await liveblocks.getRoom(roomId);
    const hasAccess = Object.keys(room.usersAccesses).includes(userId);

    if (!hasAccess) {
      throw new Error("You do not have access to this document");
    }
    return parseStringify(room);
  } catch (error) {
    console.log(`Error happened while getting the room: ${error}`);
  }
};
export const updateDocument = async (roomId: string, title: string) => {
  try {
    const updatedroom = await liveblocks.updateRoom(roomId, {
      metadata: {
        title,
      },
    });
    revalidatePath(`/documents/${roomId}`);
    return parseStringify(updatedroom);
  } catch (error) {
    console.log(`Error happened while upating the room: ${error}`);
  }
};

export const getDocuments = async (email: string) => {
  try {
    console.log(`Fetching documents for email: ${email}`);

    const rooms = await liveblocks.getRooms({ userId: email });

    if (!rooms) {
      console.error("Error: No rooms found for the given email.");
      return { data: [] }; // ✅ Return an empty array instead of undefined
    }

    return parseStringify(rooms);
  } catch (error) {
    console.error("Error happened while getting rooms:", error);
    return { data: [] }; // ✅ Ensure a consistent return type
  }
};

export const updateDocumentAccess = async ({
  roomId,
  email,
  userType,
  updatedBy,
}: ShareDocumentParams) => {
  try {
    const usersAccesses: RoomAccesses = {
      [email]: getAccessType(userType) as AccessType,
    };
    const room = await liveblocks.updateRoom(roomId, { usersAccesses });
    if (room) {
      // send notification to invited user
      const notificationId = nanoid();
      await liveblocks.triggerInboxNotification({
        userId: email,
        kind: "$documentAccess",
        subjectId: notificationId,
        activityData: {
          userType,
          title: `You have been granted ${userType} access to the document by ${updatedBy.name}`,
          updatedBy: updatedBy.name,
          avatar: updatedBy.avatar,
          email: updatedBy.email,
        },
        roomId,
      });
    }
    revalidatePath(`documents/${roomId}`);
    return parseStringify(room);
  } catch (error) {
    console.log(`Error happened while updating room access: ${error}`);
  }
};

export const removeCollaborator = async ({
  roomId,
  email,
}: {
  roomId: string;
  email: string;
}) => {
  try {
    const room = await liveblocks.getRoom(roomId);
    if (room.metadata.email === email) {
      throw new Error("you cannot remove yourself from the document");
    }
    const updatedroom = await liveblocks.updateRoom(roomId, {
      usersAccesses: {
        [email]: null,
      },
    });
    revalidatePath(`/documents/${roomId}`);
    return parseStringify(updatedroom);
  } catch (error) {
    console.log(`Error happened while removing collaborator: ${error}`);
  }
};
export const deleteDocument = async (roomId: string) => {
  try {
    await liveblocks.deleteRoom(roomId);
    revalidatePath("/");
    redirect("/");
  } catch (error) {
    console.log(`Error happened while deleting a room: ${error}`);
  }
};
