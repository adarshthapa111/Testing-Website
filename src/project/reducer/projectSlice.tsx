import { BASE_URL } from "@/utils/constants";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

export interface Project {
    _id: string;
    name: string;
    description: string;
    requirement: string;
    icon: string;
    createdAt: string;
}

export interface ProjectState {
    projects: Project[];
    loading: boolean;
    error: string;
}

const initialState: ProjectState = {
    projects: [],
    loading: false,
    error: ''
}

export const addProject = createAsyncThunk(
    "project/addProject", async(project: Omit<Project, "_id" | "createdAt">, {rejectWithValue})=> {
        try{
            const response = await axios.post(`${BASE_URL}/projects`, {
                name: project.name,
                description: project.description,
                icon: project.icon,
                requirement: project.requirement,
            });
            return response.data; // Should return the created project object
        }catch(error: any){
            return rejectWithValue(error.message || 'Failed to add project!');
        }
    }
)

export const fetchProject = createAsyncThunk(
    'projects/getProjects', async(_, {rejectWithValue})=>{
        try{ 
            const response = await axios.get(`${BASE_URL}/projects`);
            return response.data; // Should return an array of projects
        }catch(error: any) {
            return rejectWithValue(error.message || 'Failed to fetch data');
        }
    }
)

export const deleteProject = createAsyncThunk(
    'project/deleteProject', async(projectId: string, {rejectWithValue})=> {
        try{
            await axios.delete(`${BASE_URL}/projects/${projectId}`);
            return projectId; // Return the deleted project ID
        }catch(error: any){
            return rejectWithValue(error.message || 'Failed to delete project!');
        }
    }
)

const projectSlice = createSlice({
    name: 'project',
    initialState,
    reducers: {
        setProjects: (state, action) => {
            state.projects = action.payload;
        },
        resetForm: (state) => {
            state.loading = false;
            state.error = '';
        },
    },
    extraReducers: (builder) => {
        builder
        .addCase(addProject.fulfilled, (state, action) => {
            state.loading = false;
            state.error = '';
            // Add the new project to the array
            state.projects.push(action.payload);
        })
        .addCase(addProject.rejected, (state, action) => {
            state.error = action.payload as string;
            state.loading = false;
        })
        .addCase(addProject.pending, (state) => {
            state.loading = true;
        })
        .addCase(fetchProject.fulfilled, (state, action) => {
            state.projects = action.payload;
            state.error = '';
            state.loading = false;
        })
        .addCase(fetchProject.pending, (state) => {
            state.loading = true;
            state.error = '';
        })
        .addCase(fetchProject.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload as string;
        })
        .addCase(deleteProject.fulfilled, (state, action) => {
            state.loading = false;
            state.error = '';
            // Remove the project from the array
            state.projects = state.projects.filter(project => project._id !== action.payload);
        })
        .addCase(deleteProject.rejected, (state, action) => {
            state.error = action.payload as string;
            state.loading = false;
        })
        .addCase(deleteProject.pending, (state) => {
            state.loading = true;
        });
    }
})

export default projectSlice.reducer;
export const { resetForm, setProjects } = projectSlice.actions;

// Selectors
export const selectProjects = (state: { project: ProjectState }) => state.project.projects;
export const selectProjectLoading = (state: { project: ProjectState }) => state.project.loading;
export const selectProjectError = (state: { project: ProjectState }) => state.project.error;