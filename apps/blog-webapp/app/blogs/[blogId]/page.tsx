import { Label } from "@/components/ui/label";
import dayjs from "@/lib/dayjs";
import { cn } from "@/lib/utils"
import { axiosInstance } from "@/service";
import { TBlog } from "@repo/blog-types";
import BlogContent from "../_components/blogContent";
import BlogCommentSection from "../_components/blogCommentSection";
import { Badge } from "@/components/ui/badge";

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
                `w-full h-full`,
                `flex flex-col gap-8`
            )}
        >
            {
                response.data &&
                <>
                    <div
                        className={cn(
                            `size-full h-fit`,
                            `flex flex-col p-[1rem]`
                        )}
                    >
                        <div className="flex flex-col gap-[4rem] p-[4rem]" >
                            <h1 className="text-6xl font-bold" >{response.data.title}</h1>
                            <div className="flex items-center gap-4" >
                                <Label className="text-muted-foreground" >Published / <span className="text-foreground" >{dayjs(response.data.last_modified).format("MMM D, YYYY hh:mm A")}</span></Label>
                                -
                                <Label className="text-muted-foreground" >Author / <span className="text-foreground" >{response.data.author.firstname} {response.data.author.lastname}</span></Label>
                                <Badge variant={"outline"} >{response.data.author.email}</Badge>
                            </div>
                        </div>

                        <BlogContent content={response.data.body} />

                    </div>
                    
                </>
            }
            <BlogCommentSection blogId={response.data.id}/>
        </div>
    )

}