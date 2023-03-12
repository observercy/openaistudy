import { Configuration, OpenAIApi } from "openai";

export default class OpenAi {
    openai;
    temperature = 0.6;
    constructor(APPKEY, TEMPERATURE) {
        const configuration = new Configuration({
            apiKey: APPKEY,
        });
        this.openai = new OpenAIApi(configuration);
        this.temperature = Number(TEMPERATURE);
    }

    send(context) {
        return new Promise(async (resolve) => {
            const completion = await this.openai.createChatCompletion({
                model: 'gpt-3.5-turbo',
                messages: context,
                temperature: this.temperature,
            });
            resolve(completion.data.choices)
        })
    }
    async sendStream(context, readfun) {
        let allMessage = ''
        return new Promise(async (resolve) => {
            try {
                const res = await this.openai.createChatCompletion({
                    model: 'gpt-3.5-turbo',
                    messages: context,
                    temperature: this.temperature,
                    stream: true,
                }, { responseType: 'stream' });

                res.data.on('data', data => {
                    const lines = data.toString().split('\n').filter(line => line.trim() !== '');
                    for (const line of lines) {
                        const message = line.replace(/^data: /, '');
                        if (message === '[DONE]') {
                            console.log(allMessage);
                            resolve([{
                                message: {
                                    "role": "assistant",
                                    "content": allMessage
                                }
                            }])
                            return;
                        }
                        try {
                            const parsed = JSON.parse(message);
                            if (parsed.choices[0].delta.content) {
                                readfun(parsed.choices[0].delta.content)
                                allMessage += parsed.choices[0].delta.content;
                            }
                        } catch (error) {
                            resolve(this.errhandle(error))
                        }
                    }
                });
            } catch (error) {
                if (error.response?.status) {
                    console.error(error.response.status, error.message);
                    error.response.data.on('data', data => {
                        const message = data.toString();
                        try {
                            const parsed = JSON.parse(message);
                            resolve(this.errhandle(parsed))
                        } catch (error) {
                            resolve(this.errhandle(message))
                        }
                    });
                } else {
                    resolve(this.errhandle(error))
                }
            }
        })

    }
    errhandle(err) {
        return [{
            message: {
                "role": "assistant",
                "content": err
            }
        }]
    }

    async createImage(context) {
        return new Promise(async (resolve) => {
            const completion = await this.openai.createImage({
                prompt: context,
                n: 1,
                size: '1024x1024',
            });
            resolve(completion.data.data[0]['url'])
        })
    }


}
