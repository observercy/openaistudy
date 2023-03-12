import express from 'express';
import OpenAi from './openai.js'
import ChatRecord from './chatRecord.js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url';
import { encode } from 'gpt-3-encoder'

const filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(filename);
dotenv.config({ path: path.join(__dirname, '../config/.env') })


const app = express()
app.use(express.json());

app.all("*", function (req, res, next) {
    // 设置允许跨域的域名,*代表允许任意域名跨域
    res.header('Access-Control-Allow-Origin', '*');
    // 允许的header类型
    res.header('Access-Control-Allow-Headers', 'content-type');
    // 跨域允许的请求方式
    res.header('Access-Control-Allow-Methods', 'DELETE,PUT,POST,GET,OPTIONS');
    if (req.method.toLowerCase() == 'options')
        res.send(200); // 让options 尝试请求快速结束
    else
        next();
})

const openaiApiService = new OpenAi(process.env.APPKEY, process.env.TEMPERATURE);
const chatRecordService = new ChatRecord(process.env.CHARACTER, process.env.RECORDPATH);



app.post('/openaiApi', async (request, response) => {
    const msg = request.body?.msg;
    const stream = request.body?.stream;
    if (!msg) {
        res.send(500);
        return
    }

    let context = await chatRecordService.addUserChat(msg);
    let totalToken = 0;
    context.forEach(item => {
        const encoded = encode(item.content);
        totalToken += encoded.length
    });
    // 由于openai的token有4096的上限，需要裁剪请求内容，规则为人物设定加最近的信息总tokens熟小于4096减去预测的最大返回tokens数
    const maxtokenNums = 4096 - process.env.LEFTTOKENSNUM;
    if (totalToken > maxtokenNums) {
        context = chatRecordService.cutContext(context, maxtokenNums);
        console.log(context)
    }
    if (stream) {
        response.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
        response.setHeader('Cache-Control', 'no-cache');
        await openaiApiService.sendStream(context, (content) => {
            console.log(content)
            response.write(content);
        }).then(async messages => {
            await chatRecordService.addAssistantChat(messages);
            console.log(messages)
            response.end()
        })
    } else {
        await openaiApiService.send(context).then(async messages => {
            const resObj = {
                code: 0,
                messages: messages
            }

            chatRecordService.addAssistantChat(messages);
            console.log(messages)
            response.send(JSON.stringify(resObj));
        })
    }


});


app.post('/getRecords', async (request, response) => {
    let messages = []
    if (chatRecordService.isExistsRecord()) {
        messages = chatRecordService.readChatRecord();
        if (messages.length > 1) {
            messages.shift()
        }
    }

    const resObj = {
        code: 0,
        messages: messages
    }
    response.send(JSON.stringify(resObj));
});



app.post('/drawing', async (request, response) => {
    let msg = request.body?.msg;
    if (!msg) {
        res.send(500);
        return
    }
    msg = msg.replace('[图]', '')

    await openaiApiService.createImage(msg).then(async url => {
        const resObj = {
            code: 0,
            url: url
        }
        response.send(JSON.stringify(resObj));
    })



});


app.listen(8080, (err) => {
    if (!err) { console.log('服务启动成功') }
});


