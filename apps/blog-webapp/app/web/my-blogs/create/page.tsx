"use client"

import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { axiosInstance } from "@/service";
import { EBlogState, TCreateBlogRequestBody } from "@repo/blog-types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";


const CreateNewBlog = () => {

    const router = useRouter()
    const queryclient = useQueryClient()

    const [ title, setTitle ] = useState<string>("")
    const [ content, setContent ] = useState<string>("")

    const [ unsavedWarning, setUnsavedWarning ] = useState<boolean>(false)

    const {
        mutateAsync : createBlogTrigger,
        isPending : createBlogTriggerIsPending,
    } = useMutation<any, AxiosError, TCreateBlogRequestBody>({
        mutationFn : async ( payload ) => {
            const response = await axiosInstance.post(
                `/api/private/blog/create`,
                payload
            )
            return response.data
        },
        onSuccess : () => {
            toast.success("Blog saved")
            queryclient.invalidateQueries({
                queryKey : [ "my-blogs" ]
            })
            router.push("/web/my-blogs")
        }
    })

    const handleContentUpdate = ( value : string ) => {
        setContent(value)
    }

    const handleSave = ( publish : boolean | undefined = false ) => {
        if ( title.trim().replace(" ", "").length < 24 ) {
            return
        }
        createBlogTrigger({
            title,
            body : content,
            state : publish ? EBlogState.PUBLISHED : EBlogState.DRAFT
        })
    }

    const handleClose = () => {
        if ( title !== "" || content !== "" ) {
            setUnsavedWarning(true)
        } else {
            navigateToMyBlogs()
        }
    }

    const navigateToMyBlogs = () => {
        router.push("/web/my-blogs")
    }

    return (
        <div
            className={cn(
                `w-screen h-screen pt-[6rem] overflow-y-auto`
            )}
        >
            <div
                className={cn(
                    `w-[80%] max-w-[60rem] mx-auto `
                )}
            >
                <div
                    className={cn(
                        `flex justify-between items-center`
                    )}
                >
                    <h1 className="text-2xl font-bold" >Create New Blog</h1>
                    <div className="flex gap-2" >
                        <Button variant={"secondary"} disabled={createBlogTriggerIsPending} onClick={() => handleSave()} >
                            Save
                        </Button>
                        <Button variant={"secondary"} disabled={createBlogTriggerIsPending} onClick={() => handleSave(true)} >
                            Save & Publish
                        </Button>
                        <Button
                            onClick={handleClose}
                            disabled={createBlogTriggerIsPending}
                            size={"icon"}
                            variant={"ghost"}
                        ><X/></Button>
                    </div>
                </div>

                <div
                    className={cn(
                        `flex flex-col gap-[4rem]`,
                        `py-[4rem]`
                    )}
                >
                    <div className="flex flex-col gap-4" >
                        <Label className="text-2xl" >Title</Label>
                        <Input
                            placeholder="My Blog"
                            value={title}
                            onChange={ e => {
                                setTitle(e.currentTarget.value)
                            } }
                        />
                        <Label className="text-xs text-muted-foreground" >Minimum {title.trim().replace(" ", "").length}/24 Characters</Label>
                    </div>

                    <div className="flex flex-col gap-4" >
                        <Label className="text-2xl" >Body</Label>
                        <Card className="p-0" >
                            <SimpleEditor
                                content={content}
                                setContent={handleContentUpdate}
                            />
                        </Card>
                    </div>
                </div>
            </div>

            <AlertDialog
                open={unsavedWarning}
                onOpenChange={ open => {
                    setUnsavedWarning(open)
                } }
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
                        <AlertDialogDescription>You have unsaved changes. Do you want to discard these changes?</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Don't Discard</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                navigateToMyBlogs()
                            }}
                        >Discard</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
    
}

export default CreateNewBlog;