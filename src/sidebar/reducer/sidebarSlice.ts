import {database} from "@/firebase";;
import type {RootState} from "@/store";
import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import { push, ref, remove} from "firebase/database";

export interface Feature {
  id: string;
  name: string;
  description: string;
  icon: string;
  testCounts: {
    passed: number;
    failed: number;
    ready: number;
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
      const featureRef = ref(database, "features");
      await push(featureRef, feature);
      return {
         ...feature
        };
    } catch (error: any) {
      return rejectWithValue(error.message || "Failed to add feature");
    }
  }
);

export const deleteFeature = createAsyncThunk(
  'features/deleteFeature',
  async(featureId: string, {rejectWithValue})=> {
    try{
      const featureRef = ref(database, `features/${featureId}`);
      await remove(featureRef);
      const testCaseRef = ref(database, `testCases/${featureId}`);
      await remove(testCaseRef);
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
        state.features = state.features.filter((feature)=> feature.id !== action.payload);
      })
  },
});

export default sidebarSlice.reducer;

export const {resetForm, setFeatures} = sidebarSlice.actions;

export const selectLoading = (state: RootState) => state.feature.loading;
export const selectError = (state: RootState) => state.feature.error;
export const selectFeatures = (state: RootState) => state.feature.features;