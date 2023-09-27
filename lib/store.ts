import { configureStore, createSlice } from '@reduxjs/toolkit'
import { createWrapper, HYDRATE } from 'next-redux-wrapper';
import createWebStorage from 'redux-persist/lib/storage/createWebStorage';
import { persistReducer, persistStore } from 'redux-persist';
  

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

const createNoopStorage = () => {
    return {
      getItem(_key: any) {
        return Promise.resolve(null);
      },
      setItem(_key: any, value: any) {
        return Promise.resolve(value);
      },
      removeItem(_key: any) {
        return Promise.resolve();
      },
    };
  };
  
  const storage =
    typeof window === 'undefined'
      ? createNoopStorage()
      : createWebStorage('local');

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