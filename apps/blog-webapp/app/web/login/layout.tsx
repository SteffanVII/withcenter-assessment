"use client"

import { useAppSelector } from "@/store/hooks";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const LoginLayout = ( { children } : { children : React.ReactNode } ) => {

    const router = useRouter()

    const user = useAppSelector( state => state.general.user )

    useEffect(() => {
        if ( user ) {
            router.push("/web/my-blogs")
        }
    }, [user])

    return (children)

}

export default LoginLayout;