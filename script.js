// DOM Elements
const urlInput = document.getElementById('urlInput');
const fetchBtn = document.getElementById('fetchBtn');
const loading = document.getElementById('loading');
const result = document.getElementById('result');
const error = document.getElementById('error');
const videoTitle = document.getElementById('videoTitle');
const thumbnail = document.getElementById('thumbnail');
const qualityButtons = document.getElementById('qualityButtons');
const downloadBtn = document.getElementById('downloadBtn');

let videoData = null;
let selectedUrl = null;

// Button Click Event
fetchBtn.addEventListener('click', async () => {
    const url = urlInput.value.trim();
    
    if (!url) {
        showError('আগে ভিডিও লিংক পেস্ট করো ভাই!');
        return;
    }
    
    if (!url.includes('youtube.com') && !url.includes('youtu.be') && 
        !url.includes('facebook.com') && !url.includes('tiktok.com')) {
        showError('YouTube, Facebook, TikTok লিংক সাপোর্ট করে!');
        return;
    }
    
    hideAll();
    loading.classList.remove('hidden');
    fetchBtn.disabled = true;
    fetchBtn.textContent = 'খুঁজতেছি...';
    
    try {
        // Cobalt API Call - No Key Needed
        const response = await fetch('https://api.cobalt.tools/api/json', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                url: url,
                vCodec: 'h264',
                vQuality: 'max',
                aFormat: 'mp3',
                isAudioOnly: false,
                isNoTTWatermark: true,
                dubLang: false
            })
        });
        
        if (!response.ok) {
            throw new Error('API Error: ' + response.status);
        }
        
        const data = await response.json();
        console.log('API Response:', data);
        
        if (data.status === 'error') {
            throw new Error(data.error.message || 'ভিডিও পাওয়া যায় নাই');
        }
        
        if (data.status === 'redirect' || data.status === 'success') {
            videoData = data;
            displayResult(data);
        } else {
            throw new Error('Unknown status');
        }
        
    } catch (err) {
        showError('এরর: ' + err.message + '। লিংক চেক করে আবার ট্রাই করো।');
        console.error(err);
    } finally {
        loading.classList.add('hidden');
        fetchBtn.disabled = false;
        fetchBtn.textContent = 'Get Video';
    }
});

// Result Show করার ফাংশন
function displayResult(data) {
    // Title Set
    videoTitle.textContent = data.filename?.replace('.mp4', '') || 'Video Ready';
    
    // Thumbnail Set
    if (data.thumbnail) {
        thumbnail.src = data.thumbnail;
        thumbnail.style.display = 'block';
    } else {
        thumbnail.style.display = 'none';
    }
    
    // Quality Buttons Clear
    qualityButtons.innerHTML = '';
    
    // Multiple Quality থাকলে বাটন বানাও
    if (data.picker && data.picker.length > 0) {
        data.picker.forEach((item, index) => {
            const btn = document.createElement('button');
            btn.className = 'quality-btn';
            
            // Quality Name সুন্দর করে দেখাও
            let qualityText = item.quality + 'p';
            if (item.quality === 'max') qualityText = 'Best Quality';
            if (item.type === 'audio') qualityText = 'MP3 Audio';
            
            btn.textContent = qualityText;
            
            btn.addEventListener('click', () => {
                selectQuality(item.url, btn);
            });
            
            qualityButtons.appendChild(btn);
            
            // প্রথমটাকে ডিফল্ট সিলেক্ট করো
            if (index === 0) {
                selectQuality(item.url, btn);
            }
        });
    } 
    // Single URL থাকলে সরাসরি Download Button দেখাও
    else if (data.url) {
        selectedUrl = data.url;
        downloadBtn.href = data.url;
        downloadBtn.classList.remove('hidden');
    }
    
    result.classList.remove('hidden');
}

// Quality Select করার ফাংশন
function selectQuality(url, btn) {
    // সব বাটন থেকে active ক্লাস রিমুভ
    document.querySelectorAll('.quality-btn').forEach(b => {
        b.classList.remove('active');
    });
    
    // ক্লিক করা বাটনে active ক্লাস অ্যাড
    btn.classList.add('active');
    
    // Download Link আপডেট
    selectedUrl = url;
    downloadBtn.href = url;
    downloadBtn.classList.remove('hidden');
    
    // Download Button Text আপডেট
    downloadBtn.textContent = '📥 Download Now - ' + btn.textContent;
}

// Error দেখানোর ফাংশন
function showError(msg) {
    error.textContent = msg;
    error.classList.remove('hidden');
    result.classList.add('hidden');
}

// সব Hide করার ফাংশন
function hideAll() {
    result.classList.add('hidden');
    error.classList.add('hidden');
}

// Enter চাপলে সার্চ হবে
urlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        fetchBtn.click();
    }
});