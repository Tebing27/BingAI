import React, { useContext, useState } from 'react'
import { Button } from '../ui/button'
import Colors from '@/data/Colors'
import { UserDetailContext } from '@/context/UserDetailContext'
import { Download, RocketLaunch } from '@phosphor-icons/react'
import Image from 'next/image'
import { ActionContext } from '@/context/ActionContext'
import { usePathname, useRouter } from 'next/navigation'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import Link from 'next/link'
import { useConvex } from 'convex/react'
import SignInDialog from './SignInDialog'
// import { useSidebar } from "../ui/sidebar";

function Header() {
  const {userDetail,setUserDetail}=useContext(UserDetailContext)
  const {action,setAction}=useContext(ActionContext)
  const path=usePathname()
  const router = useRouter()
  const CreateWorkspace = useMutation(api.workspace.CreateWorkspace)
  const convex = useConvex()
  // const {toogleSidebar}=useSidebar()
  console.log(path?.includes('workspace'))
  const [openDialog, setOpenDialog] = useState(false)

  const onActionBtn=(action)=>{
    setAction({
      actionType:action,
      timeStamp:Date.now()
    })
  }

  const handleStartNow = async () => {
    try {
      if (!userDetail?._id) return;

      // Dapatkan daftar workspace yang sudah ada
      const existingWorkspaces = await convex.query(api.workspace.GetAllWorkspace, {
        userId: userDetail._id
      });

      // Jika sudah ada workspace, gunakan yang terbaru
      if (existingWorkspaces && existingWorkspaces.length > 0) {
        // Sort berdasarkan ID untuk mendapatkan yang terbaru
        const latestWorkspace = existingWorkspaces.sort((a, b) => 
          b._id.localeCompare(a._id)
        )[0];
        
        router.push('/workspace/' + latestWorkspace._id);
        return;
      }

      // Jika belum ada workspace, buat baru
      const workspaceId = await CreateWorkspace({
        messages: [],
        user: userDetail._id
      });

      if (workspaceId) {
        router.push('/workspace/' + workspaceId);
      }
    } catch (error) {
      console.error("Error creating workspace:", error);
    }
  }
  
  return (
    <div className="p-4 flex justify-between items-center">
      <Link href="/">
      <h1 className="text-2xl font-bold">BingAI</h1>
      </Link>
      {!userDetail?.name ? 
        <div className="flex gap-5">
          
          <Button 
            variant="ghost" 
            onClick={() => setOpenDialog(true)}
          >
            Masuk
          </Button>
        
          <Button 
            className="text-white" style={{
              backgroundColor:Colors.BLUE,
            }}
            onClick={() => setOpenDialog(true)}
          >
            Daftar
          </Button>
          
       
        </div>
        
      : !path?.includes('workspace') ? (
        <Button 
          onClick={handleStartNow}
          className="bg-green-500 hover:bg-green-600 text-white px-8 py-2"
        >
          Mulai Sekarang
        </Button>
      ) : <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            onClick={()=>onActionBtn('export')}
            className="flex items-center gap-2"
          >
            <Download size={20} />
            Export
          </Button>
          <Button 
          onClick={()=>onActionBtn('export')}
            className="flex items-center gap-2 bg-green-500 text-white hover:bg-green-600"
          >
            <RocketLaunch size={20} />
            Deploy
          </Button>
                            
        </div>
}
{/* <div className='flex items-center pr-10'> */}

{/* {userDetail?.name && (
  <div className='flex items-center gap-3'>
    <p className='text-sm font-medium'>
      Halo, <span className='font-bold text-green-500'>{userDetail?.name}</span>
    </p>
    <Image 
      src={userDetail?.picture} 
      alt="user" 
      width={30} 
      height={30} 
      className='rounded-full w-[30px]'
    />
  </div>
)} */}

      <SignInDialog 
        openDialog={openDialog} 
        CloseDialog={(v) => setOpenDialog(v)}
      />
    </div>
  )
}

export default Header
