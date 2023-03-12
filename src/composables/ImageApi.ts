import { nextTick, ref } from 'vue'

/**
 * 发送图像生成消息函数
 * @param inputText 输入的内容
 * @returns 
 */
export function imageApi(inputText: string) {
    const isinputting = ref(true)
    const message = ref('')

    fetch(`${import.meta.env.VITE_SERVERURL}/drawing`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ msg: inputText }),

    }).then(async response => {
        const data = await response.json();
        if (data.code === 0) {
            message.value = data.url;
            isinputting.value = false;
        }

    }).catch(async error => {
        message.value = "请求异常：" + error;
        await nextTick()
        isinputting.value = false;

    });

    return { isinputting, message }

}
