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

- 頁面使用 Vue 與 client-side state 來讀取 `public/fixtures/` 的資料，所有互動均發生在瀏覽器端（localStorage / memory），不會呼叫後端。
- 若要快速查看列表與明細，可以使用對應 Vue 路由或單頁元件。
- UI 文案使用繁體中文。

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

- 將 fixtures 與 UI 綁定，完成基本搜尋、分頁與過濾；然後加入簡單的訊息模擬流程。
- 若要串接真實後端，實作一個小型 HTTP API 並將前端中的 fetch 呼叫切換為真實端點。

作者: 開發團隊原型
日期: 2026-04-18
