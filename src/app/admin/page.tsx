"use client";

import { BASE_URL } from "@/lib/APIROTES";
import axios from "axios";
import { Upload, QrCode, Save, Landmark } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";


export default function AdminPage() {
    return (
        <div className="flex flex-col gap-4 p-6">
            <PaymentQRCard />
            <BankDetailsCard />
        </div>
    );
}

export function PaymentQRCard() {
    const [file, setFile] = useState<File | null>(null);

    const [preview, setPreview] = useState<string | null>(null);
    const [upiId, setUpiId] = useState("");

    const [loading, setLoading] = useState<boolean>(false);

    const handleFileChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const selectedFile = e.target.files?.[0];

        if (!selectedFile) return;

        setFile(selectedFile);
        setPreview(URL.createObjectURL(selectedFile));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            if (!file) {
                toast.error("Please select a QR image");
                setLoading(false);
                return;
            }

            const formData = new FormData();

            formData.append("file", file);
            formData.append("upiId", upiId);

            const { data } = await axios.post(
                `${BASE_URL}/admin/upload-upi`,
                formData,
                {
                    withCredentials: true,
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            setLoading(false)

            toast.success(data.message || "QR uploaded successfully");
        } catch (error: any) {
            console.log(error);

            setLoading(false)

            toast.error(
                error?.response?.data?.message ||
                error?.message ||
                "Something went wrong"
            );
        }
    };

    return (
        <div className="rounded-2xl border border-emerald-500/20 bg-[#07111d]/80 backdrop-blur-sm">
            {/* Header */}
            <div className="border-b border-emerald-500/10 p-5">
                <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-emerald-500/10 p-2">
                        <QrCode className="h-5 w-5 text-emerald-400" />
                    </div>

                    <div>
                        <h2 className="font-semibold text-white">
                            Payment QR
                        </h2>

                        <p className="text-xs text-slate-400">
                            Manage deposit scanner QR
                        </p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* QR Preview */}
                    <div>
                        <label className="mb-3 block text-sm text-slate-400">
                            Current Scanner QR
                        </label>

                        <div className="flex h-[260px] items-center justify-center rounded-xl border border-dashed border-emerald-500/20 bg-[#030813]">
                            {preview ? (
                                <img
                                    src={preview}
                                    alt="QR"
                                    className="h-52 w-52 rounded-lg object-contain"
                                />
                            ) : (
                                <div className="text-center">
                                    <QrCode className="mx-auto mb-3 h-14 w-14 text-slate-600" />
                                    <p className="text-sm text-slate-500">
                                        No QR Uploaded
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Form */}
                    <div className="space-y-5">
                        <div>
                            <label className="mb-2 block text-sm text-slate-400">
                                UPI ID
                            </label>

                            <input
                                value={upiId}
                                onChange={(e) => setUpiId(e.target.value)}
                                placeholder="example@paytm"
                                className="w-full rounded-xl border border-emerald-500/15 bg-[#030813] px-4 py-3 text-white outline-none transition focus:border-emerald-500"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm text-slate-400">
                                Upload QR Image
                            </label>

                            <label className="flex cursor-pointer items-center justify-center gap-3 rounded-xl border border-dashed border-emerald-500/20 bg-[#030813] px-4 py-6 transition hover:border-emerald-500/40">
                                <Upload className="h-5 w-5 text-emerald-400" />

                                <span className="text-sm text-slate-300">
                                    Choose QR Image
                                </span>

                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </label>
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-medium text-white transition hover:bg-emerald-500"
                        >
                            <Save className="h-4 w-4" />
                            {loading ? "Saving..." : "Save Changes"}
                        </button>

                    </div>
                </div>
            </div>
        </div>
    );
}
export function BankDetailsCard() {
    const [form, setForm] = useState({
        accountName: "",
        accountNumber: "",
        ifsc: "",
        bankName: "",
        branchName: "",
    });

    const [loading, setLoading] = useState<boolean>(false);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            if (
                !form.accountName ||
                !form.accountNumber ||
                !form.ifsc
            ) {
                toast.error("Please fill all required fields");
                setLoading(false);
                return;
            }

            const { data } = await axios.post(
                `${BASE_URL}/admin/update-bank-details`,
                {
                    accountName: form.accountName,
                    accountNumber: form.accountNumber,
                    ifsc: form.ifsc,
                    bankName: form.bankName,
                    branchName: form.branchName,
                },
                {
                    withCredentials: true,
                }
            );

            setLoading(false);

            toast.success(
                data.message || "Bank details updated successfully"
            );
        } catch (error: any) {
            console.log(error);
            setLoading(false);

            toast.error(
                error?.response?.data?.message ||
                error?.message ||
                "Something went wrong"
            );
        }
    };

    return (
        <div className="rounded-2xl border border-emerald-500/20 bg-[#07111d]/80 backdrop-blur-sm">
            {/* Header */}
            <div className="border-b border-emerald-500/10 p-5">
                <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-emerald-500/10 p-2">
                        <Landmark className="h-5 w-5 text-emerald-400" />
                    </div>

                    <div>
                        <h2 className="font-semibold text-white">
                            Bank Details
                        </h2>

                        <p className="text-xs text-slate-400">
                            Manage withdrawal bank account
                        </p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="grid gap-5 p-6">
                <div>
                    <label className="mb-2 block text-sm text-slate-400">
                        Account Holder Name
                    </label>

                    <input
                        name="accountName"
                        value={form.accountName}
                        onChange={handleChange}
                        placeholder="John Doe"
                        className="w-full rounded-xl border border-emerald-500/15 bg-[#030813] px-4 py-3 text-white outline-none focus:border-emerald-500"
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm text-slate-400">
                        Account Number
                    </label>

                    <input
                        name="accountNumber"
                        value={form.accountNumber}
                        onChange={handleChange}
                        placeholder="123456789012"
                        className="w-full rounded-xl border border-emerald-500/15 bg-[#030813] px-4 py-3 text-white outline-none focus:border-emerald-500"
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm text-slate-400">
                        IFSC Code
                    </label>

                    <input
                        name="ifsc"
                        value={form.ifsc}
                        onChange={handleChange}
                        placeholder="SBIN0001234"
                        className="w-full rounded-xl border border-emerald-500/15 bg-[#030813] px-4 py-3 uppercase text-white outline-none focus:border-emerald-500"
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm text-slate-400">
                        Bank Name
                    </label>

                    <input
                        name="bankName"
                        value={form.bankName}
                        onChange={handleChange}
                        placeholder="State Bank of India"
                        className="w-full rounded-xl border border-emerald-500/15 bg-[#030813] px-4 py-3 text-white outline-none focus:border-emerald-500"
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm text-slate-400">
                        Branch Name
                    </label>

                    <input
                        name="branchName"
                        value={form.branchName}
                        onChange={handleChange}
                        placeholder="Ranchi Branch"
                        className="w-full rounded-xl border border-emerald-500/15 bg-[#030813] px-4 py-3 text-white outline-none focus:border-emerald-500"
                    />
                </div>

                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-medium text-white transition hover:bg-emerald-500"
                >
                    <Save className="h-4 w-4" />
                    {loading ? "Saving..." : "Save Bank Details"}
                </button>
            </div>
        </div>
    );
}