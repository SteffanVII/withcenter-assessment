import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TUser } from "@repo/blog-types";

type TGeneralSlice = {
    user : TUser | null
}

const generalSliceInitialState : TGeneralSlice = {
    user : null
}

export const generalSlice = createSlice({
    name : "general",
    initialState : generalSliceInitialState,
    reducers : {
        setUser : ( state, action : PayloadAction<TUser | null> ) => {
            state.user = action.payload
        }
    }
})

export const {
    setUser
} = generalSlice.actions;

export default generalSlice.reducer