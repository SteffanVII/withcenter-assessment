"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useMutation } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { TLoginRequestBody } from "@repo/blog-types"
import { axiosInstance } from "@/service"
import { Spinner } from "@/components/ui/spinner"
import { useRouter } from "next/navigation"
import { useAppDispatch } from "@/store/hooks"
import { TUser } from "@repo/blog-types"
import { setUser } from "@/store/features/generalSlice"

const registerSchema = z.object({
    firstname : z.string().min( 2, { message : "Firstname is required" } ),
    lastname : z.string().min( 2, { message : "Firstname is required" } ),
    email : z.string().email(),
    password : z.string().min( 8, { message : "Password needs minimum of 8 characters" } )
})

const RegisterForm = () => {

    const router = useRouter()
    const dispatch = useAppDispatch()

    const form = useForm<z.infer<typeof registerSchema>>({
        resolver : zodResolver(registerSchema),
        defaultValues : {
            firstname : "",
            lastname : "",
            email : "",
            password : ""
        }
    })

    const {
        mutateAsync : registerTrigger,
        isPending : registerTriggerIsPending,
        error : registerTriggerError
    } = useMutation<{message : string, user : TUser}, AxiosError, TLoginRequestBody>({
        mutationFn : async ( payload ) => {
            const response = await axiosInstance.post(
                "/api/auth/register",
                payload
            )
            return response.data
        },
        onSuccess : (data) => {
            dispatch(setUser(data.user))
            router.push("/web/my-blogs")
        }
    })

    const handleRegister = async ( values : z.infer<typeof registerSchema> ) => {
        registerTrigger(values)
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Register</CardTitle>
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
                            name="firstname"
                            render={ ({ field }) => (
                                <FormItem>
                                    <FormLabel>Firstname</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder="John" 
                                        />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            ) }
                        />
                        <FormField
                            control={form.control}
                            name="lastname"
                            render={ ({ field }) => (
                                <FormItem>
                                    <FormLabel>Lastname</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder="Doe" 
                                        />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            ) }
                        />
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
                                    <FormDescription>Minimum of 8 characters</FormDescription>
                                    <FormMessage/>
                                </FormItem>
                            ) }
                        />
                        {
                            registerTriggerError &&
                            <p className="p-2 text-center bg-destructive/20 rounded-md border border-destructive" >{(registerTriggerError?.response?.data as any).message }</p>
                        }
                    </form>
                </Form>
            </CardContent>
            <CardFooter className="flex flex-col gap-4" >
                <Button
                    variant={"secondary"}
                    className={`w-full`}
                    disabled={registerTriggerIsPending}
                    onClick={() => {
                        form.handleSubmit(handleRegister)()
                    }}
                >
                    { registerTriggerIsPending && <Spinner/> }
                    Register
                </Button>
                <p className="text-center" >Already have an account? <Link className={`px-0 text-primary hover:underline`} href={"/web/login"} >Signin</Link></p>
            </CardFooter>
        </Card>
    )

}

export default RegisterForm;
