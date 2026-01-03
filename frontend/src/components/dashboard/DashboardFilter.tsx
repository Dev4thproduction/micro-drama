'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, ChevronDown, RefreshCcw } from 'lucide-react';
import clsx from 'clsx';

export type PeriodType = 'daily' | 'weekly' | 'monthly';

export interface FilterResult {
    period: PeriodType;
    startDate?: string;
    endDate?: string;
    label: string;
}

interface DashboardFilterProps {
    onChange: (result: FilterResult) => void;
    onRefresh: () => void;
    loading?: boolean;
}

export default function DashboardFilter({ onChange, onRefresh, loading }: DashboardFilterProps) {
    const [period, setPeriod] = useState<PeriodType>('monthly');
    const [selection, setSelection] = useState<string>('all');

    // Generate options based on period
    const getOptions = () => {
        const options = [];
        const now = new Date();

        if (period === 'monthly') {
            options.push({ value: 'all', label: 'All Time' });
            for (let i = 0; i < 12; i++) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                const label = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                options.push({ value: val, label });
            }
        } else if (period === 'weekly') {
            options.push({ value: 'this-week', label: 'Current Week' });
            // Last 8 weeks
            for (let i = 0; i < 8; i++) {
                const d = new Date();
                d.setDate(d.getDate() - (d.getDay() + (i * 7))); // Start of week i weeks ago
                const start = new Date(d);
                const end = new Date(d);
                end.setDate(end.getDate() + 6);

                const val = `${start.toISOString().split('T')[0]}_${end.toISOString().split('T')[0]}`;
                const label = `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${start.getFullYear()}`;
                options.push({ value: val, label: `Week: ${label}` });
            }
        } else if (period === 'daily') {
            options.push({ value: 'today', label: 'Today' });
            options.push({ value: 'yesterday', label: 'Yesterday' });
            for (let i = 2; i < 14; i++) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const val = d.toISOString().split('T')[0];
                const label = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
                options.push({ value: val, label });
            }
        }
        return options;
    };

    const handlePeriodChange = (p: PeriodType) => {
        setPeriod(p);
        setSelection(p === 'monthly' ? 'all' : (p === 'weekly' ? 'this-week' : 'today'));
    };

    useEffect(() => {
        const result: FilterResult = { period, label: '' };
        const now = new Date();

        if (selection === 'all') {
            result.label = 'All Time';
        } else if (period === 'monthly') {
            const [year, month] = selection.split('-').map(Number);
            const start = new Date(year, month - 1, 1);
            const end = new Date(year, month, 0, 23, 59, 59);
            result.startDate = start.toISOString();
            result.endDate = end.toISOString();
            result.label = start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        } else if (period === 'weekly') {
            if (selection === 'this-week') {
                const start = new Date();
                start.setDate(start.getDate() - start.getDay());
                start.setHours(0, 0, 0, 0);
                const end = new Date(start);
                end.setDate(end.getDate() + 6);
                end.setHours(23, 59, 59, 999);
                result.startDate = start.toISOString();
                result.endDate = end.toISOString();
                result.label = 'This Week';
            } else {
                const [s, e] = selection.split('_');
                result.startDate = new Date(s).toISOString();
                result.endDate = new Date(e).toISOString();
                result.label = 'Selected Week';
            }
        } else if (period === 'daily') {
            let d = new Date();
            if (selection === 'yesterday') d.setDate(d.getDate() - 1);
            else if (selection !== 'today') d = new Date(selection);

            const start = new Date(d.setHours(0, 0, 0, 0));
            const end = new Date(d.setHours(23, 59, 59, 999));
            result.startDate = start.toISOString();
            result.endDate = end.toISOString();
            result.label = start.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
        }

        onChange(result);
    }, [period, selection]);

    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-black/40 border border-white/5 p-1 rounded-xl shadow-inner">
                    {(['daily', 'weekly', 'monthly'] as PeriodType[]).map((p) => (
                        <button
                            key={p}
                            onClick={() => handlePeriodChange(p)}
                            className={clsx(
                                "px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all duration-200",
                                period === p
                                    ? "bg-white/10 text-white shadow-lg ring-1 ring-white/10"
                                    : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
                            )}
                        >
                            {p}
                        </button>
                    ))}
                </div>

                <div className="relative group">
                    <select
                        value={selection}
                        onChange={(e) => setSelection(e.target.value)}
                        className="appearance-none bg-black/40 border border-white/5 text-xs font-semibold text-gray-300 px-4 py-2.5 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all cursor-pointer hover:border-white/10"
                    >
                        {getOptions().map((opt) => (
                            <option key={opt.value} value={opt.value} className="bg-[#0d1117] text-gray-300">
                                {opt.label}
                            </option>
                        ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none group-hover:text-gray-300 transition-colors" />
                </div>
            </div>

            <button
                onClick={onRefresh}
                disabled={loading}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 rounded-xl text-xs font-bold uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50"
            >
                <RefreshCcw size={14} className={clsx(loading && "animate-spin")} />
                {loading ? "Refreshing..." : "Refresh"}
            </button>
        </div>
    );
}
