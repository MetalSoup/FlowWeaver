import { Head } from '@inertiajs/react';
import { PageProps } from '@/types';
import DashboardLayout from "@/Layouts/DashboardLayout";
import { useEffect, useRef, useState } from 'react';

// Chart.js imports
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function Dashboard({ auth, submissionStats: initialStats }: PageProps<{ submissionStats?: Record<string, number> }>) {
    const [stats, setStats] = useState<Record<string, number>>(initialStats ?? {});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const intervalRef = useRef<number | null>(null);

    const fetchStats = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/dashboard/stats', { credentials: 'same-origin' });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = await res.json();
            if (json && json.submissionStats) {
                setStats(json.submissionStats);
            } else {
                setError('Invalid response');
            }
        } catch (e: any) {
            setError(e?.message || String(e));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // fetch immediately on mount to ensure we have the latest data
        fetchStats();
        // poll every 15 seconds
        intervalRef.current = window.setInterval(fetchStats, 15000);
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, []);

    const labels = Object.keys(stats);
    const values = Object.values(stats);
    const total = values.reduce((s, v) => s + v, 0);

    // prepare chart data
    const chartData = {
        labels,
        datasets: [
            {
                label: 'Submissions',
                data: values,
                fill: true,
                backgroundColor: function (context: any) {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 200);
                    gradient.addColorStop(0, 'rgba(59,130,246,0.4)');
                    gradient.addColorStop(1, 'rgba(59,130,246,0.05)');
                    return gradient;
                },
                borderColor: 'rgba(59,130,246,1)',
                tension: 0.3,
                pointRadius: 3,
                pointBackgroundColor: 'rgba(59,130,246,1)',
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: { mode: 'index', intersect: false },
        },
        scales: {
            x: { grid: { display: false } },
            y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } },
        },
    };

    return (
        <DashboardLayout user={auth.user} header={<h1>Dashboard</h1>}>
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-medium">Submissions (last 30 days)</h2>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Total: <span className="font-semibold">{total}</span></p>
                            </div>

                            <div className="flex items-center space-x-2">
                                <button onClick={fetchStats} disabled={loading} className="px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-50">Refresh</button>
                                {loading && <div className="text-sm text-gray-500">Loading...</div>}
                            </div>
                        </div>

                        <div className="w-full h-80 mt-6">
                            <Line data={chartData} options={chartOptions as any} />
                        </div>

                        {error && <p className="text-red-500 mt-2">{error}</p>}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
