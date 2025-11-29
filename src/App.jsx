import React, { useState } from "react";
import {
  Search,
  Download,
  Youtube,
  User,
  Video,
  Loader2,
  AlertCircle,
  CheckCircle,
  Settings,
  Play,
} from "lucide-react";

// --- MAIN APP COMPONENT ---
export default function App() {
  const [activeTab, setActiveTab] = useState("video"); // 'video', 'channel', 'downloader'
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [resolution, setResolution] = useState("720");

  const handleProcess = async () => {
    // 1. Validasi Input kosong
    if (!url) {
      setError("Mohon masukkan URL YouTube yang valid.");
      return;
    }

    setLoading(true);
    setError("");
    setData(null);

    try {
      // 2. REQUEST KE BACKEND (PENTING)
      // Ini akan memanggil file api/index.py yang sudah kita siapkan
      // encodeURIComponent penting agar simbol di URL YouTube tidak membuat error
      const response = await fetch(
        `/api/info?url=${encodeURIComponent(url)}&type=${activeTab}`
      );

      // 3. Ambil hasil jawaban dari Python (JSON)
      const result = await response.json();

      if (response.ok) {
        // Jika Python bilang sukses, simpan datanya
        setData(result);
      } else {
        // Jika Python bilang gagal (misal URL salah/private), tampilkan error
        setError(result.error || "Gagal mengambil data dari server.");
      }
    } catch (err) {
      // 4. Jika error koneksi (internet mati atau backend belum aktif)
      console.error("Fetch error:", err);
      setError(
        "Gagal menghubungi server backend. (Jika di local, pastikan API server jalan)"
      );
    } finally {
      // 5. Matikan animasi loading
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-red-500 selection:text-white pb-10">
      {/* HEADER */}
      <div className="bg-slate-900 border-b border-slate-800 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-red-500 font-bold text-xl">
            <Youtube className="w-8 h-8 fill-current" />
            <span className="text-white">
              YT<span className="text-red-500">Scraper</span>.io
            </span>
          </div>
          <div className="text-xs text-slate-500 font-mono hidden sm:block">
            v1.0.0 • yt-dlp powered
          </div>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 mt-8">
        {/* HERO TEXT */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            YouTube Data & Downloader
          </h1>
          <p className="text-slate-400">
            Ambil data channel, analisis video, atau download video dengan
            mudah.
          </p>
        </div>

        {/* TABS */}
        <div className="flex p-1 bg-slate-900 rounded-xl mb-6 border border-slate-800">
          <button
            onClick={() => {
              setActiveTab("video");
              setData(null);
              setError("");
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${
              activeTab === "video"
                ? "bg-slate-800 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Search className="w-4 h-4" />
            Cek Video
          </button>
          <button
            onClick={() => {
              setActiveTab("channel");
              setData(null);
              setError("");
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${
              activeTab === "channel"
                ? "bg-slate-800 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <User className="w-4 h-4" />
            Cek Channel
          </button>
          <button
            onClick={() => {
              setActiveTab("downloader");
              setData(null);
              setError("");
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${
              activeTab === "downloader"
                ? "bg-red-600/90 text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Download className="w-4 h-4" />
            Downloader
          </button>
        </div>

        {/* INPUT SECTION */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl mb-8">
          <div className="flex flex-col gap-4">
            <label className="text-sm font-medium text-slate-300 ml-1">
              {activeTab === "channel"
                ? "URL Channel YouTube"
                : "URL Video YouTube"}
            </label>

            <div className="relative">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={
                  activeTab === "channel"
                    ? "https://youtube.com/@channel..."
                    : "https://youtube.com/watch?v=..."
                }
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3.5 pl-11 text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all"
              />
              <div className="absolute left-4 top-3.5 text-slate-500">
                {activeTab === "channel" ? (
                  <User className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5" />
                )}
              </div>
            </div>

            {/* RESOLUTION SELECTOR (Only for Downloader) */}
            {activeTab === "downloader" && (
              <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex-1">
                  <label className="text-xs font-medium text-slate-400 mb-1.5 block">
                    Kualitas Target
                  </label>
                  <div className="relative">
                    <select
                      value={resolution}
                      onChange={(e) => setResolution(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 appearance-none focus:outline-none focus:ring-2 focus:ring-red-500/50"
                    >
                      <option value="2160">4K (2160p)</option>
                      <option value="1440">2K (1440p)</option>
                      <option value="1080">Full HD (1080p)</option>
                      <option value="720">HD (720p)</option>
                      <option value="480">SD (480p)</option>
                      <option value="360">Low (360p)</option>
                    </select>
                    <Settings className="absolute right-4 top-3.5 w-4 h-4 text-slate-500 pointer-events-none" />
                  </div>
                </div>
                <div className="flex-1 flex items-end">
                  <div className="text-xs text-slate-500 bg-slate-950/50 p-3 rounded-lg border border-slate-800 w-full">
                    <AlertCircle className="w-3 h-3 inline mr-1 text-yellow-500" />
                    Sistem akan mencari kualitas terbaik yang mendekati
                    pilihanmu.
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleProcess}
              disabled={loading}
              className={`mt-2 w-full py-3.5 rounded-xl font-bold text-base shadow-lg hover:shadow-red-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 ${
                loading
                  ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                  : "bg-gradient-to-r from-red-600 to-red-700 text-white hover:brightness-110"
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sedang Memproses...
                </>
              ) : (
                <>
                  {activeTab === "downloader" ? (
                    <Download className="w-5 h-5" />
                  ) : (
                    <Search className="w-5 h-5" />
                  )}
                  {activeTab === "downloader"
                    ? "Dapatkan Video"
                    : "Analisis Data"}
                </>
              )}
            </button>

            {error && (
              <div className="bg-red-950/30 border border-red-900/50 text-red-400 px-4 py-3 rounded-lg text-sm flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                {error}
              </div>
            )}
          </div>
        </div>

        {/* RESULTS SECTION */}
        {data && !loading && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* 1. CHANNEL RESULT CARD */}
            {data.type === "channel" && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div
                  className="h-32 bg-slate-800 bg-cover bg-center"
                  style={{ backgroundImage: `url(${data.banner})` }}
                ></div>
                <div className="px-6 pb-6 relative">
                  <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-10 mb-4">
                    <img
                      src={data.thumbnail}
                      alt="Profile"
                      className="w-24 h-24 rounded-full border-4 border-slate-900 shadow-lg bg-slate-800"
                    />
                    <div className="text-center sm:text-left mb-2">
                      <h2 className="text-2xl font-bold text-white">
                        {data.name}
                      </h2>
                      <p className="text-slate-400 text-sm font-mono">
                        {data.id}
                      </p>
                    </div>
                    <div className="flex-1 sm:text-right mb-3">
                      <a
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-full transition-colors"
                      >
                        <Youtube className="w-4 h-4" /> Buka di YouTube
                      </a>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
                      <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                        Subscribers
                      </div>
                      <div className="text-xl sm:text-2xl font-bold text-white">
                        {data.subscribers}
                      </div>
                    </div>
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center">
                      <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">
                        Total Video
                      </div>
                      <div className="text-xl sm:text-2xl font-bold text-white">
                        {data.video_count}
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/50">
                    <h3 className="text-sm font-medium text-slate-300 mb-2">
                      Deskripsi Channel
                    </h3>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      {data.description}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 2. VIDEO RESULT CARD (Also used for Downloader) */}
            {data.type === "video" && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col md:flex-row">
                <div className="md:w-2/5 relative group">
                  <img
                    src={data.thumbnail}
                    alt="Thumbnail"
                    className="w-full h-full object-cover min-h-[200px]"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Play className="w-12 h-12 text-white fill-current" />
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded font-medium">
                    {data.duration}
                  </div>
                </div>
                <div className="p-6 md:w-3/5 flex flex-col">
                  <div className="mb-4">
                    <h2 className="text-xl font-bold text-white leading-tight mb-2 line-clamp-2">
                      {data.title}
                    </h2>
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <User className="w-3.5 h-3.5" />
                      <span>{data.uploader}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-slate-950 px-3 py-2 rounded-lg border border-slate-800">
                      <div className="text-[10px] text-slate-500 uppercase">
                        Views
                      </div>
                      <div className="font-semibold text-sm">{data.views}</div>
                    </div>
                    <div className="bg-slate-950 px-3 py-2 rounded-lg border border-slate-800">
                      <div className="text-[10px] text-slate-500 uppercase">
                        Likes
                      </div>
                      <div className="font-semibold text-sm">{data.likes}</div>
                    </div>
                  </div>

                  {/* Download Button Action */}
                  <div className="mt-auto">
                    {activeTab === "downloader" ? (
                      <div className="space-y-3">
                        <div className="text-xs text-slate-400">
                          Link tersedia untuk resolusi:{" "}
                          <span className="text-white">
                            {data.available_formats.join(", ")}
                          </span>
                        </div>
                        <button className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold shadow-lg shadow-green-900/20 active:translate-y-0.5 transition-all flex items-center justify-center gap-2">
                          <Download className="w-5 h-5" />
                          Download {resolution}p Sekarang
                        </button>
                        <p className="text-[10px] text-center text-slate-500">
                          *Jika download tidak mulai, klik kanan tombol dan
                          pilih "Save Link As".
                        </p>
                      </div>
                    ) : (
                      <div className="bg-blue-900/20 border border-blue-900/50 p-3 rounded-lg flex items-center gap-2 text-blue-400 text-sm">
                        <CheckCircle className="w-4 h-4 shrink-0" />
                        Data video berhasil diambil.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
