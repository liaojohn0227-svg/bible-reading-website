# 恩典之島部署與共享群島

遊戲頁面為 index.html。單機日記與 3D 島嶼可獨立使用。共享群島需設定 Supabase，再將同一份網頁發布到 GitHub Pages。此版本尚未連接正式 Supabase 專案。

## 設定雲端平台

1. 建立一個 Supabase 專案，在 SQL Editor 執行本資料夾的 supabase.sql。
2. 在 Authentication 的設定中啟用 Anonymous Sign-Ins。匿名登入會產生獨立使用者 ID，資料庫以此識別島主。
3. 從專案取得 Project URL 與 Publishable key。
4. 在 index.html 搜尋 GRACE_CLOUD，填入設定。

```js
const GRACE_CLOUD = Object.freeze({
  url: 'https://你的專案代號.supabase.co',
  publishableKey: 'sb_publishable_你的公開金鑰',
  room: 'grace-island'
});
```

使用 Publishable key。Secret key 與舊版 service_role 金鑰具有管理權限，不能放在網頁或 GitHub 儲存庫。

## GitHub Pages

正式版入口是 index.html，預設使用正常解鎖條件。new-player-preview.html 是使用獨立存檔的本機預覽，可留在本機。grace-creatures/ 與 penguin-outfits/ 是模型原始檔，可隨專案提交供日後維護。

將 index.html 放在 GitHub Pages 所發布的根目錄。網頁無須編譯。發布後，所有人使用同一個網址與相同 GRACE_CLOUD 設定，點「群島」，輸入島名並加入，即可互相看見。

可將 DEPLOY.md 與 supabase.sql 一起留在儲存庫，供日後維護。網頁執行時只需要 index.html。共享功能會從 esm.sh 載入固定版本的 Supabase SDK。

已設定 Supabase 的島主更新此版本時，請先在 SQL Editor 重新執行 supabase.sql，讓共享資料能儲存企鵝造型，以及新加入的虎鯨、白鯨、獨角鯨。舊版群島資料仍可讀取。

## 現有功能與資料行為

- 每個瀏覽器的匿名登入身分，在同一個 room 內擁有一座島。
- 日記存放在 localStorage。雲端只存島名、累積篇數，以及各種動物的數量，包含企鵝品種。日記標題、經文、日期、內容與日記 ID 都不會上傳。
- 加入群島後，新增或刪除日記會更新雲端的動物數量。失敗時保留待同步資料，每 30 秒重試。離線不影響本機寫日記。
- 群島每批載入 8 座島，可從列表翻頁。海面顯示其他人的縮小島嶼與動物，每種動物最多展示 3 隻，列表顯示實際數量。地形以累積進度呈現雪地、山地與草地。
- 他人的動畫在觀看者裝置播放，每 30 秒更新島嶼資料。這個版本沒有同步玩家位置或逐幀動物位置。
- 每次重新載入頁面後，從「群島」重新加入即可繼續同步，既有登入身分會由 SDK 恢復。
- 清除瀏覽器資料或更換裝置會失去原本匿名身分。JSON 備份可還原日記與動物，但不含雲端登入憑證。跨裝置認領同一座雲端島嶼需要後續加入正式帳號登入。
- room 用於區分群島。已登入者可以讀取此專案的公開島嶼資料，因此 room 名稱不是私人群組的存取密碼。

## 上線驗證

本機可執行 `node verify.cjs`，檢查共享資料隱私、數量彙整、連線錯誤重試，以及鄰島模型與動畫流程。此檢查使用模擬網路與 GPU renderer，不取代正式資料庫權限測試或瀏覽器畫面驗證。

使用兩個獨立瀏覽器設定檔開啟發布網址，各自輸入不同島名並加入。各寫一篇靈修，檢查另一個瀏覽器在 30 秒內看到島嶼與企鵝。再檢查修改、刪除日記會同步數量，以及斷線後本機日記仍可儲存。正式專案尚未設定前，這組端到端驗證無法完成。

資料庫啟用 Row Level Security。讀取開放給登入使用者，新增、修改和刪除限制為 owner_id 等於目前登入者。資料驗證觸發器拒絕額外的 snapshot 欄位。

參考官方文件

- [Supabase Anonymous Sign-Ins](https://supabase.com/docs/guides/auth/auth-anonymous)
- [Supabase API keys](https://supabase.com/docs/guides/getting-started/api-keys)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
