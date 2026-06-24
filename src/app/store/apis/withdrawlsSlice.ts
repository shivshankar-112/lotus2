import { BASE_URL } from "@/lib/APIROTES";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const withdrawlsApi = createApi({
    reducerPath: "withdrawlsApi",
    baseQuery: fetchBaseQuery({
        baseUrl:`${BASE_URL}/wallet`,
        credentials:"include"
    }),

    endpoints: (builder)=>({
        getMyWithdrawls:builder.query({
            query: () => "/my-withdraws",
        }),
        requestWithdraw:builder.mutation({
            query:(data)=>({
                url:`/withdraw`,
                method:"POST",
                body:data
            })
        }),

        getAllWithdrawls: builder.query({
            query:()=> "/all-withdraws"
        }),

        approveWithdraw: builder.mutation({
            query: (id:string) => ({
                url:`/approve-withdraw/${id}`,
                method:"POST",

            })
        }),

        rejectWithdraw: builder.mutation({
            query: (id)=>({
                url:`/reject-withdraw/${id}`,
                method:"POST"
            })
        })

    })
})

export const {
    useApproveWithdrawMutation, 
    useGetAllWithdrawlsQuery, 
    useGetMyWithdrawlsQuery, 
    useRejectWithdrawMutation, 
    useRequestWithdrawMutation
} = withdrawlsApi