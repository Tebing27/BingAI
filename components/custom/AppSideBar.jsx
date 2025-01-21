import React, { useContext } from "react";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
  } from "@/components/ui/sidebar"
import { Button } from "../ui/button";
import { Plus, PlusIcon } from "lucide-react";
import WorkspaceHistory from "./WorkspaceHistory";
import SideBarFooter from "./SideBarFooter";
import { useRouter } from "next/navigation";
import { UserDetailContext } from "@/context/UserDetailContext";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import Link from "next/link";

function AppSideBar(){
    const router = useRouter();
    const {userDetail} = useContext(UserDetailContext);
    const CreateWorkspace = useMutation(api.workspace.CreateWorkspace);

    const handleNewChat = async () => {
        try {
            if (!userDetail?._id) {
                // Redirect ke halaman login atau tampilkan dialog login
                router.push('/');
                return;
            }

            // Buat workspace baru dengan pesan kosong
            const workspaceId = await CreateWorkspace({
                messages: [],
                user: userDetail._id
            });

            if (workspaceId) {
                router.push('/workspace/' + workspaceId);
            }
        } catch (error) {
            console.error("Error creating new chat:", error);
        }
    };

    return(
        <Sidebar>
            <SidebarHeader className="p-5">
              <Link href="/">
                <h1 className="text-2xl font-bold cursor-pointer">BingAI</h1>
              </Link>
                <Button className="mt-5 w-full" onClick={handleNewChat}>
                    <PlusIcon className="mr-2"/>
                    Chat Baru
                </Button>
            </SidebarHeader>
            <SidebarContent className="p-5">
                <SidebarGroup>
                    <WorkspaceHistory/>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <SideBarFooter/>
            </SidebarFooter>
        </Sidebar>
    )
}

export default AppSideBar;
