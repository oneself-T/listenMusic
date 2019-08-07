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
        }
    },
    mounted(){
        let dissId = this.$route.query.dissId;
        if(dissId){
            fetch(`https://v1.itooi.cn/tencent/songList?id=${dissId}&pageSize=100&page=0`)
                .then((res) => res.text())
                .then((body) => {
                    let data = JSON.parse(body);
                    if(data.code == 200){
                        let title = data.data[0].dissname;
                        let pic = data.data[0].logo;
                        let desc = data.data[0].desc.replace(/\<br>/g,"\n").replace(/\&#160/g,"");
                        let songList = data.data[0].songlist;
                        let allSongList = songList.map((item,index) => {
                            return {
                                songName: item.title,
                                singerName: item.singer[0].title,
                                songId: item.mid
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