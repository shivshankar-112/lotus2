
import { useState, useMemo } from "react";

// ── shadcn/ui ──────────────────────────────────────────────
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
    Table, TableBody, TableCell,
    TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Tooltip, TooltipContent,
    TooltipProvider, TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    DropdownMenu, DropdownMenuContent,
    DropdownMenuItem, DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";

// ── Icons ──────────────────────────────────────────────────
import {
    LayoutDashboard, TrendingUp, TrendingDown, Users,
    Settings, Bell, Search, Filter, Download, RefreshCw,
    ChevronLeft, ChevronRight, MoreHorizontal, Eye,
    CheckCircle2, XCircle, Clock, AlertTriangle, Copy,
    DollarSign, Activity, ArrowUpRight, ArrowDownRight,
    Banknote, CreditCard, Wallet, ShieldCheck, LogOut,
    ChevronDown, PanelLeftClose, PanelLeftOpen, X,
    CalendarDays, Hash, Globe, Zap,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════
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
}

interface NavItem {
    icon: React.FC<{ className?: string }>;
    label: string;
    href: string;
    badge?: number;
    active?: boolean;
}

// ═══════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════
const MOCK_DEPOSITS: Deposit[] = [
    { id: "DEP-20501", userId: "U-1001", userName: "Ravi Mehta", email: "ravi.m@techco.in", initials: "RM", amount: 25000, currency: "USD", method: "bank_transfer", accountRef: "SBI ****3321", status: "pending", receivedAt: "2026-06-01T07:12:00Z", country: "IN", flagged: false },
    { id: "DEP-20500", userId: "U-2234", userName: "Elena Kovacs", email: "elena.k@eumail.hu", initials: "EK", amount: 8400, currency: "EUR", method: "wire", accountRef: "OTP ****5512", status: "completed", receivedAt: "2026-06-01T06:45:00Z", confirmedAt: "2026-06-01T08:00:00Z", country: "HU", flagged: false },
    { id: "DEP-20499", userId: "U-3871", userName: "James Whitfield", email: "j.whitfield@corp.us", initials: "JW", amount: 140000, currency: "USD", method: "wire", accountRef: "JPMorgan ****8801", status: "reviewing", receivedAt: "2026-05-31T22:10:00Z", country: "US", flagged: true, note: "Exceeds $100k threshold — AML check required", txHash: undefined },
    { id: "DEP-20498", userId: "U-4492", userName: "Amira Hassan", email: "amira.h@arabmail.ae", initials: "AH", amount: 5500, currency: "USD", method: "crypto", accountRef: "0xC4f...B83A", status: "completed", receivedAt: "2026-05-31T18:30:00Z", confirmedAt: "2026-05-31T19:15:00Z", country: "AE", flagged: false, txHash: "0xC4f91...B83A" },
    { id: "DEP-20497", userId: "U-5010", userName: "Seo-Yeon Park", email: "seo.park@kmail.kr", initials: "SP", amount: 3200, currency: "USD", method: "card", accountRef: "Visa ****7742", status: "failed", receivedAt: "2026-05-31T14:22:00Z", country: "KR", flagged: false, note: "Card declined — insufficient funds" },
    { id: "DEP-20496", userId: "U-6614", userName: "Diego Fuentes", email: "diego.f@latam.mx", initials: "DF", amount: 1800, currency: "USD", method: "upi", accountRef: "diego@okicici", status: "completed", receivedAt: "2026-05-31T11:05:00Z", confirmedAt: "2026-05-31T11:07:00Z", country: "MX", flagged: false },
    { id: "DEP-20495", userId: "U-7723", userName: "Fatima Al-Rashid", email: "f.alrashid@gulf.sa", initials: "FA", amount: 67000, currency: "USD", method: "bank_transfer", accountRef: "Al Rajhi ****2290", status: "reviewing", receivedAt: "2026-05-30T20:44:00Z", country: "SA", flagged: true, note: "PEP screening in progress" },
    { id: "DEP-20494", userId: "U-8830", userName: "Tobias Brandt", email: "t.brandt@germmail.de", initials: "TB", amount: 12500, currency: "EUR", method: "bank_transfer", accountRef: "Deutsche ****6634", status: "completed", receivedAt: "2026-05-30T15:30:00Z", confirmedAt: "2026-05-30T17:00:00Z", country: "DE", flagged: false },
    { id: "DEP-20493", userId: "U-9901", userName: "Priya Nair", email: "priya.n@inbox.in", initials: "PN", amount: 9900, currency: "USD", method: "upi", accountRef: "priya@ybl", status: "pending", receivedAt: "2026-05-30T10:15:00Z", country: "IN", flagged: false },
    { id: "DEP-20492", userId: "U-1122", userName: "Lucas Petit", email: "l.petit@frmail.fr", initials: "LP", amount: 4400, currency: "EUR", method: "card", accountRef: "MC ****3391", status: "failed", receivedAt: "2026-05-29T16:50:00Z", country: "FR", flagged: false, note: "3DS authentication failed" },
    { id: "DEP-20491", userId: "U-2241", userName: "Ngozi Adeyemi", email: "ngozi.a@ngmail.ng", initials: "NA", amount: 2100, currency: "USD", method: "crypto", accountRef: "0xD9e...31cF", status: "completed", receivedAt: "2026-05-29T12:00:00Z", confirmedAt: "2026-05-29T12:45:00Z", country: "NG", flagged: false, txHash: "0xD9e31...31cF" },
    { id: "DEP-20490", userId: "U-3312", userName: "Chen Wei", email: "chen.w@cnmail.cn", initials: "CW", amount: 33000, currency: "USD", method: "wire", accountRef: "ICBC ****8821", status: "reviewing", receivedAt: "2026-05-28T09:30:00Z", country: "CN", flagged: true, note: "Geo-restriction flag" },
];

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
    completed: { label: "Completed", variant: "outline", className: "border-emerald-500/40 text-emerald-400 bg-emerald-500/10", icon: CheckCircle2 },
    failed: { label: "Failed", variant: "destructive", className: "border-red-500/40 text-red-400 bg-red-500/10", icon: XCircle },
    reviewing: { label: "Reviewing", variant: "outline", className: "border-blue-500/40 text-blue-400 bg-blue-500/10", icon: ShieldCheck },
};

const METHOD_META: Record<PaymentMethod, { label: string; icon: React.FC<{ className?: string }> }> = {
    bank_transfer: { label: "Bank Transfer", icon: Banknote },
    crypto: { label: "Crypto", icon: Zap },
    card: { label: "Card", icon: CreditCard },
    upi: { label: "UPI", icon: Wallet },
    wire: { label: "Wire Transfer", icon: Globe },
};

const NAV_ITEMS: NavItem[] = [
    { icon: LayoutDashboard, label: "Overview", href: "/admin", active: false },
    { icon: TrendingUp, label: "Deposits", href: "/admin/deposits", active: true, badge: 3 },
    { icon: TrendingDown, label: "Withdrawals", href: "/admin/withdrawals", active: false, badge: 2 },
    { icon: Users, label: "Users", href: "/admin/users", active: false },
    { icon: Activity, label: "Analytics", href: "/admin/analytics", active: false },
    { icon: ShieldCheck, label: "Compliance", href: "/admin/compliance", active: false, badge: 5 },
    { icon: Settings, label: "Settings", href: "/admin/settings", active: false },
];

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
// ── COMPONENT: TopBar ──────────────────────────────────────
// ═══════════════════════════════════════════════════════════
export function TopBar({ onToggle, collapsed }: { onToggle: () => void; collapsed: boolean }) {
    return (

        <div className="flex items-center px-2 border border-white/8 bg-[#0b0d14]">

            {/* Side bar toggle button */}
            <Button
                onClick={onToggle}
                variant="ghost"
                size="icon"
                className="w-7 h-7 rounded-full text-slate-500 hover:text-white shadow-lg z-10"
            >
                {collapsed ? <PanelLeftOpen className="w-3 h-3" /> : <PanelLeftClose className="w-3 h-3" />}
            </Button>

            <header className="w-full h-16 flex items-center justify-between px-8 border-b border-white/6 bg-[#0b0d14]/80 backdrop-blur-sm shrink-0">
                <div>
                    <p className="text-[10px] font-semibold tracking-widest uppercase text-slate-600">Finance Admin / Deposits</p>
                    <h1 className="text-white font-bold text-lg tracking-tight mt-0.5">Deposit Management</h1>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="w-9 h-9 text-slate-500 hover:text-white relative">
                        <Bell className="w-4 h-4" />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400" />
                    </Button>
                    <Avatar className="w-8 h-8 cursor-pointer">
                        <AvatarFallback className="bg-linear-to-br from-emerald-600 to-teal-700 text-white text-xs font-bold">AD</AvatarFallback>
                    </Avatar>
                </div>
            </header>

        </div>
    );
}

// ═══════════════════════════════════════════════════════════
// ── COMPONENT: Sidebar ─────────────────────────────────────
// ═══════════════════════════════════════════════════════════
interface SidebarProps { collapsed: boolean; onToggle: () => void }
export function Sidebar({ collapsed, onToggle }: SidebarProps) {
    return (
        <aside
            className={`relative flex flex-col border-r border-white/6 bg-[#0b0d14] transition-all duration-300 ease-in-out shrink-0
        ${collapsed ? "w-17" : "w-60"}`}
        >
            {/* Logo */}
            <div className={`flex items-center h-16 px-4 border-b border-white/6 gap-3 overflow-hidden`}>
                <div className="w-8 h-8 rounded-lg bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0">
                    <DollarSign className="w-4 h-4 text-white" />
                </div>
                {!collapsed && (
                    <div className="overflow-hidden">
                        <p className="text-white font-bold text-sm tracking-tight whitespace-nowrap">FinanceAdmin</p>
                        <p className="text-slate-600 text-[10px] whitespace-nowrap">Management Console</p>
                    </div>
                )}
            </div>

            {/* Nav */}
            <ScrollArea className="flex-1 py-4">
                <nav className="space-y-1 px-2">
                    <TooltipProvider delayDuration={0}>
                        {NAV_ITEMS.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Tooltip key={item.label}>
                                    <TooltipTrigger asChild>
                                        <a
                                            href={item.href}
                                            className={`flex relative items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group
                        ${item.active
                                                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                                                    : "text-slate-500 hover:text-slate-200 hover:bg-white/5"
                                                } ${collapsed ? "justify-center" : ""}`}
                                        >
                                            <Icon className={`w-4 h-4 shrink-0 ${item.active ? "text-emerald-400" : "text-slate-500 group-hover:text-slate-300"}`} />
                                            {!collapsed && (
                                                <span className="flex-1 truncate">{item.label}</span>
                                            )}
                                            {!collapsed && item.badge && (
                                                <span className="ml-auto w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold flex items-center justify-center border border-emerald-500/30">
                                                    {item.badge}
                                                </span>
                                            )}
                                            {collapsed && item.badge && (
                                                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400" />
                                            )}
                                        </a>
                                    </TooltipTrigger>
                                    {collapsed && (
                                        <TooltipContent side="right" className="bg-[#1a1d27] border-white/10 text-white text-xs">
                                            {item.label}
                                        </TooltipContent>
                                    )}
                                </Tooltip>
                            );
                        })}
                    </TooltipProvider>
                </nav>
            </ScrollArea>

            <Separator className="bg-white/6" />

            {/* User */}
            <div className={`flex items-center gap-3 p-3 overflow-hidden`}>
                <Avatar className="w-8 h-8 shrink-0">
                    <AvatarFallback className="bg-linear-to-br from-emerald-600 to-teal-700 text-white text-xs font-bold">AD</AvatarFallback>
                </Avatar>
                {!collapsed && (
                    <div className="flex-1 overflow-hidden">
                        <p className="text-white text-xs font-semibold truncate">Admin User</p>
                        <p className="text-slate-600 text-[10px] truncate">admin@company.com</p>
                    </div>
                )}
                {!collapsed && (
                    <Button variant="ghost" size="icon" className="w-7 h-7 text-slate-600 hover:text-red-400 shrink-0">
                        <LogOut className="w-3.5 h-3.5" />
                    </Button>
                )}
            </div>

            {/* Collapse toggle */}
            {/* <Button
                onClick={onToggle}
                variant="ghost"
                size="icon"
                className="absolute right-4 top-18 w-7 h-7 rounded-full border border-white/8 bg-[#0b0d14] text-slate-500 hover:text-white shadow-lg z-10"
            >
                {collapsed ? <PanelLeftOpen className="w-3 h-3" /> : <PanelLeftClose className="w-3 h-3" />}
            </Button> */}
        </aside>
    );
}

