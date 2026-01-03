'use client';

import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';

interface GenreChartProps {
    data: { _id: string; count: number }[];
    loading?: boolean;
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1'];

export default function GenreChart({ data, loading }: GenreChartProps) {
    if (loading) {
        return (
            <div className="flex h-[300px] w-full items-center justify-center rounded-xl bg-white/5 animate-pulse">
                <div className="h-32 w-32 rounded-full border-8 border-white/10" />
            </div>
        );
    }

    const formattedData = data.map(item => ({
        name: item._id,
        value: item.count
    }));

    if (formattedData.length === 0) {
        return (
            <div className="flex h-[300px] w-full items-center justify-center rounded-xl bg-white/5 text-gray-500 italic text-sm">
                No genre data available
            </div>
        );
    }

    return (
        <div className="h-[300px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={formattedData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {formattedData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip
                        contentStyle={{ backgroundColor: '#0d1117', border: '1px solid #ffffff10', borderRadius: '8px' }}
                        itemStyle={{ color: '#fff' }}
                    />
                    <Legend
                        verticalAlign="bottom"
                        height={36}
                        formatter={(value) => <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{value}</span>}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
