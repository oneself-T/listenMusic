<template>
    <div class="ranking" v-if="rankingData" >
        <title-name></title-name>
        <div class="header">
            <div class="rankingPic" v-if="rankingData[0]">
                <span class="ranking-name" v-if="ascription">{{ascription}}</span>
                <img :src="rankingData[0].pic" alt="这是一张加载不出的图片">
            </div>
            <p class="ranking-name" v-cloak>{{ascription}}</p>
            <p class="updateTime" v-if="updateTime" v-cloak>更新时间：{{updateTime}}</p>
        </div>
        <div class="songList">
            <ul>
                <li v-for="(item,index) in rankingData" :key="index" @click="requestPlayer(item.songId)">
                    <span class="order">{{index + 1}}</span>
                    <div class="songInfo">
                        <span class="songName">{{item.songName}}</span>
                        <br/>
                        <span class="singer">{{item.singerName}}</span>
                    </div>
                    <span class="iconfont download" @click="download(item.songId,item.time)">&#xe71d;</span>
                </li>
            </ul>
        </div>
        <load></load>
    </div>
    
</template>

<script>
import titleName from './title';
import Bus from '../../../public/bus';
import load from './load';
export default {
    name:'ranking',
    components: {
        titleName,
        load
    },
    data() {
        return {
            rankingData:[],
            ascription:'',
            updateTime:'',
            downloadMusic:'',
            rankingInfo:[{id:3,rankingName:'云音乐飙升榜'},{id:1,rankingName:'云音乐热歌榜'},{id:0,rankingName:'云音乐新歌榜'},{id:4,rankingName:'云音乐电音榜'},{id:5,rankingName:'UK排行榜周榜'}]
        }
    },
    methods:{
        requestPlayer(songId) {
            let url = `http://localhost:3000/song/url?id=${songId}`;
            this.request(url)
             .then(res => {
                if(res.code == 200) {
                    let playerURL = res.data[0].url;
                    Bus.$emit('requestPlayer',songId,this.rankingData);
                }
             })
        },
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
        download(songId,time) {
            let url = `http://localhost:3000/song/url?id=${songId}`;
            this.request(url)
             .then(res => {
                if(res.code == 200) {
                    let playerURL = res.data[0].url;
                    this.downloadMusic.href = playerURL;
                    this.downloadMusic.down = 'music'+time;
                    this.downloadMusic.click();
                }
             })
        },
        // 数据请求
        request(url, format = true) {
            return fetch(url).then(res => format ? res.json() : res.text());
        }

    },
    mounted() {
        // window.open('https://v1.itooi.cn/tencent/url?id=000wocYU11tSzS');
        let downloadMusic = document.createElement('a');
        this.downloadMusic = downloadMusic;
        let rankingId = this.$route.query.rankingId;
        if(rankingId) {
            let url = `http://localhost:3000/top/list?idx=${rankingId}`;
            this.request(url)
                .then(res => {
                    if(res.code == 200) {
                        // 列表数据
                        let data = res.playlist.tracks;
                        let rankingData = data.map(item => {
                            let singerList = item.ar;
                            return {
                                songId:item.id,
                                songName:item.name,
                                singerName:this.parseName(singerList),
                                pic:item.al.picUrl,
                                time:item.al.pic_str,
                            }
                        })
                        this.rankingData = rankingData;
                        // 榜单归类
                        let ascription = this.rankingInfo.filter(item => item.id == rankingId)
                        this.ascription = ascription[0].rankingName;
                        // 更新时间
                        let getTime = res.playlist.trackNumberUpdateTime;
                        let date = new Date(getTime);
                        let year = date.getFullYear();
                        let month = date.getMonth()+1;
                        let day = date.getDate();
                        let updateTime = `${year}年${month}月${day}日`;
                        this.updateTime = updateTime;
                    }
                }).then(() => {
                    Bus.$emit('show','hidden');
                })
        }
    }
}
</script>

<style scoped>
    .ranking{
        height:100vh;
        overflow-y:auto;
        padding-bottom:3.8rem;
    }
    .header{
        margin-bottom:2rem;
        text-align:center;
    }
    .header .rankingPic{
        width:55%;
        margin:0 auto .5rem;
        position:relative;
        border-radius:1rem;
        overflow:hidden;
        box-shadow:0 7px 13px rgba(0,0,0,.21);
        line-height:0;
    }
    .header .rankingPic .ranking-name{
        color: #efefef;
        position: absolute;
        left: 50%;
        top: 50%;
        white-space: nowrap;
        transform: translate(-50%,-50%);
        font-size:1.6rem;
    }
    .header .rankingPic img{
        width:100%;
        height:auto;
    }
    .header .rankingPic:before{
        content:'';
        position:absolute;
        width:100%;
        height:100%;
        top:0;
        left:0;
        background-color:rgba(0,0,0,.5);
    }
    .header >p {
        font-size:1rem;
        line-height:2;
    }
    .header >.ranking-name{
        font-size:1.2rem;
    }
    .header .updateTime{
        font-size:.9rem;
        color:#808080;
    }
    .songList li{
        display:flex;
        align-items:center;
        margin-bottom:.625rem;
    }
    .songList li .order{
        flex:1;
        text-align:center;
        margin-right:.6rem;
        color:#555;
    }
    .songList li .songInfo{
        font-size:.9rem;
        flex:10;
        overflow:hidden;
        text-overflow:ellipsis;
        margin-right:.5rem;
    }
    .songList li .songInfo span{
        line-height:1.6;
    }
    .songList li .singer{
        color:#999;
    }
    .songList li .download{
        flex:1;
        font-size:2rem;
        color:#999;
        margin-left:auto;
    }

</style>