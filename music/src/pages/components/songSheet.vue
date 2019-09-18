<template>
    <div class="songSheet" v-if="songSheetInfo">
        <title-name></title-name>
        <div class="songSheetInfo">
            <div class="songSheetPic">
                <img :src="songSheetInfo.pic" alt="这是一张加载不出的图片">
            </div>
            <div class="introduce" v-if="songSheetInfo">
                <h2 class="title">{{songSheetInfo.title}}</h2>
                <p class="desc">{{songSheetInfo.desc}}</p>
            </div>
        </div>
        <div class="songList">
            <div class="row title">
                <span class="songName">歌曲</span>
                <span class="singerName">歌手</span>
            </div>
            <div 
                class="row"
                v-for="(item,index) in songSheetInfo.allSongList"
                :key="index"
                @click="requestPlayer(index)"
            >
                <span class="songName">{{item.songName}}</span>
                <span class="singerName">{{item.singerName}}</span>
            </div>
        </div>
        <load></load>
    </div>
</template>

<script>
import titleName from './title';
import load from './load';
import Bus from '../../../public/bus';

export default {
    name:'songSheet',
    components:{
        titleName,
        load
    },
    data() {
        return {
            songSheetInfo:{}
        }
    },
    methods:{
        requestPlayer(index){
            let songId = this.songSheetInfo.allSongList[index].songId;
            let songList = this.songSheetInfo.allSongList;
            Bus.$emit('requestPlayer',songId,songList);
        },
        // 数据请求
        request(url, format = true) {
            return fetch(url).then(res => format ? res.json() : res.text());
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
        }
    },
    mounted(){
        // 歌单ID
        let dissId = this.$route.query.dissId;
        if(dissId) {
            // 获取歌单详情
            let url = `http://localhost:3000/playlist/detail?id=${dissId}`;
            this.request(url)
                .then(res => {
                    if(res.code == 200){
                        let title = res.playlist.name;
                        let pic = res.playlist.coverImgUrl;
                        let desc = res.playlist.description;
                        let songListID = res.playlist.trackIds;
                        let songListInfo = res.playlist.tracks;
                        
                        let allSongList = songListInfo.map((item,index) => {
                            return {
                                songName: item.name,
                                singerName: this.parseName(item.ar),
                                songId: songListID[index]['id']
                            }
                        })
                        this.songSheetInfo = {title,pic,desc,allSongList};
                    }
                })
                .then(() => {
                    Bus.$emit('show','hidden');
                })
        }
    }
}
</script>

<style>
    .songSheet{
        padding-bottom: 3.8rem;
        overflow-y:auto;
        overflow-x:hidden;
    }
    .songSheetInfo{
        position:relative;
        line-height: 0;
        margin-bottom:1rem;
    }
    .songSheetInfo .songSheetPic{
        width:33%;
        
    }
    .songSheetInfo .songSheetPic img{
        width:100%;
        height:auto;
    }
    .introduce{
        width:63%;
        height:100%;
        position:absolute;
        right:0;
        top:0;
        overflow:hidden;
    }
    .introduce .title{
        font-size:1rem;
        line-height:1.1;
        margin-bottom:.5rem;
    }
    .introduce .desc{
        line-height:1.5;
        font-size:.8rem;
        height:calc(100% - 1.1rem - .5rem);
        display:-webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 5;
        overflow: hidden;
    }
    .songList span{
        white-space:nowrap;
    }
    .songList .title{
        color:#666;
    }
    .songList .row{
        display:flex;
        font-size:.8rem;
        line-height:4;
    }
    .songList .row span{
        overflow:hidden;
        text-overflow:ellipsis;
    }
    .songList .row .songName{
        flex:5;
        margin-right:.625rem;
    }
    .songList .row .singerName{
        flex:2;
    }
</style>