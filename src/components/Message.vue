<script setup lang="ts">
import { ROLE } from '@app/constants/dictionary'
import avatar1 from '@app/assets/avatar1.png'
import avatar2 from '@app/assets/avatar2.jpg'

const props = defineProps(['content', 'role', 'msgtype', 'isinputting'])

function isUser(role: string) {
    return role === ROLE.USER
}

function getAvatar(role: string) {
    let avatarPicUrl = avatar1;
    if (role === ROLE.USER) {
        avatarPicUrl = avatar2;
    }
    return avatarPicUrl
}

</script>

<template>
    <div class="message_line" :class="{ user: isUser(role) }">
        <div class="avatar">
            <img :src="getAvatar(role)">
        </div>
        <div class="record" v-if="msgtype === 'chat' || !msgtype">
            {{ content }}<i v-if="isinputting"></i>
        </div>
        <div class="record" v-if="msgtype === 'img'">
            <img :src="content" v-if="!isinputting"><i v-if="isinputting"></i>
        </div>
    </div>
</template>
<style scoped lang="less">
.message_line {
    width: 100%;
    display: flex;
    margin-top: 20px;

    .avatar {
        width: 36px;
        height: 36px;
        display: inline-block;

        img {
            width: 100%;
            border-radius: 50%;
        }
    }

    .record {
        max-width: 50%;
        background-color: #f5f5f5;
        line-height: 24px;
        padding: 10px;
        border-radius: 5px;
        white-space: pre-line;
        margin-left: 15px;
        position: relative;
        word-break: break-word;

        img {
            max-width: 100%;
        }

        &:before {
            width: 0;
            content: "";
            position: absolute;
            border-style: solid;
            border-width: 0 10px 10px 0;
            border-color: transparent #f2f2f2;
            top: 20px;
            left: -10px;
        }

        i {
            display: inline-block;
            width: 3px;
            height: 21px;
            position: relative;

            &:after {
                position: absolute;
                top: 4px;
                left: 0;
                content: '';
                width: 100%;
                height: 100%;
                background-color: #71a0e5;
                animation: blink 1s infinite;
            }
        }

        @keyframes blink {
            0% {
                opacity: 0;
            }

            50% {
                opacity: 1;
            }

            100% {
                opacity: 0;
            }
        }

    }

    &.user {
        flex-direction: row-reverse;

        .record {
            margin-left: 0;
            margin-right: 15px;
            background-color: #71a0e5;

            &:before {
                border-color: transparent #71a0e5;
                left: unset;
                right: -10px;
                transform: rotateY(180deg);
            }

        }
    }
}
</style>