"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"
import { axiosInstance } from "@/service"
import { setUser } from "@/store/features/generalSlice"
import { useAppDispatch } from "@/store/hooks"
import { zodResolver } from "@hookform/resolvers/zod"
import { TUser } from "@repo/blog-types"
import { TLoginRequestBody } from "@repo/blog-types"
import { useMutation } from "@tanstack/react-query"
import { AxiosError } from "axios"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { z } from "zod"


const loginSchema = z.object({
    email : z.string().email(),
    password : z.string()
})

const LoginForm = () => {

    const router = useRouter()
    const dispatch = useAppDispatch()

    const form = useForm<z.infer<typeof loginSchema>>({
        resolver : zodResolver(loginSchema),
        defaultValues : {
            email : "",
            password : ""
        }
    })

    const {
        mutateAsync : loginTrigger,
        isPending : loginIsPending,
        error : loginError
    } = useMutation<TUser, AxiosError, TLoginRequestBody>({
        mutationFn : async ( payload ) => {
            const response = await axiosInstance.post(
                "/api/auth/login",
                payload
            )
            return response.data
        },
        onSuccess(data) {
            dispatch(setUser(data))
            router.push("/web/my-blogs")
        },
    })

    const handleLogin = ( value : z.infer<typeof loginSchema> ) => {
        loginTrigger(value)
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Login</CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form} >
                    <form
                        className={cn(
                            `w-[20rem]`,
                            `flex flex-col gap-4`
                        )}
                    >
                        <FormField
                            control={form.control}
                            name="email"
                            render={ ({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder="johndoe@email.com" 
                                        />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            ) }
                        />
                        <FormField
                            control={form.control}
                            name="password"
                            render={ ({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            type="password"
                                            placeholder="********" 
                                        />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            ) }
                        />
                        {
                            loginError &&
                            <p className="p-2 text-center bg-destructive/20 rounded-md border border-destructive" >{(loginError?.response?.data as any).message }</p>
                        }
                    </form>
                </Form>
            </CardContent>
            <CardFooter className="flex flex-col gap-4" >
                <Button
                    variant={"secondary"}
                    className={`w-full`}
                    disabled={loginIsPending}
                    onClick={() => {
                        form.handleSubmit(handleLogin)()
                    }}
                >
                    { loginIsPending && <Spinner/> }
                    Login
                </Button>
                <p className="text-center" >Don't have an account? <Link href={"/web/registration"} className={`px-0 text-primary hover:underline`} >Register</Link></p>
            </CardFooter>
        </Card>
    )

}

export default LoginForm;