import { GET_PROFILE } from "@/lib/APIROTES";
import { User } from "@/types/auth";
import {
  createAsyncThunk,
  createSlice,
  PayloadAction
} from "@reduxjs/toolkit";
import axios from "axios";


// ======================
// TYPES
// ======================

interface UserState {
  data: User | null;
  loading: boolean;
  error: string | null;
}


// ======================
// INITIAL STATE
// ======================

const initialState: UserState = {
  data: null,
  loading: false,
  error: null
};


// ======================
// ASYNC THUNK
// ======================

export const fetchUserProfile = createAsyncThunk<
  User,
  void,
  { rejectValue: string }
>(
  "user/fetchProfile",

  async (_, thunkAPI) => {
    try {
      const { data } = await axios.get(GET_PROFILE, {withCredentials:true});

      const {_id, name, isVerified, createdAt} = data.data; 
      
      return {...data.data, displayName:name, id:_id, kycVerified:isVerified, joinedAt:createdAt};

    } catch (error: any) {

        console.log("User api error - ", error)
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch user"
      );
    }
  }
);


// ======================
// SLICE
// ======================

const userSlice = createSlice({
  name: "user",

  initialState,

  reducers: {

    setUser(state, action: PayloadAction<User | null>) {
      state.data = action.payload;
    },

    clearUser(state) {
      state.data = null;
    }
  },

  extraReducers: (builder) => {

    builder

      // PENDING
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      // SUCCESS
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })

      // ERROR
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload || "Something went wrong";
      });
  }
});


// ======================
// EXPORTS
// ======================

export const { setUser, clearUser } = userSlice.actions;

export default userSlice.reducer;