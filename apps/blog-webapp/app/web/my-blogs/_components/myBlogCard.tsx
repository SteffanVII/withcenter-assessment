"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import dayjs from "@/lib/dayjs"
import { axiosInstance } from "@/service"
import { EBlogState, TMyBlog } from "@repo/blog-types"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { Eye, Pencil } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import React from "react"

type TMyBlogCardProps = {
    data : TMyBlog
}

const MyBlogCard : React.FC<TMyBlogCardProps> = ({
    data
}) => {

    const router = useRouter()
    const queryClient = useQueryClient()

    const {
        mutateAsync : updateStateTrigger,
        isPending : updateStateIsPending
    } = useMutation<any, AxiosError, { blogId : string, state : EBlogState }>({
        mutationFn : async ( payload ) => {
            const response = await axiosInstance.patch(
                `/api/private/blog/state`,
                payload
            )
            return response.data
        },
        onSuccess : () => {
            queryClient.invalidateQueries({
                queryKey : [ "my-blogs" ]
            })
        }
    })

    const handleEdit = () => [
        router.push(`./my-blogs/edit/${data.id}`)
    ]

    const handleStateUpdate = async () => {
        updateStateTrigger({
            blogId : data.id,
            state : data.state === EBlogState.DRAFT ? EBlogState.PUBLISHED : EBlogState.DRAFT
        })
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between" >
                    <CardTitle className="w-full flex" >
                        {data.title}
                    </CardTitle>
                    <Badge className="ml-auto" variant={data.state === EBlogState.DRAFT ? "outline" : "default"} >{data.state === EBlogState.DRAFT ? "Draft" : "Published"}</Badge>
                </div>
                <CardDescription>
                    <Label className="text-xs" >Created at {dayjs(data.created_at).format("MMM D, YYYY hh:mm A")}</Label>
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex justify-end gap-2 w-full" >
                    <Button
                        variant={ data.state === EBlogState.PUBLISHED ? "outline" : "default" }
                        disabled={updateStateIsPending}
                        onClick={handleStateUpdate}
                    >
                        {
                            updateStateIsPending &&
                            <Spinner/>
                        }
                        {
                            data.state === EBlogState.PUBLISHED ?
                            "Unpublish" : "Publish"
                        }
                    </Button>
                    {
                        data.state === EBlogState.PUBLISHED &&
                        <Link target="_blank" href={`/blogs/${data.id}`} >
                            <Button variant={"outline"} >
                                <Eye/> View
                            </Button>
                        </Link>
                    }
                    <Button variant={"outline"} onClick={handleEdit} >
                        <Pencil/> Edit
                    </Button>
                </div>
            </CardContent>
        </Card>
    )

}

export default MyBlogCard;