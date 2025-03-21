import CollaborativeRoom from "@/components/CollaborativeRoom";
import { getDocuments, getDocument } from "@/lib/actions/rooms.actions";
import { getClerkUsers } from "@/lib/actions/user.actions";
import { SearchParamProps } from "@/types";
import { User } from "@/types";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const Document = async ({ params: { id } }: SearchParamProps) => {
  const clerkUser = await currentUser();
  if (!clerkUser) redirect("/sign-in");

  const room = await getDocument({
    roomId: id,
    userId: clerkUser.emailAddresses[0].emailAddress,
  });

  if (!room) redirect("/");

  const userIds = Object.keys(room.usersAccesses);
  const users = await getClerkUsers({ userIds });

  console.log("Fetched users:", users); // Debugging line

  const usersData = users
    .filter((user: User | null) => user !== null) // Ensure no null values
    .map((user: User) => ({
      ...user,
      userType: room.usersAccesses[user.email]?.includes("room:write")
        ? "editor"
        : "viewer",
    }));
  console.log(usersData);

  const currentUserType = room.usersAccesses[
    clerkUser.emailAddresses[0].emailAddress
  ]?.includes("room:write")
    ? "editor"
    : "viewer";

  return (
    <main className="flex w-full flex-col items-center">
      <CollaborativeRoom
        roomId={id}
        roomMetadata={room.metadata}
        users={usersData}
        currentUserType={currentUserType}
      />
    </main>
  );
};

export default Document;
