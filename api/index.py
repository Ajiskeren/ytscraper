from flask import Flask, request, jsonify
import yt_dlp

app = Flask(__name__)

# Konfigurasi YDL agar ringan di serverless
def get_ydl_opts(extract_flat=False):
    return {
        'quiet': True,
        'no_warnings': True,
        'extract_flat': extract_flat, # True = Cepat (hanya metadata), False = Detail
        'geo_bypass': True,
    }

@app.route('/api/info', methods=['GET'])
def get_info():
    url = request.args.get('url')
    type_req = request.args.get('type', 'video') # video atau channel

    if not url:
        return jsonify({'error': 'URL is required'}), 400

    try:
        # PENGATURAN BERDASARKAN TIPE
        flat_mode = True if type_req == 'channel' else False
        opts = get_ydl_opts(extract_flat=flat_mode)

        with yt_dlp.YoutubeDL(opts) as ydl:
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
                    'banner': info.get('banner_url', '') # Jika ada
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
                    # Mengambil Direct URL (Link Download Langsung dari YouTube)
                    # Catatan: Link ini mungkin memiliki masa berlaku (expiry)
                    'download_url': info.get('url'), 
                    'formats': [
                        {'format_id': f['format_id'], 'res': f.get('height'), 'ext': f['ext']} 
                        for f in info.get('formats', []) 
                        if f.get('height') and f['ext'] == 'mp4'
                    ]
                })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Untuk Vercel Serverless Function
# Handler harus bisa dipanggil oleh Vercel
if __name__ == '__main__':
    app.run(debug=True)