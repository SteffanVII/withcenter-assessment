"use client"

import { QueryClient, QueryClientProvider,  } from "@tanstack/react-query"

const queryClient = new QueryClient()

type TServiceQueryClientProviderProps = {
    children : React.ReactNode
}

const ServiceQueryClientProvider : React.FC<TServiceQueryClientProviderProps> = ({
    children
}) => {

    return (
        <QueryClientProvider client={queryClient} >
            {children}
        </QueryClientProvider>
    )

}

export default ServiceQueryClientProvider;