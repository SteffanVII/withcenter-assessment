import { Label } from "@/components/ui/label";
import dayjs from "@/lib/dayjs";
import { cn } from "@/lib/utils"
import { axiosInstance } from "@/service";
import { TBlog } from "@repo/blog-types";
import { generateHTML } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import BlogContent from "../_components/blogContent";

type TBlogPageProps = {
    params : Promise<{ blogId : string }>
}

export default async function BlogPage({ params } : TBlogPageProps) {

    const { blogId } = await params;

    const response = await axiosInstance.get<TBlog>(
        `/api/public/blog/${blogId}`,
    )

    return (
        <div
            className={cn(
                `w-full h-full`
            )}
        >
            {
                response.data &&
                <div
                    className={cn(
                        `size-full`,
                        `flex flex-col p-[1rem]`
                    )}
                >
                    <div className="flex flex-col gap-[4rem] p-[4rem]" >
                        <h1 className="text-6xl font-bold" >{response.data.title}</h1>
                        <div className="flex gap-4" >
                            <Label className="text-muted-foreground" >Published / {dayjs(response.data.last_modified).format("MMM D, YYYY hh:mm A")}</Label>
                            -
                            <Label className="text-muted-foreground" >Author / {response.data.author.firstname} {response.data.author.lastname}</Label>
                        </div>
                    </div>

                    <BlogContent content={response.data.body} />

                </div>
            }
        </div>
    )

}