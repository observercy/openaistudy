// var fs = require("fs");
import fs from "fs"
import { encode } from 'gpt-3-encoder'

export default class ChatRecord {
    dataPath = ''
    system = {}
    constructor(character, dataPath) {
        this.dataPath = dataPath;
        this.system = { "role": "system", "content": character }
    }

    /**
     * 添加用户消息到消息记录
     * @param {*} message 
     */
    addUserChat(message) {
        let data = []
        if (this.isExistsRecord() && this.readChatRecord().length > 0) {
            data = this.readChatRecord()
            data.push({ "role": "user", "content": message })
        } else {
            data = [
                ...[this.system],
                ...[{ "role": "user", "content": message }]
            ]
        }
        fs.writeFileSync(this.dataPath, JSON.stringify(data, null, 2), 'utf-8');
        return data;
    }

    isExistsRecord() {
        if (fs.existsSync(this.dataPath)) {
            return true
        }
        return false
    }

    readChatRecord() {
        let data = []
        let filedata = fs.readFileSync(this.dataPath);
        try {
            data = JSON.parse(filedata);
        } catch (error) {
            data = [];
        }
        return data
    }

    addAssistantChat(messages) {
        let data = this.readChatRecord()
        messages.forEach(msg => {
            data.push(msg.message)
            // msg.finish_reason
        });
        fs.writeFileSync(this.dataPath, JSON.stringify(data, null, 2), 'utf-8');
    }

    cutContext(records, max) {
        const systemRecord = records[0];
        let sum = encode(systemRecord.content).length;
        let contextArr = [];
        for (let i = records.length - 1; i >= 0; i--) {
            if (records[i].role !== 'system') {
                const encoded = encode(records[i].content);
                if (sum + encoded.length < max) {
                    sum += encoded.length;
                    contextArr = [...[records[i]], ...contextArr]
                } else {
                    break
                }
            }
        }
        return [...[systemRecord], contextArr].flat()
    }
}

