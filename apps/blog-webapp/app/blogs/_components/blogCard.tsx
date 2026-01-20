import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { TBlog } from "@repo/blog-types"
import React from "react"
import dayjs from "../../../lib/dayjs"
import Link from "next/link"

type TBlogCardProps = {
    data : TBlog
}

const BlogCard : React.FC<TBlogCardProps> = ({
    data
}) => {

    return (
        <div
            className={cn(
                `flex flex-col gap-[2rem]`,
                `p-4 border-b`,
                `last:border-0`
            )}
        >
            <Link target="_blank" href={`/blogs/${data.id}`} className="text-2xl font-bold hover:underline" >{data.title}</Link>
            <div className="flex items-end justify-between gap-4" >
                <Label className="text-muted-foreground" >Published {dayjs(data.last_modified).format("MMM D, YYYY hh:mm A")}</Label>
                <div className="flex items-end flex-col gap-2" >
                    <Label className="text-muted-foreground" >Author - {data.author.firstname} {data.author.lastname}</Label>
                    <Label className="text-muted-foreground" >{data.author.email}</Label>
                </div>
            </div>
        </div>
    )

}

export default BlogCard