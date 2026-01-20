import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type TMyBlogsSlice = {
    search : string,
    page : number,
    display : number
}

const myBlogsSliceInitialState : TMyBlogsSlice = {
    search : "",
    page : 1,
    display : 5
}

export const myBlogsSlice = createSlice({
    name : "general",
    initialState : myBlogsSliceInitialState,
    reducers : {
        setSearch : ( state, action : PayloadAction<string> ) => {
            state.search = action.payload
        },
        setPage : ( state, action : PayloadAction<number> ) => {
            state.page = action.payload
        },
        setDisplay : ( state, action : PayloadAction<number> ) => {
            state.display = action.payload
        }
    }
})

export const {
    setSearch,
    setPage,
    setDisplay
} = myBlogsSlice.actions;

export default myBlogsSlice.reducer