import React from "react";
import { UserButton } from "@clerk/nextjs";
import Search from "@/components/Search";
import FileUploader from "@/components/FileUploader";

const Header = ({
  userId,
  accountId,
}: {
  userId: string;
  accountId: string;
}) => {
  return (
    <header className="header">
      <Search />
      <div className="header-wrapper">
        <FileUploader ownerId={userId} accountId={accountId} />
        <UserButton 
          appearance={{
            elements: {
              userButtonAvatarBox: "w-10 h-10",
              userButtonPopoverCard: "shadow-lg border",
              userButtonPopoverActionButton: "hover:bg-gray-50"
            }
          }}
          afterSignOutUrl="/sign-in"
        />
      </div>
    </header>
  );
};

export default Header;
