import { BASE_URL } from "@/lib/APIROTES";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export interface PlaceBetBody {
    amount: number;
}

export interface CashoutBody {
    roundId: string;
}

export interface AviatorBet {
    _id: string;
    userId: string;
    roundId: string;
    betAmount: number;
    payout: number;
    status: "pending" | "won" | "lost";
    cashedOut: boolean;
    cashoutMultiplier?: number;
    createdAt: string;
    updatedAt: string;
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export const aviatorGameApi = createApi({
    reducerPath: "aviatorGameApi",

    baseQuery: fetchBaseQuery({
        baseUrl: `${BASE_URL}/aviator`,
        credentials: "include",
    }),

    tagTypes: ["AviatorBet"],

    endpoints: (builder) => ({
        // Place bet
        placeBet: builder.mutation<ApiResponse<AviatorBet>, PlaceBetBody>({
            query: (body) => ({
                url: "/place-bet",
                method: "POST",
                body,
            }),

            invalidatesTags: ["AviatorBet"],
        }),

        // Cashout
        cashout: builder.mutation<ApiResponse<AviatorBet>, CashoutBody>({
            query: (body) => ({
                url: "/cashout",
                method: "POST",
                body,
            }),

            invalidatesTags: ["AviatorBet"],
        }),

        // History
        getHistory: builder.query<ApiResponse<AviatorBet[]>, void >({
            query: () => "/history",

            providesTags: ["AviatorBet"],
        }),

        // Current round
        getCurrentRound: builder.query<any, void>({
            query: () => "/current-round",
        }),
    }),
});

export const {
    usePlaceBetMutation,
    useCashoutMutation,
    useGetHistoryQuery,
    useGetCurrentRoundQuery,
} = aviatorGameApi;