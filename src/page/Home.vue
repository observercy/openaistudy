<script setup lang="ts">
import { ref } from '@vue/reactivity';
import { nextTick, onMounted, reactive, watchEffect } from 'vue';
import Message from '@app/components/Message.vue';
import { ROLE } from '@app/constants/dictionary';

import { chatApi } from '@app/composables/ChatApi'
import { imageApi } from '@app/composables/ImageApi'
let msg = ref('');
let messages: any = reactive({
    value: []
});
const chat = ref()

function sendToServer() {
    let type = 'chat';
    if (!msg.value) {
        return
    }
    if (msg.value.match(/^\[图\]/)) {
        type = 'img';
    }
    messages.value.push({
        role: ROLE.USER,
        content: msg.value,
    }, {
        role: ROLE.ASSISTANT,
        content: '',
        type: type
    });
    let inputText = msg.value;
    msg.value = '';
    const { isinputting, message } = type === 'img' ? imageApi(inputText) : chatApi(inputText, true);

    const sendFun = watchEffect(() => {
        messages.value[messages.value.length - 1].isinputting = isinputting.value;
        debugger
        if (!isinputting.value && type !== 'img') {
            sendFun()
            return;
        }
        messages.value[messages.value.length - 1].content += message.value;
        nextTick(() => {
            chat.value.scrollTo({
                top: chat.value.scrollHeight,
                behavior: "smooth"
            });
            if (!isinputting.value) {
                sendFun()
            }
        })

    }, { flush: 'post' })
}
function getRecords() {
    return new Promise<void>((resolve, reject) => {
        fetch(`${import.meta.env.VITE_SERVERURL}/getRecords`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
        }).then(async response => {
            const data = await response.json();
            if (data.code === 0) {
                resolve(data.messages)
            }
        });
    })
}

onMounted(() => {
    getRecords().then((res) => {
        messages.value = res;
        nextTick(() => {
            chat.value.scrollTo({
                top: chat.value.scrollHeight,
                behavior: "smooth"
            });
        })

    })
})



</script>

<template>
    <div class="chat_record" ref="chat">
        <Message v-for="item in messages.value" :content="item.content" :role="item.role" :msgtype="item.type"
            :isinputting="item.isinputting">
        </Message>
    </div>
    <div class="chat_tools">
        <input type="text" class="chat_input" v-model="msg" placeholder="按回车发送消息" @keyup.enter="sendToServer()">
    </div>
</template>
<style scoped lang="less">
.chat_record {
    max-width: 100%;
    height: calc(100% - 48px - 24px);
    overflow-y: scroll;
    padding: 0 10px;
}

.chat_tools {
    margin-top: 24px;
    width: 100%;
    display: flex;
}

.chat_input {
    width: 100%;
    height: 48px;
    border-radius: 5px;
    border: 0;
    font-size: 20px;
    padding: 0 10px;
}
</style>