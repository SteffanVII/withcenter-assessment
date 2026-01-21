"use client"

import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { axiosInstance } from "@/service"
import { TBlogComment } from "@repo/blog-types"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { SendHorizonal } from "lucide-react"
import React, { useState } from "react"
import BlogContent from "./blogContent"
import { Spinner } from "@/components/ui/spinner"
import { Badge } from "@/components/ui/badge"
import dayjs from "@/lib/dayjs"

type TBlogCommentSection = {
    blogId : string
}

const BlogCommentSection : React.FC<TBlogCommentSection> = ({
    blogId
}) => {

    const queryClient = useQueryClient()

    const {
        data : comments,
        isLoading : commentsIsLoading
    } = useQuery<TBlogComment[], AxiosError>({
        queryKey : [ "blog-comments", blogId ],
        queryFn : async () => {
            const response = await axiosInstance.get(
                `/api/public/blog/comments/${blogId}`
            )
            return response.data
        }
    })

    const {
        mutateAsync : commentTrigger,
        isPending : commentIsPending
    } = useMutation<TBlogComment, AxiosError, {
        blogId : string,
        content : string
    }>({
        mutationFn : async ( payload ) => {
            const response = await axiosInstance.post<TBlogComment>(
                `/api/public/blog/comment`,
                payload
            )
            return response.data
        },
        onSuccess : ( data ) => {
            queryClient.setQueryData(
                [ "blog-comments", blogId ],
                ( oldData : TBlogComment[] ) => {
                    if ( oldData ) {
                        return [
                            data,
                            ...oldData
                        ]
                    }
                }
            )
            setContent("")
            setIsEmpty(true)
            setEditorForceRenderKey( prev => prev + 1 )
        }
    })

    const [ content, setContent ] = useState<string>("")
    const [ isEmpty, setIsEmpty ] = useState<boolean>(true)
    const [ editorForceRenderKey, setEditorForceRenderKey ] = useState<number>(1)

    const handleComment = async () => {
        if ( isEmpty ) {
            return
        }
        commentTrigger({
            blogId,
            content : content
        })
    }

    return (
        <>
            {
                commentsIsLoading ?
                <Empty>
                    <EmptyHeader>
                        <EmptyMedia>
                            <Spinner/>
                        </EmptyMedia>
                        <EmptyTitle>Loading Comments</EmptyTitle>
                    </EmptyHeader>
                </Empty>
                :
                <div
                    className={cn(
                        `w-full max-w-[80rem] mx-auto px-4 pb-[6rem]`,
                        `flex flex-col gap-[4rem]`
                    )}
                >
                    <div className="w-full flex flex-col gap-4" >
                        <Label>Comments</Label>
                        <div
                            className=" flex flex-row gap-4"
                        >
                            <Card
                                className="p-0 grow"
                            >
                                <SimpleEditor
                                    key={editorForceRenderKey}
                                    content={content}
                                    setContent={ ( value, isEmpty ) => {
                                        setContent(value)
                                        setIsEmpty(isEmpty)
                                    } }
                                    commentSectionMode
                                />
                            </Card>
                            <Button
                                disabled={isEmpty || commentIsPending}
                                onClick={handleComment}
                            >
                                {
                                    commentIsPending ?
                                    <Spinner/>
                                    :
                                    <SendHorizonal/>
                                }
                            </Button>
                        </div>
                    </div>

                    <Separator/>

                    <div
                        className={cn(
                            `flex flex-col gap-4`
                        )}
                    >
                        {
                            (comments && comments.length === 0) &&
                            <Empty>
                                <EmptyHeader>
                                    <EmptyTitle>No Comments</EmptyTitle>
                                </EmptyHeader>
                            </Empty>
                        }
                        {
                            comments && comments.map( comment => (
                                <div
                                    key={comment.id}
                                    className={cn(
                                        `flex flex-col`,
                                        `p-4 rounded-md bg-muted/30`,
                                    )}
                                >
                                    <div className="flex items-center gap-4" >
                                        <p>{ comment.user ? `${comment.user.firstname} ${comment.user.lastname}` : "Anonymous" }</p>
                                        {
                                            comment.user && <Badge variant={"outline"} className="text-muted-foreground" >{comment.user.email}</Badge>
                                        }
                                    </div>
                                    <p className="text-xs text-muted-foreground" >{dayjs(comment.created_at).fromNow()}</p>
                                    <BlogContent content={comment.content} />
                                </div>
                            ) )
                        }
                    </div>
                </div>
            }
        </>
    )
    
}

export default BlogCommentSection;