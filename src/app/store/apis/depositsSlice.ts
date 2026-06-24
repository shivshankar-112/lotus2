import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "@/lib/APIROTES";


type DepositStatus = "pending" | "completed" | "failed" | "reviewing";
type PaymentMethod = "bank_transfer" | "crypto" | "card" | "upi" | "wire";
interface Deposit {
    id: string;
    userId: string;
    userName: string;
    email: string;
    initials: string;
    amount: number;
    currency: string;
    method: PaymentMethod;
    accountRef: string;
    status: DepositStatus;
    receivedAt: string;
    confirmedAt?: string;
    country: string;
    flagged: boolean;
    note?: string;
    txHash?: string;

    accountDetails?:any
}


export const depositsApi = createApi({
    reducerPath: "depositsApi",

    baseQuery: fetchBaseQuery({
        baseUrl: `${BASE_URL}/wallet`,
        credentials: "include"
    }),

    endpoints: (builder) => ({
        getMyDeposits: builder.query<Deposit[], void>({
            query: () => "/my-deposits",
        }),

        getAllDeposits: builder.query({
            query: () => "/all-deposits",

            transformResponse: (res)=>{

                const newData = res.data.map((d: any) => ({
                    id: d._id,
                    userId: d.userId._id,
                    userName: d.userId.name,
                    email: d.userId.email || d.userId.phone,
                    initials: d.userId.name.split(" ").map((n: string) => n[0]).join("").toUpperCase(),
                    
                    amount: d.amount,
                    currency: d.currency || "INR",
                    method: d.method,
                    status: d.status,
                    accountRef: d.accountRef || "-",
                    receivedAt: d.createdAt,

                    country: d.country || "India",
                    flagged: d.flagged,
                    note: d.remark,
                    txHash: d.txHash,

                    accountDetails: d.accountDetails || null
                }))  

                return newData;
            }
        }),

        approveDeposit: builder.mutation({
            query: (id) => ({
                url: `/deposit/approve/${id}`,
                method: "POST"
            }),

            transformResponse: (res:any) => {
                console.log("Approve deposit response - ", res);
                return res;
            }
        }),

        rejectDeposit: builder.mutation({
            query: (id) => ({
                url: `/deposit/reject/${id}`,
                method: "POST"
            })
        }),

    }),

})

export const {useGetMyDepositsQuery, useGetAllDepositsQuery, useApproveDepositMutation, useRejectDepositMutation } = depositsApi;