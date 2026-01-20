"use client"

import { cn } from "@/lib/utils";
import LoginForm from "./_components/loginForm";

const LoginPage = () => {

    return (
        <div
            className={cn(
                `w-screen h-screen`,
                `flex justify-center items-center`
            )}
        >
            <LoginForm/>
        </div>
    )

}

export default LoginPage;