import { createRouter, createWebHistory } from "vue-router"


const routes = [
    { path: '/', component: () => import('@app/page/Home.vue') }
]


const router = createRouter({
    history: createWebHistory(),
    routes,
})


export default router;