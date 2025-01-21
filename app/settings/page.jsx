'use client'
import React, { useContext, useState } from 'react'
import { UserDetailContext } from '@/context/UserDetailContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { toast } from 'sonner'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function SettingsPage() {
    const router = useRouter()
    const {userDetail, setUserDetail} = useContext(UserDetailContext)
    const [name, setName] = useState(userDetail?.name || '')
    const [imageFile, setImageFile] = useState(null)
    const [previewUrl, setPreviewUrl] = useState(userDetail?.picture || '')
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const UpdateUser = useMutation(api.users.UpdateUser)
    const DeleteUser = useMutation(api.users.DeleteUser)

    const handleImageChange = (e) => {
        const file = e.target.files[0]
        if (!file) return

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Ukuran file terlalu besar', {
                description: 'Maksimal 5MB'
            })
            return
        }

        setImageFile(file)
        setPreviewUrl(URL.createObjectURL(file))
    }

    const handleUpdateProfile = async () => {
        try {
            if (!userDetail?._id) return

            let pictureUrl = userDetail.picture

            if (imageFile) {
                // Convert image ke base64
                const base64 = await new Promise((resolve) => {
                    const reader = new FileReader()
                    reader.onloadend = () => resolve(reader.result)
                    reader.readAsDataURL(imageFile)
                })
                pictureUrl = base64
            }

            await UpdateUser({
                userId: userDetail._id,
                name,
                picture: pictureUrl
            })

            setUserDetail({
                ...userDetail,
                name,
                picture: pictureUrl
            })

            toast.success('Profil berhasil diperbarui')
        } catch (error) {
            toast.error('Gagal memperbarui profil')
        }
    }

    const handleDeleteAccount = async () => {
        try {
            await DeleteUser({ userId: userDetail._id })
            localStorage.removeItem('user')
            setUserDetail(null)
            router.push('/')
            toast.success('Akun berhasil dihapus')
        } catch (error) {
            toast.error('Gagal menghapus akun')
        }
    }

    return (
        <div className="container max-w-2xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Pengaturan Profil</h1>
            
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Foto Profil
                    </label>
                    <div className="flex items-center gap-4">
                        <Image
                            src={previewUrl || userDetail?.picture || '/default-avatar.png'}
                            alt="Profile"
                            width={80}
                            height={80}
                            className="rounded-full object-cover w-20 h-20"
                        />
                        <Input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="w-full"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">
                        Nama
                    </label>
                    <Input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Masukkan nama"
                    />
                </div>

                <Button 
                    onClick={handleUpdateProfile}
                    className="w-full bg-green-500 hover:bg-green-600"
                >
                    Simpan Perubahan
                </Button>

                <div className="pt-6 border-t">
                    <Button 
                        variant="destructive"
                        className="w-full"
                        onClick={() => setShowDeleteDialog(true)}
                    >
                        Hapus Akun
                    </Button>
                </div>
            </div>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tindakan ini tidak dapat dibatalkan. Semua data Anda akan dihapus secara permanen.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={handleDeleteAccount}
                            className="bg-red-500 hover:bg-red-600"
                        >
                            Hapus Akun
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
} 