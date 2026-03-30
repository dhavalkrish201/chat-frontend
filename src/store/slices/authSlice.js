import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import { axiosInstance } from "../../lib/axios";
import { connectSocket, disconnectSocket } from "../../lib/socket";

export const getUser = createAsyncThunk("user/me", async (_, thunkAPI) => {
  try {
    const res = await axiosInstance.get("/user/me", { withCredentials: true });
    connectSocket(res.data.user);
    return res.data.user;
  } catch (error) {
    console.log("Error fetching user", error);
    return thunkAPI.rejectWithValue(
      error.response?.data || "Failed to fetch user",
    );
  }
});

export const login = createAsyncThunk(
  "user/sign-in",
  async (data, thunkAPI) => {
    try {
      const res = await axiosInstance.post("/user/sign-in", data);
      console.log("res", res);
      // Login only returns token, so fetch the actual user after
      const userRes = await axiosInstance.get("/user/me", {
        withCredentials: true,
      });
      connectSocket(userRes.data.user._id);
      toast.success("Logged in successfully");
      return userRes.data.user; // ✅ now returns the full user object
    } catch (error) {
      toast.error(error.response.data.message);
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  },
);

export const signup = createAsyncThunk(
  "auth/sign-up",
  async (data, thunkAPI) => {
    try {
      const res = await axiosInstance.post("/user/sign-up", data);

      connectSocket(res.data);
      toast.success("Account Created successfully");
      return res.data;
    } catch (error) {
      toast.error(error.response.data.message);
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  },
);

export const logout = createAsyncThunk("user/sign-out", async (_, thunkAPI) => {
  try {
    await axiosInstance.get("/user/sign-out");
    disconnectSocket();
    return null;
  } catch (error) {
    toast.error(error.response.data.message);
    return thunkAPI.rejectWithValue(error.response.data.message);
  }
});

export const updateProfile = createAsyncThunk(
  "user/update-profile",
  async (data, thunkAPI) => {
    try {
      const res = await axiosInstance.put("/user/update-profile", data);
      toast.success("Profile Updated Successfully");
      return res.data;
    } catch (error) {
      toast.error(error.response.data.message);
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    authUser: null,
    isSigninUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    isCheckingAuth: true,
    onlineUsers: [],
  },
  reducers: {
    setOnlineUsers(state, action) {
      state.onlineUsers = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUser.fulfilled, (state, action) => {
        console.log("action.payload", action.payload);
        state.authUser = action.payload;
        state.isCheckingAuth = false;
      })
      .addCase(getUser.rejected, (state) => {
        state.authUser = null;
        state.isCheckingAuth = false;
      })
      .addCase(logout.fulfilled, (state) => {
        state.authUser = null;
      })
      .addCase(logout.rejected, (state) => {
        state.authUser = null;
      })
      .addCase(login.pending, (state) => {
        state.isLoggingIn = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        console.log("action.payload", action.payload); // ✅ will log now
        state.authUser = action.payload; // the user object directly
        state.isLoggingIn = false;
      })
      .addCase(login.rejected, (state) => {
        state.isLoggingIn = false;
      })
      .addCase(signup.pending, (state) => {
        state.isSigninUp = true;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.authUser = action.payload;
        state.isSigninUp = false;
      })
      .addCase(signup.rejected, (state) => {
        state.isSigninUp = false;
      })
      .addCase(updateProfile.pending, (state) => {
        state.isUpdatingProfile = true;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.authUser = action.payload;
        state.isUpdatingProfile = false;
      })
      .addCase(updateProfile.rejected, (state) => {
        state.isUpdatingProfile = false;
      });
  },
});

export const { setOnlineUsers } = authSlice.actions;
export default authSlice.reducer;
