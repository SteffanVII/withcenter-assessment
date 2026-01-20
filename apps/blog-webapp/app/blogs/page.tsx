import { axiosInstance } from "@/service";
import { TBlog } from "@repo/blog-types";
import BlogCard from "./_components/blogCard";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { File } from "lucide-react";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";

type TBLogsPageProps = {
    searchParams : Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function BlogsPage({ searchParams } : TBLogsPageProps) {

    const params = await searchParams;

    const page = Number(params.page) || 1

    const response = await axiosInstance.get<[TBlog[], number]>(
        `/api/public/blog/blogs`,
        {
            params
        }
    )

    const pagination : {
        buttons : number[],
        next : number | null,
        previous : number | null
    } = {
        buttons : [],
        next : null,
        previous : null
    }

    if ( response.data ) {
        const pages = Math.ceil(response.data[1] / 5);
        if ( pages > 0 ) {
            pagination.buttons = Array.from({ length : pages }, (_, i) => i + ( pages <= 5 ? 1 : page ));
            pagination.next = page < pages ? page + 1 : null;
            pagination.previous = page > 1 ? page - 1 : null;
        } else {
            pagination.buttons = [1]
            pagination.next = null;
            pagination.previous = null;
        }
    }

    return (
        <div
            className="w-full pt-[3rem] flex flex-col gap-[2rem]"
        >
            <Link target="_blank" href={"/web/my-blogs"} >
                <h1 className="text-3xl font-bold px-[3rem] pb-[3rem] hover:underline" >Blogs</h1>
            </Link>
            {
                response.data &&
                <>
                    <div
                        className="flex flex-col px-[3rem] space-y-4"
                    >
                        {
                            response.data[0].length === 0 &&
                        <Empty>
                            <EmptyHeader>
                                <EmptyMedia>
                                    <File/>
                                </EmptyMedia>
                                <EmptyTitle>No Blogs</EmptyTitle>
                                <EmptyDescription>There are currently no blogs published.</EmptyDescription>
                            </EmptyHeader>
                        </Empty>
                        }
                        {
                            response.data[0].map( blog => (
                                <BlogCard
                                    key={blog.id}
                                    data={blog}
                                />
                            ) )
                        }
                    </div>
                    <div
                        className={cn(
                            `flex justify-end gap-4`,
                            `px-[6rem] pb-[6rem]`
                        )}
                    >
                        <div className="flex gap-2" >
                            <Link href={ pagination.previous !== null ? `/blogs?page=${pagination.previous}` : "#" } >
                                <Button
                                    variant={"ghost"}
                                    disabled={pagination.previous === null}
                                >Previous</Button>
                            </Link>

                            {
                                pagination.buttons.map( buttonPage => (
                                    <Link key={buttonPage} href={ `/blogs?page=${page}` } >
                                        <Button
                                            size={"icon"}
                                            variant={ page === buttonPage ? "default" : "outline" }
                                        >
                                            {buttonPage}
                                        </Button>
                                    </Link>
                                ) )
                            }

                            <Link href={ pagination.next !== null ? `/blogs?page=${pagination.next}` : "#" } >
                                <Button
                                    variant={"ghost"}
                                    disabled={pagination.next === null}
                                >Next</Button>
                            </Link>
                        </div>
                    </div>
                </>
            }
        </div>
    )

}