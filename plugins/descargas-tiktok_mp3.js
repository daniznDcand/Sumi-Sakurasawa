import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return conn.reply(m.chat, `💙 Por favor, ingresa un enlace de TikTok.\n\n📝 *Ejemplo:* ${usedPrefix}${command} https://www.tiktok.com/@usuario/video/1234567890`, m);
    }

    
    const tiktokUrl = validateTikTokUrl(text);
    if (!tiktokUrl) {
        return conn.reply(m.chat, `❌ URL de TikTok inválida. Por favor verifica el enlace.`, m);
    }

    conn.sendMessage(m.chat, { react: { text: "🕒", key: m.key } });

    try {
        
        const result = await downloadAudioFromMultipleAPIs(tiktokUrl);
        
        if (!result || !result.audioUrl) {
            return conn.reply(m.chat, `❌ No se pudo extraer el audio del video. El enlace podría ser privado o no válido.`, m);
        }

        const { audioUrl, title, author, thumbnail } = result;

        const doc = {
            audio: { url: audioUrl },
            mimetype: 'audio/mp4',
            fileName: `${title || 'tiktok_audio'}.mp3`,
            contextInfo: {
                externalAdReply: {
                    showAdAttribution: true,
                    mediaType: 2,
                    mediaUrl: tiktokUrl,
                    title: title || 'Audio de TikTok',
                    body: `👤 ${author || 'Autor desconocido'}`,
                    sourceUrl: tiktokUrl,
                    thumbnail: thumbnail ? await (await conn.getFile(thumbnail)).data : null
                }
            }
        };
        
        await conn.sendMessage(m.chat, doc, { quoted: m });
        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
        
    } catch (error) {
        console.error('Error en TikTok MP3:', error);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        return conn.reply(m.chat, `❌ Error al procesar el audio: ${error.message}`, m);
    }
}

handler.help = ['tiktokmp3 *<url>*']
handler.tags = ['dl']
handler.command = ['tiktokmp3', 'ttmp3']
handler.group = true
handler.register = true
handler.coin = 2

export default handler


function validateTikTokUrl(url) {
    try {
        url = url.trim().replace(/[^\x00-\x7F]/g, "");
        
        const patterns = [
            /(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@([^\/]+)\/video\/(\d+)/,
            /(?:https?:\/\/)?vm\.tiktok\.com\/([A-Za-z0-9]+)/,
            /(?:https?:\/\/)?vt\.tiktok\.com\/([A-Za-z0-9]+)/,
            /(?:https?:\/\/)?m\.tiktok\.com\/v\/(\d+)/,
            /(?:https?:\/\/)?www\.tiktok\.com\/t\/([A-Za-z0-9]+)/
        ];
        
        for (const pattern of patterns) {
            if (pattern.test(url)) {
                if (!url.startsWith('http://') && !url.startsWith('https://')) {
                    url = 'https://' + url;
                }
                return url;
            }
        }
        
        return null;
    } catch (error) {
        return null;
    }
}


async function downloadAudioFromMultipleAPIs(url) {
    const apis = [
        {
            name: 'Eliasar',
            func: () => tiktokAudioEliasar(url)
        },
        {
            name: 'TikWM',
            func: () => tiktokAudioTikWM(url)
        },
        {
            name: 'SaveTT',
            func: () => tiktokAudioSaveTT(url)
        }
    ];
    
    for (const api of apis) {
        try {
            console.log(`🔍 Intentando audio con ${api.name}...`);
            const result = await api.func();
            
            if (result && result.audioUrl) {
                console.log(`✅ ${api.name} audio exitoso`);
                return result;
            }
        } catch (error) {
            console.log(`❌ ${api.name} audio falló: ${error.message}`);
            continue;
        }
    }
    
    return null;
}


async function tiktokAudioEliasar(url) {
    try {
        const apiUrl = `https://eliasar-yt-api.vercel.app/api/search/tiktok?query=${encodeURIComponent(url)}`;
        
        const response = await fetch(apiUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 15000
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.results && data.results.audio) {
            return {
                audioUrl: data.results.audio,
                title: data.results.title || 'Audio TikTok',
                author: data.results.author || 'Desconocido',
                thumbnail: data.results.thumbnail
            };
        }
        
        throw new Error('No audio data found');
    } catch (error) {
        throw new Error(`Eliasar API error: ${error.message}`);
    }
}


async function tiktokAudioTikWM(url) {
    try {
        const apiUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(url)}&hd=1`;
        
        const response = await fetch(apiUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'application/json, text/plain, */*',
                'Referer': 'https://www.tikwm.com/',
                'Origin': 'https://www.tikwm.com'
            },
            timeout: 15000
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.code === 0 && data.data && data.data.music) {
            return {
                audioUrl: data.data.music,
                title: data.data.title || 'Audio TikTok',
                author: data.data.author?.unique_id || 'Desconocido',
                thumbnail: data.data.cover || data.data.origin_cover
            };
        }
        
        throw new Error('No audio data found');
    } catch (error) {
        throw new Error(`TikWM API error: ${error.message}`);
    }
}


async function tiktokAudioSaveTT(url) {
    try {
        const apiUrl = `https://api.savett.cc/v2/info?url=${encodeURIComponent(url)}`;
        
        const response = await fetch(apiUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 15000
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.data && data.data.music) {
            return {
                audioUrl: data.data.music,
                title: data.data.desc || 'Audio TikTok',
                author: data.data.author?.nickname || 'Desconocido',
                thumbnail: data.data.cover
            };
        }
        
        throw new Error('No audio data found');
    } catch (error) {
        throw new Error(`SaveTT API error: ${error.message}`);
    }
}
