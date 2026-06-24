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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

// ═══════════════════════════════════════════════════════════
// ── COMPONENT: StatCard ────────────────────────────────────
// ═══════════════════════════════════════════════════════════
interface StatCardProps {
    title: string; value: string; sub: string;
    icon: React.FC<{ className?: string }>;
    trend?: "up" | "down"; trendValue?: string;
    progress?: number; accentClass: string;
}
export function StatCard({ title, value, sub, icon: Icon, trend, trendValue, progress, accentClass }: StatCardProps) {
    return (
        <Card className="bg-[#0f1117] border-white/6 rounded-2xl overflow-hidden">
            <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">{title}</p>
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${accentClass}`}>
                        <Icon className="w-4 h-4" />
                    </div>
                </div>
                <p className="text-2xl font-black tracking-tight text-white">{value}</p>
                <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-slate-600">{sub}</p>
                    {trend && trendValue && (
                        <span className={`flex items-center gap-1 text-xs font-semibold ${trend === "up" ? "text-emerald-400" : "text-red-400"}`}>
                            {trend === "up" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            {trendValue}
                        </span>
                    )}
                </div>
                {progress !== undefined && (
                    <Progress value={progress} className="mt-3 h-1 bg-white/[0.05]" />
                )}
            </CardContent>
        </Card>
    );
}
