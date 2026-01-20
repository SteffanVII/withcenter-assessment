"use client"

import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { axiosInstance } from "@/service";
import { EBlogState, TMyBlog, TUpdateBlogRequestBody } from "@repo/blog-types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { X } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";


const EditBlog = () => {

    const queryClient = useQueryClient()
    const router = useRouter()

    const { blogId } = useParams()

    const [ title, setTitle ] = useState<string>("")
    const [ content, setContent ] = useState<string>("")

    const [ unsavedWarning, setUnsavedWarning ] = useState<boolean>(false)

    const {
        data : blog,
        isLoading : blogIsLoading
    } = useQuery<TMyBlog, AxiosError>({
        queryKey : [ "my-blog", blogId ],
        queryFn : async () => {
            const response = await axiosInstance.get(
                `/api/private/blog/my-blog/${blogId}`
            )
            return response.data
        },
        refetchOnWindowFocus : false,
        enabled : !!blogId
    })

    const {
        mutateAsync : updateBlogTrigger,
        isPending : updateBlogTriggerIsPending,
    } = useMutation<any, AxiosError, TUpdateBlogRequestBody>({
        mutationFn : async ( payload ) => {
            const response = await axiosInstance.patch(
                `/api/private/blog`,
                payload
            )
            return response.data
        },
        onSuccess : () => {
            queryClient.invalidateQueries({
                queryKey : [ "my-blog", blogId ]
            })
            toast.success( "Blog successfully updated" )
        }
    })

    const handleContentUpdate = ( value : string ) => {
        setContent(value)
    }

    const handleSave = () => {
        if ( title.trim().replace(" ", "").length < 24 ) {
            toast.warning( "Title needs to be 24 characters minimum" )
            return
        }
        updateBlogTrigger({
            blogId : blogId as string,
            title,
            body : content
        })
    }

    const handleClose = () => {
        if ( title !== blog?.title || content !== blog.body ) {
            setUnsavedWarning(true)
        } else {
            navigateToMyBlogs()
        }
    }

    const navigateToMyBlogs = () => {
        router.push("/web/my-blogs")
    }

    const saveDisabled = useMemo(() => {
        return title.trim().replace(" ", "").length < 24;
    }, [
        title
    ])

    useEffect(() => {
        if ( blog ) {
            setTitle(blog.title)
            setContent(blog.body)
        }
    }, [
        blog
    ])

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
                    <h1 className="text-2xl font-bold" >Edit Blog</h1>
                    <div className="flex gap-2" >
                        <Button
                            variant={"secondary"} disabled={ blogIsLoading || updateBlogTriggerIsPending || saveDisabled}
                            onClick={() => handleSave()}
                        >
                            { updateBlogTriggerIsPending && <Spinner/> }
                            Save
                        </Button>
                        <Button
                            disabled={blogIsLoading || updateBlogTriggerIsPending || saveDisabled}
                            size={"icon"}
                            variant={"ghost"}
                            onClick={handleClose}
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
                            disabled={blogIsLoading || updateBlogTriggerIsPending}
                            onChange={ e => {
                                setTitle(e.currentTarget.value)
                            } }
                        />
                        <Label className="text-xs text-muted-foreground" >Minimum {title.trim().replace(" ", "").length}/24 Characters</Label>
                    </div>

                    <div className="flex flex-col gap-4" >
                        <Label className="text-2xl" >Body</Label>
                        <Card className="p-0" >
                            {
                                (blog && content) &&
                                <SimpleEditor
                                    key={blog.body}
                                    content={content}
                                    setContent={handleContentUpdate}
                                />
                            }
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

export default EditBlog;