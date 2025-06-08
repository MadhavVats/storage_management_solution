import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export const getCurrentUserFromClerk = async () => {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return null;
    }

    const user = await currentUser();
    
    if (!user) {
      return null;
    }

    // Transform Clerk user data to match the existing interface
    return {
      $id: user.id,
      accountId: user.id,
      email: user.emailAddresses[0]?.emailAddress || "",
      fullName: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username || "User",
      avatar: user.imageUrl,
    };
  } catch (error) {
    console.error("Error getting current user from Clerk:", error);
    return null;
  }
};

export const requireAuth = async () => {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      redirect("/sign-in");
    }

    return userId;
  } catch (error) {
    console.error("Error in requireAuth:", error);
    redirect("/sign-in");
  }
};
