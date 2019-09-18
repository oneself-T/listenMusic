<template>
    <div class="playerInterface">
        <!-- 播放栏 -->
        <div class="playerBar" @click="playerBar">

            <div :class= "['turntable', playerState ? 'run' : '']" :style="[{backgroundImage:`url(${songCover})`}]" v-if="existence"></div>
            <div class='turntable iconfont existence ' v-else>&#xe602;</div>

            <div class="songInfo">
                <span class="songName">{{songInfo.songName}}</span>
                <span v-if="existence"> - </span>
                <span class="singer">{{songInfo.singerName}}</span>
            </div>
            <div class="playerFlag">
                <span class="iconfont playerNav" @click="playerFlag">{{playerState ? '&#xe670;' : '&#xe65a;'}}</span>
            </div>
            <div class="prepareNav">
                <span class="iconfont listNav" @click="preparesFlag">&#xe61f;</span>
            </div>
        </div>
        <!-- 播放列 -->
        <div class="prepareList" :class="[prepareFlag ? 'top' : '']" @click="prepareListInterface" v-if="prepareList">
            <div class="container">
                <div class="set list">
                    <span class="title">播放列表</span>
                    <span class="iconfont allDelete" @click="clearAll">&#xe618;</span>
                </div>
                <ul>
                    <li class="list" v-for="(item,index) in prepareList" :key="index">
                        <div class="state icon" v-if="item.songId == songId">
                            <span class="iconfont">&#xe626;</span>
                        </div>
                        <div class="songInfo" @click="requestPlayer(index)">
                            <span class="songName">{{item.songName}}</span>
                            <span> - </span>
                            <span class="singer">{{item.singerName}}</span>
                        </div>
                        <div class="delete icon">
                            <span class="iconfont" @click="remove(index)">&#xe625;</span>
                        </div>
                    </li>
                </ul>
            </div>
        </div>
        <!-- 播放器界面 -->
        <div class="mainInterface" :class="[!showPlayerInterface ? 'top' : '']">
            <img :src="songCover" alt="" class="vagueBG">
            <div class="home" :class="[!mainInterfaceState ? 'hidden' : '']">
                <div class="upHalf part">
                    <div class="title-name">
                        <span class="iconfont icon" @click="playerBar">&#xe62a;</span>
                        <p class="songName">{{songInfo.songName}}</p>
                        <p class="singerName">— {{songInfo.singerName}} —</p>
                    </div>
                    <div :class="['player',playerState ? 'run' : '']" :style="{backgroundImage:`url(${songCover})`}" @click="mainInterfaceSwitch"></div>
                    <div class="progress-bar">
                        <span class="curren-time">{{time.currentTime}}</span>
                        <input type="range" value="0" class="range" @input="change"> 
                        <span class="total-time">{{time.totalTime}}</span>
                    </div>
                    <div class="control">
                        <div class="like">
                            <span :class="['like','iconfont',likeState ? 'active-like' : '']" @click="like">{{likeState ? '&#xe630;' : '&#xe640;'}}</span>
                        </div>
                        <div class="prev">
                            <span class="iconfont" @click="prev">&#xe78a;</span>
                        </div>
                        <div class="playerFlag" @click="playerFlag">
                            <span class="iconfont">{{playerState ? '&#xe663;' : '&#xe653;'}}</span>
                        </div>
                        <div class="next">
                            <span class="iconfont" @click="next">&#xe7a5;</span>
                        </div>
                        <div class="prepare">
                            <span class="iconfont" @click="preparesFlag">&#xe61f;</span>
                        </div>
                    </div>
                </div>
                <div class="comment part">
                    <h3>精彩评论</h3>
                    <ul>
                        <li class="commentBlock" v-for="(item,index) in commentList" :key="index">
                            <div class="blockLeft">
                                <img :src="item.userPic" alt="这一个进度条">
                            </div>
                            <div class="blockRight">
                                <span class="userName">{{item.userName}}</span>
                                <p class="commentContent">{{item.commentContent}}</p>
                                <span class="praise">👍 {{item.fabulous}}</span>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
            <div class="songWordsList" :class="[mainInterfaceState ? 'hidden' : '']" @click="mainInterfaceSwitch" >
                <ul v-if="songWordsList">
                    <li class="line" :class='[item.highlight ? "highlight" : ""]' v-for="(item,index) in songWordsList" :key="index">
                        {{item.songWords}}
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script>
import Bus from '../../../public/bus';
import TitleName from '../components/title';

export default {
    name:'playerInterface',
    components:{
        TitleName
    },
    data(){
        return{
            songId:'',
            commentList:[],
            songWordsList:[],
            songCover:'',
            backups:[],
            prepareList:[],
            songInfo:{},
            time:{totalTime:'',currentTime:'',originTime:''},
            showPlayerInterface:false,
            mainInterfaceState:true,
            playerState:false,
            prepareFlag:true,
            existence:false,
            autoScroll:true,
            likeState:false
        }
    },
    methods: {
        // 歌手名(多人)
        parseName(singerList) {
            let singerName = '';
            for(let f=0;f<singerList.length;f++) {
                let name = singerList[f].name + '/';
                singerName += name;
            }
            singerName = singerName.substring(0,singerName.length-1);
            return singerName;
        },
        getSongData(songId,songList,state) {
            let id = this.songId;
            let _this = this;
            this.audio.src = '';
            // 歌词滚动元素
            let songWordsList = document.querySelector('.songWordsList');
            
            // bar条
            let range = document.querySelector('.range');
            
            let audio = this.audio;

            // 设置默认项
            songWordsList.scrollTop = 0;
            this.likeState = false;



            // 数据请求
            function request(url, format = true) {
                return fetch(url).then(res => format ? res.text() : res.json());
            }
            // 加载所有请求           
            request(`http://localhost:3000/comment/music?id=${id}&limit=1`,false)
                // 歌曲评论
                .then(res => {
                    if(res.code == 200) {
                        let commentList = new Array();
                        let allData = res.hotComments;
                        if(allData) {
                            allData.forEach((item,index) => {
                                let commentContent = item.content.replace(/\\n/g, '\n');
                                let userPic = item.user.avatarUrl;
                                let userName = item.user.nickname;
                                let fabulous = item.likedCount;
                                commentList.push({
                                    commentContent,
                                    userPic,
                                    userName,
                                    fabulous
                                })
                            })
                            this.commentList = commentList;
                        }
                    }
                    return request(`http://localhost:3000/lyric?id=${id}`,false);
                })
                // 歌词
                .then(res => {
                    if(res.code == 200) {
                        let songWordsList = new Array();
                        let part = res.lrc.lyric.split("\n");
                        part.forEach((item,index) => {
                            // 拆分时间:歌词
                            let start = item.indexOf('[');
                            let end = item.indexOf(']');
                            let len = item.length;
                            let cuttingFront = item.substring(start + 1, end);
                            let cuttingAfter = item.substring(end + 1, len);
                            // 时间格式转换为秒
                            cuttingFront = (cuttingFront.split(':')[0] * 60 + parseFloat(cuttingFront.split(":")[1])).toFixed(1);
                            // 判断时间值是否为NaN
                            if (!isNaN(cuttingFront) && cuttingAfter) {
                                songWordsList.push({
                                    songWords:cuttingAfter,
                                    time:cuttingFront,
                                    highlight:false,
                                })
                            }
                        })
                        _this.songWordsList = songWordsList;
                        return request(`http://localhost:3000/song/detail?ids=${id}`,false);
                    }
                })
                // 获取音乐详情/封面
                .then(res => {
                    if(res.code == 200) {
                        let songName = res.songs[0].name;
                        let singerName = this.parseName(res.songs[0].ar);
                        let albumName = res.songs[0].al.name;
                        let songId = id;
                        let cancel = false;
                        this.songInfo = {songName,singerName,albumName,songId,cancel};

                        this.songWordsList.unshift({
                            songWords:songName,
                            time:0,
                            highlight:false,
                        })
                        // 封面
                        let cover = res.songs[0].al.picUrl;
                        this.songCover = cover;
                        return request(`http://localhost:3000/song/url?id=${id}`,false);                        
                    }
                })
                // 调用音频/封面/歌词top值
                .then(res => {
                    if(res.code == 200) {
                        // 音频
                        let audioPath = res.data[0].url;
                        audio.src = audioPath;
                        // 歌词top值
                        let line = document.querySelectorAll('.line');
                        line.forEach((item,index) => {
                            let top = item.offsetTop;
                            this.songWordsList[index].top = top;
                        })
                        this.backups = JSON.stringify(this.songWordsList);
                        this.queryLike();
                    }

                })
            
            // 音频加载完成
            audio.oncanplay = () => {
                let time = audio.duration;

                let minute = time / 60 | 0;
                let second = time % 60 | 0;
                minute < 10 ? minute = '0' + minute : minute;
                second < 10 ? second = '0' + second : second;
                let totalTime = `${minute}:${second}`;
                this.time.totalTime = totalTime;
                this.time.originTime = time;
             
                this.existence = true;
                this.addCache('historyPlayer',this.songInfo);
                this.addCache('currentSong',this.songId);                
                if(!state){
                    this.audio.play();
                    this.playerState = true;
                } 
                if(songList) {
                    this.prepareList = JSON.parse(JSON.stringify(songList));
                    this.addCache('playerList',this.prepareList);
                }
            }
            
            let time;
            let times;
            let scrollFlag;
            let touchFlag;
            let autoBar = true;

            setInterval(() =>{
                if(autoBar) {
                    // 获取实时播放时间
                    let time = audio.currentTime | 0;
                    let minute = time / 60 | 0;
                    let second = time % 60 | 0;
                    minute < 10 ? minute = '0' + minute : miunte;
                    second < 10 ? second = '0' + second : second;
                    let currentTimes = `${minute}:${second}`;
                    this.time.currentTime = currentTimes;

                    // bar条进度
                    let rate = time / audio.duration;
                    let runNum = rate.toFixed(2) * 100; 
                    range.value = runNum;
                }

                this.songWordsRoll();
                this.playerEnd();
            },100)

            // bar条滚动
            range.addEventListener('touchstart',() => {
                autoBar = false;
            })
            range.addEventListener('touchend',() => {
                this.barMoveEnd();      
                autoBar = true;   
            })
            // pc端事件
            range.addEventListener('mousedown',() => {
                autoBar = false;                
            })
            range.addEventListener('mouseup',() => {
                this.barMoveEnd();  
                autoBar = true;   
            })
            // 滚轮滚动
            songWordsList.addEventListener('mousewheel',() => {
                if(touchFlag) return;
                if(!scrollFlag){
                    scrollFlag = true;
                    this.autoScroll = false;
                }
                clearTimeout(times);
                times = setTimeout(() => {
                    scrollFlag = false;
                    this.autoScroll = true;
                },500)
            })
            // 触屏滑动
            songWordsList.addEventListener('touchstart',() => {
                if(scrollFlag) return;
                this.autoScroll = false;
                touchFlag = true;
                songWordsList.ontouchend = () => {
                    touchFlag = false;
                    this.autoScroll = true;
                };
            })
        },
        // 手动改变进度条
        change() {
            let range = document.querySelector('.range');
            let originTime = this.time.originTime;
            let time =  originTime * range.value / 100;
            let minute = time / 60 | 0;
            let second = time % 60 | 0;
            minute < 10 ? minute = '0' + minute : miunte;
            second < 10 ? second = '0' + second : second;
            let currentTimes = `${minute}:${second}`;
            this.time.currentTime = currentTimes;
        },
        // 进度条滑动结束
        barMoveEnd() {
            let range = document.querySelector('.range');
            let originTime = this.time.originTime;
            let rate = range.value * originTime / 100;
            this.audio.currentTime = rate;
            let index = this.songWordsList.findIndex(item => item.highlight);
            if(index != -1) this.songWordsList[index].highlight = false;
        },
        // 进入/关闭 播放界面
        playerBar(e) {
            let className = e.target.className;
            let existence = this.existence;
            if(className.indexOf('playerNav') == -1 && className.indexOf('listNav') == -1 && existence) {
                this.showPlayerInterface = !this.showPlayerInterface;
            }
        },
        // 切换界面
        mainInterfaceSwitch(e) {
            if(e.target.className.indexOf('player') != -1  || e.target.className.indexOf('line') != -1){
                this.mainInterfaceState = !this.mainInterfaceState;
            }
        },
        // 播放开关
        playerFlag() {
            if(this.existence) {
                this.playerState = !this.playerState;
                this.playerState ? this.audio.play() : this.audio.pause();
            }
        },
        // 播放列表开关
        preparesFlag() {
            this.prepareFlag = !this.prepareFlag;
        },
        // 播放界面
        prepareListInterface(e) {
            let className = e.target.className;
            if(className == 'prepareList'){
                this.prepareFlag = !this.prepareFlag;
            }
        },
        // 播放列播放
        requestPlayer(index) {
            let songId = this.prepareList[index].songId;
            this.requestDeploy(songId);
        },
        // 播放配置项
        requestDeploy(songId,songList,state){
            if(songId != this.songId) {
                this.songId = songId;
                this.getSongData(songId,songList,state)
            }
        },
        // 清除播放列所有歌曲/数据
        clearAll(){
            this.prepareList = [];
            this.songId = '';
            this.prepareFlag = true;
            this.existence = false;
            this.songInfo = {}
            this.audio.src = '';
            this.playerState = false;
        },
        // 删除播放列中歌曲
        remove(index) {
            let prepareList = this.prepareList;
            let nowId = this.songId;
            let songId = prepareList[index].songId;
            prepareList.splice(index,1);
            if(prepareList.length > 0) {
                if(nowId == songId) {
                    let songId;
                    if(index > 0 && index < prepareList.length) {
                        songId = prepareList[index].songId;
                    }else {
                        songId = prepareList[0].songId;
                    }
                    this.requestDeploy(songId)
                }
            }else{
                this.clearAll()
            }
        },
        // 添加本地存储
        addCache(cacheName,insertData) {
            // 添加缓存记录
            let cacheData = JSON.parse(localStorage.getItem(cacheName));
            // 本地存储数据是否存在
            if(cacheData) {
                if(cacheName == 'historyPlayer') {
                    // 预防空值插入
                    let indexs = cacheData.findIndex(item => item == undefined || item == null);
                    if((indexs || indexs == 0) && indexs >= 0 ){
                        cacheData.splice(indexs,1);
                        localStorage.setItem(cacheName,JSON.stringify(cacheData));
                    }
                    // 当前播放音乐是否存在列表中
                    let seek = cacheData.map(item => {
                        if(item.songId == insertData.songId) {
                            return item;
                        }
                    })
                    let index = seek.findIndex(item => item !== undefined);
                    // 当前播放歌曲不是排在最前
                    if(index !== 0){
                        if(index && index > 0) {
                            let temporary = cacheData[index];
                            cacheData.splice(index,1);
                            cacheData.unshift(temporary);
                        }else{
                            cacheData.unshift(insertData);
                        }
                        localStorage.setItem(cacheName,JSON.stringify(cacheData));
                    }
                }
                if(cacheName == 'playerList' || cacheName == 'currentSong') {
                    localStorage.setItem(cacheName,JSON.stringify(insertData));
                }
            }else{
                if(cacheName == 'historyPlayer') {
                    let songList = new Array;
                    songList.push(insertData);
                    localStorage.setItem(cacheName,JSON.stringify(songList));
                }
                if(cacheName == 'playerList' || cacheName == 'currentSong') {
                    localStorage.setItem(cacheName,JSON.stringify(insertData));
                }
            }
        },
        // 上一首
        prev() {
            let id = this.songId;
            let prepareList = this.prepareList;
            let index = prepareList.findIndex(item => id == item.songId);
            let prev = index - 1;
            if(prev >= 0) {
                let songId = prepareList[prev].songId;
                this.requestDeploy(songId);
            }
        },
        // 下一首
        next() {
            let id = this.songId;
            let prepareList = this.prepareList;
            let index = prepareList.findIndex(item => id == item.songId);
            let next = index + 1;
            if(next < prepareList.length) {
                let songId = prepareList[next].songId;
                this.requestDeploy(songId);
            }
        },
        // 播放结束
        playerEnd() {
            let audio = this.audio;
            let currentTime = audio.currentTime | 0;
            let totalTime = audio.duration | 0;
            if(currentTime && totalTime && currentTime == totalTime) {
                audio.currentTime = 0;
                audio.src = '';
                let id = this.songId;
                let prepareList = this.prepareList;
                let index = prepareList.findIndex(item => id == item.songId);
                let next = index + 1;
                if(next < prepareList.length) {
                    let songId = prepareList[next].songId;
                    this.requestDeploy(songId);
                }
                console.log('结束');
            }
        },
        // 歌词滚动
        songWordsRoll() {
            // 获取当前进度
            let screenHeight = document.documentElement.clientHeight;
            // 歌词滚动元素
            let songWordsList = document.querySelector('.songWordsList');
            let audio = this.audio;
            let currentTime = audio.currentTime.toFixed(1);
            this.songWordsList.forEach((item,index) => {
                if(currentTime == item.time){
                    this.songWordsList[index].highlight = true;
                    if(index > 0) this.songWordsList[index - 1].highlight = false;
                    // 超过屏幕一半
                    if(item.top >= screenHeight / 2) {
                        if(this.songWordsList[index + 1] && this.autoScroll) {
                            let top = this.songWordsList[index + 1].top - screenHeight / 2 ;
                            songWordsList.scrollTop = top;
                        }
                    }
                }
            })
        },
        // 歌曲收藏
        like() {
            let likeData = JSON.parse(localStorage.getItem('like'));
            if(likeData) {
                let index = likeData.findIndex(item => item.songId == this.songId);
                if(index != -1) {
                    likeData.splice(index,1);
                }else{
                    likeData.unshift(this.songInfo);
                }
            }else{

                likeData = [this.songInfo]
            }
            
            localStorage.setItem('like',JSON.stringify(likeData));
            this.queryLike();
            Bus.$emit('requestLike',likeData);
        },
        // 获取歌曲是否为收藏状态
        queryLike() {
            let like = JSON.parse(localStorage.getItem('like'));
            if(like){
                let index = like.findIndex(item => item.songId == this.songId);
                if(index != -1) {
                    this.likeState = true;
                }else{
                    this.likeState = false;
                }
            }else{
                this.likeState = false;
            }
        }
    },
    mounted() {
        let _this = this;
        // 创建音频
        const audio = new Audio();
        this.audio = audio;

        // 缓存歌曲ID
        let songId = JSON.parse(localStorage.getItem('currentSong'));
        if(songId) {
            this.requestDeploy(songId,'',true);            
        }

        // 缓存歌曲列表
        let playerList = JSON.parse(localStorage.getItem('playerList'));
        if(playerList) {
            this.prepareList = playerList;
        }

        this.queryLike();


        // 播放
        Bus.$on('requestPlayer',(songId,songList) => {
            if(songId && songList){
                this.requestDeploy(songId,songList);
            }
        })

        Bus.$on('requestcancel',() => {
            console.log('213')
            this.queryLike();
        })


    }
}
</script>

<style scoped>
    *{
        box-sizing:border-box;
    }
    .playerInterface{
        position: fixed;
        width:100%;
        left:0;
        top:0;
        z-index:999;
    }
    .playerBar{
        position: absolute;;
        width:100%;
        height:3rem;
        top:calc(100vh - 3rem);
        left:0;
        display:flex;
        background-color:#fff;
        box-sizing:border-box;
        padding:0 .5rem;
        line-height:3rem;
    }
    .playerBar .turntable{
        height:3rem;
        width:3rem;
        background-color:white;
        box-shadow:0px 0px 10px 2px rgba(0,0,0,.25);
        border-radius:3rem;
        background-size:100% auto;
        background-position:center;
        background-repeat:no-repeat;
        margin-top:-.5rem;
        animation:rotate 15s linear infinite;
        animation-play-state:paused;
    }
    .playerBar .existence{
        text-align:center;
        font-size:1.5rem;
    }
    .playerBar .songInfo{
        font-size:.9rem;
        margin:0 auto 0 1rem;
    }
    .playerBar .playerFlag span{
        font-size:1.8rem;
    }
    .run{
        animation-play-state:running !important;
        transform-origin:center;
        line-height:0;
    }
    @keyframes rotate {
        0%{
            padding:0;
            transform:rotate(0deg);
        }
        100%{
            transform:rotate(360deg);            
        }
    }
    .playerBar .prepareNav{
        margin-left:1rem;
    }
    .playerBar .prepareNav span{
        color:#333;
        font-size:1.5rem;
    }
    .prepareList{
        position:fixed;
        top:0;
        width:100%;
        height:100vh;
        padding-top:50vh;
        background-color:rgba(0,0,0,.1);
        transition:top .2s ease-in-out;
        z-index:999;
    }
    .prepareList .container{
        height:100%;
        padding: 0 2vw;
        background-color:#fff;
        border-radius:.8rem .8rem 0 0;
        overflow:hidden;
    }
    .prepareList .list{
        display:flex;
    }
    .prepareList .set{
        height:6vh;
        line-height:6vh;
        border-bottom:1px solid #efefef;
    }
    .prepareList .set .title{
        padding-left:.5rem;
        font-size:1rem;
    }
    .prepareList .set .allDelete{
        margin-left:auto;
        padding:0 .3rem;
    }
    .prepareList ul{
        height:calc(100% - 6vh);
        overflow-y:auto;
        position:relative;
    }
    .prepareList.top{
        top:100%;
        background-color:rgba(0,0,0,0);
    }
    .prepareList li{
        color:#666;
    }
    .prepareList .state span{
        padding-right:.5rem;
        color:red;
    }
    .prepareList li .songInfo {
        line-height:3;
        padding-left:.3rem;
    }
    .prepareList li .songName{
        font-size:.95rem;
        color:#333;
    }
    .prepareList li .singer{
        font-size:.6rem;
    }
    .prepareList .icon{
        display:flex;
        align-items:center;
        line-height:1;
    }
    .prepareList .delete{
        margin-left:auto;
    } 
    .prepareList .delete span{
        font-size:1.5rem;
    }
    .playerBar .LAY{
        padding:0 10vw;
        text-decoration:none;
        text-align:center;
    }
    .playerBar .LAY span{
        display:block;
    }
    .playerBar .LAY .icon{
        font-size:1.5rem;
        color:#000;
    }
    .playerBar .LAY .text{
        font-size:.6rem;   
        line-height:2;
        color:#999;
    }
    .playerBar .me .icon{
        border-radius:100px;
        background:url(../../assets/pic.png) center/100% auto no-repeat;
        width:1.6rem;
        height:1.6rem;
    }
    .mainInterface{
        position: absolute;
        top:0;
        left:0;
        width:100%;
        box-sizing:border-box;
        height:100vh;
        overflow:hidden;
        transition:.2s linear;
        background-color:#333;
    }
    .mainInterface .vagueBG{
        position:absolute;
        left:0;
        width:inherit;
        height: inherit;
        filter:blur(30px);
        opacity:.5;
    }
    .mainInterface .home{
        color:#fdfdfd;
        padding:0 3vw;
        height:100vh;
        position:absolute;
        overflow-y:auto;
        width:100%;
        scroll-snap-type:y mandatory;
    }
    .home .part{
        height:100vh;
		scroll-snap-align:end;
    }
    .mainInterface .home .title-name{
        text-align:center;
        position:relative;
        padding-top:3vh;
        margin-bottom:5vh;
    }
    .mainInterface .home .title-name p{
        font-size:1rem;
        line-height:2;
    }
    .mainInterface .title-name .icon{
        font-size:1.2rem;
        position:absolute;
        left:.2rem;
        top:1.25rem;
        transform:rotate(-90deg);
        cursor:pointer;
    }
    .mainInterface .player{
        width:18.75rem;
        height:18.75rem;
        margin:0 auto 5.375rem auto;
        border-radius:18.75rem;
        background-size:100% auto;
        background-position:center;
        background-repeat:no-repeat;
        position:relative;
        box-shadow:0 0 1rem .38px rgba(0,0,0,.3);
        overflow:hidden;
        animation:rotate 25s linear infinite;
        animation-play-state:paused;
    }
    .mainInterface .progress-bar{
        font-family:'微软雅黑';
        font-size:.8rem;
        display:flex;
        padding:.5rem 0;
        align-items:center;
        line-height:5;
    }
    .mainInterface .progress-bar .range{
        -webkit-appearance: none;
        background-color:#ccc;
        width:100%;
        height:.1rem;
        margin:0 .8rem;
        outline:none;
    }
    .mainInterface .progress-bar .range::-webkit-slider-thumb{
        -webkit-appearance: none;
        width:1rem;
        height:1rem;
        border-radius:1rem;
        background-color:#fff;
    }
    .mainInterface .control{
        display:flex;
        justify-content:space-around;
    }
    .mainInterface .control span{
        font-size:1.8rem;
        line-height:3.4rem;
    }
    .mainInterface .playerFlag span{
        border:1px solid #fff;
        border-radius:1.8rem;
        padding:.8rem;
    }
    .mainInterface .control .prepare span{
        font-size:1.3rem;
    }
    .mainInterface .control .active-like{
        color:red;
    }
    .comment h3{
        color:#fff;
        text-align:center;
        font-weight:normal;
        font-size:1.1rem;
        height:3rem;
        padding-top:2rem;
        box-sizing:content-box;
    }
    .comment ul{
        height:calc(100vh - 5rem);
        overflow-y:scroll;
        
    }
    .comment .commentBlock{
        display:flex;
    }
    .comment .blockLeft{
        margin-right:.625rem;
    }
    .comment .blockLeft img{
        width:2.4rem;
        height:auto;
        border-radius:2.4rem;
    }
    .comment .blockRight {
        width:100%;
        padding-bottom:.8rem;
        margin-bottom:.5rem;
        color:#ccc;
    }
    .comment .blockRight .userName{
        font-size:1rem;
        line-height:2.4;
        color:orange;
    }
    .comment .blockRight .commentContent{
        font-size:.8rem;
        text-align: justify;
        line-height:2;
        margin-bottom:.625rem;
    }
    .comment .blockRight .praise{
        display:block;
        font-size:.6rem;
        text-align:right;
    }
    .songWordsList{
        color:#ccc;
        height:100vh;
        overflow-y:auto;
        position:absolute;
        width:100%;
        scroll-behavior:smooth;
    }
    .songWordsList ul{
        transition:margin .3s ease-out;
        padding:0 2vw;
    }
    .songWordsList li{
        text-align:center;
        font-size:.95rem;
        line-height:3;
    }
    .highlight{
        color:#30d6a8;
    }
    .top{
        top:100vh !important;
    }
    .hidden{
        z-index:-999;
        height:0;
        overflow:hidden;
        visibility:hidden;
    }
</style>