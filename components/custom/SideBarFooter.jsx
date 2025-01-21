import { Settings, LogOut } from 'lucide-react'
import React, { useContext } from 'react'
import { Button } from '@/components/ui/button'
import { UserDetailContext } from '@/context/UserDetailContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'

function SideBarFooter() {
    const {setUserDetail} = useContext(UserDetailContext)
    const router = useRouter()

    const handleLogout = async () => {
        try {
            // Redirect ke homepage dulu sebelum clear data
            await router.push('/')
            
            // Hapus data user dari context
            setUserDetail(null)
            // Hapus data dari localStorage
            localStorage.removeItem('user')
            
            toast.success('Berhasil keluar')
        } catch (error) {
            toast.error('Gagal keluar')
        }
    }

    const options = [
        {
            icon: Settings,
            label: 'Pengaturan',
            onClick: () => router.push('/settings')
        },
        {
            icon: LogOut,
            label: 'Keluar',
            onClick: handleLogout
        }
    ]

    return (
        <div className='p-5'>
            {options.map((option, index) => (
                <Button 
                    key={index}
                    variant="ghost" 
                    className='w-full justify-start mb-2'
                    onClick={option.onClick}
                >
                    <option.icon className='w-4 h-4 mr-2' />
                    {option.label}
                </Button>
            ))}
        </div>
    )
}

export default SideBarFooter
