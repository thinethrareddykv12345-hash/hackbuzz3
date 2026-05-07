import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL + '/contributions';

export const fetchProjectContributions = createAsyncThunk(
  'contributions/fetchByProject',
  async (projectId, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.accessToken;
      const response = await axios.get(`${API_URL}/project/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.data.contributions;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

export const logContribution = createAsyncThunk(
  'contributions/log',
  async (formData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.accessToken;
      const response = await axios.post(API_URL, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data.data.contribution;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data.message);
    }
  }
);

const contributionSlice = createSlice({
  name: 'contributions',
  initialState: {
    items: [],
    isLoading: false,
    error: null,
  },
  reducers: {
    addContribution: (state, action) => {
      state.items.unshift(action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjectContributions.pending, (state) => { state.isLoading = true; })
      .addCase(fetchProjectContributions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(logContribution.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      });
  },
});

export const { addContribution } = contributionSlice.actions;
export default contributionSlice.reducer;
