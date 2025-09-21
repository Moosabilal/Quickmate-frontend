import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IProviderProfile } from '../../util/interface/IProvider';

interface ProviderState  {
    provider: Partial<IProviderProfile>
}

const initialState: ProviderState  = {
    provider: {}
}

const providerSlice = createSlice({
    name: "provider",
    initialState,
    reducers: {
        updateProviderProfile: (state, action: PayloadAction<{provider: IProviderProfile}>) => {
            state.provider = action.payload.provider
        }
    }
})

export const { updateProviderProfile } = providerSlice.actions;
export default providerSlice.reducer;