import { configureStore } from "@reduxjs/toolkit"
import generalSlice from "./features/generalSlice"
import myBlogsSlice from "./features/myBlogsSlice"

export const makeStore = () => {
    return configureStore({
        reducer: {
            general: generalSlice,
            myBlogs : myBlogsSlice
        }
    })
}

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']