import { createApp } from 'vue'
import { createPinia } from 'pinia'
import VueBlocksTree from 'vue3-blocks-tree';
import './assets/reset.css'
import './assets/main.css'
import 'vue3-blocks-tree/dist/vue3-blocks-tree.css';

import App from './App.vue'
import router from './router'

const defaultoptions = {treeName:'blocks-tree'}

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(VueBlocksTree,defaultoptions)

app.mount('#app')

createApp(App)
