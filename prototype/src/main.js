import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

import { setMode } from "./lib/store"; //TMP
setMode("memory"); //TMP

createApp(App).use(router).mount("#app");
