import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import { useSelector } from "react-redux";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
// import AdminLayouts from '../../layouts/AdminLayouts'; // Uncomment jika perlu

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

  // --- STATE PAGINATION (BARU) ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Batas maksimal 10 baris

  // --- STATE DROPDOWN UI ---
  const [openActionDropdown, setOpenActionDropdown] = useState(false);
  const [openChartDropdown, setOpenChartDropdown] = useState(false);
  const [openTimeDropdown, setOpenTimeDropdown] = useState(false);

  const chartDropdownRef = useRef(null);
  const timeDropdownRef = useRef(null);
  const actionDropdownRef = useRef(null);

  // -----------------------
  // Chart configuration
  // -----------------------
  const chartConfig = {
    proyek: {
      label: "Grafik Proyek",
      title: "Statistik Proyek",
      color: "#8884d8",
      gradientId: "colorProyek",
    },
    mitra: {
      label: "Grafik Mitra",
      title: "Statistik Mitra",
      color: "#39B54A",
      gradientId: "colorMitra",
    },
    produk: {
      label: "Grafik Produk",
      title: "Statistik Produk",
      color: "#3B82F6",
      gradientId: "colorProduk",
    },
  };

  // --- 1. FETCH DATA ---
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `/api/dashboard?filter=${encodeURIComponent(timeFilter)}`
        );
        const data = await res.json();
        if (res.ok) setDashboardData(data);
        else {
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

  // --- 2. LOGIC RESET PAGINATION ---
  // Jika user mencari atau ganti filter aksi, kembali ke halaman 1
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, actionFilter]);

  // --- FORMATTING ---
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const d = new Date(dateString);
    if (isNaN(d)) return dateString;
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Generate Judul Dinamis
  const getDynamicTitle = () => {
    const date = new Date();
    const monthName = date.toLocaleDateString("id-ID", { month: "long" });
    const year = date.getFullYear();

    const baseTitle = chartConfig[selectedChart]?.title || "Statistik";

    if (timeFilter === "Bulan Ini")
      return `${baseTitle} - ${monthName} ${year}`;
    if (timeFilter === "Tahun Ini") return `${baseTitle} - Tahun ${year}`;
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

  const currentData = dashboardData?.charts?.[selectedChart] || [];
  const currentConfig = chartConfig[selectedChart] || {
    label: "-",
    title: "-",
    color: "#888",
    gradientId: "g",
  };

  const norm = (s) => (s || "").toString().toLowerCase().trim();

  const actionMatches = (actionText, filterOption) => {
    const a = norm(actionText);
    const filter = norm(filterOption);

    if (
      !filter ||
      filter === "semua aksi" ||
      filter === "semua" ||
      filter === "all"
    )
      return true;

    const synonyms = {
      tambah: ["tambah", "create", "added", "created"],
      edit: ["edit", "update", "updated", "ubah"],
      hapus: ["hapus", "delete", "deleted", "remove", "removed"],
    };

    if (a.includes(filter)) return true;

    for (const key of Object.keys(synonyms)) {
      if (filter.includes(key) || key.includes(filter)) {
        if (synonyms[key].some((syn) => a.includes(syn))) return true;
      }
      if (
        synonyms[key].some((syn) => filter.includes(syn)) &&
        synonyms[key].some((syn) => a.includes(syn))
      ) {
        return true;
      }
    }
    return false;
  };

  // --- FILTER LOGIC ---
  const filteredLogs = (dashboardData?.logs || []).filter((log) => {
    const searchLower = norm(searchQuery);
    const userName = log?.users?.username || log?.user || "Unknown";

    const detailsText = (log.details || log.detail || "").toString();
    const actionText = (log.action || log.aksi || "").toString();

    const matchesSearch =
      norm(detailsText).includes(searchLower) ||
      norm(userName).includes(searchLower) ||
      norm(actionText).includes(searchLower) ||
      norm(log.tanggal || log.created_at || "").includes(searchLower);

    const matchesAction = actionMatches(actionText, actionFilter);

    return matchesSearch && matchesAction;
  });

  // --- PAGINATION CALCULATION (BARU) ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Click Outside Listener
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        chartDropdownRef.current &&
        !chartDropdownRef.current.contains(event.target)
      )
        setOpenChartDropdown(false);
      if (
        timeDropdownRef.current &&
        !timeDropdownRef.current.contains(event.target)
      )
        setOpenTimeDropdown(false);
      if (
        actionDropdownRef.current &&
        !actionDropdownRef.current.contains(event.target)
      )
        setOpenActionDropdown(false);
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
        <div className="relative w-1/3 mx-auto md:mx-0">
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden md:block">
            <p className="text-sm font-medium text-white">
              Hi, {user?.username || "SuperAdmin"}
            </p>
          </div>
          <div className="h-10 w-10 rounded-full bg-gray-500 flex items-center justify-center text-white uppercase font-bold border-2 border-gray-400">
            {user?.username ? user.username.charAt(0) : "A"}
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
              className={`bg-white px-5 py-2.5 rounded-lg shadow-sm border flex items-center gap-3 cursor-pointer transition-all duration-200 ${
                openTimeDropdown
                  ? "border-green-500 ring-2 ring-green-500/10"
                  : "border-gray-200 hover:border-green-500"
              }`}
            >
              <span className="text-sm font-medium text-gray-600">Filter:</span>
              <span className="text-sm font-bold text-[#27D14C]">
                {timeFilter}
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-4 w-4 text-gray-400 transition-transform ${
                  openTimeDropdown ? "rotate-180" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {openTimeDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                {["Keseluruhan", "Tahun Ini", "Bulan Ini"].map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setTimeFilter(opt);
                      setOpenTimeDropdown(false);
                    }}
                    className={`w-full text-left px-5 py-3 text-sm font-medium hover:bg-green-50 hover:text-[#27D14C] transition-colors ${
                      timeFilter === opt
                        ? "bg-green-50 text-[#27D14C]"
                        : "text-gray-600"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-10">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="rounded-2xl p-6 flex flex-col items-center justify-center text-white shadow-lg h-40 transition-transform hover:scale-105"
              style={{
                background: "linear-gradient(180deg, #94E93F 0%, #39B54A 100%)",
                boxShadow: "0 4px 15px rgba(74, 222, 128, 0.3)",
              }}
            >
              <span className="text-5xl font-bold mb-2">
                {isLoading ? "..." : stat.value}
              </span>
              <span className="text-lg font-medium">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* CHART SECTION */}
        <div className="bg-white rounded-2xl p-8 shadow-sm mb-10 border border-gray-100 h-[550px] relative flex flex-col">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {getDynamicTitle()}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {timeFilter === "Bulan Ini"
                  ? "Data per tanggal (Harian)"
                  : "Data per bulan (Bulanan)"}
              </p>
            </div>

            <div className="relative mt-4 sm:mt-0" ref={chartDropdownRef}>
              <button
                onClick={() => setOpenChartDropdown(!openChartDropdown)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all duration-200 shadow-sm ${
                  openChartDropdown
                    ? "border-[#27D14C] ring-2 ring-[#27D14C]/10 bg-white"
                    : "border-gray-200 bg-white hover:border-[#27D14C]"
                }`}
              >
                <span className="text-sm font-medium text-gray-600">
                  Tampilkan:
                </span>
                <span className="text-sm font-bold text-[#27D14C]">
                  {currentConfig.label}
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-4 w-4 text-gray-400 ml-2 transition-transform ${
                    openChartDropdown ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {openChartDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                  {Object.keys(chartConfig).map((key) => (
                    <button
                      key={key}
                      onClick={() => {
                        setSelectedChart(key);
                        setOpenChartDropdown(false);
                      }}
                      className={`w-full text-left px-5 py-3 text-sm font-medium transition-colors border-b border-gray-50 last:border-0 ${
                        selectedChart === key
                          ? "bg-green-50 text-[#27D14C]"
                          : "text-gray-600 hover:bg-gray-50 hover:text-[#27D14C]"
                      }`}
                    >
                      {chartConfig[key].label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex-grow w-full h-full min-h-0">
            {isLoading ? (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                Memuat Grafik...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={currentData}
                  // UPDATE: Tambah margin bottom/left agar label axis tidak terpotong
                  margin={{ top: 10, right: 10, left: 15, bottom: 25 }}
                >
                  <defs>
                    <linearGradient
                      id={currentConfig.gradientId}
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor={currentConfig.color}
                        stopOpacity={0.3}
                      />
                      <stop
                        offset="95%"
                        stopColor={currentConfig.color}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#F3F4F6"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#9CA3AF", fontSize: 12 }}
                    dy={10}
                    // UPDATE: Label Sumbu X
                    label={{
                      value: timeFilter === "Bulan Ini" ? "Tanggal" : "Bulan",
                      position: "insideBottom",
                      offset: -20,
                      fill: "#6B7280",
                      fontSize: 12,
                      fontWeight: "bold",
                    }}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#9CA3AF", fontSize: 12 }}
                    // UPDATE: Label Sumbu Y Dinamis
                    label={{
                      value:
                        selectedChart === "mitra"
                          ? "Total Mitra"
                          : selectedChart === "produk"
                          ? "Total Produk"
                          : "Total Proyek",
                      angle: -90,
                      position: "insideLeft",
                      fill: "#6B7280",
                      fontSize: 12,
                      fontWeight: "bold",
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                      padding: "12px",
                    }}
                    cursor={{ stroke: "#E5E7EB", strokeWidth: 2 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke={currentConfig.color}
                    strokeWidth={3}
                    fillOpacity={1}
                    fill={`url(#${currentConfig.gradientId})`}
                    activeDot={{
                      r: 6,
                      strokeWidth: 0,
                      fill: "white",
                      stroke: currentConfig.color,
                    }}
                    animationDuration={800}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* LOG AKTIVITAS */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-gray-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h2 className="text-2xl font-bold text-gray-900">
                Log Aktivitas
              </h2>
            </div>
            <p className="text-gray-500">
              Aktivitas terbaru yang tercatat di sistem
            </p>
          </div>

          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search log aktivitas."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-green-500 text-sm"
              />
            </div>

            <div className="relative w-full md:w-auto" ref={actionDropdownRef}>
              <button
                onClick={() => setOpenActionDropdown(!openActionDropdown)}
                className={`w-full md:w-48 flex items-center justify-between px-4 py-2.5 rounded-lg border transition-all duration-200 ${
                  openActionDropdown
                    ? "border-[#27D14C] ring-2 ring-[#27D14C]/10 bg-white"
                    : "border-gray-300 bg-white hover:border-gray-400"
                }`}
              >
                <div className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                    />
                  </svg>
                  <span
                    className={`text-sm font-medium ${
                      actionFilter !== "Semua Aksi"
                        ? "text-[#27D14C]"
                        : "text-gray-700"
                    }`}
                  >
                    {actionFilter}
                  </span>
                </div>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-4 w-4 text-gray-400 transition-transform ${
                    openActionDropdown ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {openActionDropdown && (
                <div className="absolute right-0 mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                  {["Semua Aksi", "Tambah", "Edit", "Hapus"].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        setActionFilter(opt);
                        setOpenActionDropdown(false);
                      }}
                      className={`w-full text-left px-5 py-3 text-sm font-medium transition-colors border-b border-gray-50 last:border-0 ${
                        actionFilter === opt
                          ? "bg-green-50 text-[#27D14C]"
                          : "text-gray-600 hover:bg-gray-50 hover:text-[#27D14C]"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-gray-200">
            {/* ===== TABLE (SCROLL DI MOBILE) ===== */}
            <div className="overflow-x-auto touch-pan-x">
              <table className="w-full min-w-[900px] text-left border-collapse table-fixed">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="py-5 px-8 text-sm font-semibold text-gray-700 border-b border-gray-200">
                      Tanggal
                    </th>
                    <th className="py-5 px-8 text-sm font-semibold text-gray-700 border-b border-gray-200">
                      User
                    </th>
                    <th className="py-5 px-8 text-sm font-semibold text-gray-700 border-b border-gray-200">
                      Aksi
                    </th>
                    <th className="py-5 px-8 text-sm font-semibold text-gray-700 border-b border-gray-200">
                      Detail
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {currentLogs.length > 0 ? (
                    currentLogs.map((log, index) => {
                      const actionText = (
                        log.action ||
                        log.aksi ||
                        ""
                      ).toString();
                      const actionTextLC = norm(actionText);

                      const badgeClass =
                        actionTextLC.includes("hapus") ||
                        actionTextLC.includes("delete")
                          ? "bg-red-100 text-red-600"
                          : actionTextLC.includes("edit") ||
                            actionTextLC.includes("update") ||
                            actionTextLC.includes("ubah")
                          ? "bg-yellow-100 text-yellow-600"
                          : "bg-green-100 text-green-600";

                      return (
                        <tr
                          key={index}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="w-1/4 py-3 px-8 text-sm text-gray-600 border-b border-gray-100 whitespace-nowrap">
                            {formatDate(log.created_at || log.tanggal)}
                          </td>

                          <td className="w-1/4 py-3 px-8 text-sm text-gray-600 border-b border-gray-100 truncate">
                            {log.users?.username || log.user || "Unknown"}
                          </td>

                          <td className="w-1/4 py-3 px-8 text-sm font-medium text-gray-800 border-b border-gray-100 whitespace-nowrap">
                            <span
                              className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold ${badgeClass}`}
                            >
                              {log.action || log.aksi || "-"}
                            </span>
                          </td>

                          <td
                            className="w-1/4 py-5 px-8 text-sm text-gray-600 border-b border-gray-100 
                  max-w-[250px] overflow-hidden text-ellipsis whitespace-nowrap"
                            title={log.details || log.detail}
                          >
                            {log.details || log.detail || "-"}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="py-10 text-center text-gray-400 text-sm"
                      >
                        Tidak ada aktivitas yang ditemukan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* ===== PAGINATION (DI BAWAH TABEL, TIDAK SCROLL) ===== */}
            {filteredLogs.length > 0 && (
              <div className="flex flex-col md:flex-row justify-between items-center pt-8 mt-6 border-t border-gray-100 px-4 md:px-8">
                <span className="text-sm text-gray-500 mb-5 md:mb-0">
                  Menampilkan{" "}
                  <span className="font-bold text-gray-900">
                    {indexOfFirstItem + 1}
                  </span>{" "}
                  -{" "}
                  <span className="font-bold text-gray-900">
                    {Math.min(indexOfLastItem, filteredLogs.length)}
                  </span>{" "}
                  dari{" "}
                  <span className="font-bold text-gray-900">
                    {filteredLogs.length}
                  </span>{" "}
                  data
                </span>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`p-2
            ${
              currentPage === 1
                ? "border-gray-100 text-gray-300 bg-gray-50"
                : "border-gray-200 text-gray-600 hover:border-[#27D14C] hover:text-[#27D14C] hover:bg-green-50"
            }`}
                  >
                    ‹
                  </button>

                  <div className="flex gap-2">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pNum = i + 1;
                      if (totalPages > 5 && currentPage > 3)
                        pNum = currentPage - 2 + i;
                      if (pNum > totalPages) pNum = totalPages - 4 + i;

                      return (
                        <button
                          key={pNum}
                          onClick={() => paginate(pNum)}
                          className={`w-11 h-11 rounded-xl text-sm font-bold
                  ${
                    currentPage === pNum
                      ? "bg-[#27D14C] text-white shadow-lg"
                      : "text-gray-500 hover:bg-gray-50 hover:text-[#27D14C]"
                  }`}
                        >
                          {pNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`p-2
            ${
              currentPage === totalPages
                ? "border-gray-100 text-gray-300 bg-gray-50"
                : "border-gray-200 text-gray-600 hover:border-[#27D14C] hover:text-[#27D14C] hover:bg-green-50"
            }`}
                  >
                    ›
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardAdmin;