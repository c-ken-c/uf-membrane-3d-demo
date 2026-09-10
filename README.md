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

## 單支拆解展示

單支頁面依 GS-TECH-122 的 14 項 BOM 建立 22 個可選物件／總成，保留原三支 SKID 頁面。支援拆開、組合、程度滑桿、編號、零件料號與材質、近看、透視核心及線框。`#single` 可直接開啟單支頁面。

這是近似外形重建，非原廠 3D 或製造圖。O 型環採用原表標示尺寸；其他未標細節未經完整尺寸驗證。項次 02 的原文 CU／6 inch 與 ABS 材質欄、項次 14 的 Rubber Spacer 與 PE 材質欄存在待核對事項。展示全部 BOM 件不保證它們可同時使用；黏合接頭保留在總成內，動畫不代表實際維修程序。

## SKID 管材與儀表配置

新增58個可選配置項目：22個原圖管段／軟管、6個新增連接路由、19個管件、5組氣動閥、6個儀表。CSV同時列出材質、跨度、待確認裁管尺寸與規格說明。清單不是完整施工BOM，模組供貨、框架、支撐、控制附件與樣品調流隔離等不在這58項中。

水路PVC-U為暫定設計條件；氣洗與儀用空氣須選氣體用途額定管材。原圖水路跨度6.282m與新增段分列，跨度包含管件及閥體占位。所有製品尺寸、承插深度、壓力等級與安裝配置均待確認；此更新沒有同步更改DWG。

PT-101/102/103、FIT-101/102、AIT-101分別為壓力、流量及產水濁度位置。讀值顯示未連線，不使用模擬資料充當即時訊號。儀表與閥體造型为占位示意；取樣管排樣去向及配套仍待設計。既有流程粒子保留為原理動畫，不對應已驗證的氣動閥開關程序。

### 比例估長

以1184 × 728 × 2200 mm架體及管段座標校準比例，28段管路估長四捨五入至10mm。水路含新增段共8.69m、氣洗總管及接管1.78m、氣洗軟管0.33m、濁度取樣／排樣管1.61m。各段長度及分類加總同步輸出CSV。這是含管件占位的路由估長，未加損耗，供初步抓料。

### 管徑資料來源（2026-09-10）

28個管路項目以廠商尺寸作配置選用，分別為GF PVC-U DIN8061/62 SDR21 PN10：d110×5.3（ID99.4）、d63×3（ID57）；Yamatoku SUS304管60.5×3.9（ID52.7）；Festo PUN-H 10×1.5（ID7）；SMC TL0806 PFA 8×6（壁厚1）。管段內徑標明型錄值或OD-2t計算值，非實測公差尺寸。28段皆提供數值、型號、來源及估長，可獨立下載管段尺寸CSV。非管段改填不適用並另列接管規格。

支管模型外徑由60改63mm，氣洗主管由63改60.5mm；須配合實際UF端口與相容接頭。PU軟管依Festo最小彎曲半徑28mm改為R30弧線與直段，估長仍為每條110mm。型錄規格不等於本案施工核定；PVC PN10以20°C水為基準，溫度／介質需降額。全部來源链接见src/pipe-specs.js及下載CSV。


### SKID frame specification
The frame and support crossbars are provisionally SUS316 (one assembly). The modeled bounding dimensions are W 1184 × D 728 × H 2200 mm, excluding external piping and instruments. The frame is selectable as SKID-001, with toggleable 3D dimensions and dedicated W/D/H columns in the complete material CSV. Member wall thickness, welds and load capacity remain unspecified. Gas piping material specifications are independent of the frame.
