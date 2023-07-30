import { configureStore, createSlice } from '@reduxjs/toolkit'
import { createWrapper, HYDRATE } from 'next-redux-wrapper';

import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage/session';

const initialState = { theme: true, }
const slice = createSlice({
    name: 'theme',
    initialState,
    reducers: {
        toggle(state, action) {
            state.theme = !state.theme;
        },
    },
    extraReducers: (builder) => {
        builder.addCase(HYDRATE, (state, action) => {
            return state = {
                ...state,
                ...action
            };
        })
    },
});


const persistConfig = {
    key: 'root',
    storage,
}
const persistedReducer = persistReducer(persistConfig, slice.reducer)

const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
})

export type StoreType = any;
export type StateType = any;

export const persistor = persistStore(store)

export const wrapper = createWrapper<StoreType>(() => store)