import { GET_WALLET } from "@/lib/APIROTES";
import { Wallet } from "@/types/auth";
import { PayloadAction } from "@reduxjs/toolkit";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";


// ======================
// TYPES
// ======================
interface WalletState {
    data: Wallet | null;
    loading: boolean;
    error: string | null;
}

// ======================
// INITIAL STATE
// ======================
const initialState: WalletState = {
    data: null,
    loading: false,
    error: null
};

export const fetchWallet = createAsyncThunk<
    null,
    void,
    { rejectValue: string }
>(
    "wallet/fetchWallet",
    async (_, thunkApi) => {
        try {
            const { data } = await axios.get(GET_WALLET, { withCredentials: true });
            return data.data;
        } catch (error: any) {
            console.log("API error in getting wallet", error)
            thunkApi.rejectWithValue(error.response?.data?.message || "something went wrong")
        }
    }
)
const walletSlice = createSlice({
    name: "wallet",
    initialState,

    reducers: {
        setWallet(state, action: PayloadAction<Wallet | null>) {
            state.data = action.payload;
        },
        clearWallet(state) {
            state.data = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchWallet.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchWallet.rejected, (state, action) => {
                state.error = action.payload || "Something went wrong";
                state.loading = false;
            })
            .addCase(fetchWallet.fulfilled, (state, action) => {
                state.data = action.payload;
                state.error = null;
                state.loading = false;
            })
    }
})

export const {setWallet, clearWallet} = walletSlice.actions;
const walletReducer = walletSlice.reducer;
export default walletReducer;
