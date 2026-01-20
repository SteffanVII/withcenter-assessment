"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { axiosInstance } from "@/service"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { useQuery } from "@tanstack/react-query"
import { AxiosError } from "axios"
import { File, Plus } from "lucide-react"
import Link from "next/link"
import { TMyBlog } from "@repo/blog-types"
import MyBlogCard from "./_components/myBlogCard"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { setDisplay, setPage } from "@/store/features/myBlogsSlice"
import { useMemo } from "react"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"

const MyBlogsPage = () => {

    const dispatch = useAppDispatch()

    const user = useAppSelector( state => state.general.user )
    const search = useAppSelector( state => state.myBlogs.search )
    const page = useAppSelector( state => state.myBlogs.page )
    const display = useAppSelector( state => state.myBlogs.display )

    const {
        data : myBlogs
    } = useQuery<[TMyBlog[], number], AxiosError>({
        queryKey : [
            "my-blogs",
            search,
            page,
            display
        ],
        queryFn : async () => {
            const response = await axiosInstance.get<[TMyBlog[], number]>(
                `/api/private/blog/my-blogs`,
                {
                    params : {
                        search : search === "" ? undefined : search,
                        page,
                        display
                    }
                }
            )
            return response.data
        },
        enabled : !!user
    })

    const pagination = useMemo(() => {

        const returnValue : {
            buttons : number[],
            next : number | null,
            previous : number | null
        } = {
            buttons : [],
            next : null,
            previous : null
        }

        if ( myBlogs ) {
            const pages = Math.ceil(myBlogs[1] / display);
            if ( pages > 0 ) {
                returnValue.buttons = Array.from({ length : pages }, (_, i) => i + ( pages <= 5 ? 1 : page ));
                returnValue.next = page < pages ? page + 1 : null;
                returnValue.previous = page > 1 ? page - 1 : null;
            } else {
                returnValue.buttons = [1]
                returnValue.next = null;
                returnValue.previous = null;
            }
        }

        return returnValue;
    }, [ myBlogs, page, display ])
    
    return (
        <div
            className={cn(
                `size-full pt-[6rem] mb-[6rem]`
            )}
        >
            <div
                className={cn(
                    `w-[80%] max-w-[60rem] mx-auto space-y-[2rem]`
                )}
            >
                <div
                    className={cn(
                        `w-full flex justify-between`
                    )}
                >
                    <div className="flex flex-col gap-4" >
                        <h1 className="text-4xl font-bold" >My Blogs</h1>
                        <div className="flex gap-4" >
                            <div className="flex flex-col gap-1" >
                                <p className="capitalize" >{user?.firstname} {user?.lastname}</p>
                                <Badge>{user?.email}</Badge>
                            </div>
                            <div>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-1" >
                        <Link href={"./my-blogs/create"} >
                            <Button variant={"secondary"} ><Plus/>Create New Blog</Button>
                        </Link>
                    </div>
                </div>

                <div
                    className={cn(
                        `flex flex-col space-y-4`
                    )}
                >
                    {
                        (myBlogs && myBlogs[0].length === 0) &&
                        <Empty>
                            <EmptyHeader>
                                <EmptyMedia>
                                    <File/>
                                </EmptyMedia>
                                <EmptyTitle>No Blogs</EmptyTitle>
                                <EmptyDescription>You currently don't have any blogs. Please create one.</EmptyDescription>
                            </EmptyHeader>
                        </Empty>
                    }
                    {
                        myBlogs && myBlogs[0].map( blog => (
                            <MyBlogCard key={blog.id} data={blog} />
                        ) )
                    }
                </div>

                <div
                    className={cn(
                        `flex justify-end gap-4`,
                        `w-full`
                    )}
                >
                    <Select
                        value={display}
                        onValueChange={ value => {
                            if ( value ) {
                                dispatch(setDisplay(value))
                            }
                        } }
                    >
                        <SelectTrigger>
                            <SelectValue/>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={5} >5</SelectItem>
                            <SelectItem value={10} >10</SelectItem>
                            <SelectItem value={20} >20</SelectItem>
                            <SelectItem value={30} >30</SelectItem>
                            <SelectItem value={40} >40</SelectItem>
                            <SelectItem value={50} >50</SelectItem>
                        </SelectContent>
                    </Select>

                    <div className="flex gap-2" >
                        <Button
                            variant={"ghost"}
                            onClick={() => {
                                if ( pagination.previous !== null ) {
                                    dispatch(setPage(pagination.previous))
                                }
                            }}
                            disabled={pagination.previous === null}
                        >Previous</Button>

                        {
                            pagination.buttons.map( buttonPage => (
                                <Button
                                    key={buttonPage}
                                    size={"icon"}
                                    variant={ page === buttonPage ? "default" : "outline"}
                                    onClick={() => {
                                        dispatch(setPage(buttonPage))
                                    }}
                                >
                                    {buttonPage}
                                </Button>
                            ) )
                        }

                        <Button
                            variant={"ghost"}
                            onClick={() => {
                                if ( pagination.next !== null ) {
                                    dispatch(setPage(pagination.next))
                                }
                            }}
                            disabled={pagination.next === null}
                        >Next</Button>
                    </div>
                </div>
            </div>
        </div>
    )

}

export default MyBlogsPage;