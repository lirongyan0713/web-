// ========== 时间换算函数 ==========
function transTime(value) {
  var time = '';
  var h = parseInt(value / 3600);
  value %= 3600;
  var m = parseInt(value / 60);
  var s = parseInt(value % 60);
  if (h > 0) {
    time = formatTime(h + ':' + m + ':' + s);
  } else {
    time = formatTime(m + ':' + s);
  }
  return time;
}

function formatTime(value) {
  var time = '';
  var s = value.split(':');
  var i = 0;
  for (; i < s.length - 1; i++) {
    time += s[i].length == 1 ? '0' + s[i] : s[i];
    time += ':';
  }
  time += s[i].length == 1 ? '0' + s[i] : s[i];
  return time;
}

// ========== 音乐数据 ==========
const playlist = [
    {
        id: 0,
        title: '洛春赋',
        artist: '尹昔眠/小田音乐社',
        src: './mp3/music0.mp3',
        cover: './img/record0.jpg',
        mv: './mp4/video0.mp4'
    },
    {
        id: 1,
        title: 'Yesterday',
        artist: 'The Beatles',
        src: './mp3/music1.mp3',
        cover: './img/record1.jpg',
        mv: './mp4/video1.mp4'
    },
    {
        id: 2,
        title: '江南烟雨色',
        artist: '杨树人',
        src: './mp3/music2.mp3',
        cover: './img/record2.jpg',
        mv: './mp4/video2.mp4'
    },
    {
        id: 3,
        title: 'Vision pt.II',
        artist: 'Dxvn.',
        src: './mp3/music3.mp3',
        cover: './img/record3.jpg',
        mv: './mp4/video3.mp4'
    }
];

// ========== DOM元素 ==========
const audioTag = document.getElementById('audioTag');
const playPauseBtn = document.getElementById('playPause');
const skipForwardBtn = document.getElementById('skipForward');
const skipBackwardBtn = document.getElementById('skipBackward');
const progressTotal = document.getElementById('progress-total');
const progress = document.getElementById('progress');
const playedTimeSpan = document.getElementById('playedTime');
const audioTimeSpan = document.getElementById('audioTime');
const musicTitleSpan = document.getElementById('music-title');
const authorNameSpan = document.getElementById('author-name');
const playModeBtn = document.getElementById('playMode');
const volumeBtn = document.getElementById('volume');
const volumeSlider = document.getElementById('volumn-togger');
const speedBtn = document.getElementById('speed');
const listBtn = document.getElementById('list');
const musicListDiv = document.getElementById('music-list');
const closeListDiv = document.getElementById('close-list');
const recordImg = document.getElementById('record-img');
const mvBtn = document.getElementById('MV');

// ========== 状态变量 ==========
let currentTrackIndex = 0;
let isPlaying = false;
let playMode = 0;
let currentSpeed = 1.0;
let isDraggingProgress = false;

// ========== MV 相关变量 ==========
let mvModal = null;
let mvVideo = null;
let mvTitle = null;
let isMVOpen = false;

// ========== 初始化所有图标 ==========
function initAllIcons() {
    if (playPauseBtn) {
        playPauseBtn.style.backgroundImage = "url('./img/继续播放.png')";
        playPauseBtn.style.backgroundSize = '100% 100%';
    }
    
    if (skipBackwardBtn) {
        skipBackwardBtn.style.backgroundImage = "url('./img/下一首.png')";
        skipBackwardBtn.style.backgroundSize = '100% 100%';
    }
    if (skipForwardBtn) {
        skipForwardBtn.style.backgroundImage = "url('./img/上一首.png')";
        skipForwardBtn.style.backgroundSize = '100% 100%';
    }
    
    if (listBtn) {
        listBtn.style.backgroundImage = "url('./img/列表.png')";
        listBtn.style.backgroundSize = '100% 100%';
    }
    
    if (volumeBtn) {
        volumeBtn.style.backgroundImage = "url('./img/音量.png')";
        volumeBtn.style.backgroundSize = '100% 100%';
    }
    
    if (playModeBtn) {
        playModeBtn.style.backgroundImage = "url('./img/mode1.png')";
        playModeBtn.style.backgroundSize = '100% 100%';
    }
    
    if (mvBtn) {
        mvBtn.style.backgroundImage = "url('./img/MV.png')";
        mvBtn.style.backgroundSize = '100% 100%';
        mvBtn.style.cursor = 'pointer';
    }
    
    if (volumeSlider) {
        volumeSlider.style.display = 'inline-block';
    }
}

// ========== 播放列表点击绑定 ==========
for (let i = 0; i < playlist.length; i++) {
    const musicDiv = document.getElementById('music' + i);
    if (musicDiv) {
        musicDiv.addEventListener('click', (function(index) {
            return function() { 
                playTrack(index);
                if (musicListDiv && musicListDiv.style.display === 'block') {
                    togglePlaylist();
                }
            };
        })(i));
    }
}

// ========== 核心功能 ==========
function loadTrack(index) {
    const track = playlist[index];
    if (!track) return;
    
    audioTag.src = track.src;
    musicTitleSpan.innerText = track.title;
    authorNameSpan.innerText = track.artist;
    
    if (recordImg && track.cover) {
        recordImg.style.backgroundImage = "url('" + track.cover + "')";
        recordImg.style.backgroundSize = '100% 100%';
    }
    
    progress.style.width = '0%';
    playedTimeSpan.innerText = '00:00';
    audioTimeSpan.innerText = '00:00';
}

function playTrack(index) {
    if (index < 0) index = playlist.length - 1;
    if (index >= playlist.length) index = 0;
    
    currentTrackIndex = index;
    loadTrack(currentTrackIndex);
    
    // 如果 MV 模态框是打开状态，关闭它
    if (isMVOpen && mvModal) {
        mvModal.style.display = 'none';
        isMVOpen = false;
        if (mvVideo) {
            mvVideo.pause();
        }
    }
    
    audioTag.play().then(function() {
        isPlaying = true;
        updatePlayPauseButton();
        startRotateAnimation();
        console.log('播放歌曲:', playlist[currentTrackIndex].title);
    }).catch(function(e) {
        console.log('播放失败:', e);
        isPlaying = false;
        updatePlayPauseButton();
    });
}

function togglePlayPause() {
    if (isPlaying) {
        audioTag.pause();
        isPlaying = false;
        pauseRotateAnimation();
    } else {
        audioTag.play().then(function() {
            isPlaying = true;
            startRotateAnimation();
        }).catch(function(e) {
            console.log('播放失败:', e);
        });
    }
    updatePlayPauseButton();
}

function updatePlayPauseButton() {
    if (isPlaying) {
        playPauseBtn.style.backgroundImage = "url('./img/暂停.png')";
        playPauseBtn.className = 'icon-pause';
    } else {
        playPauseBtn.style.backgroundImage = "url('./img/继续播放.png')";
        playPauseBtn.className = 'icon-play';
    }
}

// 上一首
function prevTrack() {
    console.log('上一首被点击');
    let newIndex = currentTrackIndex - 1;
    if (newIndex < 0) newIndex = playlist.length - 1;
    if (playMode === 2) {
        newIndex = Math.floor(Math.random() * playlist.length);
    }
    playTrack(newIndex);
}

// 下一首
function nextTrack() {
    console.log('下一首被点击');
    let newIndex = currentTrackIndex + 1;
    if (newIndex >= playlist.length) newIndex = 0;
    if (playMode === 2) {
        newIndex = Math.floor(Math.random() * playlist.length);
    }
    playTrack(newIndex);
}

// ========== 进度条 ==========
function updateProgress() {
    if (!isDraggingProgress && audioTag.duration && !isNaN(audioTag.duration)) {
        var percent = (audioTag.currentTime / audioTag.duration) * 100;
        progress.style.width = percent + '%';
        playedTimeSpan.innerText = transTime(audioTag.currentTime);
        audioTimeSpan.innerText = transTime(audioTag.duration);
    }
}

function setProgress(event) {
    var rect = progressTotal.getBoundingClientRect();
    var clickX = event.clientX - rect.left;
    if (clickX < 0) clickX = 0;
    if (clickX > rect.width) clickX = rect.width;
    var percent = (clickX / rect.width) * 100;
    if (audioTag.duration) {
        audioTag.currentTime = (percent / 100) * audioTag.duration;
        progress.style.width = percent + '%';
    }
}

function startDrag(event) {
    isDraggingProgress = true;
    event.preventDefault();
}

function onDrag(event) {
    if (isDraggingProgress && audioTag.duration) {
        var rect = progressTotal.getBoundingClientRect();
        var clickX = event.clientX - rect.left;
        if (clickX < 0) clickX = 0;
        if (clickX > rect.width) clickX = rect.width;
        var percent = (clickX / rect.width) * 100;
        progress.style.width = percent + '%';
        audioTag.currentTime = (percent / 100) * audioTag.duration;
        playedTimeSpan.innerText = transTime(audioTag.currentTime);
    }
}

function endDrag() {
    isDraggingProgress = false;
}

function onTrackEnd() {
    console.log('歌曲播放结束');
    if (playMode === 1) {
        audioTag.currentTime = 0;
        audioTag.play().catch(function(e) {});
    } else {
        nextTrack();
    }
}

// ========== 播放模式 ==========
function togglePlayMode() {
    playMode = (playMode + 1) % 3;
    var modeImg = '';
    switch(playMode) {
        case 0: modeImg = './img/mode1.png'; break;
        case 1: modeImg = './img/mode2.png'; break;
        case 2: modeImg = './img/mode3.png'; break;
    }
    playModeBtn.style.backgroundImage = "url('" + modeImg + "')";
    console.log('播放模式:', playMode);
}

// ========== 音量控制 ==========
function setVolume(value) {
    var vol = value / 100;
    audioTag.volume = vol;
    volumeSlider.value = value;
}

function updateVolumeIcon(volumeValue) {
    if (volumeValue == 0) {
        volumeBtn.style.backgroundImage = "url('./img/静音.png')";
    } else {
        volumeBtn.style.backgroundImage = "url('./img/音量.png')";
    }
}

function toggleMute() {
    if (audioTag.volume > 0) {
        audioTag.lastVolume = audioTag.volume;
        audioTag.volume = 0;
        volumeSlider.value = 0;
        updateVolumeIcon(0);
    } else {
        var lastVol = audioTag.lastVolume || 0.7;
        audioTag.volume = lastVol;
        volumeSlider.value = lastVol * 100;
        updateVolumeIcon(lastVol * 100);
    }
}

// ========== 倍速 ==========
function toggleSpeed() {
    var speeds = [1.0, 1.25, 1.5, 2.0];
    var currentIndex = speeds.indexOf(currentSpeed);
    var nextIndex = (currentIndex + 1) % speeds.length;
    currentSpeed = speeds[nextIndex];
    audioTag.playbackRate = currentSpeed;
    speedBtn.innerText = currentSpeed.toFixed(1) + 'X';
    console.log('倍速:', currentSpeed);
}

// ========== 播放列表 ==========
function togglePlaylist() {
    if (musicListDiv.style.display === 'block') {
        musicListDiv.style.display = 'none';
        closeListDiv.style.display = 'none';
    } else {
        musicListDiv.style.display = 'block';
        closeListDiv.style.display = 'block';
    }
}

if (closeListDiv) {
    closeListDiv.addEventListener('click', function() {
        musicListDiv.style.display = 'none';
        closeListDiv.style.display = 'none';
    });
}

// ========== 唱片动画 ==========
function startRotateAnimation() {
    if (recordImg) recordImg.style.animationPlayState = 'running';
}

function pauseRotateAnimation() {
    if (recordImg) recordImg.style.animationPlayState = 'paused';
}

// ========== MV 功能（修复版） ==========

// 创建 MV 模态框
function createMVModal() {
    const modal = document.createElement('div');
    modal.id = 'mv-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.95);
        z-index: 2000;
        display: none;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    `;
    
    const video = document.createElement('video');
    video.id = 'mv-video';
    video.style.cssText = `
        width: 80%;
        max-width: 1000px;
        border-radius: 10px;
        box-shadow: 0 0 30px rgba(0, 0, 0, 0.5);
    `;
    video.controls = true;
    video.autoplay = false;
    
    const title = document.createElement('div');
    title.id = 'mv-title';
    title.style.cssText = `
        color: white;
        font-size: 20px;
        margin-top: 20px;
        margin-bottom: 20px;
        text-align: center;
        font-family: sans-serif;
    `;
    
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '✕ 关闭 MV';
    closeBtn.style.cssText = `
        position: absolute;
        top: 20px;
        right: 30px;
        padding: 10px 20px;
        background-color: #42b680;
        border: none;
        border-radius: 5px;
        color: white;
        font-size: 16px;
        cursor: pointer;
        z-index: 2001;
        transition: 0.3s;
        font-family: sans-serif;
    `;
    closeBtn.onmouseover = function() { this.style.backgroundColor = '#359669'; };
    closeBtn.onmouseout = function() { this.style.backgroundColor = '#42b680'; };
    closeBtn.onclick = closeMVModal;
    
    modal.onclick = function(e) {
        if (e.target === modal) closeMVModal();
    };
    
    modal.appendChild(video);
    modal.appendChild(title);
    modal.appendChild(closeBtn);
    document.body.appendChild(modal);
    
    return { modal, video, title };
}

// 关闭 MV 模态框
function closeMVModal() {
    if (mvModal && mvVideo) {
        mvVideo.pause();
        mvModal.style.display = 'none';
        isMVOpen = false;
        
        const currentTrack = playlist[currentTrackIndex];
        if (audioTag.src !== currentTrack.src) {
            audioTag.src = currentTrack.src;
            audioTag.load();
        }
        if (isPlaying) {
            audioTag.play().catch(function(e) { console.log('恢复播放失败:', e); });
        }
        console.log('MV 已关闭');
    }
}

// 打开 MV 模态框
function openMVModal(mvPath, songTitle) {
    if (!mvModal) {
        const obj = createMVModal();
        mvModal = obj.modal;
        mvVideo = obj.video;
        mvTitle = obj.title;
    }
    
    // 显示加载状态
    mvTitle.innerText = '🎬 ' + songTitle + ' - 加载中...';
    mvModal.style.display = 'flex';
    isMVOpen = true;
    
    // 暂停音频
    const wasPlaying = isPlaying;
    if (wasPlaying) {
        audioTag.pause();
    }
    
    // 重置视频
    mvVideo.src = '';
    mvVideo.load();
    
    // 清除旧的事件监听
    mvVideo.onerror = null;
    mvVideo.oncanplay = null;
    mvVideo.onloadstart = null;
    
    // 加载开始
    mvVideo.onloadstart = function() {
        console.log('开始加载 MV:', mvPath);
    };
    
    // 加载错误处理
    mvVideo.onerror = function() {
        var errorMsg = '';
        switch(mvVideo.error ? mvVideo.error.code : 4) {
            case 1:
                errorMsg = '视频加载中止';
                break;
            case 2:
                errorMsg = '网络错误，无法获取视频文件';
                break;
            case 3:
                errorMsg = '视频解码失败，文件格式可能不支持';
                break;
            case 4:
                errorMsg = '视频文件不存在或路径错误';
                break;
            default:
                errorMsg = '未知错误';
        }
        console.error('MV 加载失败:', mvPath, errorMsg);
        mvTitle.innerText = '🎬 ' + songTitle + ' - 加载失败: ' + errorMsg;
        alert('MV 加载失败！\n\n错误：' + errorMsg + '\n文件路径：' + mvPath + '\n\n请检查：\n1. 文件是否存在\n2. 文件名是否正确\n3. 浏览器是否支持该视频格式');
        setTimeout(function() {
            if (isMVOpen) closeMVModal();
        }, 3000);
    };
    
    // 可以播放时
    mvVideo.oncanplay = function() {
        console.log('MV 加载成功，开始播放');
        mvTitle.innerText = '🎬 ' + songTitle + ' - MV';
        mvVideo.play().catch(function(e) {
            console.log('自动播放失败:', e);
        });
    };
    
    // 设置视频源
    mvVideo.src = mvPath;
    mvVideo.load();
}

// MV 按钮点击事件
function toggleMV() {
    const currentTrack = playlist[currentTrackIndex];
    
    if (isMVOpen) {
        closeMVModal();
        return;
    }
    
    if (!currentTrack.mv) {
        alert('当前歌曲暂无 MV');
        return;
    }
    
    // 直接尝试打开 MV（不提前预检，让 video 元素自己处理错误）
    openMVModal(currentTrack.mv, currentTrack.title);
}

// ========== 事件绑定 ==========
if (skipBackwardBtn) skipBackwardBtn.addEventListener('click', nextTrack);
if (skipForwardBtn) skipForwardBtn.addEventListener('click', prevTrack);
if (playPauseBtn) playPauseBtn.addEventListener('click', togglePlayPause);
if (progressTotal) progressTotal.addEventListener('click', setProgress);
if (progressTotal) progressTotal.addEventListener('mousedown', startDrag);
window.addEventListener('mousemove', onDrag);
window.addEventListener('mouseup', endDrag);
if (audioTag) audioTag.addEventListener('timeupdate', updateProgress);
if (audioTag) audioTag.addEventListener('ended', onTrackEnd);
if (playModeBtn) playModeBtn.addEventListener('click', togglePlayMode);
if (volumeBtn) volumeBtn.addEventListener('click', toggleMute);
if (volumeSlider) {
    volumeSlider.addEventListener('input', function(e) {
        var val = parseInt(e.target.value);
        setVolume(val);
        updateVolumeIcon(val);
    });
}
if (speedBtn) speedBtn.addEventListener('click', toggleSpeed);
if (listBtn) listBtn.addEventListener('click', togglePlaylist);
if (mvBtn) mvBtn.addEventListener('click', toggleMV);

if (audioTag) {
    audioTag.addEventListener('play', function() {
        if (!isPlaying) {
            isPlaying = true;
            updatePlayPauseButton();
            startRotateAnimation();
        }
    });

    audioTag.addEventListener('pause', function() {
        if (isPlaying) {
            isPlaying = false;
            updatePlayPauseButton();
            pauseRotateAnimation();
        }
    });
}

// ========== 初始化 ==========
loadTrack(0);
isPlaying = false;
initAllIcons();
updatePlayPauseButton();
pauseRotateAnimation();
audioTag.volume = 0.7;
volumeSlider.value = 70;
audioTag.playbackRate = 1.0;
audioTag.lastVolume = 0.7;

if (musicListDiv) musicListDiv.style.display = 'none';
if (closeListDiv) closeListDiv.style.display = 'none';

// 显示学号姓名
var studentInfoDiv = document.createElement('div');
studentInfoDiv.style.position = 'fixed';
studentInfoDiv.style.bottom = '10px';
studentInfoDiv.style.left = '10px';
studentInfoDiv.style.color = 'rgba(255,255,255,0.7)';
studentInfoDiv.style.fontSize = '14px';
studentInfoDiv.style.zIndex = '999';
studentInfoDiv.style.backgroundColor = 'rgba(0,0,0,0.5)';
studentInfoDiv.style.padding = '5px 10px';
studentInfoDiv.style.borderRadius = '5px';
studentInfoDiv.innerText = '学号：24215220110  姓名：李镕妍';
document.body.appendChild(studentInfoDiv);

console.log('音乐播放器初始化完成');
console.log('当前歌曲:', playlist[0].title);
console.log('MV 功能已加载，请确保 mp4 文件夹中有对应的视频文件');