import { nextTick, ref } from 'vue'

/**
 * 发送消息函数
 * @param inputText 输入的内容
 * @param stream 请求方式 true：流方式（可以持续接收流，直到响应关闭） false:等待openai响应完成后一次返回
 * @returns 
 */
export function chatApi(inputText: string, stream = true) {
    const isinputting = ref(true)
    const message = ref('')

    fetch(`${import.meta.env.VITE_SERVERURL}/openaiApi`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ msg: inputText, stream: stream }),

    }).then(async response => {
        if (stream) {
            const reader = response?.body?.getReader();
            const decoder = new TextDecoder();
            function read() {
                reader!.read().then(({ done, value }) => {
                    if (done) {
                        isinputting.value = false
                        return;
                    }
                    const text = decoder.decode(new Uint8Array(value));
                    message.value = text
                    console.log('接收数据', text);
                    read();
                });
            }
            read();
        } else {
            const data = await response.json();
            if (data.code === 0) {
                isinputting.value = false;
                message.value = data.messages[0].message.content
            }
        }

    }).catch(async error => {
        message.value = "请求异常：" + error;
        await nextTick()
        isinputting.value = false;

    });

    return { isinputting, message }

}
