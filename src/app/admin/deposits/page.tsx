"use client";

/**
 * Admin Deposits Page
 * ─────────────────────────────────────────────────────────────
 * Stack  : Next.js · TypeScript · Tailwind CSS · shadcn/ui
 * Layout : Collapsible sidebar + main content area
 *
 * shadcn components used (copy exact paths from your project):
 *   npx shadcn@latest add button badge card dialog input
 *                          label select table separator
 *                          scroll-area tooltip avatar
 *                          dropdown-menu progress
 * ─────────────────────────────────────────────────────────────
 */

import { useState, useMemo, useEffect } from "react";

// ── shadcn/ui ──────────────────────────────────────────────
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
    Table, TableBody, TableCell,
    TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    DropdownMenu, DropdownMenuContent,
    DropdownMenuItem, DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";

// ── Icons ──────────────────────────────────────────────────
import {
    Users, Search, Filter, Download, RefreshCw,
    ChevronLeft, ChevronRight, MoreHorizontal, Eye,
    CheckCircle2, XCircle, Clock, AlertTriangle, Copy,
    DollarSign, Activity, Banknote, CreditCard, Wallet, ShieldCheck,
    ChevronDown, X,
    CalendarDays, Hash, Globe, Zap,
    Loader2,
} from "lucide-react";
import { StatCard } from "@/components/admin/cards";
import { useGetAllDepositsQuery, useApproveDepositMutation, useRejectDepositMutation } from "@/app/store/apis/depositsSlice";

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════
type DepositStatus = "pending" | "approved" | "failed" | "reviewing" | "completed" | "rejected";
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

    accountDetails?: any

}

// ═══════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════
const STATUS_CONFIG: Record<DepositStatus, {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
    className: string;
    icon: React.FC<{ className?: string }>;
}> = {
    pending: { label: "Pending", variant: "outline", className: "border-amber-500/40 text-amber-400 bg-amber-500/10", icon: Clock },
    approved: { label: "Approved", variant: "outline", className: "border-emerald-500/40 text-emerald-400 bg-emerald-500/10", icon: CheckCircle2 },
    completed: { label: "Completed", variant: "outline", className: "border-emerald-500/40 text-emerald-400 bg-emerald-500/10", icon: CheckCircle2 },
    failed: { label: "Failed", variant: "destructive", className: "border-red-500/40 text-red-400 bg-red-500/10", icon: XCircle },
    rejected: { label: "Rejected", variant: "destructive", className: "border-red-500/40 text-red-400 bg-red-500/10", icon: XCircle },
    reviewing: { label: "Reviewing", variant: "outline", className: "border-blue-500/40 text-blue-400 bg-blue-500/10", icon: ShieldCheck },
};

const METHOD_META: Record<PaymentMethod, { label: string; icon: React.FC<{ className?: string }> }> = {
    bank_transfer: { label: "Bank Transfer", icon: Banknote },
    crypto: { label: "Crypto", icon: Zap },
    card: { label: "Card", icon: CreditCard },
    upi: { label: "UPI", icon: Wallet },
    wire: { label: "Wire Transfer", icon: Globe },
};

const PER_PAGE = 8;

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════
function fmt(amount: number, currency: string) {
    return new Intl.NumberFormat("en-US", {
        style: "currency", currency, maximumFractionDigits: 0,
    }).format(amount);
}

function timeAgo(iso: string) {
    const d = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (d < 60) return `${d}s ago`;
    if (d < 3600) return `${Math.floor(d / 60)}m ago`;
    if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
    return `${Math.floor(d / 86400)}d ago`;
}

function shortDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" });
}

// ═══════════════════════════════════════════════════════════
// ── COMPONENT: StatusBadge ─────────────────────────────────
// ═══════════════════════════════════════════════════════════
function StatusBadge({ status }: { status: DepositStatus }) {
    const cfg = STATUS_CONFIG[status];
    const Icon = cfg.icon;
    return (
        <Badge variant="outline" className={`gap-1.5 rounded-full text-xs font-semibold px-2.5 py-1 ${cfg.className}`}>
            <Icon className="w-3 h-3" />
            {cfg.label}
        </Badge>
    );
}

// ═══════════════════════════════════════════════════════════
// ── COMPONENT: MethodBadge ─────────────────────────────────
// ═══════════════════════════════════════════════════════════
function MethodBadge({ method }: { method: PaymentMethod }) {
    const { label, icon: Icon } = METHOD_META[method];
    return (
        <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 bg-white/4 border border-white/6 px-2.5 py-1 rounded-full">
            <Icon className="w-3 h-3 text-slate-500" />
            {label}
        </span>
    );
}

// ═══════════════════════════════════════════════════════════
// ── COMPONENT: UserAvatar ──────────────────────────────────
// ═══════════════════════════════════════════════════════════
function UserAvatar({ initials, flagged }: { initials: string; flagged: boolean }) {
    return (
        <div className="relative">
            <Avatar className="w-9 h-9">
                <AvatarFallback className="bg-linear-to-br from-teal-600 to-emerald-700 text-white text-xs font-bold">
                    {initials}
                </AvatarFallback>
            </Avatar>
            {flagged && (
                <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-amber-500 border-2 border-[#0f1117] flex items-center justify-center">
                    <AlertTriangle className="w-2 h-2 text-white" />
                </span>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════
// ── COMPONENT: DetailDialog ────────────────────────────────
// ═══════════════════════════════════════════════════════════
interface DetailDialogProps {
    deposit: Deposit | null;
    onClose: () => void;
    onApprove: (id: string) => void;
    onReject: (id: string) => void;
}
function DetailDialog({ deposit: d, onClose, onApprove, onReject }: DetailDialogProps) {
    const [copied, setCopied] = useState(false);
    if (!d) return null;

    const copy = (v: string) => {
        navigator.clipboard.writeText(v);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    const rows = [
        { label: "Deposit ID", value: d.id, icon: Hash },
        { label: "User ID", value: d.userId, icon: Users },
        { label: "Amount", value: fmt(d.amount, d.currency), icon: DollarSign },
        { label: "Method", value: METHOD_META[d.method].label, icon: Wallet },
        { label: "Country", value: d.country, icon: Globe },
        { label: "Received", value: shortDate(d.receivedAt), icon: CalendarDays },
        { label: "Confirmed", value: d.confirmedAt ? shortDate(d.confirmedAt) : "—", icon: CheckCircle2 },
        { label: "UPI ID", value: d.method === "upi" ? d.accountDetails?.upiId : "—", icon: CreditCard },
        ...(d.txHash ? [{ label: "Tx Hash", value: d.txHash, icon: Zap }] : []),
    ];

    return (
        <Dialog open={!!d} onOpenChange={onClose}>
            <DialogContent className="bg-[#0f1117] border-white/8 text-white max-w-md rounded-2xl p-0 overflow-hidden gap-0">
                {/* Header */}
                <DialogHeader className="px-6 pt-6 pb-4 border-b border-white/6">
                    <div className="flex items-start gap-3">
                        <UserAvatar initials={d.initials} flagged={d.flagged} />
                        <div className="flex-1">
                            <DialogTitle className="text-white font-bold text-base leading-tight">{d.userName}</DialogTitle>
                            <p className="text-slate-500 text-xs mt-0.5">{d.email}</p>
                        </div>
                        <StatusBadge status={d.status} />
                    </div>
                </DialogHeader>

                {/* Body */}
                <div className="px-6 py-5 space-y-4">
                    {/* Amount hero */}
                    <div className="text-center py-4 rounded-2xl bg-linear-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20">
                        <p className="text-slate-500 text-xs uppercase tracking-widest mb-1">Deposit Amount</p>
                        <p className="text-3xl font-black text-white">{fmt(d.amount, d.currency)}</p>
                        <p className="text-slate-500 text-xs mt-1">{timeAgo(d.receivedAt)}</p>
                    </div>

                    {/* Details grid */}
                    <div className="grid grid-cols-2 gap-2">
                        {rows.map(({ label, value, icon: Icon }) => (
                            <div key={label} className="rounded-xl bg-white/3 border border-white/5 p-3">
                                <div className="flex items-center gap-1.5 mb-1">
                                    <Icon className="w-3 h-3 text-slate-600" />
                                    <span className="text-slate-600 text-[10px] uppercase tracking-wider">{label}</span>
                                </div>
                                <p className="text-white text-xs font-semibold truncate">{value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Account ref with copy */}
                    <div className="flex items-center gap-3 rounded-xl bg-white/3 border border-white/5 px-4 py-3">
                        <span className="text-slate-500 text-[10px] uppercase tracking-wider shrink-0">Account</span>
                        <span className="text-white text-xs font-mono flex-1 truncate">{d.accountRef}</span>
                        <Button variant="ghost" size="icon" className="w-7 h-7 text-slate-500 hover:text-emerald-400"
                            onClick={() => copy(d.accountRef)}>
                            {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </Button>
                    </div>

                    {/* Flag note */}
                    {d.note && (
                        <div className="flex gap-2 rounded-xl bg-amber-500/5 border border-amber-500/20 px-4 py-3">
                            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                            <p className="text-amber-300 text-xs leading-relaxed">{d.note}</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {(d.status === "pending" || d.status === "reviewing") && (
                    <DialogFooter className="px-6 pb-6 gap-3 flex-row">
                        <Button
                            variant="outline"
                            className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-300 rounded-xl h-10"
                            onClick={() => { onReject(d.id); onClose(); }}
                        >
                            <XCircle className="w-4 h-4 mr-2" /> Reject
                        </Button>
                        <Button
                            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl h-10"
                            onClick={() => { onApprove(d.id); onClose(); }}
                        >
                            <CheckCircle2 className="w-4 h-4 mr-2" /> Approve
                        </Button>
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    );
}

// ═══════════════════════════════════════════════════════════
// ── COMPONENT: BulkActionBar ───────────────────────────────
// ═══════════════════════════════════════════════════════════
interface BulkBarProps { count: number; onApprove: () => void; onReject: () => void; onClear: () => void }
function BulkActionBar({ count, onApprove, onReject, onClear }: BulkBarProps) {
    return (
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
            <span className="text-sm font-semibold text-emerald-400">{count} selected</span>
            <Separator orientation="vertical" className="h-4 bg-white/10" />
            <Button variant="ghost" size="sm" className="text-xs text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 h-7 gap-1.5" onClick={onApprove}>
                <CheckCircle2 className="w-3.5 h-3.5" /> Approve all
            </Button>
            <Button variant="ghost" size="sm" className="text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 h-7 gap-1.5" onClick={onReject}>
                <XCircle className="w-3.5 h-3.5" /> Reject all
            </Button>
            <Button variant="ghost" size="sm" className="ml-auto text-xs text-slate-600 hover:text-slate-400 h-7" onClick={onClear}>
                <X className="w-3.5 h-3.5" />
            </Button>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════
// ── COMPONENT: DepositsTable ───────────────────────────────
// ═══════════════════════════════════════════════════════════
interface DepositsTableProps {
    deposits: Deposit[];
    selected: Set<string>;
    onToggle: (id: string) => void;
    onToggleAll: () => void;
    onView: (d: Deposit) => void;
    onApprove: (id: string) => void;
    onReject: (id: string) => void;
    sortKey: string;
    sortDir: "asc" | "desc";
    onSort: (key: string) => void;
}
function DepositsTable({ deposits, selected, onToggle, onToggleAll, onView, onApprove, onReject, sortKey, sortDir, onSort }: DepositsTableProps) {
    const SortBtn = ({ col }: { col: string }) => (
        <Button variant="ghost" size="sm" className="h-auto p-0 text-slate-500 hover:text-slate-300 gap-1 font-semibold text-xs uppercase tracking-wider"
            onClick={() => onSort(col)}>
            {col.replace(/([A-Z])/g, " $1").trim()}
            <ChevronDown className={`w-3 h-3 transition-transform ${sortKey === col && sortDir === "asc" ? "rotate-180" : ""} ${sortKey === col ? "text-emerald-400" : ""}`} />
        </Button>
    );

    return (
        <div className="rounded-xl border border-white/6 overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="border-white/6 hover:bg-transparent">
                        <TableHead className="w-10 px-4">
                            <input type="checkbox"
                                checked={selected.size === deposits.length && deposits.length > 0}
                                onChange={onToggleAll}
                                className="w-4 h-4 rounded accent-emerald-500 bg-white/4 border-white/20 cursor-pointer"
                            />
                        </TableHead>
                        <TableHead className="px-4"><SortBtn col="id" /></TableHead>
                        <TableHead className="px-4"><SortBtn col="userName" /></TableHead>
                        <TableHead className="px-4"><SortBtn col="amount" /></TableHead>
                        <TableHead className="px-4">
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Method</span>
                        </TableHead>
                        <TableHead className="px-4"><SortBtn col="status" /></TableHead>
                        <TableHead className="px-4"><SortBtn col="receivedAt" /></TableHead>
                        <TableHead className="px-4 text-right">
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</span>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {deposits.length === 0 && (
                        <TableRow className="hover:bg-transparent border-0">
                            <TableCell colSpan={8} className="text-center py-16 text-slate-600 text-sm">
                                No deposits match your filters.
                            </TableCell>
                        </TableRow>
                    )}
                    {deposits.map((dep) => (
                        <TableRow key={dep.id}
                            className={`border-white/4 transition-colors cursor-pointer
                ${selected.has(dep.id) ? "bg-emerald-500/5 hover:bg-emerald-500/8" : "hover:bg-white/2"}`}
                        >
                            <TableCell className="px-4 py-3.5">
                                <input type="checkbox" checked={selected.has(dep.id)} onChange={() => onToggle(dep.id)}
                                    className="w-4 h-4 rounded accent-emerald-500 bg-white/4 border-white/20 cursor-pointer"
                                    onClick={e => e.stopPropagation()}
                                />
                            </TableCell>
                            <TableCell className="px-4 py-3.5">
                                <span className="font-mono text-xs text-slate-400">{dep.id}</span>
                            </TableCell>
                            <TableCell className="px-4 py-3.5" onClick={() => onView(dep)}>
                                <div className="flex items-center gap-3">
                                    <UserAvatar initials={dep.initials} flagged={dep.flagged} />
                                    <div>
                                        <p className="text-white text-sm font-semibold leading-tight">{dep.userName}</p>
                                        <p className="text-slate-600 text-xs">{dep.email}</p>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="px-4 py-3.5">
                                <span className="text-white font-bold text-sm">{fmt(dep.amount, dep.currency)}</span>
                            </TableCell>
                            <TableCell className="px-4 py-3.5">
                                <MethodBadge method={dep.method} />
                            </TableCell>
                            <TableCell className="px-4 py-3.5">
                                <StatusBadge status={dep.status} />
                            </TableCell>
                            <TableCell className="px-4 py-3.5">
                                <div className="flex flex-col">
                                    <span className="text-slate-400 text-xs font-medium">{shortDate(dep.receivedAt)}</span>
                                    <span className="text-slate-600 text-[10px]">{timeAgo(dep.receivedAt)}</span>
                                </div>
                            </TableCell>
                            <TableCell className="px-4 py-3.5 text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="w-8 h-8 text-slate-500 hover:text-white hover:bg-white/6">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-44 bg-[#151820] border-white/8 text-slate-300 rounded-xl">
                                        <DropdownMenuItem className="gap-2 cursor-pointer hover:text-white focus:text-white focus:bg-white/5"
                                            onClick={() => onView(dep)}>
                                            <Eye className="w-3.5 h-3.5 text-slate-500" /> View details
                                        </DropdownMenuItem>
                                        {(dep.status === "pending" || dep.status === "reviewing") && (
                                            <>
                                                <DropdownMenuSeparator className="bg-white/6" />
                                                <DropdownMenuItem className="gap-2 cursor-pointer text-emerald-400 hover:text-emerald-300 focus:text-emerald-300 focus:bg-emerald-500/10"
                                                    onClick={() => onApprove(dep.id)}>
                                                    <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="gap-2 cursor-pointer text-red-400 hover:text-red-300 focus:text-red-300 focus:bg-red-500/10"
                                                    onClick={() => onReject(dep.id)}>
                                                    <XCircle className="w-3.5 h-3.5" /> Reject
                                                </DropdownMenuItem>
                                            </>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════
// ── COMPONENT: Pagination ──────────────────────────────────
// ═══════════════════════════════════════════════════════════
interface PaginationProps { page: number; total: number; perPage: number; onChange: (p: number) => void }
function Pagination({ page, total, perPage, onChange }: PaginationProps) {
    const pages = Math.ceil(total / perPage);
    const start = (page - 1) * perPage + 1;
    const end = Math.min(page * perPage, total);

    return (
        <div className="flex items-center justify-between mt-4">
            <p className="text-xs text-slate-600">
                Showing <span className="text-slate-400">{start}–{end}</span> of <span className="text-slate-400">{total}</span> deposits
            </p>
            <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="w-8 h-8 text-slate-500 hover:text-white rounded-lg"
                    disabled={page === 1} onClick={() => onChange(page - 1)}>
                    <ChevronLeft className="w-4 h-4" />
                </Button>
                {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                    <Button key={p} variant="ghost" size="icon"
                        className={`w-8 h-8 rounded-lg text-xs font-semibold ${p === page ? "bg-emerald-600 text-white hover:bg-emerald-500" : "text-slate-500 hover:text-white hover:bg-white/6"}`}
                        onClick={() => onChange(p)}>
                        {p}
                    </Button>
                ))}
                <Button variant="ghost" size="icon" className="w-8 h-8 text-slate-500 hover:text-white rounded-lg"
                    disabled={page === pages} onClick={() => onChange(page + 1)}>
                    <ChevronRight className="w-4 h-4" />
                </Button>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════
// ── PAGE: DepositsPage (root) ──────────────────────────────
// ═══════════════════════════════════════════════════════════
export default function DepositsPage() {
    const { data: deposits, isLoading, error } = useGetAllDepositsQuery({});
    const [approveDeposit] = useApproveDepositMutation();
    const [rejectDeposit] = useRejectDepositMutation();

    useEffect(() => {
        console.log("Fetched deposits:", deposits);
    }, [deposits]);
    const [data, setData] = useState<Deposit[]>(deposits || []);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<DepositStatus | "all">("all");
    const [methodFilter, setMethodFilter] = useState<PaymentMethod | "all">("all");
    const [sortKey, setSortKey] = useState("receivedAt");
    const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [modal, setModal] = useState<Deposit | null>(null);
    const [page, setPage] = useState(1);

    useEffect(() => {
        if (deposits) setData(deposits);
    }, [deposits]);

    // ── Stats
    const stats = useMemo(() => {
        const completed = data.filter(d => d.status === "approved");
        const pending = data.filter(d => d.status === "pending");
        const reviewing = data.filter(d => d.status === "reviewing");
        const totalVol = data.reduce((s, d) => s + d.amount, 0);
        const rate = data.length ? Math.round((completed.length / data.length) * 100) : 0;
        return { totalVol, pending: pending.length, reviewing: reviewing.length, rate };
    }, [data]);

    // ── Filter + Sort
    const filtered = useMemo(() => {
        let r = data.filter(d => {
            const q = search.toLowerCase();
            const ms = !q || d.userName.toLowerCase().includes(q) || d.email.toLowerCase().includes(q) || d.id.toLowerCase().includes(q);
            const ss = statusFilter === "all" || d.status === statusFilter;
            const ms2 = methodFilter === "all" || d.method === methodFilter;
            return ms && ss && ms2;
        });
        r = [...r].sort((a: any, b: any) => {
            const av = a[sortKey] ?? ""; const bv = b[sortKey] ?? "";
            return sortDir === "asc" ? (av < bv ? -1 : 1) : (av > bv ? -1 : 1);
        });
        return r;
    }, [data, search, statusFilter, methodFilter, sortKey, sortDir]);

    const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

    // ── Sort
    function handleSort(key: string) {
        if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
        else { setSortKey(key); setSortDir("asc"); }
    }

    // ── Select
    function toggleSelect(id: string) {
        setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
    }
    function toggleAll() {
        setSelected(selected.size === paginated.length ? new Set() : new Set(paginated.map(d => d.id)));
    }

    // ── Update
    function updateStatus(ids: string[], status: DepositStatus) {
        // setData(d => d.map(dep => ids.includes(dep.id) ? { ...dep, status, confirmedAt: new Date().toISOString() } : dep));
        // setSelected(new Set());
        // if (modal && ids.includes(modal.id)) setModal(null);
        if (status == "approved") {
            ids.forEach((id: string) => {
                approveDeposit(id);
            })
        }

        if (status == "failed") {
            ids.forEach(id => {
                rejectDeposit(id);
            })
        }

    }
    const actionableSelected = paginated.filter(d => selected.has(d.id) && (d.status === "pending" || d.status === "reviewing")).map(d => d.id);

    return (
        <div className="flex justify-center h-screen  bg-[#0a0c12] text-white">

            <main className="px-6 py-6 space-y-6 w-full max-w-7xl">

                {/* Stats */}
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                    <StatCard
                        title="Total Volume" value={fmt(stats.totalVol, "USD")} sub="All deposits"
                        icon={DollarSign} trend="up" trendValue="+12.4%"
                        accentClass="bg-emerald-500/10 text-emerald-400"
                    />
                    <StatCard
                        title="Pending Review" value={String(stats.pending)} sub="Awaiting action"
                        icon={Clock} trend={stats.pending > 3 ? "up" : "down"} trendValue={`${stats.pending} queued`}
                        accentClass="bg-amber-500/10 text-amber-400"
                    />
                    <StatCard
                        title="Under Scrutiny" value={String(stats.reviewing)} sub="AML / KYC checks"
                        icon={ShieldCheck}
                        accentClass="bg-blue-500/10 text-blue-400"
                    />
                    <StatCard
                        title="Approval Rate" value={`${stats.rate}%`} sub="Last 30 days"
                        icon={Activity} trend="up" trendValue="+2.1%" progress={stats.rate}
                        accentClass="bg-teal-500/10 text-teal-400"
                    />
                </div>

                {/* Table Card */}
                <Card className="bg-[#0f1117] border-white/6 rounded-2xl overflow-hidden">
                    <CardHeader className="px-5 py-4 border-b border-white/6">
                        <div className="flex flex-wrap items-center gap-3">
                            {/* Search */}
                            <div className="relative flex-1 min-w-50">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                                <Input
                                    value={search}
                                    onChange={e => { setSearch(e.target.value); setPage(1); }}
                                    placeholder="Search name, ID, email…"
                                    className="pl-9 h-9 bg-white/4 border-white/8 text-sm text-white placeholder:text-slate-600 focus-visible:ring-emerald-500/40 focus-visible:border-emerald-500/50 rounded-xl"
                                />
                            </div>

                            {/* Status filter */}
                            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v as DepositStatus | "all"); setPage(1); }}>
                                <SelectTrigger className="w-40 h-9 bg-white/4 border-white/8 text-slate-300 text-sm rounded-xl focus:ring-emerald-500/40">
                                    <Filter className="w-3.5 h-3.5 text-slate-500 mr-2" />
                                    <SelectValue placeholder="All Statuses" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#151820] border-white/8 text-slate-300 rounded-xl">
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    {(Object.keys(STATUS_CONFIG) as DepositStatus[]).map(s => (
                                        <SelectItem key={s} value={s}>{STATUS_CONFIG[s].label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Method filter */}
                            <Select value={methodFilter} onValueChange={(v) => { setMethodFilter(v as PaymentMethod | "all"); setPage(1); }}>
                                <SelectTrigger className="w-40 h-9 bg-white/4 border-white/8 text-slate-300 text-sm rounded-xl focus:ring-emerald-500/40">
                                    <SelectValue placeholder="All Methods" />
                                </SelectTrigger>
                                <SelectContent className="bg-[#151820] border-white/8 text-slate-300 rounded-xl">
                                    <SelectItem value="all">All Methods</SelectItem>
                                    {(Object.keys(METHOD_META) as PaymentMethod[]).map(m => (
                                        <SelectItem key={m} value={m}>{METHOD_META[m].label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Export */}
                            <Button variant="outline" size="sm"
                                className="ml-auto h-9 border-white/8 bg-white/4 text-slate-400 hover:text-white hover:border-white/20 rounded-xl gap-2">
                                <Download className="w-3.5 h-3.5" /> Export CSV
                            </Button>
                            <Button variant="ghost" size="icon" className="w-9 h-9 text-slate-500 hover:text-white rounded-xl">
                                <RefreshCw className="w-4 h-4" />
                            </Button>
                        </div>

                        {/* Bulk bar */}
                        {selected.size > 0 && (
                            <BulkActionBar
                                count={selected.size}
                                onApprove={() => updateStatus(actionableSelected, "approved")}
                                onReject={() => updateStatus(actionableSelected, "failed")}
                                onClear={() => setSelected(new Set())}
                            />
                        )}
                    </CardHeader>

                    {isLoading ? <div className="p-5"><Loader2 className="w-5 h-5 animate-spin" /></div> : error ? <div className="p-5 text-red-500">Error loading deposits.</div> :
                        <CardContent className="p-5 pb-24">
                            <DepositsTable
                                deposits={paginated}
                                selected={selected}
                                onToggle={toggleSelect}
                                onToggleAll={toggleAll}
                                onView={setModal}
                                onApprove={id => updateStatus([id], "approved")}
                                onReject={id => updateStatus([id], "failed")}
                                sortKey={sortKey}
                                sortDir={sortDir}
                                onSort={handleSort}
                            />
                            <Pagination
                                page={page} total={filtered.length}
                                perPage={PER_PAGE} onChange={setPage}
                            />
                        </CardContent>
                    }
                </Card>

            </main>


            {/* Detail dialog */}
            <DetailDialog
                deposit={modal}
                onClose={() => setModal(null)}
                onApprove={id => updateStatus([id], "approved")}
                onReject={id => updateStatus([id], "failed")}
            />
        </div>
    );
}