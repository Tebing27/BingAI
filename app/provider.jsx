"use client";

import React, { useEffect, useState } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes"
import Header from "@/components/custom/Header";
import { MessagesContext } from "@/context/MessagesContext";
import { UserDetailContext } from "@/context/UserDetailContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { useConvex } from "convex/react";
import { api } from "@/convex/_generated/api";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSideBar from "@/components/custom/AppSideBar";
import { ActionContext } from "@/context/ActionContext";
import { useRouter } from "next/navigation";

function Provider({ children }) {
  const [messages,setMessages]=useState()
  const [userDetail,setUserDetail]=useState()
  const [action,setAction]=useState()
  const convex=useConvex();
  const router=useRouter()
  useEffect(()=>{
    IsAuthenticated()
  },[])
  const IsAuthenticated = async () => {
    try {
      if (typeof window !== undefined) {
        const userData = localStorage.getItem('user');
        if (!userData) {
          router.push('/');
          return;
        }

        const user = JSON.parse(userData);
        if (user?.email) {
          const result = await convex.query(api.users.GetUser, {
            email: user.email
          });
          
          if (!result) {
            localStorage.removeItem('user');
            router.push('/');
            return;
          }
          
          setUserDetail(result);
        }
      }
    } catch (error) {
      console.error("Error authenticating:", error);
      localStorage.removeItem('user');
      setUserDetail(null);
      router.push('/');
    }
  };

  return (
    <div>
      <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_AUTH_CLIENT_ID_KEY}>
      <UserDetailContext.Provider value={{userDetail,setUserDetail}}>
      <MessagesContext.Provider value={{messages,setMessages}}>
        <ActionContext.Provider value={{action,setAction}}>
        <NextThemesProvider attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange>
              <Header/>
              <SidebarProvider defaultOpen={false}>
                <AppSideBar/>
            {children}
              </SidebarProvider>
        </NextThemesProvider>
        </ActionContext.Provider>
        </MessagesContext.Provider>
        </UserDetailContext.Provider>
        </GoogleOAuthProvider>
    </div>
  )
}

export default Provider;
