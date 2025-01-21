"use client"
import { UserDetailContext } from "@/context/UserDetailContext";
import { api } from "@/convex/_generated/api";
import { useConvex } from "convex/react";
import Link from "next/link";
import React, { useContext, useEffect, useState } from "react";
import { useSidebar } from "../ui/sidebar";

function WorkspaceHistory(){
    const {userDetail} = useContext(UserDetailContext)
    const convex = useConvex()
    const [workspaceList, setWorkspaceList] = useState([])
    const {toogleSidebar} = useSidebar()

    useEffect(() => {
        const fetchWorkspaces = async () => {
            if (userDetail?._id) {
                await GetAllWorkspace()
            } else {
                setWorkspaceList([])
            }
        }
        
        fetchWorkspaces()
    }, [userDetail, convex])

    const GetAllWorkspace = async () => {
        try {
            const result = await convex.query(api.workspace.GetAllWorkspace, {
                userId: userDetail._id
            })
            
            const sortedWorkspaces = result?.sort((a, b) => 
                b._id.localeCompare(a._id)
            ) || []
            
            setWorkspaceList(sortedWorkspaces)
        } catch (error) {
            console.error("Error fetching workspaces:", error)
            setWorkspaceList([])
        }
    }

    return (
        <div>
            <h2 className='font-medium text-lg'>Riwayat Chat</h2>
            <div>
                {workspaceList?.map((workspace,index) => (
                    <Link href={'/workspace/'+workspace?._id} key={index}>
                        <h2 onClick={toogleSidebar} 
                            className="text-sm text-gray-400 mt-2 font-light hover:text-white cursor-pointer">
                           {workspace?.messages[0]?.content || 'Chat Baru'}
                        </h2>
                    </Link>
                ))}
            </div>
        </div>
    )
}
export default WorkspaceHistory;