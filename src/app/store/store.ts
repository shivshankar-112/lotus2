import { configureStore } from "@reduxjs/toolkit";

import userReducer from "./features/userSlice";
import walletReducer from "./features/walletSlice";

import { depositsApi } from "./apis/depositsSlice";
import { withdrawlsApi } from "./apis/withdrawlsSlice";
import { colorGameApi } from "./apis/games/colorGameSlice";
import { aviatorGameApi } from "./apis/games/aviatorGameSlice";

export const store = configureStore({
    reducer: {
        user: userReducer,
        wallet: walletReducer,

        [depositsApi.reducerPath]:
            depositsApi.reducer,

        [withdrawlsApi.reducerPath]:
            withdrawlsApi.reducer,

        [colorGameApi.reducerPath]:
            colorGameApi.reducer,

        [aviatorGameApi.reducerPath]:
            aviatorGameApi.reducer,
    },

    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware()
            .concat(depositsApi.middleware)
            .concat(withdrawlsApi.middleware)
            .concat(colorGameApi.middleware)
            .concat(aviatorGameApi.middleware),
});

// TYPES
export type RootState =
    ReturnType<typeof store.getState>;

export type AppDispatch =
    typeof store.dispatch;