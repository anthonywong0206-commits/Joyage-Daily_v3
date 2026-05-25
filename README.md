# MoodFlow

MoodFlow 是一個可部署到 GitHub Pages / Vercel 的純前端情緒記錄日記網站。

副標題：每天記下自己的情緒。

## 技術

- React 18
- Vite 5.x
- Tailwind CSS 3.x
- lucide-react
- framer-motion
- html2canvas
- localStorage
- 無後端
- 無資料庫
- 無 API Key

## 本機安裝方法

請先安裝 Node.js 18 或以上版本。

```bash
npm install
npm run dev
```

開啟畫面顯示的網址，例如：

```bash
http://localhost:5173
```

## 建立正式版本

```bash
npm run build
```

完成後會產生 `dist` 資料夾。

## GitHub Pages 部署方法

方法一：使用 GitHub Pages + GitHub Actions。

1. 將所有專案檔案上載到 GitHub repository。
2. 在 GitHub repository 進入 Settings。
3. 進入 Pages。
4. Source 選擇 GitHub Actions。
5. 可自行加入 Vite deploy workflow，或在本機執行 `npm run build` 後上載 `dist` 內容到 Pages 分支。

本專案已在 `vite.config.js` 使用：

```js
base: './'
```

所以可支援 GitHub Pages 子路徑部署。

## Vercel 部署方法

1. 將完整專案上載到 GitHub。
2. 到 Vercel 新增 Project。
3. Import 你的 GitHub repository。
4. Framework Preset 選 Vite。
5. Build Command 使用：

```bash
npm run build
```

6. Output Directory 使用：

```bash
dist
```

7. 按 Deploy。

## 如何更新網站檔案

如你只是修改程式：

1. 在電腦解壓 ZIP。
2. 修改相應檔案，例如 `src/App.jsx` 或 `src/index.css`。
3. 上載及覆蓋 GitHub repository 內的同名檔案。
4. Vercel 會自動重新部署。

如使用 GitHub Pages，請重新執行 build 或重新部署。

## 常見問題

### 1. Vercel build failed 點處理？

先在本機執行：

```bash
npm install
npm run build
```

如果本機都失敗，通常是以下原因：

- package.json 被改到 React 19 或 Vite 6/7/8
- import 路徑錯誤
- 刪除了 `src/App.jsx`、`src/main.jsx` 或 `src/index.css`
- 上載漏檔案
- Node.js 版本太舊

本專案指定穩定版本：

```json
"vite": "^5.4.0",
"react": "^18.2.0",
"react-dom": "^18.2.0",
"tailwindcss": "^3.4.0"
```

### 2. 白屏點處理？

請檢查：

- GitHub / Vercel 是否已上載全部檔案
- `index.html` 是否有 `<script type="module" src="./src/main.jsx"></script>`
- `vite.config.js` 是否保留 `base: './'`
- 瀏覽器 Console 是否顯示 missing file / import error
- 不要只上載 `src`，必須連 `package.json`、`index.html`、config 檔案一併上載

### 3. localStorage 資料在哪裡？

資料存在使用者瀏覽器內的 localStorage。

Key 名稱：

```txt
moodflow_records_v1
```

資料不會上傳到伺服器，也不會同步到其他手機或電腦。

如清除瀏覽器資料，紀錄會消失。

### 4. IG Story 圖在哪裡生成？

全部在瀏覽器前端完成，使用 `html2canvas` 生成 1080 x 1920 PNG。

支援 Web Share API 的手機瀏覽器會嘗試直接分享；不支援時會下載 PNG。
