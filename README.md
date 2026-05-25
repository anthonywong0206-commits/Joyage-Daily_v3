# MoodFlow Modern UI 版本

這是 MoodFlow 的現代化介面更新版，風格跟從概念圖方向：

- iOS App-like
- 柔和漸層背景
- 玻璃感卡片
- 半圓情緒轉盤
- 現代月曆紀錄
- 統計分析卡片
- IG Story 圖生成
- Mobile-first
- 支援 GitHub Pages / Vercel
- 保留原本 localStorage Key：`moodflow_records_v1`

## 更新網站方法

### 方法一：直接覆蓋原網站檔案

1. 下載並解壓 ZIP。
2. 將 ZIP 入面的所有檔案上載到你的 GitHub repository。
3. 選擇覆蓋舊檔案。
4. 等 Vercel / GitHub Pages 自動重新部署。

建議覆蓋以下檔案及資料夾：

```txt
package.json
index.html
vite.config.js
postcss.config.js
tailwind.config.js
src/
public/
README.md
```

不要上載 `node_modules`。

## 本機安裝方法

請先安裝 Node.js 18 或以上版本。

```bash
npm install
npm run dev
```

然後打開畫面顯示的網址，例如：

```bash
http://localhost:5173
```

## 建立正式版本

```bash
npm run build
```

成功後會產生：

```txt
dist/
```

## Vercel 部署方法

1. 將完整專案上載到 GitHub。
2. 到 Vercel 新增 Project。
3. Import 你的 GitHub repository。
4. Framework Preset 選 Vite。
5. Build Command：

```bash
npm run build
```

6. Output Directory：

```bash
dist
```

7. 按 Deploy。

## GitHub Pages 部署方法

本專案已設定：

```js
base: './'
```

可支援 GitHub Pages 子路徑部署。

基本做法：

1. 上載完整專案到 GitHub。
2. 執行：

```bash
npm install
npm run build
```

3. 將 `dist` 內容部署到 GitHub Pages。

## localStorage 資料

紀錄儲存在使用者瀏覽器：

```txt
moodflow_records_v1
```

更新介面不會自動刪除舊紀錄，因為沿用相同 Key。

## 常見問題

### Vercel build failed

請檢查：

- 是否漏了 `package.json`
- 是否漏了 `src/App.jsx`
- 是否漏了 `src/main.jsx`
- 是否使用 React 19 / Vite 6 以上
- 是否把 `node_modules` 上載到 GitHub

本版本使用：

```json
"vite": "^5.4.0",
"react": "^18.2.0",
"react-dom": "^18.2.0",
"tailwindcss": "^3.4.0"
```

### 白屏

多數是以下原因：

- 沒有完整覆蓋檔案
- `src` 資料夾漏檔
- `index.html` script 路徑被改錯
- GitHub Pages 沒有使用 `base: './'`
- 舊版瀏覽器快取

可嘗試：

1. 清除瀏覽器快取。
2. Vercel 重新 Deploy。
3. 確認 GitHub 上有完整 `src/App.jsx`。

### 要不要上載 node_modules？

不用。  
只需上載專案檔案，Vercel 會自動根據 `package.json` 安裝。
