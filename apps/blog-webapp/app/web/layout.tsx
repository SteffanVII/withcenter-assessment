"use client"

import { Spinner } from "@/components/ui/spinner"
import { axiosInstance } from "@/service"
import { setUser } from "@/store/features/generalSlice"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { useMutation } from "@tanstack/react-query"
import { usePathname, useRouter } from "next/navigation"
import React, { useEffect, useLayoutEffect, useState } from "react"


const WebLayout = ( { children } : { children : React.ReactNode } ) => {

    const pathname = usePathname()
    const router = useRouter()
    const dispatch = useAppDispatch()

    const user = useAppSelector( state => state.general.user )

    const {
        mutateAsync : authTrigger,
        isPending : authIsPending,
        error
    } = useMutation({
        mutationFn : async () => {
            const response = await axiosInstance.post(
                `/api/auth`
            )
            return response.data;
        },
        onSuccess : ( data ) => {
            dispatch(setUser(data))
            if (
                pathname.includes( "/login" ) ||
                pathname.includes( "/registration" )
            ) {
                router.push("/web/my-blogs")
            }
        },
        onError : () => {
            console.log("adwadawd")
            if ( !pathname.includes("/web/login") || !pathname.includes("/web/registration") ) {
                router.push("/web/login")
            }
            
        }
    })

    useEffect(() => {
        if ( !user ) {
            authTrigger()
        }
    }, [user])

    return (
        <>
            {
                ((authIsPending || user === null) && !error) ?
                <div className={`w-screen h-screen flex justify-center items-center fixed top-0 left-0 bg-background z-[999999]`} >
                    <Spinner/>
                </div>
                :
                (children)
            }
        </>
    )

}

export default WebLayout