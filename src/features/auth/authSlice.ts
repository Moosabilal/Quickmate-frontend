import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, IUser } from '../../util/interface/IUser';

const CHATBOT_SESSION_ID_KEY = 'chatbot_session_id';

const getUserNameFromLocalStorage = (): string | null => {
    return localStorage.getItem('userName');
};

const getUserRoleFromLocalStorage = (): string | null => {
    return localStorage.getItem('userRole');
};

const initialState: AuthState = {
    user: (() => {
        const userName = getUserNameFromLocalStorage();
        const userRole = getUserRoleFromLocalStorage(); 

        if ( userName && userRole) {
            return {
                id: '', 
                name: userName,
                email: '', 
                role: userRole, 
            };
        }
        return null; 
    })(), 

    isAuthenticated: !!getUserNameFromLocalStorage() && !!getUserRoleFromLocalStorage(),
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        login: (
            state,
            action: PayloadAction<{ user: IUser; }>
        ) => {
            state.user = action.payload.user;
            state.isAuthenticated = true;

            localStorage.setItem('userName', action.payload.user.name);
            localStorage.setItem('userRole', action.payload.user.role);
            
            localStorage.removeItem(CHATBOT_SESSION_ID_KEY);
        },
        logout: state => {
            state.user = null;
            state.isAuthenticated = false;
            localStorage.removeItem('userName');
            localStorage.removeItem('userRole'); 
            
            localStorage.removeItem(CHATBOT_SESSION_ID_KEY);
        },

        updateProfile: (
            state,
            action: PayloadAction<{ user: IUser }>
        ) => {
            state.user = action.payload.user;
            state.isAuthenticated = action.payload.user.isVerified || false;
        },
    },
});

export const { login, logout, updateProfile } = authSlice.actions;
export default authSlice.reducer;