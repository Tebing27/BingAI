import React, { useContext } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import Lookup from '@/data/Lookup'
import { Button } from '../ui/button'
import { useGoogleLogin } from '@react-oauth/google';
import { UserDetailContext } from "@/context/UserDetailContext";
import axios from 'axios';
import { useMutation, useConvex } from 'convex/react';
import { api } from '@/convex/_generated/api';
import uuid4 from 'uuid4';

function SignInDialog({openDialog,CloseDialog}) {
    const {userDetail,setUserDetail}=useContext(UserDetailContext)
    const CreateUser=useMutation(api.users.CreateUser)
    const convex=useConvex()

    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                const userInfo = await axios.get(
                    'https://www.googleapis.com/oauth2/v3/userinfo',
                    { headers: { Authorization: 'Bearer '+tokenResponse?.access_token } },
                );

                const user = userInfo.data;
                await CreateUser({
                    name: user?.name,
                    email: user?.email,
                    picture: user?.picture,
                    uid: uuid4()
                });

                // Dapatkan data user lengkap dari database
                const fullUserData = await convex.query(api.users.GetUser, {
                    email: user?.email
                });

                if(typeof window !== undefined){
                    localStorage.setItem('user', JSON.stringify({
                        ...fullUserData,
                        _id: fullUserData._id
                    }));
                }

                setUserDetail(fullUserData);
                CloseDialog(false);
            } catch(error) {
                console.error("Error during login:", error);
            }
        },
        onError: errorResponse => console.log(errorResponse),
    });

    return (
        <Dialog open={openDialog} onOpenChange={CloseDialog}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-center text-white">
                        {Lookup.SIGNIN_HEADING}
                    </DialogTitle>
                    <div className="flex flex-col items-center justify-center gap-3">
                        <div className="mt-2 text-center text-lg">
                            {Lookup.SIGNIN_SUBHEADING}
                        </div>
                        <Button 
                            className="bg-blue-500 text-white hover:bg-blue-400 mt-3"
                            onClick={googleLogin}
                        >
                            Masuk dengan Google
                        </Button>
                        <div className="text-sm text-gray-400">
                            {Lookup?.SIGNIn_AGREEMENT_TEXT}
                        </div>
                    </div>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )
}

export default SignInDialog
