<template>
    <div class="load" v-if="show">
        <div class="bouncing-loader">
            <div class="ball"></div>
            <div class="ball"></div>
            <div class="ball"></div>
            <span>请稍等...</span>
        </div>
    </div>
</template>

<script>
import Bus from '../../../public/bus';
export default {
    name:"load",
    data() {
        return {
            show:true
        }
    },
    mounted() {
        Bus.$on('show',(state) => {
           if(state == 'hidden') {
               this.show = false;
           }
           if(state == 'show') {
               this.show = true;
           }
        })
    }
}
</script>

<style>
    .load{
        width:100vw;
        height:100vh;
        position:fixed;
        top:0;
        left:0;
        background-color:rgba(255,255,255,1);
        z-index:999;
    }
    @keyframes bouncing-loader {
        from {
            opacity: 1;
            transform: translateY(0);
        }
        to {
            opacity: 0.1;
            transform: translateY(-1rem);
        }
	}
	.bouncing-loader {
        display: flex;
        justify-content: center;
        position:absolute;
        top:50%;
        width:100%;
        transform:translateY(-50%);
    }
    .bouncing-loader >span {
        position:absolute;
        bottom:0;
        left:50%;
        transform:translateX(-50%);
        color:#666;
        font-size:1rem;
    }
	.bouncing-loader > .ball {
        width: 1rem;
        height: 1rem;
        margin: 3rem 0.2rem;
        background: #8385aa;
        border-radius: 50%;
        animation: bouncing-loader 0.6s infinite alternate;
	}
	.bouncing-loader > .ball:nth-child(2) {
        animation-delay: 0.2s;
	}
	.bouncing-loader > .ball:nth-child(3) {
        animation-delay: 0.4s;
    }

    
</style>