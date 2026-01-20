"use client"

import { cn } from "@/lib/utils"
import RegisterForm from "./_components/registerForm"

const RegistrationPage = () => {

    return (
        <div
            className={cn(
                `w-screen h-screen`,
                `flex justify-center items-center`
            )}
        >
            <RegisterForm/>
        </div>
    )

}

export default RegistrationPage