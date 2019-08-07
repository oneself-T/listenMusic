<template>
    <div class="index">
        <div class="top">
            <div class="title-name">
                <span>Listen音乐</span>
            </div>
            <!-- 分类栏 -->
            <div class="classfiy">
                <router-link to="/">
                    <span :class="[state ? 'active' : '']">乐库</span>
                </router-link>
                <router-link to="/index/me" >
                    <span :class="[!state ? 'active' : '']">我的</span>
                </router-link>
            </div>
        </div>
        <!-- 主内容 -->
        <router-view></router-view>
        
    </div>
</template>
<script>
import Bus from '../../../public/bus';
export default {
    name:'index',
    data() {
        return {
            state:true
        }
    },
    methods:{

    },
    mounted() {
        let url = window.location.hash;
        if(url == '#/'){
            this.state = true;
        }
        if(url == '#/index/me'){
            this.state = false;
        }
         Bus.$on('page',(page) => {
            if(page == 'musicLibrary') {
                this.state = true;
            }
            if(page == 'me') {
                this.state = false;
            }
        })
    }
    
}
</script>
<style scoped>
    *{
        box-sizing:border-box;
    }
    a{
        text-decoration:none;
        display:block;
    }
    .index{
        padding-bottom:3.8rem;
        height:100vh;
        overflow-y:auto;
    }
    .index .classfiy a{
        color:#333;
    }
    .top{
        position:fixed;
        width:100%;
        left:0;
        top:0;
        z-index:1;
        background-color:#fafafa;
        padding: 0 3vw;
    }
    .title-name{
        text-align:center;
        height:5rem;
        line-height:5rem;
        font-size:1.1rem;
    }
    .index .classfiy{
        height:2.5rem;
        display:flex;
        justify-content: space-around;
    }
    .classfiy span{
        font-size:1rem;
        color:#666;
    }
    .classfiy .active{
        font-size:1.1rem;
        color:#333;
    }
    
</style>