前端原型說明

這是快速前端原型的 `Vite + Vue` 專案目錄。目標是用最少的工程量，展示使用者可見的互動流程：登入、房源列表、房源細節、訊息介面、房東管理與管理員審核。

目錄結構（相對於專案根目錄）：

- `frontend/prototype/src/` — Vue 元件、頁面與 API 串接邏輯
- `frontend/prototype/vite.config.js` — Vite 設定
- `frontend/prototype/vite.config.js` — Vite 設定
- `frontend/prototype/index.html` — Vite 入口頁

如何本機啟動（Vite 範例）

1. 開啟 PowerShell，切換到專案的 `frontend/prototype` 目錄：

```powershell
Set-Location -Path "$(Resolve-Path .)\frontend\prototype"
npm install
npm run dev
```

2. 打開瀏覽器並前往 Vite 顯示的本機網址（通常是 `http://localhost:5173/`）。

備註（開發者提示）

- **現在已全面切換為串接真實後端 API (`http://localhost:8080`)**。不再依賴本地 JSON 假資料。
- 若要正常使用前端系統，**必須確保後端伺服器（Spring Boot）已在背景啟動**，否則會遇到連線錯誤。
- UI 文案使用繁體中文。

## 執行前端測試 (Vitest)

專案目前配有完整的「前端元件端到端 (E2E) 測試」，會直接掛載 Vue 元件並向真實後端發送請求。
在跑測試之前，**請務必確認後端已經啟動**。

```powershell
npm run test
```

> **跳過 E2E 測試：**
> 如果你還沒啟動後端，或是只想跑純前端的單元測試，請加上 `--skip-e2e` 參數來跳過這些需要真實 API 的測試：
> ```powershell
> npm run test -- --skip-e2e
> ```

Vite 開發伺服器說明

- Vite 會提供開發伺服器與熱重載，無需自寫 `serve.js`。
- 若需要預覽 production build，可使用 `npm run build` 後搭配 `npm run preview`。

Admin / Landlord testing notes

- 系統重啟後端時會自動寫入假資料（DemoDataInitializer），預設的測試帳號為：
  - 房東: `landlord` (密碼 `password`)
  - 房客: `tenant` (密碼 `password`)
  - 管理員: `admin` (密碼 `password`)

已知技術債與限制（待辦）

- 圖片暫時以 URL 方式存儲，尚未實作實際圖片檔案上傳。

開發歷程

- 最初將 fixtures 與 UI 綁定，完成基本搜尋、分頁與過濾。
- **目前已全面串接真實後端（Spring Boot + PostgreSQL）**，包含完整的 JWT 登入、WebSocket 聊天室與資料庫永續化。

作者: 開發團隊原型
日期: 2026-04-18
