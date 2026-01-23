"use client"

import { SimpleEditor } from "@/components/tiptap-templates/simple/simple-editor"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { axiosInstance } from "@/service"
import { TBlogComment, TUser } from "@repo/blog-types"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { Check, Pencil, SendHorizonal, Trash, X } from "lucide-react"
import React, { useEffect, useState } from "react"
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

    const {
        mutateAsync : userTrigger,
    } = useMutation<TUser, AxiosError>({
        mutationFn : async () => {
            const response = await axiosInstance.post<TUser>(
                "/api/auth"
            )
            return response.data
        },
        onSuccess : (data) => {
            setAuthUser(data)
        }
    })

    const [ authUser, setAuthUser ] = useState<TUser | null>(null)

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

    useEffect(() => {
        userTrigger()
    }, [])

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
                                <BlogCommentCard
                                    key={comment.id}
                                    data={comment}
                                    authUser={authUser}
                                />
                            ) )
                        }
                    </div>
                </div>
            }
        </>
    )
    
}

type TBlogCommentCardProps = {
    data : TBlogComment,
    authUser : TUser | null
}

const BlogCommentCard : React.FC<TBlogCommentCardProps> = ({
    data,
    authUser
}) => {

    const queryClient = useQueryClient()

    const [ editMode, setEditMode ] = useState<boolean>(false)
    const [ content, setContent ] = useState<string>("");
    const [ isEmpty, setIsEmpty ] = useState<boolean>(false);

    const {
        mutateAsync : updateCommentTrigger,
        isPending : updateCommentIsPending
    } = useMutation<any, AxiosError, { commentId : string, content : string }>({
        mutationFn : async ( payload ) => {
            const response = await axiosInstance.patch(
                `/api/private/blog/comment`,
                payload
            )
            return response.data
        },
        onSuccess : ( _, variables ) => {
            setEditMode(false)
            setContent("")
            setIsEmpty(false)
            queryClient.setQueryData(
                [ "blog-comments", data.blog_id ],
                ( oldData : TBlogComment[] ) => {
                    if ( oldData ) {
                        return oldData.map( comment => {
                            if ( comment.id === variables.commentId ) {
                                return {
                                    ...comment,
                                    content : variables.content
                                }
                            }
                            return comment
                        } )
                    }
                    return oldData
                }
            )
        }
    })

    const {
        mutateAsync : deleteCommentTrigger,
        isPending : deleteCommentIsPending
    } = useMutation<any, AxiosError, string>({
        mutationFn : async ( payload ) => {
            const response = await axiosInstance.delete(
                `/api/public/blog/comment/${payload}`
            )
            return response.data
        },
        onSuccess : () => {
            queryClient.setQueryData(
                [ "blog-comments", data.blog_id ],
                ( oldData : TBlogComment[] ) => {
                    if ( oldData ) {
                        return oldData.filter( comment => comment.id !== data.id )
                    }
                    return oldData
                }
            )
        }
    })

    const handleUpdateComment = () => {
        updateCommentTrigger({
            commentId : data.id,
            content : content
        })
    }

    const handleDeleteComment = () => {
        deleteCommentTrigger(data.id)
    }

    return (
        <div
            key={data.id}
            className={cn(
                `flex flex-col gap-4`,
                `p-4 rounded-md bg-muted/30`,
            )}
        >
            <div className="flex items-center gap-4" >
                <p>{ data.user ? `${data.user.firstname} ${data.user.lastname}` : "Anonymous" }</p>
                {
                    data.user && <Badge variant={"outline"} className="text-muted-foreground" >{data.user.email}</Badge>
                }
                {
                    (authUser && authUser.id === data.user_id) &&
                    <div
                        className="flex gap-2 ml-auto"
                    >
                        {
                            !editMode &&
                            <>
                                <Button
                                    size={"icon"}
                                    variant={"ghost"}
                                    disabled={deleteCommentIsPending}
                                    onClick={() => {
                                        setEditMode(true)
                                        setContent(data.content)
                                        setIsEmpty(false)
                                    }}
                                >
                                    <Pencil/>
                                </Button>
                                <Button
                                    size={"icon"}
                                    variant={"ghost"}
                                    disabled={deleteCommentIsPending}
                                    onClick={handleDeleteComment}
                                >
                                    {
                                        deleteCommentIsPending ?
                                        <Spinner/>
                                        :
                                        <Trash/>
                                    }
                                </Button>
                            </>
                        }
                        {
                            editMode &&
                            <>
                                <Button
                                    size={"icon"}
                                    variant={"outline"}
                                    disabled={isEmpty || updateCommentIsPending}
                                    onClick={handleUpdateComment}
                                >
                                    {
                                        updateCommentIsPending ?
                                        <Spinner/>
                                        :
                                        <Check/>
                                    }
                                </Button>
                                <Button
                                    size={"icon"}
                                    variant={"outline"}
                                    disabled={updateCommentIsPending}
                                    onClick={() => {
                                        setEditMode(false)
                                        setContent("")
                                        setIsEmpty(false)
                                    }}
                                >
                                    <X/>
                                </Button>
                            </>
                        }
                    </div>
                }
            </div>
            <p className="text-xs text-muted-foreground" >{dayjs(data.created_at).fromNow()}</p>
            {
                editMode ?
                <Card className="p-0" >
                    <SimpleEditor
                        content={content}
                        setContent={( value, isEmpty ) => {
                            setContent(value)
                            setIsEmpty(isEmpty)
                        }}
                        commentSectionMode
                    />
                </Card>
                :
                <BlogContent content={data.content} />
            }
        </div>
    )

}

export default BlogCommentSection;