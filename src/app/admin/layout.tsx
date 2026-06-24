'use client'
import { Sidebar, TopBar } from '@/components/admin/layout'
import { ScrollArea } from '@/components/ui/scroll-area';
import React, { useState } from 'react'

const Layout = ({ children }: { children: React.ReactNode }) => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    return (
        <div className="flex h-screen overflow-hidden bg-[#0a0c12] text-white">
            {/* ── Ambient glows */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
                <div className="absolute -top-32 -left-32 w-125 h-125 rounded-full bg-emerald-900/15 blur-[120px]" />
                <div className="absolute -bottom-32 -right-32 w-125 h-125 rounded-full bg-teal-900/15 blur-[120px]" />
            </div>

            {/* ── Sidebar */}
            <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((c: boolean) => !c)} />

            {/* ── Main */}
            <div className="flex flex-col flex-1 overflow-hidden relative z-10">
                <TopBar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((c: boolean) => !c)} />
                    <ScrollArea className="flex-1 h-full w-full">
                        <main className="pb-14">
                            {children}
                        </main>
                    </ScrollArea>
            </div>
        </div>

    )
}

export default Layout