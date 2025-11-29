from flask import Flask, request, jsonify
import yt_dlp
import os  # PENTING: Untuk mencari lokasi file cookies

app = Flask(__name__)

# Konfigurasi YDL dengan Cookies & User Agent
def get_ydl_opts(extract_flat=False):
    # Cari lokasi file cookies.txt di folder yang sama dengan script ini
    # Ini wajib dilakukan agar Vercel bisa menemukan filenya
    dir_path = os.path.dirname(os.path.realpath(__file__))
    cookie_path = os.path.join(dir_path, 'cookies.txt')
    
    # Cek apakah file cookies benar-benar ada (untuk debugging)
    if not os.path.exists(cookie_path):
        print(f"WARNING: File cookies tidak ditemukan di {cookie_path}")

    return {
        'quiet': True,
        'no_warnings': True,
        'extract_flat': extract_flat,
        'geo_bypass': True,
        
        # --- SOLUSI ANTI BLOKIR ---
        # 1. Gunakan Cookies dari browser asli
        'cookiefile': cookie_path,
        
        # 2. Menyamar jadi Browser Chrome di Windows
        'user_agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    }

@app.route('/api/info', methods=['GET'])
def get_info():
    url = request.args.get('url')
    type_req = request.args.get('type', 'video')

    if not url:
        return jsonify({'error': 'URL is required'}), 400

    try:
        flat_mode = True if type_req == 'channel' else False
        opts = get_ydl_opts(extract_flat=flat_mode)

        with yt_dlp.YoutubeDL(opts) as ydl:
            # Ambil Info
            info = ydl.extract_info(url, download=False)
            
            # FORMAT DATA CHANNEL
            if type_req == 'channel':
                return jsonify({
                    'type': 'channel',
                    'name': info.get('uploader'),
                    'id': info.get('channel_id'),
                    'subscribers': info.get('channel_follower_count'),
                    'video_count': len(info.get('entries', [])),
                    'description': info.get('description'),
                    'thumbnail': info.get('thumbnails', [{}])[0].get('url'),
                    'banner': info.get('banner_url', '')
                })
            
            # FORMAT DATA VIDEO
            else:
                return jsonify({
                    'type': 'video',
                    'title': info.get('title'),
                    'uploader': info.get('uploader'),
                    'views': info.get('view_count'),
                    'likes': info.get('like_count'),
                    'duration': info.get('duration_string'),
                    'thumbnail': info.get('thumbnail'),
                    'download_url': info.get('url'), 
                    'formats': [
                        {'format_id': f['format_id'], 'res': f.get('height'), 'ext': f['ext']} 
                        for f in info.get('formats', []) 
                        if f.get('height') and f['ext'] == 'mp4'
                    ]
                })

    except Exception as e:
        # Tampilkan error yang jelas jika gagal
        print(f"Error Log: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)