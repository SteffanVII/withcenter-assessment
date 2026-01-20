"use client"

import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { axiosInstance } from "@/service";
import { setUser } from "@/store/features/generalSlice";
import { useAppDispatch } from "@/store/hooks";
import { useMutation } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const MyBlogsLayout = ( props : { children : React.ReactNode } ) => {

    const router = useRouter()
    const dispatch = useAppDispatch()

    const {
        mutateAsync : logoutTrigger,
        isPending : logoutIsPending
    } = useMutation({
        mutationFn : async () => {
            const response = await axiosInstance.post(
                `/api/auth/logout`
            )
            return response.data
        },
        onSuccess : () => {
            dispatch(setUser(null))
            router.push("/web/login")
        }
    })

    const handleLogout = () => {
        logoutTrigger()
    }

    return (
        <>
            <div
                className={cn(
                    `fixed top-0 left-0`,
                    `w-screen h-fit p-4 border-b`,
                    `flex justify-between`,
                    `bg-background/50 backdrop-blur-md`
                )}
            >
                <div>
                    <Link target="_blank" href={"/blogs"} >
                        <h1 className="text-2xl font-bold hover:underline" >Blogs</h1>
                    </Link>
                </div>
                <div>
                    <AlertDialog>
                        <AlertDialogTrigger
                            render={
                                <Button
                                    size={"icon"}
                                    variant={"destructive"}
                                >
                                    <LogOut/>
                                </Button>
                            }
                        />
                        <AlertDialogContent>
                            <AlertDialogHeader>Are you sure you want to logout?</AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel disabled={logoutIsPending} >Cancel</AlertDialogCancel>
                                <Button
                                    variant={"destructive"}
                                    disabled={logoutIsPending}
                                    onClick={handleLogout}
                                >
                                    { logoutIsPending && <Spinner/> }
                                    Logout
                                </Button>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
            {props.children}
        </>
    )

}

export default MyBlogsLayout;