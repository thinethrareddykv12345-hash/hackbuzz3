import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL + '/teams';

export const fetchMyTeams = createAsyncThunk('teams/fetchMy', async (_, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.accessToken;
    const response = await axios.get(API_URL, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data.teams;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response.data.message);
  }
});

const teamSlice = createSlice({
  name: 'teams',
  initialState: {
    teams: [],
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyTeams.fulfilled, (state, action) => {
        state.teams = action.payload;
      });
  },
});

export default teamSlice.reducer;
