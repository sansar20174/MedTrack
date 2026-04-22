import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { takeMedicine, untakeMedicine } from "../redux/medicineSlice";
import { CheckCircle2, Circle, Bell, AlertTriangle, ArrowRight, Calendar, Droplet, BarChart3 } from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

function Dashboard() {
  const medicines = useSelector((state) => state.medicines.medicines);
  const dispatch = useDispatch();

  // Get current date in YYYY-MM-DD
  const today = new Date().toISOString().split("T")[0];
  const dateDisplay = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  // Compute what needs to be taken today
  const todaysSchedule = [];

  medicines.forEach((med) => {
    if (med.frequency === "Daily" || med.frequency === "Weekly") {
      med.times.forEach((time) => {
        todaysSchedule.push({
          med,
          time,
          isTaken: med.history && med.history[today] && med.history[today].includes(time),
        });
      });
    }
  });

  // Sort schedule by time
  todaysSchedule.sort((a, b) => a.time.localeCompare(b.time));

  const lowStockMeds = medicines.filter(med => med.stock <= med.refillThreshold);

  const handleToggleTake = (medId, time, isTaken) => {
    if (isTaken) {
      dispatch(untakeMedicine({ id: medId, date: today, time }));
    } else {
      dispatch(takeMedicine({ id: medId, date: today, time }));
    }
  };

  const completedCount = todaysSchedule.filter(s => s.isTaken).length;
  const totalCount = todaysSchedule.length;
  const progressPercent = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

  // Circumference calculation for progress circle
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  // --- Chart Data Preparation ---

  // 1. Doughnut Chart: Taken vs Missed
  const doughnutData = {
    labels: ['Taken', 'Pending/Missed'],
    datasets: [
      {
        data: totalCount === 0 ? [0, 1] : [completedCount, totalCount - completedCount],
        backgroundColor: totalCount === 0 ? ['#cbd5e1', '#cbd5e1'] : ['#10b981', '#e2e8f0'],
        borderWidth: 0,
        cutout: '75%',
      },
    ],
  };

  // 2. Bar Chart: Stock Levels
  const stockData = {
    labels: medicines.length > 0 ? medicines.map(m => m.name.substring(0, 10)) : ['No Data'],
    datasets: [
      {
        label: 'Stock Remaining',
        data: medicines.length > 0 ? medicines.map(m => m.stock) : [0],
        backgroundColor: medicines.length > 0
          ? medicines.map(m => m.stock <= m.refillThreshold ? '#f59e0b' : '#3b82f6')
          : ['#e2e8f0'],
        borderRadius: 6,
      }
    ]
  };

  // 3. Line Chart: Weekly Usage
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 6 + i);
    return d.toISOString().split('T')[0];
  });

  const weeklyUsageData = last7Days.map(date => {
    let count = 0;
    medicines.forEach(med => {
      if (med.history && med.history[date]) {
        count += med.history[date].length;
      }
    });
    return count;
  });

  const lineData = {
    labels: last7Days.map(date => {
      const d = new Date(date);
      return d.toLocaleDateString('en-US', { weekday: 'short' });
    }),
    datasets: [
      {
        label: 'Medicines Taken',
        data: weeklyUsageData,
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#8b5cf6',
      }
    ]
  };

  const chartOptions = {
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, grid: { display: true, color: '#f1f5f9' }, border: { display: false } },
      x: { grid: { display: false }, border: { display: false } }
    }
  };

  return (
    <div className="animate-fade-in max-w-5xl mx-auto mt-6 space-y-10 pb-12">
      {/* Header Section */}
      <div>
        <h1 className="text-[2.5rem] font-extrabold text-[#1a202c] tracking-tight">Good morning!</h1>
        <p className="text-[#64748b] mt-3 flex items-center gap-2 font-medium">
          <Calendar className="w-5 h-5 text-[#64748b]" />
          {dateDisplay}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Schedule */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-[22px] font-extrabold text-[#1a202c] flex items-center gap-3">
                  <Bell className="w-6 h-6 text-blue-500" strokeWidth={2.5} />
                  Today's Schedule
                </h2>
                <p className="text-[15px] font-medium text-[#64748b] mt-2">
                  You have taken {completedCount} out of {totalCount} medications today.
                </p>
              </div>

              <div className="relative flex items-center justify-center">
                <svg width="72" height="72" className="transform -rotate-90">
                  <circle cx="36" cy="36" r={radius} stroke="#e2e8f0" strokeWidth="6" fill="none" />
                  <circle
                    cx="36" cy="36" r={radius} stroke="#0052ff" strokeWidth="6" fill="none"
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-in-out"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                  />
                </svg>
                <span className="absolute text-[13px] font-extrabold text-[#0052ff]">{progressPercent}%</span>
              </div>
            </div>

            {todaysSchedule.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Droplet className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">No medications scheduled for today.</p>
                <Link to="/add-medicine" className="text-blue-600 hover:underline text-sm mt-2 inline-block font-medium">
                  Add a medication
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {todaysSchedule.map((item, idx) => {
                  return (
                    <div
                      key={`${item.med.id}-${item.time}-${idx}`}
                      className={`flex items-center justify-between p-5 rounded-2xl transition-all border ${item.isTaken
                          ? 'bg-[#ecfdf5] border-[#d1fae5]'
                          : 'bg-white border-[#e2e8f0] shadow-sm'
                        }`}
                    >
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handleToggleTake(item.med.id, item.time, item.isTaken)}
                          className={`transition-colors ${item.isTaken ? 'text-[#10b981]' : 'text-slate-300 hover:text-blue-500'}`}
                        >
                          {item.isTaken ? <CheckCircle2 className="w-8 h-8" strokeWidth={2.5} /> : <Circle className="w-8 h-8" strokeWidth={2.5} />}
                        </button>

                        <div>
                          <h3 className={`font-extrabold text-lg ${item.isTaken ? 'text-[#065f46]' : 'text-[#1a202c]'}`}>
                            {item.med.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm font-medium text-[#64748b]">{item.med.dosage}</span>
                            <span className="w-1 h-1 bg-[#cbd5e1] rounded-full"></span>
                            <span className="text-sm font-bold text-[#64748b]">
                              {item.time}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Alerts & Actions */}
        <div className="space-y-12">
          {/* Refill Alerts */}
          <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <h2 className="text-[20px] font-extrabold text-[#1a202c] flex items-center gap-3 mb-6">
              <AlertTriangle className="w-6 h-6 text-[#f59e0b]" strokeWidth={2.5} />
              Refill Alerts
            </h2>

            {lowStockMeds.length === 0 ? (
              <div className="bg-[#f8fafc] rounded-2xl p-6">
                <p className="text-[15px] text-[#64748b] font-medium leading-relaxed">
                  All your medications are well stocked.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {lowStockMeds.map(med => (
                  <div key={med.id} className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                    <h3 className="font-bold text-amber-900">{med.name}</h3>
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-sm text-amber-700 font-medium">Only {med.stock} left</p>
                      <button className="text-xs bg-amber-200 hover:bg-amber-300 text-amber-800 px-3 py-1.5 rounded-lg transition-colors font-bold">
                        Refill
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="pt-2 pl-2">
            <h2 className="text-xl font-bold text-[#cbd5e1] mb-2">Need to add more?</h2>
            <p className="text-[#94a3b8] text-[15px] font-medium mb-8 leading-relaxed max-w-[260px]">
              Keep your medication list up to date to ensure you never miss a dose.
            </p>
            <Link
              to="/add-medicine"
              className="inline-flex items-center justify-between bg-[#3b5998] hover:bg-[#2d4373] text-white px-6 py-4 rounded-xl font-semibold w-full transition-colors shadow-lg shadow-blue-900/10"
            >
              Add New Medicine
              <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
            </Link>
          </div>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="pt-6">
        <h2 className="text-[22px] font-extrabold text-[#1a202c] flex items-center gap-3 mb-8">
          <BarChart3 className="w-6 h-6 text-indigo-500" strokeWidth={2.5} />
          Analytics Overview
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Taken vs Missed Doughnut */}
          <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <h3 className="text-[17px] font-bold text-[#1a202c] mb-6 text-center">Today's Status</h3>
            <div className="h-48 relative">
              <Doughnut
                data={doughnutData}
                options={{
                  maintainAspectRatio: false,
                  plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8, font: { family: 'Outfit', weight: '500' } } } },
                  cutout: '75%'
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center -mt-6">
                <span className="text-2xl font-extrabold text-[#1a202c]">{progressPercent}%</span>
              </div>
            </div>
          </div>

          {/* Stock Levels Bar */}
          <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <h3 className="text-[17px] font-bold text-[#1a202c] mb-6">Current Stock Levels</h3>
            <div className="h-48 relative">
              <Bar data={stockData} options={chartOptions} />
            </div>
          </div>

          {/* Weekly Usage Line */}
          <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <h3 className="text-[17px] font-bold text-[#1a202c] mb-6">7-Day Usage Trend</h3>
            <div className="h-48 relative">
              <Line data={lineData} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

export default Dashboard;