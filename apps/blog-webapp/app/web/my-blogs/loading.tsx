import { Spinner } from "@/components/ui/spinner";

const LoadingPage = () => {

    return (
        <div
            className="w-full h-screen flex justify-center items-center bg-background"
        >
            <Spinner/>
        </div>
    )

}

export default LoadingPage;