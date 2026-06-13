// Buffer + browser Iroha bridge must load before anything touches the SDK.
import { Buffer } from "buffer";
(globalThis as any).Buffer = (globalThis as any).Buffer ?? Buffer;
import "@/services/irohaBrowserBridge";
import "./tokens.css";

import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";

const app = createApp(App);
app.use(createPinia());
app.mount("#app");