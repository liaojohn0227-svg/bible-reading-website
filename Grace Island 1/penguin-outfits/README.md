# 企鵝聖經造型（獨立資料夾）

這個資料夾可以整個搬走（例如放進 ChatGPT 資料夾），不依賴其他資料夾。

## 打開預覽

直接雙擊 `index.html`，或在這個資料夾執行：

```bash
python -m http.server 8768
```

然後打開 http://localhost:8768

預覽頁可以：切換島上原有的 5 套造型和 4 套新造型、切換五種企鵝（含新的麥哲倫企鵝）、「五種並排」一次比較、「走動」看走路時的樣子、「現在禱告」立刻看禱告動作；選「傳福音的人」時多一個「島上模擬」，用島上真正的企鵝程式跑牠和另外三隻企鵝。

## 新造型

| 檔案 | 造型 | 經文 | 特色 |
|---|---|---|---|
| `outfits/prayer.js` | 禱告者 | 腓立比書 4:6 | 白底藍條紋禱告披巾披到頭上、前方垂著繸子；每 8–15 秒停下來，跪在出現的小跪墊上，合翼、低頭、閉眼禱告約 5 秒 |
| `outfits/priest.js` | 祭司（簡化） | 彼得前書 2:9 | 細麻白袍、藍紫朱紅三色腰帶、鑲十二顆寶石的金色胸牌、肩上兩顆紅瑪瑙、白色纏頭巾和金牌 |
| `outfits/shepherd.js` | 好牧人 | 約翰福音 10:11 | 沙色長袍、麻繩腰帶、條紋頭巾和頭箍、牧羊杖；一隻蓬鬆雲朵小羊跟在後面走，牧人停下時牠會低頭吃草 |
| `outfits/evangelist.js` | 傳福音的人 | 羅馬書 10:15 | 綠色旅行袍、赭黃短披風、斜背書包、雙翼捧著打開的聖經、腳上穿涼鞋；每 10–20 秒會去找附近的企鵝說話（頭上冒出 ✝ ♥ 📖），對方會轉身聽、點頭、回一個 ♥ |

## 資料夾結構

```
penguin-outfits/
├─ index.html          預覽頁
├─ lib/                three.js r128 + OrbitControls（和島上同版本）
├─ js/base.js          島上的小工具（M、LIN、smooth、rnd）＋造型名稱表＋ registerOutfit()
├─ js/penguin.js       島上的企鵝模型，原封不動複製
├─ js/outfits-core.js  島上的 dressPenguin，只改了一行（見下方）
├─ js/magellanic.js    新企鵝品種：麥哲倫企鵝（SPECIES.magellanic＋專屬花紋）
├─ js/island-sim.js    島上的企鵝生活程式（活動系統＋每幀移動），原封不動複製，三處改動標 [NEW]
├─ js/bear.js          新版北極熊（一體成型、企鵝式眼睛），和島上 makeBear 同樣的骨架
├─ js/bear-island.js   島上原版北極熊 makeBearOriginal、bearBrain、表情泡泡，原封不動複製（比較用）
└─ outfits/*.js        每套新造型一個檔案
```

## 放回 Grace Island 的步驟

1. **造型名稱**：在 `index.html` 的 `PENGUIN_OUTFITS` 加上
   `prayer:'禱告者', priest:'祭司', shepherd:'好牧人', evangelist:'傳福音的人'`。
   這張表也被備份檢查使用，加了之後舊備份照樣能讀。
2. **造型程式**：在 `dressPenguin` 前面加上 `const EXTRA_OUTFITS={};function registerOutfit(id,def){EXTRA_OUTFITS[id]=def}`，再貼上四個 `outfits/*.js` 的內容。
3. **dressPenguin 的那一行**：把原本的
   ```js
   const makers={pastor,warrior,angel,gardener,dress};
   makers[outfit]({inner:outfitRoot,flips:penguin.flips});
   ```
   換成 `js/outfits-core.js` 最後那幾行（把同一組工具交給新造型，並多傳 `feet` 給涼鞋使用）。
4. **姿勢**：島上主迴圈裡，園丁目前是寫死的 `if(p.outfit==='gardener'){tg=-.16;tx=-.65}`，要再加兩個情況：
   - `pose.hold`（傳福音的人捧聖經）：`tg=hold.z; tx=hold.x`
   - `pose.pray`（禱告者）：定時進入禱告，期間停下腳步、`tg/tx` 換成 `fold.z/fold.x`、翅膀 `rotation.order='YXZ'` 並把 `rotation.y` 設為 `±fold.y`、身體前傾 `bow`、眼睛閉上。
   預覽頁 `index.html` 的 `tick()` 就是可以照抄的寫法。
   - `companion`（好牧人的小羊）：造型穿上時另外建一隻小羊放進場景，每幀讓牠走到牧人身後約 1 公尺處、停下時吃草（預覽頁 `tick()` 裡的「lamb trots」那段）；企鵝被移除時也要一起移除。
   - 禱告時的跪墊是造型回傳的 `outfitParts.cushion`，跪下時顯示並放大、身體下沉、雙腳往後收（見預覽頁「kneeling」那段）。
   - **傳福音的人找人說話**：照 `js/island-sim.js` 裡標 `[NEW]` 的三處修改島上的同名函式——
     `chooseNext()` 開頭讓造型的 `behavior.choose()` 先決定；`runAct()` 的 switch 加 `default` 執行 `PENGUIN_ACTS`；
     企鵝每幀的翅膀姿勢加上 `pose.hold`。另外在島上加 `const PENGUIN_ACTS={};`，再貼上 `outfits/evangelist.js`，牠就會自己找人說話。
5. **雲端**：若之後啟用群島，`supabase.sql` 允許的造型清單也要加上這四個 id。

造型的解鎖方式不用改：島上原本的「連續兩天寫靈修就能解鎖一套造型」會自動包含新造型。

## 新版北極熊

`js/bear.js` 的 `makeBear()` 回傳和島上一樣的 `{g, torso, head, legs}`，所以島上的 `bearBrain()` 可以直接驅動它。
放回島上：用 `js/bear.js` 的整個 `makeBear` 函式取代 `index.html` 裡原本的 `makeBear`（它用到的 `M`、`LIN`、`smooth` 島上都有）。
- 身體＋脖子是一個圓潤的整體，頭是另一個形狀、底部藏在脖子裡，所以轉頭、低頭聞東西時不會露出接縫。
- 四肢從身體裡自然長出來，腳掌往前收、底部有深色肉墊；耳朵是貼在頭上的半圓，內側稍深。
- 眼睛改成和企鵝一樣：貼在臉上的黑色橢圓片，不再是立體黑珠。

預覽頁左上角選「北極熊（新）」、「北極熊（原版）」或「北極熊 新舊並排」即可比較。

## 麥哲倫企鵝

`js/magellanic.js`：在 `SPECIES` 加上 `magellanic`，並包住 `bodyMaterial()` 畫牠專屬的花紋；體型、眼睛和其他品種完全一樣。
花紋照真實的麥哲倫企鵝、畫法照島上的柔和風格（顏色用島上企鵝同樣的深灰）：
深色頭和臉頰 → 從嘴基部經過眼睛上方、繞到臉頰後面再到下巴的白色 C 字紋 → 深色領圈 → 往兩側彎下去的第二道白帶 → 橫過胸口、沿兩側往腳延伸的深色馬蹄帶 → 白肚子；臉頰保留粉紅腮紅。
放回島上：貼上這個檔案，再把 `magellanic` 加進島上的企鵝品種清單、解鎖順序和 `supabase.sql` 的允許清單。

## 小魟寶寶（取代冬鰩）

`js/ray-baby.js` 的 `makeRayBaby(scale)` 回傳 `{g, inner, animate(phase)}`。
- 圓胖的身體、大圓頭、圓鈍的翼尖、短尾巴和小尾鰭；用島上鯨魚、海豚同一系的柔和灰藍色，背上幾顆淡淡的小白點，柔白色肚子。
- 眼睛是頭前方兩側上緣的一對小小黑色圓點，完整地坐在表面上，翅膀拍動時也不會穿模；肚子上有兩個小鼻孔、一抹微笑、兩排鰓裂。這些細節會跟著翅膀的擺動一起動，不會被表面穿過。
- 預覽頁左上角選「小魟寶寶（新）」，按「從下面看」可以看肚子上的笑臉。
放回島上：在 Grace Island 的 `GratitudeRays` 裡，把 `makeSkate` 換成 `makeRayBaby(.5)`（它的 `animate(ph)` 用法一樣），
並把感恩魚類名稱「冬鰩」改成「小魟寶寶」（`gratitudeFishKinds.skate.name` 與通知文字）。存檔裡的 id 仍是 `skate`，舊資料不受影響。
