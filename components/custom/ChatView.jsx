"use client"
import { MessagesContext } from '@/context/MessagesContext';
import { UserDetailContext } from '@/context/UserDetailContext';
import { api } from '@/convex/_generated/api';
import Colors from '@/data/Colors';
import Lookup from '@/data/Lookup';
import Prompt from '@/data/Prompt';
import axios from 'axios';
import { useConvex, useMutation } from 'convex/react';
import { ArrowRight, Link, Loader2Icon } from 'lucide-react';
import Image from 'next/image';
import { useParams } from 'next/navigation'
import React, { useContext, useEffect, useState } from 'react'
import ReactMarkdown from 'react-markdown';
import { useSidebar } from '@/components/ui/sidebar';
import { toast } from 'sonner';


export const countToken=(inputText)=>{
    return inputText.trim().split(/\s+/).filter(word=>word).length;
}

function ChatView() {
    const {id}=useParams();
    const convex=useConvex();
    const {userDetail,setUserDetail}=useContext(UserDetailContext)
    const {messages,setMessages}=useContext(MessagesContext)
    const [userInput,setUserInput]=useState();
    const [loading,setLoading]=useState(false);
    const UpdateMessages=useMutation(api.workspace.UpdateMessages);
    const {toggleSidebar} = useSidebar()
    const UpdateTokens=useMutation(api.users.UpdateTokens);
    const [editingMessageIndex, setEditingMessageIndex] = useState(null);
    const [editedContent, setEditedContent] = useState('');
    const [isMobile, setIsMobile] = useState(false);

    useEffect(()=>{
        id&&GetWorkspaceData();
    },[id])

    useEffect(() => {
        if (!Array.isArray(messages)) {
            setMessages([]);
        }
    }, [messages, setMessages]);

    const GetWorkspaceData=async()=>{
        if (!userDetail?._id) return;
        
        const result = await convex.query(api.workspace.GetWorkspace, {
            workspaceId: id,
            userId: userDetail._id
        });
        setMessages(result?.messages);
        console.log(result);
    }

    useEffect(()=>{
        if(messages?.length>0){
            const role=messages[messages.length-1].role;
            if(role=="user"){
                GetAiResponse();
            }
        }
        
    },[messages])

    const GetAiResponse=async()=>{
        try {
            if (!userDetail?._id) return;
            
            // Reset token jika sudah lewat 1 hari
            await convex.mutation(api.users.ResetDailyTokens, {
                userId: userDetail._id
            });
            
            // Cek apakah masih punya token
            if (userDetail.token <= 0) {
                toast.error("Batas generate harian Anda sudah habis", {
                    description: "Silakan coba lagi besok"
                });
                return;
            }
            
            setLoading(true);
            const PROMPT = JSON.stringify(messages) + Prompt.CHAT_PROMPT;
            const prevMessages = [...messages];
            
            const result = await axios.post('/api/ai-chat', {
                prompt: PROMPT
            });
            
            const aiResp = {
                role: 'ai',
                content: result.data.result
            };

            const updatedMessages = [...prevMessages, aiResp];
            setMessages(updatedMessages);

            await UpdateMessages({
                messages: updatedMessages,
                workspaceId: id,
                userId: userDetail._id
            });

            // Update token dan generation count
            const newToken = Math.max(0, userDetail.token - 1);
            await UpdateTokens({
                userId: userDetail._id,
                token: newToken
            });

        } catch (error) {
            toast.error("Gagal mendapatkan respons", {
                description: error.message
            });
        } finally {
            setLoading(false);
        }
    }

    const onGenerate=(input)=>{
        setMessages(prev=>[...prev,{
            role:'user',
            content:input
        }]);
        setUserInput('');
    }

    // const handleEditMessage = (index, content) => {
    //     setEditingMessageIndex(index);
    //     setEditedContent(content);
    // }

    // const handleSaveEdit = async (index) => {
    //     try {
    //         const updatedMessages = [...messages];
    //         updatedMessages[index] = {
    //             ...updatedMessages[index],
    //             content: editedContent
    //         };
            
    //         // Hapus semua pesan setelah pesan yang diedit
    //         const trimmedMessages = updatedMessages.slice(0, index + 1);
            
    //         // Simpan pesan yang diedit
    //         setMessages(trimmedMessages);
    //         await UpdateMessages({
    //             messages: trimmedMessages,
    //             workspaceId: id
    //         });
            
    //         setEditingMessageIndex(null);
    //         setEditedContent('');

    //         // Trigger useEffect untuk generate AI dengan menambahkan flag isEdited
    //         const editedMsg = {
    //             ...trimmedMessages[trimmedMessages.length - 1],
    //             isEdited: true
    //         };
    //         setMessages([...trimmedMessages.slice(0, -1), editedMsg]);
            
    //     } catch (error) {
    //         console.error("Error saving edit:", error);
    //     }
    // }

    // Modifikasi useEffect untuk menangani generate setelah edit
    useEffect(() => {
        if (messages?.length > 0) {
            const lastMessage = messages[messages.length - 1];
            if (lastMessage.role === "user" && lastMessage.isEdited) {
                GetAiResponse();
            }
        }
    }, [messages]);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className='relative h-[85vh] flex flex-col'>
            <style jsx global>{`
                /* Styling untuk webkit browsers (Chrome, Safari, dll) */
                ::-webkit-scrollbar {
                    width: 5px;
                }
                
                ::-webkit-scrollbar-track {
                    background: transparent;
                }
                
                ::-webkit-scrollbar-thumb {
                    background: #666;
                    border-radius: 5px;
                }

                ::-webkit-scrollbar-thumb:hover {
                    background: #888;
                }

                /* Styling untuk Firefox */
                * {
                    scrollbar-width: thin;
                    scrollbar-color: #666 transparent;
                }
            `}</style>

            <div className={`flex-1 overflow-y-scroll scrollbar-hide pr-2
                ${isMobile ? 'px-2' : 'pl-5'}`}> 
                {Array.isArray(messages) && messages.map((msg, index) => (
                    <div key={index} 
                        className='p-3 rounded-lg mb-2 flex gap-2 items-start leading-7'
                        style={{
                            backgroundColor: Colors.CHAT_BACKGROUND
                        }}>
                        {msg?.role == "user" && (
                            <Image src={userDetail?.picture} 
                                alt="user" 
                                width={35} 
                                height={35} 
                                className='rounded-full'
                            />
                        )}
                        
                            <div className="flex-1 group">
                                <div className="flex justify-between items-start">
                                    <ReactMarkdown className='flex-1'>
                                        {msg.content}
                                    </ReactMarkdown>
                                    
                                </div>
                            </div>
                    </div>
                ))}
                {loading&& 
                <div className='p-3 rounded-lg mb-2 flex gap-2 items-center'
                style={{
                    backgroundColor:Colors.CHAT_BACKGROUND
                }}>
                            <Loader2Icon className='animate-spin'/>
                            <h2>Generating...</h2>
                </div>
                }
            </div>

            {/* input */}
            <div className='flex items-end gap-2'>
                {userDetail&&<Image src={userDetail?.picture} 
                className='rounded-full cursor-pointer'
                onClick={toggleSidebar}
                alt="user" width={30} height={30}/>}
            <div className="p-5 rounded-xl border max-w-xl w-full mt-3"
        style={{
            backgroundColor:Colors.BACKGROUND
        }}>
          <div className="flex gap-2">
            <textarea placeholder={Lookup.INPUT_PLACEHOLDER} 
            value={userInput}
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
        </div>
        </div>
    )
}

export default ChatView

