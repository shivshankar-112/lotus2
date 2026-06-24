"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Search,
  Filter,
  Download,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  Eye,
  Ban,
  RefreshCw,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  Users,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Copy,
  X,
} from "lucide-react";
import { useApproveWithdrawMutation, useGetAllWithdrawlsQuery, useRejectWithdrawMutation } from "../../store/apis/withdrawlsSlice";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type Status = "pending" | "approved" | "rejected" | "processing";

interface Withdrawal {
  id: string;
  userId: string;
  userName: string;
  email: string;
  avatar: string;
  amount: number;
  currency: string;
  method: "bank_transfer" | "crypto" | "paypal" | "wire";
  accountDetails: any;
  status: Status;
  requestedAt: string;
  processedAt?: string;
  note?: string;
  country: string;
  flagged: boolean;
}

type SortKey = keyof Withdrawal;
type SortDir = "asc" | "desc";

// ─────────────────────────────────────────────
// Mock Data
// ─────────────────────────────────────────────
const MOCK_WITHDRAWALS: Withdrawal[] = [
  { id: "WD-10291", userId: "U-4821", userName: "Priya Sharma", email: "priya.sharma@mail.com", avatar: "PS", amount: 12400, currency: "USD", method: "bank_transfer", accountDetails: "HDFC ****4821", status: "pending", requestedAt: "2026-05-31T08:14:00Z", country: "IN", flagged: false },
  { id: "WD-10290", userId: "U-3310", userName: "Marcus Holt", email: "m.holt@inbox.io", avatar: "MH", amount: 88500, currency: "USD", method: "wire", accountDetails: "Chase ****9910", status: "pending", requestedAt: "2026-05-31T07:02:00Z", country: "US", flagged: true, note: "Large amount — verify identity" },
  { id: "WD-10289", userId: "U-7719", userName: "Chloe Dupont", email: "chloe.d@webmail.fr", avatar: "CD", amount: 3200, currency: "EUR", method: "paypal", accountDetails: "chloe.d@webmail.fr", status: "approved", requestedAt: "2026-05-30T14:55:00Z", processedAt: "2026-05-30T16:00:00Z", country: "FR", flagged: false },
  { id: "WD-10288", userId: "U-2204", userName: "Arjun Patel", email: "arjun.p@techco.in", avatar: "AP", amount: 5500, currency: "USD", method: "crypto", accountDetails: "0xA3c...f91B", status: "processing", requestedAt: "2026-05-30T11:30:00Z", country: "IN", flagged: false },
  { id: "WD-10287", userId: "U-8891", userName: "Sofia Reyes", email: "sofia.r@latam.mx", avatar: "SR", amount: 1800, currency: "USD", method: "bank_transfer", accountDetails: "BBVA ****0023", status: "rejected", requestedAt: "2026-05-29T09:44:00Z", processedAt: "2026-05-29T12:00:00Z", note: "KYC not completed", country: "MX", flagged: false },
  { id: "WD-10286", userId: "U-5502", userName: "Liam O'Brien", email: "liam.ob@domain.ie", avatar: "LO", amount: 22000, currency: "GBP", method: "bank_transfer", accountDetails: "AIB ****3341", status: "approved", requestedAt: "2026-05-29T08:10:00Z", processedAt: "2026-05-29T10:30:00Z", country: "IE", flagged: false },
  { id: "WD-10285", userId: "U-1193", userName: "Yuki Tanaka", email: "yuki.t@jp-mail.jp", avatar: "YT", amount: 9900, currency: "USD", method: "crypto", accountDetails: "0xB7d...22aC", status: "pending", requestedAt: "2026-05-28T20:15:00Z", country: "JP", flagged: true, note: "Multiple requests in 24h" },
  { id: "WD-10284", userId: "U-6608", userName: "Nina Kozlov", email: "nina.k@rupost.ru", avatar: "NK", amount: 4100, currency: "USD", method: "wire", accountDetails: "Sberbank ****7712", status: "rejected", requestedAt: "2026-05-28T14:22:00Z", processedAt: "2026-05-28T16:00:00Z", note: "Sanctioned region", country: "RU", flagged: true },
  { id: "WD-10283", userId: "U-9901", userName: "Carlos Lima", email: "c.lima@brazinet.br", avatar: "CL", amount: 7750, currency: "USD", method: "paypal", accountDetails: "c.lima@brazinet.br", status: "approved", requestedAt: "2026-05-27T10:05:00Z", processedAt: "2026-05-27T11:45:00Z", country: "BR", flagged: false },
  { id: "WD-10282", userId: "U-3314", userName: "Amara Osei", email: "amara.o@africamail.gh", avatar: "AO", amount: 2600, currency: "USD", method: "bank_transfer", accountDetails: "GCB ****5566", status: "processing", requestedAt: "2026-05-27T07:33:00Z", country: "GH", flagged: false },
];

// ─────────────────────────────────────────────
// Utility helpers
// ─────────────────────────────────────────────
const statusConfig: Record<Status, { label: string; color: string; icon: React.FC<{ className?: string }> }> = {
  pending:    { label: "Pending",    color: "text-amber-400 bg-amber-400/10 border-amber-400/20",    icon: Clock },
  approved:   { label: "Approved",   color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20", icon: CheckCircle2 },
  rejected:   { label: "Rejected",   color: "text-red-400 bg-red-400/10 border-red-400/20",          icon: XCircle },
  processing: { label: "Processing", color: "text-blue-400 bg-blue-400/10 border-blue-400/20",       icon: RefreshCw },
};

const methodLabels: Record<Withdrawal["method"], string> = {
  bank_transfer: "Bank Transfer",
  crypto: "Crypto",
  paypal: "PayPal",
  wire: "Wire Transfer",
};

function fmt(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

// Stat Card
interface StatCardProps { label: string; value: string; sub: string; icon: React.FC<{ className?: string }>; trend: "up" | "down" | "neutral"; accent: string }
function StatCard({ label, value, sub, icon: Icon, trend, accent }: StatCardProps) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0f1117] p-5 flex flex-col gap-3`}>
      <div className="flex items-start justify-between">
        <span className="text-xs font-medium tracking-widest uppercase text-slate-500">{label}</span>
        <span className={`flex items-center justify-center w-9 h-9 rounded-xl ${accent}`}>
          <Icon className="w-4 h-4" />
        </span>
      </div>
      <div>
        <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
        <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
          {trend === "up"   && <ArrowUpRight className="w-3 h-3 text-emerald-400" />}
          {trend === "down" && <ArrowDownRight className="w-3 h-3 text-red-400" />}
          {sub}
        </p>
      </div>
    </div>
  );
}

// Status Badge
function StatusBadge({ status }: { status: Status }) {
  const cfg = statusConfig[status];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.color}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

// Avatar
function Avatar({ initials, flagged }: { initials: string; flagged: boolean }) {
  return (
    <div className="relative shrink-0">
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center text-white text-xs font-bold">
        {initials}
      </div>
      {flagged && (
        <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-red-500 border-2 border-[#0a0c12] flex items-center justify-center">
          <AlertTriangle className="w-2 h-2 text-white" />
        </span>
      )}
    </div>
  );
}

// Sort icon
function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <ChevronsUpDown className="w-3.5 h-3.5 text-slate-600" />;
  return dir === "asc" ? <ChevronUp className="w-3.5 h-3.5 text-violet-400" /> : <ChevronDown className="w-3.5 h-3.5 text-violet-400" />;
}

// Detail Modal
function DetailModal({ w, onClose, onApprove, onReject }: { w: Withdrawal; onClose: () => void; onApprove: () => void; onReject: () => void }) {
  const [copied, setCopied] = useState(false);
  const copy = (v: string) => { navigator.clipboard.writeText(v); setCopied(true); setTimeout(() => setCopied(false), 1500); };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl border border-white/[0.08] bg-[#0f1117] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <div>
            <h2 className="text-white font-bold text-base">{w.id}</h2>
            <p className="text-slate-500 text-xs mt-0.5">Withdrawal detail</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* User */}
          <div className="flex items-center gap-3">
            <Avatar initials={w.avatar} flagged={w.flagged} />
            <div>
              <p className="text-white font-semibold text-sm">{w.userName}</p>
              <p className="text-slate-500 text-xs">{w.email}</p>
            </div>
            <div className="ml-auto"><StatusBadge status={w.status} /></div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              ["Amount", fmt(w.amount, w.currency)],
              ["Method", methodLabels[w.method]],
              ["Account", w.accountDetails?.upiId || "N/A"],
              ["Country", w.country],
              ["Requested", timeAgo(w.requestedAt)],
              ["Processed", w.processedAt ? timeAgo(w.processedAt) : "—"],
            ].map(([k, v]) => (
              <div key={k} className="rounded-xl bg-white/[0.03] border border-white/[0.05] p-3">
                <p className="text-slate-500 text-xs mb-1">{k}</p>
                <p className="text-white text-sm font-semibold truncate">{v}</p>
              </div>
            ))}
          </div>

          {/* Account copy */}
          <div className="flex items-center gap-2 rounded-xl bg-white/[0.03] border border-white/[0.05] px-4 py-3">
            <span className="text-slate-400 text-xs font-mono flex-1 truncate">{w.accountDetails?.upiId || "N/A"}</span>
            <button onClick={() => copy(w.accountDetails?.upiId || "N/A")} className="text-slate-500 hover:text-violet-400 transition-colors">
              {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* Note */}
          {w.note && (
            <div className="flex gap-2 rounded-xl bg-amber-400/5 border border-amber-400/20 px-4 py-3">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-amber-300 text-xs">{w.note}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        {w.status === "pending" && (
          <div className="flex gap-3 px-6 pb-5">
            <button onClick={onReject}  className="flex-1 flex items-center justify-center gap-2 h-10 rounded-xl border border-red-500/40 text-red-400 hover:bg-red-500/10 text-sm font-semibold transition-colors">
              <XCircle className="w-4 h-4" /> Reject
            </button>
            <button onClick={onApprove} className="flex-1 flex items-center justify-center gap-2 h-10 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors">
              <CheckCircle2 className="w-4 h-4" /> Approve
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Filters bar
interface FiltersProps {
  search: string; onSearch: (v: string) => void;
  statusFilter: Status | "all"; onStatus: (v: Status | "all") => void;
  methodFilter: Withdrawal["method"] | "all"; onMethod: (v: Withdrawal["method"] | "all") => void;
}
function FiltersBar({ search, onSearch, statusFilter, onStatus, methodFilter, onMethod }: FiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Search */}
      <div className="relative flex-1 min-w-[220px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input
          value={search}
          onChange={e => onSearch(e.target.value)}
          placeholder="Search by name, ID, email…"
          className="w-full h-10 pl-9 pr-4 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.06] transition-all"
        />
      </div>

      {/* Status */}
      <div className="relative">
        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
        <select
          value={statusFilter}
          onChange={e => onStatus(e.target.value as Status | "all")}
          className="h-10 pl-9 pr-8 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-slate-300 focus:outline-none focus:border-violet-500/50 appearance-none cursor-pointer"
        >
          <option value="all">All Statuses</option>
          {(Object.keys(statusConfig) as Status[]).map(s => <option key={s} value={s}>{statusConfig[s].label}</option>)}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
      </div>

      {/* Method */}
      <div className="relative">
        <select
          value={methodFilter}
          onChange={e => onMethod(e.target.value as Withdrawal["method"] | "all")}
          className="h-10 px-4 pr-8 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-slate-300 focus:outline-none focus:border-violet-500/50 appearance-none cursor-pointer"
        >
          <option value="all">All Methods</option>
          {(Object.keys(methodLabels) as Withdrawal["method"][]).map(m => <option key={m} value={m}>{methodLabels[m]}</option>)}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
      </div>

      {/* Export */}
      <button className="h-10 px-4 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-slate-400 hover:text-white hover:border-white/20 flex items-center gap-2 transition-all ml-auto">
        <Download className="w-3.5 h-3.5" /> Export
      </button>
    </div>
  );
}

// Table row actions dropdown
function RowActions({ w, onView, onApprove, onReject }: { w: Withdrawal; onView: () => void; onApprove: () => void; onReject: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/[0.06] transition-colors">
        <MoreHorizontal className="w-4 h-4" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-9 z-20 w-44 rounded-xl border border-white/[0.08] bg-[#151820] shadow-xl overflow-hidden">
            <button onClick={() => { onView(); setOpen(false); }}    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/[0.05] hover:text-white transition-colors">
              <Eye className="w-3.5 h-3.5 text-slate-500" /> View details
            </button>
            {w.status === "pending" && <>
              <button onClick={() => { onApprove(); setOpen(false); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-emerald-400 hover:bg-emerald-500/10 transition-colors">
                <CheckCircle2 className="w-3.5 h-3.5" /> Approve
              </button>
              <button onClick={() => { onReject(); setOpen(false); }}  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                <Ban className="w-3.5 h-3.5" /> Reject
              </button>
            </>}
          </div>
        </>
      )}
    </div>
  );
}

// Bulk action bar
function BulkBar({ count, onApprove, onReject, onClear }: { count: number; onApprove: () => void; onReject: () => void; onClear: () => void }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-violet-600/10 border border-violet-500/30">
      <span className="text-sm text-violet-300 font-semibold">{count} selected</span>
      <div className="h-4 w-px bg-white/10" />
      <button onClick={onApprove} className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors">
        <CheckCircle2 className="w-3.5 h-3.5" /> Approve all
      </button>
      <button onClick={onReject}  className="text-xs font-semibold text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors">
        <XCircle className="w-3.5 h-3.5" /> Reject all
      </button>
      <button onClick={onClear}   className="ml-auto text-xs text-slate-500 hover:text-slate-300 transition-colors">Clear</button>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────
export default function WithdrawalsPage() {
  const [approveWithdrawl] = useApproveWithdrawMutation();
  const [rejectWithdrawl] = useRejectWithdrawMutation();
  const {data: apiData, isLoading} = useGetAllWithdrawlsQuery({});
  const [data, setData] = useState<Withdrawal[]>(MOCK_WITHDRAWALS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [methodFilter, setMethodFilter] = useState<Withdrawal["method"] | "all">("all");
  const [sortKey, setSortKey] = useState<SortKey>("requestedAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [modal, setModal] = useState<Withdrawal | null>(null);
  const [page, setPage] = useState(1);
  const PER_PAGE = 7;

  useEffect(() => {
    if(apiData && !isLoading) {
      const formattedData = apiData.data.map((w: any) => ({
        id: w._id,
        userId: w.userId._id,
        userName: w.userId.name,
        email: w.userId.email || w.userId.phone || "N/A",

        avatar: w.userId.avatar || w.userId.name.split(" ").map((n: string) => n[0]).join("").toUpperCase(),
        amount: w.amount,
        currency: w.currency || "INR",
        method: w.method,
        accountDetails: w.accountDetails,
        status: w.status,
        requestedAt: w.createdAt,
        processedAt: w.updatedAt,
        note: w.note || "nothing",
        country: w.country || "India",
        flagged: w.flagged || false,
      }));
      setData(formattedData);
    }
  }, [apiData, isLoading]);

  // Stats
  const stats = useMemo(() => ({
    total: data.reduce((s, w) => s + w.amount, 0),
    pending: data.filter(w => w.status === "pending").length,
    approved: data.filter(w => w.status === "approved").length,
    flagged: data.filter(w => w.flagged).length,
  }), [data]);

  // Filter + Sort
  const filtered = useMemo(() => {
    let r = data.filter(w => {
      const q = search.toLowerCase();
      const matchSearch = !q || w.userName.toLowerCase().includes(q) || w.email.toLowerCase().includes(q) || w.id.toLowerCase().includes(q);
      const matchStatus = statusFilter === "all" || w.status === statusFilter;
      const matchMethod = methodFilter === "all" || w.method === methodFilter;
      return matchSearch && matchStatus && matchMethod;
    });
    r = [...r].sort((a, b) => {
      const av = a[sortKey] ?? ""; const bv = b[sortKey] ?? "";
      return sortDir === "asc" ? (av < bv ? -1 : 1) : (av > bv ? -1 : 1);
    });
    return r;
  }, [data, search, statusFilter, methodFilter, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  }

  function toggleSelect(id: string) {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }

  function toggleAll() {
    if (selected.size === paginated.length) setSelected(new Set());
    else setSelected(new Set(paginated.map(w => w.id)));
  }

  function updateStatus(ids: string[], status: Status) {
    // setData(d => d.map(w => ids.includes(w.id) ? { ...w, status, processedAt: new Date().toISOString() } : w));
    // setSelected(new Set());
    // if (modal && ids.includes(modal.id)) setModal(null);

    if(status === "approved") {
      ids.forEach(id => approveWithdrawl(id));
    }
      else if(status === "rejected") {
        ids.forEach(id => rejectWithdrawl(id));
      }
  }

  const pendingSelected = paginated.filter(w => selected.has(w.id) && w.status === "pending").map(w => w.id);

  const COLS: { key: SortKey; label: string; sortable?: boolean }[] = [
    { key: "id", label: "ID", sortable: true },
    { key: "userName", label: "User", sortable: true },
    { key: "amount", label: "Amount", sortable: true },
    { key: "method", label: "Method" },
    { key: "status", label: "Status", sortable: true },
    { key: "requestedAt", label: "Requested", sortable: true },
  ];

  return (
    <div className="min-h-screen bg-[#0a0c12] text-white font-sans">
      {/* Ambient */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-violet-900/20 blur-[120px]" />
        <div className="absolute -bottom-40 -right-20 w-[500px] h-[500px] rounded-full bg-indigo-900/20 blur-[120px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-7">

        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="w-5 h-5 text-violet-400" />
              <span className="text-xs font-bold tracking-widest uppercase text-violet-400">Finance Admin</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white">Withdrawals</h1>
            <p className="text-slate-500 text-sm mt-1">Review, approve, and manage all withdrawal requests.</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="h-9 px-4 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm text-slate-400 hover:text-white hover:border-white/20 flex items-center gap-2 transition-all">
              <Calendar className="w-3.5 h-3.5" /> Today
            </button>
            <button className="h-9 px-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-sm font-semibold text-white flex items-center gap-2 transition-colors">
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Volume"    value={fmt(stats.total, "USD")}       sub="All time"                        icon={DollarSign}   trend="up"      accent="bg-violet-500/10 text-violet-400" />
          <StatCard label="Pending"         value={String(stats.pending)}          sub={`${stats.pending} awaiting action`} icon={Clock}        trend="neutral" accent="bg-amber-500/10 text-amber-400" />
          <StatCard label="Approved"        value={String(stats.approved)}         sub="Successfully processed"         icon={CheckCircle2} trend="up"      accent="bg-emerald-500/10 text-emerald-400" />
          <StatCard label="Flagged"         value={String(stats.flagged)}          sub="Needs manual review"            icon={AlertTriangle} trend="down"   accent="bg-red-500/10 text-red-400" />
        </div>

        {/* Table Card */}
        <div className="rounded-2xl border border-white/[0.06] bg-[#0f1117] overflow-hidden">
          {/* Toolbar */}
          <div className="px-5 py-4 border-b border-white/[0.06] space-y-3">
            <FiltersBar
              search={search} onSearch={v => { setSearch(v); setPage(1); }}
              statusFilter={statusFilter} onStatus={v => { setStatusFilter(v); setPage(1); }}
              methodFilter={methodFilter} onMethod={v => { setMethodFilter(v); setPage(1); }}
            />
            {selected.size > 0 && (
              <BulkBar
                count={selected.size}
                onApprove={() => updateStatus(pendingSelected, "approved")}
                onReject={() => updateStatus(pendingSelected, "rejected")}
                onClear={() => setSelected(new Set())}
              />
            )}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.04]">
                  <th className="w-12 px-5 py-3">
                    <input
                      type="checkbox"
                      checked={selected.size === paginated.length && paginated.length > 0}
                      onChange={toggleAll}
                      className="w-4 h-4 rounded border-white/20 bg-white/[0.04] accent-violet-500 cursor-pointer"
                    />
                  </th>
                  {COLS.map(col => (
                    <th key={col.key} className="px-4 py-3 text-left">
                      {col.sortable ? (
                        <button onClick={() => toggleSort(col.key)} className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 hover:text-slate-300 transition-colors">
                          {col.label} <SortIcon active={sortKey === col.key} dir={sortDir} />
                        </button>
                      ) : (
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{col.label}</span>
                      )}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-5 py-16 text-center text-slate-600 text-sm">No withdrawals match your filters.</td>
                  </tr>
                )}
                {paginated.map((w, i) => (
                  <tr
                    key={w.id}
                    className={`border-b border-white/[0.03] transition-colors ${selected.has(w.id) ? "bg-violet-600/5" : "hover:bg-white/[0.02]"}`}
                    style={{ animationDelay: `${i * 30}ms` }}
                  >
                    <td className="px-5 py-3.5">
                      <input type="checkbox" checked={selected.has(w.id)} onChange={() => toggleSelect(w.id)}
                        className="w-4 h-4 rounded border-white/20 bg-white/[0.04] accent-violet-500 cursor-pointer" />
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-slate-400 text-xs font-mono">{w.id}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar initials={w.avatar} flagged={w.flagged} />
                        <div>
                          <p className="text-white text-sm font-semibold leading-tight">{w.userName}</p>
                          <p className="text-slate-600 text-xs">{w.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-white font-bold text-sm">{fmt(w.amount, w.currency)}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-slate-400 text-xs bg-white/[0.04] px-2.5 py-1 rounded-full border border-white/[0.06]">
                        {methodLabels[w.method]}
                      </span>
                    </td>
                    <td className="px-4 py-3.5"><StatusBadge status={w.status} /></td>
                    <td className="px-4 py-3.5 text-slate-500 text-xs whitespace-nowrap">{timeAgo(w.requestedAt)}</td>
                    <td className="px-4 py-3.5 text-right">
                      <RowActions
                        w={w}
                        onView={() => setModal(w)}
                        onApprove={() => updateStatus([w.id], "approved")}
                        onReject={() => updateStatus([w.id], "rejected")}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-5 py-4 border-t border-white/[0.06]">
            <p className="text-xs text-slate-600">
              Showing <span className="text-slate-400">{(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)}</span> of <span className="text-slate-400">{filtered.length}</span>
            </p>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${p === page ? "bg-violet-600 text-white" : "text-slate-500 hover:text-white hover:bg-white/[0.06]"}`}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <DetailModal
          w={modal}
          onClose={() => setModal(null)}
          onApprove={() => updateStatus([modal.id], "approved")}
          onReject={() => updateStatus([modal.id], "rejected")}
        />
      )}
    </div>
  );
}