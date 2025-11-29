import React, { useState } from 'react';
import { Search, Download, Youtube, User, Video, Loader2, AlertCircle, CheckCircle, Settings, Play } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('video'); 
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [resolution, setResolution] = useState('720');

  const handleProcess = async () => {
    if (!url) {
      setError('Mohon masukkan URL YouTube yang valid.');
      return;
    }
    
    setLoading(true);
    setError('');
    setData(null);

    try {
      const response = await fetch(`/api/info?url=${encodeURIComponent(url)}&type=${activeTab}`);
      const result = await response.json();
      
      if (response.ok) {
        setData(result);
      } else {
        setError(result.error || 'Terjadi kesalahan saat mengambil data.');
      }
    } catch (err) {
      setError('Gagal menghubungi server. Pastikan API berjalan.');
    } finally {
      setLoading(false);
    }
  };

  // Helper untuk menampilkan format resolusi dengan aman
  const getFormatsString = () => {
    if (data?.formats && Array.isArray(data.formats)) {
      // Ambil unik resolusi saja
      const uniqueRes = [...new Set(data.formats.map(f => f.res ? `${f.res}p` : 'HD'))];
      return uniqueRes.join(', ');
    }
    return 'Auto / HD';
  };

  return (
    <div className="min-h-screen pb-10">
      {/* HEADER */}
      <div className="bg-slate-900 border-b border-slate-800 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-red-500 font-bold text-xl">
            <Youtube className="w-8 h-8 fill-current" />
            <span className="text-white">YT<span className="text-red-500">Scraper</span>.io</span>
          </div>
          <div className="text-xs text-slate-500 font-mono hidden sm:block">
            v1.1 Fix • yt-dlp
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
            Ambil data channel, analisis video, atau download video dengan mudah.
          </p>
        </div>

        {/* TABS */}
        <div className="flex p-1 bg-slate-900 rounded-xl mb-6 border border-slate-800">
          <button onClick={() => { setActiveTab('video'); setData(null); setError(''); }} className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'video' ? 'bg-slate-800 text-white' : 'text-slate-400'}`}>
            <Search className="w-4 h-4" /> Cek Video
          </button>
          <button onClick={() => { setActiveTab('channel'); setData(null); setError(''); }} className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'channel' ? 'bg-slate-800 text-white' : 'text-slate-400'}`}>
            <User className="w-4 h-4" /> Cek Channel
          </button>
          <button onClick={() => { setActiveTab('downloader'); setData(null); setError(''); }} className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'downloader' ? 'bg-red-600/90 text-white' : 'text-slate-400'}`}>
            <Download className="w-4 h-4" /> Downloader
          </button>
        </div>

        {/* INPUT SECTION */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl mb-8">
          <div className="flex flex-col gap-4">
            <div className="relative">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={activeTab === 'channel' ? "https://youtube.com/@channel..." : "https://youtube.com/watch?v=..."}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3.5 pl-11 text-slate-100 focus:ring-2 focus:ring-red-500/50 outline-none"
              />
              <div className="absolute left-4 top-3.5 text-slate-500">
                {activeTab === 'channel' ? <User className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </div>
            </div>

            {/* RESOLUTION SELECTOR */}
            {activeTab === 'downloader' && (
              <div className="flex items-center gap-4">
                 <div className="relative w-full">
                    <select value={resolution} onChange={(e) => setResolution(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 appearance-none">
                      <option value="1080">Full HD (1080p)</option>
                      <option value="720">HD (720p)</option>
                      <option value="480">SD (480p)</option>
                      <option value="360">Low (360p)</option>
                    </select>
                    <Settings className="absolute right-4 top-3.5 w-4 h-4 text-slate-500 pointer-events-none" />
                 </div>
              </div>
            )}

            <button
              onClick={handleProcess}
              disabled={loading}
              className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${loading ? 'bg-slate-800 text-slate-500' : 'bg-red-600 hover:bg-red-700 text-white'}`}
            >
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Proses...</> : <>{activeTab === 'downloader' ? <Download className="w-5 h-5" /> : <Search className="w-5 h-5" />} {activeTab === 'downloader' ? 'Dapatkan Link' : 'Analisis'}</>}
            </button>
            
            {error && (
              <div className="bg-red-950/30 border border-red-900/50 text-red-400 px-4 py-3 rounded-lg text-sm flex gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /> {error}
              </div>
            )}
          </div>
        </div>

        {/* RESULTS SECTION */}
        {data && !loading && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* CHANNEL CARD */}
            {data.type === 'channel' && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                {data.banner && <div className="h-32 bg-slate-800 bg-cover bg-center" style={{backgroundImage: `url(${data.banner})`}}></div>}
                <div className="p-6">
                  <div className="flex items-center gap-4 -mt-12 mb-4">
                    <img src={data.thumbnail} alt="Profile" className="w-20 h-20 rounded-full border-4 border-slate-900 bg-slate-800" />
                    <div className="mt-8">
                      <h2 className="text-2xl font-bold text-white">{data.name}</h2>
                      <p className="text-slate-400 text-sm">{data.subscribers || 'Hidden'} Subs</p>
                    </div>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 mb-4 grid grid-cols-2 gap-4 text-center">
                     <div><div className="text-xs text-slate-500">VIDEO</div><div className="font-bold">{data.video_count}</div></div>
                     <div><div className="text-xs text-slate-500">ID</div><div className="font-mono text-xs truncate px-2">{data.id}</div></div>
                  </div>
                  <p className="text-sm text-slate-400 line-clamp-3">{data.description}</p>
                </div>
              </div>
            )}

            {/* VIDEO & DOWNLOADER CARD */}
            {data.type === 'video' && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                 <img src={data.thumbnail} alt="Thumb" className="w-full aspect-video object-cover" />
                 <div className="p-6">
                    <h2 className="text-xl font-bold text-white mb-2 line-clamp-2">{data.title}</h2>
                    <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
                      <User className="w-4 h-4" /> {data.uploader} • {data.views} views
                    </div>

                    {activeTab === 'downloader' ? (
                        <div className="space-y-4">
                          <div className="text-xs text-slate-400 bg-slate-950 p-3 rounded border border-slate-800">
                             Resolusi tersedia di server: <span className="text-white font-mono">{getFormatsString()}</span>
                          </div>
                          
                          {/* TOMBOL DOWNLOAD YANG BERFUNGSI */}
                          {data.download_url ? (
                            <a 
                              href={data.download_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-colors"
                            >
                               <Download className="w-5 h-5" />
                               Buka / Download Video
                            </a>
                          ) : (
                            <div className="text-red-400 text-sm text-center">Link download tidak ditemukan oleh server.</div>
                          )}

                          <p className="text-[10px] text-center text-slate-500">
                            *Jika video terbuka di tab baru, klik titik tiga di pojok video &gt; Download.
                          </p>
                        </div>
                    ) : (
                       <div className="bg-blue-900/20 text-blue-400 p-3 rounded-lg text-sm flex gap-2">
                          <CheckCircle className="w-4 h-4" /> Data video berhasil dianalisis.
                       </div>
                    )}
                 </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

