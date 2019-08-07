<template>
    <div class="search">
        <title-name></title-name>
        <div class="search-input">
            <span class="icon iconfont">&#xe615;</span>
            <input type="text" class="input" @keyup="input" v-model="inputContent">
        </div>
        <div class="result-list">
            <ul>
                <li v-for="(item,index) in searchList" @click="enterPlayer(index)" :key="index">
                    <p class="songName">{{item.songName}}</p>
                    <p class="songInfo">
                        <span>{{item.singerName}}</span>
                        <span> - </span>
                        <span>{{item.albumName}}</span>
                    </p>
                </li>
            </ul>
        </div>
        <load></load>
    </div>
</template>

<script>
import TitleName from './title';
import Bus from '../../../public/bus';
import load from './load';
export default {
    components:{
        TitleName,
        load
    },
    data() {
        return {
            inputContent:'',
            searchList:[]
        }
    },
    methods: {
        // 获取搜索结果
        input(e) {
            switch(e.keyCode) {
                case 13:
                    this.searchSong();
                    break;
            }
        },
        // 获取播放歌曲id
        enterPlayer(index) {
            let songId = this.searchList[index].songId;
            let searchList = this.searchList;
            Bus.$emit('requestPlayer',songId,searchList);
        },
        // 搜索请求
        searchSong() {
            let value = this.inputContent;
            if(value.length > 0){
                Bus.$emit('show','show');
                fetch(`https://v1.itooi.cn/tencent/search?keyword=${value}&type=song&pageSize=600&page=0`)
                    .then((res) => res.text())
                    .then((body) => {
                        let data = JSON.parse(body);
                        if(data.code == 200){
                            let allData = data.data.list.map((item,index) => {
                                return {
                                    songId: item.songmid,
                                    songName: item.songname,
                                    singerName: item.singer[0].name,
                                    albumName: item.albumname
                                }
                            })
                            this.searchList = allData;
                        }
                    })
                    .then(() => {
                        Bus.$emit('show','hidden');
                    })
            }else{
                this.searchList = [];
            }
        }
    },
    mounted() {
        this.$nextTick(() => {
            Bus.$emit('show','hidden');
        })
    }
}
</script>

<style scoped>
    .search{
        min-height: 100vh;
        padding-bottom:3.5rem;
    }
    .search-input{
        background-color:#fff;
        height:2.25rem;
        line-height:2.25rem;
        border-radius:2.25rem;
        overflow:hidden;
        display:flex;
        margin-bottom:1rem;
    }
    .search-input .icon{
        padding:0 .75rem 0 1.125rem;
    }
    .search-input .input{
        outline:none;
        border:none;
        width:100%;
    }
    .result-list li{
        margin-bottom:1rem;
    }
    .result-list .songName{
        font-size:1rem;
        line-height:2;
    }
    .result-list .songInfo{
        color:#666;
        font-size:.8rem;
        line-height:1.5;
    }
    
</style>