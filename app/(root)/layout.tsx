import React from "react";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import MobileNavigation from "@/components/MobileNavigation";
import Header from "@/components/Header";
import { Toaster } from "@/components/ui/toaster";

export const dynamic = "force-dynamic";

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const { userId } = await auth();
  
  if (!userId) {
    redirect("/sign-in");
  }

  const user = await currentUser();
  
  if (!user) {
    redirect("/sign-in");
  }

  // Transform Clerk user data to match the existing interface
  const userData = {
    $id: user.id,
    accountId: user.id,
    email: user.emailAddresses[0]?.emailAddress || "",
    fullName: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username || "User",
    avatar: user.imageUrl,
  };

  return (
    <main className="flex h-screen">
      <Sidebar {...userData} />

      <section className="flex h-full flex-1 flex-col">
        <MobileNavigation {...userData} />
        <Header userId={userData.$id} accountId={userData.accountId} />
        <div className="main-content">{children}</div>
      </section>

      <Toaster />
    </main>
  );
};

export default Layout;
