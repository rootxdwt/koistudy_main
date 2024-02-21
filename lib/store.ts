import { configureStore, createSlice, combineReducers } from '@reduxjs/toolkit'
import { createWrapper, HYDRATE } from 'next-redux-wrapper';
import createWebStorage from 'redux-persist/lib/storage/createWebStorage';
import { persistReducer, persistStore } from 'redux-persist';
  
const ThemeSlice = createSlice({
    name: 'theme',
    initialState:{isDarkTheme: true},
    reducers: {
        toggle(state, action) {
            state.isDarkTheme = !state.isDarkTheme;
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

const initialState:{activeTabs:Array<{id:string, name:string, isActive:boolean}> } = {activeTabs:[]}
const TabSlice = createSlice({
  name: 'tabs',
  initialState,
  reducers: {
    add(state, action) {
      if(!state.activeTabs.find(elem=>elem.id==action.payload.id)) {
        state.activeTabs.push(action.payload)
      }
    },
    remove(state, action) {
      state.activeTabs=state.activeTabs.filter(elem=>elem.id!=action.payload)
    },
    setActive(state,action) {
      state.activeTabs.map(elem=>elem.isActive=false)
      state.activeTabs.map((elem)=>{if(elem.id==action.payload){
        elem.isActive=true
      }})
    }
  },
  extraReducers: (builder) => {
    builder.addCase(HYDRATE, (state, action) => {
        return state = {
            ...state,
            ...action
        };
    })
},
})
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
    whitelist:["theme", "tabs"]
}

const rootReducer = combineReducers({
  theme: ThemeSlice.reducer,
  tabs: TabSlice.reducer

})
const persistedReducer = persistReducer(persistConfig, rootReducer)

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