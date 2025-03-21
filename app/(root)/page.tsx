import AddDocumentBtn from "@/components/AddDocumentBtn";
import Header from "@/components/Header";
import { SignedIn, UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import { getDocuments } from "@/lib/actions/rooms.actions";
import Link from "next/link";
import { dateConverter } from "@/lib/utils";
import { DeleteModal } from "@/components/DeleteModal";
import Notifications from "@/components/Notifications";

export default async function Home() {
  const clerkUser = await currentUser();

  if (!clerkUser) redirect("/sign-in");

  // ✅ Check if the user has an email before calling getDocuments
  if (!clerkUser.emailAddresses || clerkUser.emailAddresses.length === 0) {
    console.error("Error: Clerk user has no email", clerkUser);
    return <p>Error: Unable to fetch user email.</p>;
  }

  let roomdocuments;
  try {
    // ✅ Fetch documents and log the response
    roomdocuments = await getDocuments(
      clerkUser.emailAddresses[0].emailAddress
    );
    console.log("Fetched documents:", roomdocuments);
  } catch (error) {
    console.error("Error fetching documents:", error);
    return <p>Error: Unable to fetch documents.</p>;
  }

  // ✅ Ensure roomdocuments is valid
  if (!roomdocuments || !roomdocuments.data) {
    console.error(
      "Error: getDocuments() returned undefined or no data",
      roomdocuments
    );
    return <p>Error: No documents found.</p>;
  }

  return (
    <main className="home-container">
      <Header className="sticky left-0 top-0">
        <div className="flex items-center gap-2 lg:gap-4">
          <Notifications />
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </Header>
      {roomdocuments.data.length > 0 ? (
        <div className="document-list-container">
          <div className="document-list-title">
            <h3 className="text-28-semibold">All Documents</h3>
            <AddDocumentBtn
              userId={clerkUser.id}
              email={clerkUser.emailAddresses[0].emailAddress}
            />
          </div>
          <ul className="document-ul">
            {roomdocuments.data.map(({ id, metadata, createdAt }: any) => (
              <li key={id} className="document-list-item">
                <Link
                  href={`/documents/${id}`}
                  className="flex flex-1 items-center gap-4"
                >
                  <div className="hidden rounded-md bg-dark-500 p-2 sm:block">
                    <Image
                      src="/assets/icons/doc.svg"
                      alt="file"
                      width={40}
                      height={40}
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="line-clamp-1 text-lg">
                      {metadata?.title || "Untitled"}
                    </p>
                    <p className="text-sm font-light text-blue-100">
                      Created About {dateConverter(createdAt)}
                    </p>
                  </div>
                </Link>

                <DeleteModal roomId={id} />
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="document-list-empty">
          <Image
            src="/assets/icons/doc.svg"
            alt="Document"
            width={40}
            height={40}
            className="mx-auto"
          />
          <p>No documents found. Start by adding one!</p>
          <AddDocumentBtn
            userId={clerkUser.id}
            email={clerkUser.emailAddresses[0].emailAddress}
          />
        </div>
      )}
    </main>
  );
}
