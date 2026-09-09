# UF Studio

三支 UF-0915E 一般型膜組件與 SKID 的網頁互動概念展示。

線上展示：https://c-ken-c.github.io/uf-membrane-3d-demo/

## 操作

- 拖曳旋轉、滾輪／雙指縮放、點選膜組件。
- 切換過濾、氣洗與通用反洗示意。
- 「透視膜絲」顯示簡化內部膜絲。
- 支援手機與 reduced-motion 偏好。

## 資料與限制

模型由程式以基本幾何建立，沒有上傳原廠 CAD、PDF、客戶檔案或機密圖紙。介面數值是固定示範值，未連接感測器，也不代表產品性能或操作設定。

一般型的上方側口 B 表示產水，軸向頂口 C 表示濃水，下方側口表示原水／排放，底部小接頭表示進氣。內部流線是概念路徑，不能作為管路設計或水力分析。反洗動畫是通用 UF 原理展示，TIPS 實際清洗程序須另依原廠確認。

尺寸僅為展示比例：名義模組長 1860 mm、筒徑 225 mm、三支中心距 380 mm。尚非正式設備模型。

## 開發

Node.js 22，執行 `npm ci`、`npm run dev`。`npm run build` 輸出至 `dist`。GitHub Actions 自動部署 main 至 GitHub Pages。

使用 Three.js 和 Vite。介面與模型為本專案建立，未複製 sc-datav 的程式或素材。
