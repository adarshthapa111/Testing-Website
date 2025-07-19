import type {RootState} from "@/store";
import { BASE_URL } from "@/utils/constants";
import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import axios from "axios";

export interface Feature {
  _id:string;
  name: string;
  description: string;
  icon: string;
  testCounts: {
    passed: number;
    failed: number;
    pending: number;
  };
}

export interface FeatureState {
  features: Feature[];
  loading: boolean;
  error: string;
}

const initialState: FeatureState = {
  features: [],
  loading: false,
  error: "",
};



export const addFeature = createAsyncThunk(
  "features/addFeature", // Fixed action type
  async (feature: Omit<Feature, "id">, {rejectWithValue}) => {
    try {
      const response = await axios.post(`${BASE_URL}/features`, {
        name: feature.name,
        description: feature.description,
        icon: feature.icon
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to add feature");
    }
  }
);

export const fetchFeatures = createAsyncThunk(
  'features/fetchFeatures', async(_, {rejectWithValue})=>{
    try{
      const response = await axios.get(`${BASE_URL}/features`);
      return response.data;
    }catch(error: any) {
      rejectWithValue(error.message || 'Failed to fetch feature!')
    }
  }
)

export const deleteFeature = createAsyncThunk(
  'features/deleteFeature',
  async(featureId: string, {rejectWithValue})=> {
    try{
      await axios.delete(`${BASE_URL}/features/${featureId}`);
      return featureId;
    }catch(error: any) {
      return rejectWithValue(error.message || "Unable to delete the feature!")
    }
  }
)

const sidebarSlice = createSlice({
  name: "features",
  initialState,
  reducers: {
    setFeatures: (state, action) => {
      state.features = action.payload;
    },
    resetForm: (state) => {
      state.loading = false;
      state.error = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addFeature.fulfilled, (state) => {
        state.loading = false;
        state.error = "";
      })
      .addCase(addFeature.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(addFeature.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteFeature.fulfilled, (state, action)=>{
        state.features = state.features.filter((feature)=> feature._id !== action.payload);
      })
      .addCase(fetchFeatures.fulfilled, (state, action)=>{
        state.features = action.payload;
        state.loading = false;
      })
      .addCase(fetchFeatures.rejected, (state, action)=>{
        state.error = action.payload as string;
        state.loading = false;
      })
      .addCase(fetchFeatures.pending, (state)=>{
        state.loading = true;
      })
  },
});

export default sidebarSlice.reducer;

export const {resetForm, setFeatures} = sidebarSlice.actions;

export const selectLoading = (state: RootState) => state.feature.loading;
export const selectError = (state: RootState) => state.feature.error;
export const selectFeatures = (state: RootState) => state.feature.features;