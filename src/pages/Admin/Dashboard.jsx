import React, { useState, useEffect, useRef } from "react";
import Head from 'next/head';
import { useSelector } from "react-redux";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import AdminLayouts from '../../layouts/AdminLayouts';

const DashboardAdmin = () => {
  // ambil user dari redux 
  const { user } = useSelector((state) => state.auth);

  // --- STATE DATA ---
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- STATE FILTER ---
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("Semua Aksi");
  const [selectedChart, setSelectedChart] = useState("proyek");
  const [timeFilter, setTimeFilter] = useState("Keseluruhan"); 
  
  // --- STATE DROPDOWN UI ---
  const [openActionDropdown, setOpenActionDropdown] = useState(false);
  const [openChartDropdown, setOpenChartDropdown] = useState(false);
  const [openTimeDropdown, setOpenTimeDropdown] = useState(false);

  const chartDropdownRef = useRef(null);
  const timeDropdownRef = useRef(null);
  const actionDropdownRef = useRef(null);

  // -----------------------
  // Chart configuration (pindah ke atas agar aman untuk fungsi lain)
  // -----------------------
  const chartConfig = {
    proyek: { label: "Grafik Proyek", title: "Statistik Proyek", color: "#8884d8", gradientId: "colorProyek" },
    mitra: { label: "Grafik Mitra", title: "Statistik Mitra", color: "#39B54A", gradientId: "colorMitra" },
    produk: { label: "Grafik Produk", title: "Statistik Produk", color: "#3B82F6", gradientId: "colorProduk" }
  };

  // --- 1. FETCH DATA ---
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/dashboard?filter=${encodeURIComponent(timeFilter)}`);
        const data = await res.json();
        if (res.ok) setDashboardData(data);
        else {
          // jika API mengembalikan error, set data kosong agar UI tetap stabil
          setDashboardData(null);
          console.error("Fetch dashboard failed:", data);
        }
      } catch (error) {
        console.error("Error fetch dashboard:", error);
        setDashboardData(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, [timeFilter]);

  // --- FORMATTING ---
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const d = new Date(dateString);
    if (isNaN(d)) return dateString;
    return d.toLocaleDateString('id-ID', { 
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' 
    });
  };

  // Generate Judul Dinamis (Bulan/Tahun)
  const getDynamicTitle = () => {
    const date = new Date();
    const monthName = date.toLocaleDateString('id-ID', { month: 'long' });
    const year = date.getFullYear();

    const baseTitle = chartConfig[selectedChart]?.title || "Statistik";

    if (timeFilter === 'Bulan Ini') return `${baseTitle} - ${monthName} ${year}`;
    if (timeFilter === 'Tahun Ini') return `${baseTitle} - Tahun ${year}`;
    return `${baseTitle} (Total Keseluruhan)`;
  };

  // --- DATA UNTUK RENDER ---
  const stats = [
    { value: dashboardData?.stats?.years ?? 0, label: "Tahun" },
    { value: dashboardData?.stats?.mitra ?? 0, label: "Total Mitra" },
    { value: dashboardData?.stats?.produk ?? 0, label: "Total Produk" },
    { value: dashboardData?.stats?.proyek ?? 0, label: "Total Projek" },
    { value: dashboardData?.stats?.layanan ?? 0, label: "Total Layanan" },
  ];

  // Ambil data grafik yang sesuai dari API response
  const currentData = dashboardData?.charts?.[selectedChart] || [];
  const currentConfig = chartConfig[selectedChart] || { label: "-", title: "-", color: "#888", gradientId: "g" };

  // Helper: normalisasi teks (lowercase & trim)
  const norm = (s) => (s || "").toString().toLowerCase().trim();

  // Helper: cek kecocokan aksi (mendukung kata Indonesia & beberapa sinonim EN)
  const actionMatches = (actionText, filterOption) => {
    const a = norm(actionText);
    const filter = norm(filterOption);

    if (!filter || filter === "semua aksi" || filter === "semua" || filter === "all") return true;

    // mapping kemungkinan sinonim (bisa diperluas jika API pakai bahasa EN)
    const synonyms = {
      "tambah": ["tambah", "create", "added", "created"],
      "edit": ["edit", "update", "updated", "ubah"],
      "hapus": ["hapus", "delete", "deleted", "remove", "removed"]
    };

    // coba cocokan dengan nilai filter langsung
    if (a.includes(filter)) return true;

    // cek pada synonyms
    for (const key of Object.keys(synonyms)) {
      if (filter.includes(key) || key.includes(filter)) {
        // bila filter mengacu ke key, cek apakah actionText mengandung salah satu sinonim
        if (synonyms[key].some(syn => a.includes(syn))) return true;
      }
      // jika filter itself is one of synonyms (misal "delete"), cek juga
      if (synonyms[key].some(syn => filter.includes(syn)) && synonyms[key].some(syn => a.includes(syn))) {
        return true;
      }
    }

    return false;
  };

  // Filter Log
  const filteredLogs = (dashboardData?.logs || []).filter((log) => {
    const searchLower = norm(searchQuery);
    const userName = log?.users?.username || log?.user || "Unknown";

    const detailsText = (log.details || log.detail || "").toString();
    const actionText = (log.action || log.aksi || "").toString();

    const matchesSearch = 
      norm(detailsText).includes(searchLower) ||
      norm(userName).includes(searchLower) ||
      norm(actionText).includes(searchLower) ||
      // juga perbolehkan pencarian berdasarkan tanggal string
      norm(log.tanggal || log.created_at || "").includes(searchLower);

    const matchesAction = actionMatches(actionText, actionFilter);

    return matchesSearch && matchesAction;
  });

  // Click Outside Listener (untuk menutup dropdown)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (chartDropdownRef.current && !chartDropdownRef.current.contains(event.target)) setOpenChartDropdown(false);
      if (timeDropdownRef.current && !timeDropdownRef.current.contains(event.target)) setOpenTimeDropdown(false);
      if (actionDropdownRef.current && !actionDropdownRef.current.contains(event.target)) setOpenActionDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F7FB] font-['Poppins'] pb-10">
      <Head>
        <title>Dashboard - Divus Admin</title>
      </Head>

      {/* TOP BAR */}
      <header className="bg-[#1E1E2D] px-8 py-4 flex justify-between items-center shadow-md sticky top-0 z-30">
        <div className="relative w-1/3">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input 
            type="text"
            className="block w-full pl-11 pr-4 py-2.5 rounded-full bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 sm:text-sm"
            placeholder="Search.."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden md:block">
            <p className="text-sm font-medium text-white">Hi, {user?.username || "SuperAdmin"}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-gray-500 flex items-center justify-center text-white uppercase font-bold">
            {user?.username ? user.username.charAt(0) : <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0h-3v-1a4 4 0 10-8 0v1H3z" clipRule="evenodd" /></svg>}
          </div>
        </div>
      </header>

      <div className="px-8 pt-8">
        
        {/* HEADER & FILTER WAKTU */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-black">Dashboard Overview</h1>
          <div className="relative" ref={timeDropdownRef}>
            <button 
              onClick={() => setOpenTimeDropdown(!openTimeDropdown)}
              className={`bg-white px-5 py-2.5 rounded-lg shadow-sm border flex items-center gap-3 cursor-pointer transition-all duration-200 ${openTimeDropdown ? 'border-green-500 ring-2 ring-green-500/10' : 'border-gray-200 hover:border-green-500'}`}
            >
              <span className="text-sm font-medium text-gray-600">Filter:</span>
              <span className="text-sm font-bold text-[#27D14C]">{timeFilter}</span>
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-gray-400 transition-transform ${openTimeDropdown ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {openTimeDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                {["Keseluruhan", "Tahun Ini", "Bulan Ini"].map((opt) => (
                  <button key={opt} onClick={() => { setTimeFilter(opt); setOpenTimeDropdown(false); }} className={`w-full text-left px-5 py-3 text-sm font-medium hover:bg-green-50 hover:text-[#27D14C] transition-colors ${timeFilter === opt ? 'bg-green-50 text-[#27D14C]' : 'text-gray-600'}`}>{opt}</button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-10">
          {stats.map((stat, index) => (
            <div key={index} className="rounded-2xl p-6 flex flex-col items-center justify-center text-white shadow-lg h-40 transition-transform hover:scale-105" style={{ background: "linear-gradient(180deg, #94E93F 0%, #39B54A 100%)", boxShadow: "0 4px 15px rgba(74, 222, 128, 0.3)" }}>
              <span className="text-5xl font-bold mb-2">{isLoading ? "..." : stat.value}</span>
              <span className="text-lg font-medium">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* CHART SECTION */}
        <div className="bg-white rounded-2xl p-8 shadow-sm mb-10 border border-gray-100 h-[550px] relative flex flex-col">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{getDynamicTitle()}</h2>
              <p className="text-sm text-gray-500 mt-1">
                 {timeFilter === 'Bulan Ini' ? 'Data per tanggal (Harian)' : 'Data per bulan (Bulanan)'}
              </p>
            </div>

            {/* FILTER JENIS GRAFIK */}
            <div className="relative mt-4 sm:mt-0" ref={chartDropdownRef}>
              <button 
                onClick={() => setOpenChartDropdown(!openChartDropdown)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 shadow-sm ${openChartDropdown ? 'border-[#27D14C] ring-2 ring-[#27D14C]/10 bg-white' : 'border-gray-200 bg-white hover:border-[#27D14C]'}`}
              >
                <span className="text-sm font-medium text-gray-600">Tampilkan:</span>
                <span className="text-sm font-bold text-[#27D14C]">{currentConfig.label}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-gray-400 ml-2 transition-transform ${openChartDropdown ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              {openChartDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                  {Object.keys(chartConfig).map((key) => (
                    <button key={key} onClick={() => { setSelectedChart(key); setOpenChartDropdown(false); }} className={`w-full text-left px-5 py-3 text-sm font-medium transition-colors border-b border-gray-50 last:border-0 ${selectedChart === key ? 'bg-green-50 text-[#27D14C]' : 'text-gray-600 hover:bg-gray-50 hover:text-[#27D14C]'}`}>{chartConfig[key].label}</button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex-grow w-full h-full min-h-0">
            {isLoading ? (
               <div className="w-full h-full flex items-center justify-center text-gray-400">Memuat Grafik...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={currentData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id={currentConfig.gradientId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={currentConfig.color} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={currentConfig.color} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', padding: '12px' }} cursor={{ stroke: '#E5E7EB', strokeWidth: 2 }} />
                  <Area type="monotone" dataKey="total" stroke={currentConfig.color} strokeWidth={3} fillOpacity={1} fill={`url(#${currentConfig.gradientId})`} activeDot={{ r: 6, strokeWidth: 0, fill: 'white', stroke: currentConfig.color }} animationDuration={800} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* LOG AKTIVITAS */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <h2 className="text-2xl font-bold text-gray-900">Log Aktivitas</h2>
            </div>
            <p className="text-gray-500">Aktivitas terbaru yang tercatat di sistem</p>
          </div>

          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <input type="text" placeholder="Search log aktivitas." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 text-sm" />
            </div>

            <div className="relative w-full md:w-auto" ref={actionDropdownRef}>
              <button 
                onClick={() => setOpenActionDropdown(!openActionDropdown)}
                className={`w-full md:w-48 flex items-center justify-between px-4 py-2.5 rounded-lg border transition-all duration-200 ${openActionDropdown ? 'border-[#27D14C] ring-2 ring-[#27D14C]/10 bg-white' : 'border-gray-300 bg-white hover:border-gray-400'}`}
              >
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                  <span className={`text-sm font-medium ${actionFilter !== "Semua Aksi" ? 'text-[#27D14C]' : 'text-gray-700'}`}>{actionFilter}</span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-gray-400 transition-transform ${openActionDropdown ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </button>
              {openActionDropdown && (
                <div className="absolute right-0 mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                  {["Semua Aksi", "Tambah", "Edit", "Hapus"].map((opt) => (
                    <button key={opt} onClick={() => { setActionFilter(opt); setOpenActionDropdown(false); }} className={`w-full text-left px-5 py-3 text-sm font-medium transition-colors border-b border-gray-50 last:border-0 ${actionFilter === opt ? 'bg-green-50 text-[#27D14C]' : 'text-gray-600 hover:bg-gray-50 hover:text-[#27D14C]'}`}>{opt}</button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-4 px-6 text-sm font-semibold text-gray-700 border-b border-gray-200">Tanggal</th>
                  <th className="py-4 px-6 text-sm font-semibold text-gray-700 border-b border-gray-200">User</th>
                  <th className="py-4 px-6 text-sm font-semibold text-gray-700 border-b border-gray-200">Aksi</th>
                  <th className="py-4 px-6 text-sm font-semibold text-gray-700 border-b border-gray-200">Detail</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log, index) => {
                    const actionText = (log.action || log.aksi || "").toString();
                    const actionTextLC = norm(actionText);
                    const badgeClass = actionTextLC.includes("hapus") || actionTextLC.includes("delete") ? 'bg-red-100 text-red-600'
                      : actionTextLC.includes("edit") || actionTextLC.includes("update") || actionTextLC.includes("ubah") ? 'bg-yellow-100 text-yellow-600'
                      : 'bg-green-100 text-green-600';

                    return (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-6 text-sm text-gray-600 border-b border-gray-100 whitespace-nowrap">{formatDate(log.created_at || log.tanggal)}</td>
                        <td className="py-4 px-6 text-sm text-gray-600 border-b border-gray-100">{log.users?.username || log.user || 'Unknown'}</td>
                        <td className="py-4 px-6 text-sm font-medium text-gray-800 border-b border-gray-100">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${badgeClass}`}>
                            {log.action || log.aksi || '-'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600 border-b border-gray-100 max-w-md truncate" title={log.details || log.detail}>{log.details || log.detail || '-'}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-gray-400 text-sm">Tidak ada aktivitas yang ditemukan.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardAdmin;
