前端原型說明

這是快速前端原型的 `Vite + Vue` 專案目錄。目標是用最少的工程量，展示使用者可見的互動流程：登入、房源列表、房源細節、訊息介面、房東管理與管理員審核。

目錄結構（相對於專案根目錄）：

- `frontend/prototype/src/` — Vue 元件、頁面與 client-side 狀態管理
- `frontend/prototype/public/fixtures/` — JSON 假資料：`users.json`, `listings.json`, `messages.json`
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

- 過去頁面使用 Vue 與 client-side state 來讀取本地假資料，但**現在已切換為串接真實後端 API (`http://localhost:8080`)**。
- 若要快速查看列表與明細，請確保後端伺服器（Spring Boot）已在背景啟動。
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

- 在 `public/fixtures/users.json` 中加入一個 `landlord` 與一個 `admin` 帳號；使用者登入時可用相應帳號模擬不同角色介面。
- `public/fixtures/listings.json` 應包含多個 `published` 與 `pending` 狀態的項目，admin review 頁面會顯示 `pending` 項目以測試發佈與退回流程。

已知技術債與限制（待辦）

- 無後端永續化（變更僅儲存在當前瀏覽器會話或 localStorage）。
- 無檔案上傳或圖片處理，圖片可以用占位符顯示。
- 權限驗證與安全機制為模擬狀態，不應用於生產。

建議的迭代步驟

- 將 fixtures 與 UI 綁定，完成基本搜尋、分頁與過濾；然後加入簡單的訊息模擬流程。（已完成）
- 若要串接真實後端，實作一個小型 HTTP API 並將前端中的 fetch 呼叫切換為真實端點。（**目前已全面串接真實後端**）

作者: 開發團隊原型
日期: 2026-04-18
