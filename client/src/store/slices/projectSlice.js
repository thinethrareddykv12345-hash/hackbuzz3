import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL + '/projects';

export const fetchMyProjects = createAsyncThunk('projects/fetchMy', async (_, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.accessToken;
    const response = await axios.get(`${API_URL}/my`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data.projects;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response.data.message);
  }
});

export const createProject = createAsyncThunk('projects/create', async (projectData, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.accessToken;
    const response = await axios.post(API_URL, projectData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data.project;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response.data.message);
  }
});

const projectSlice = createSlice({
  name: 'projects',
  initialState: {
    projects: [],
    currentProject: null,
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyProjects.pending, (state) => { state.isLoading = true; })
      .addCase(fetchMyProjects.fulfilled, (state, action) => {
        state.isLoading = false;
        state.projects = action.payload;
      })
      .addCase(fetchMyProjects.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.projects.unshift(action.payload);
      });
  },
});

export default projectSlice.reducer;
