'use client'
import { MessagesContext } from '@/context/MessagesContext'
import { UserDetailContext } from '@/context/UserDetailContext'
import Colors from '@/data/Colors'
import Lookup from '@/data/Lookup'
import { ArrowRight, Link } from 'lucide-react'
import React, { useContext, useState } from 'react'
import SignInDialog from './SignInDialog'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { useRouter } from 'next/navigation'

function Hero() {
    const [userInput, setUserInput] = useState('')
    const {messages, setMessages}=useContext(MessagesContext)
    const {userDetail,setUserDetail}=useContext(UserDetailContext)
    const [openDialog,setOpenDialog]=useState(false)
    const CreateWorkspace=useMutation(api.workspace.CreateWorkspace)
    const router=useRouter()

    const onGenerate=async(input)=>{
        try {
            if(!userDetail?._id) {
                setOpenDialog(true)
                return;
            }

            const msg = {
                role: 'user',
                content: input
            }
            setMessages([msg]) // Ubah ke array untuk konsistensi

            const workspaceId = await CreateWorkspace({
                messages: [msg],
                user: userDetail._id
            })

            if (workspaceId) {
                router.push('/workspace/' + workspaceId)
            }
        } catch (error) {
            console.error("Error creating workspace:", error)
            setOpenDialog(true)
        }
    }

    return (
        <div className="flex flex-col items-center mx-96 mt-36 xl:mt-52 gap-2">
            <h2 className="text-4xl font-bold">{Lookup.HERO_HEADING}</h2>
            <p className="text-gray-400 font-medium">{Lookup.HERO_DESC}</p>

            <div className="p-5 rounded-xl border max-w-xl w-full mt-3"
            style={{
                backgroundColor:Colors.BACKGROUND
            }}>
                <div className="flex gap-2">
                    <textarea placeholder={Lookup.INPUT_PLACEHOLDER} 
                    onChange={(event)=>setUserInput(event.target.value)}
                    className="outline-none bg-transparent w-full h-32 max-h-56 resize-none"/>
                    {userInput && <ArrowRight 
                    onClick={()=>onGenerate(userInput)}
                    className="bg-green-500 p-2 h-10 w-10 rounded-md cursor-pointer" />}
                </div>
                {/* <div>
                    <Link className="h-5 w-5"/>
                </div> */}
            </div>
            <div className="flex mt-8 flex-wrap max-w-2xl items-center justify-center gap-3">
                {Lookup?.SUGGSTIONS.map((suggestion,index)=>(
                    <h2 key={index}
                    onClick={()=>onGenerate(suggestion)}
                    className='p-1 px-2 border rounded-full text-sm text-gray-400 hover:text-white cursor-pointer'
                    >{suggestion}</h2>
                ))}
            </div>
            <SignInDialog openDialog={openDialog} CloseDialog={(v)=>setOpenDialog(v)}/>
        </div>
    )
}

export default Hero
