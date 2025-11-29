from flask import Flask, request, jsonify
import yt_dlp
import os
import shutil

app = Flask(__name__)

def get_ydl_opts(extract_flat=False):
    # 1. Tentukan lokasi folder source dan folder temp (yang boleh ditulis)
    source_dir = os.path.dirname(os.path.realpath(__file__))
    source_cookie = os.path.join(source_dir, 'cookies.txt')
    
    # Lokasi writable di Vercel hanyalah /tmp
    temp_cookie = '/tmp/cookies.txt'
    temp_cache_dir = '/tmp/yt_dlp_cache'

    # 2. Salin cookies.txt dari Source ke /tmp agar aman dibaca/tulis
    if os.path.exists(source_cookie):
        try:
            shutil.copyfile(source_cookie, temp_cookie)
        except Exception as e:
            print(f"Gagal menyalin cookies: {e}")
    else:
        print("WARNING: File cookies.txt asli tidak ditemukan!")

    return {
        'quiet': True,
        'no_warnings': True,
        'extract_flat': extract_flat,
        'geo_bypass': True,
        
        # --- KONFIGURASI PENTING UNTUK VERCEL ---
        # Gunakan file cookies yang ada di folder /tmp
        'cookiefile': temp_cookie,
        
        # Simpan cache di /tmp (JANGAN di folder project)
        'cache_dir': temp_cache_dir,
        
        # Opsi tambahan agar tidak error saat mencoba menulis file sementara
        'nopart': True, 
        'writethumbnail': False,
        
        # User Agent Samaran
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
            info = ydl.extract_info(url, download=False)
            
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
        # Print error ke log Vercel untuk debugging
        print(f"Server Error: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
