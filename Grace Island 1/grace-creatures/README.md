# Grace Island 生物庫

恩典之島的生物模型和牠們的動作都集中放在這裡，每隻生物一個資料夾。打開 `preview.html` 就能 3D 預覽、切換生物、調整設定。

```
grace-creatures/
├─ preview.html            通用預覽頁（自動讀取所有生物）
├─ lib/                    three.js r128 + OrbitControls（和島上同版本，可離線）
├─ shared/
│  ├─ kit.js               共用造型工具：材質、黑色橢圓眼、雙色鰭、旋轉體身體
│  ├─ stage.js             預覽舞台：島上同款天空／燈光、海面 (y=0)、海底、水花／泡泡粒子、頭上表情泡泡、跟隨鏡頭
│  ├─ swim.js              鯨豚游泳大腦：路線、換氣、轉向、尾鰭擺動、內建特技（躍身／探頭／拍尾／翻滾）
│  ├─ fish.js              魚類簡易大腦：只繞圈游（游速、半徑、深度、方向）
│  ├─ shark.js             鯊魚模板：身體、各種鰭、鰓裂、嘴、可選錘頭；尾柄左右擺動
│  └─ ray.js               魟／鰩模板：扁平圓盤身體，翅膀可拍動或波浪擺動
└─ creatures/
   ├─ manifest.js          生物清單 ← 新增生物時在這裡加 id
   ├─ orca/                虎鯨
   ├─ beluga/              白鯨
   ├─ narwhal/             獨角鯨
   ├─ manta/               鬼蝠魟
   ├─ skate/               冬鰩
   ├─ blacktip/            黑鰭礁鯊
   └─ hammerhead/          雙髻鯊
       ├─ model.js         外型（只管長相）
       └─ behavior.js      這個物種的游泳參數與專屬特技
```

## 新增一隻生物

1. 建立 `creatures/<id>/model.js`：
   ```js
   GC.register('<id>',{name:'中文名',en:'English',habitat:'sea',blurb:'一句介紹',
     make(){ /* 回傳 {g, inner, ...} — g 管位置與朝向（頭朝 +z），inner 管俯仰／翻滾 */ }});
   ```
2. 建立 `creatures/<id>/behavior.js`。海洋生物直接套用共用游泳大腦，只寫參數與專屬特技：
   ```js
   const cfg={surf:-.45, spyY:.6,                    // 浮在水面時身體中心高度、探頭高度
     tricks:['spyhop','roll',                          // 內建：breach / spyhop / slap / roll
       {key:'sing',label:'唱歌',status:'唱歌 ♪',len:4, // 自訂特技
        onStart:c=>c.fx.emote(c.o.g,'♪'), pose:T=>({headPitch:-.2})}]};
   GC.register('<id>',{settings:GC.swim.settings({speed:2}), actions:GC.swim.actions(cfg),
     brain:GC.swim.brain(cfg), controlsHelp:GC.swim.controlsHelp});
   ```
   自訂特技可用的欄位：`len` 秒數、`v` 速度上限、`y(C,st)` 目標高度、`climb` 升降速度、
   `pose(T)` 回傳 `{pitch, roll, look, headYaw, headPitch, tailAmp, scull, slap}`、`onStart(c)`、`onUpdate(T,dt,c)`。
   陸地或不會游泳的生物，可以自己寫 `brain(rig,{settings,input,fx})`，回傳 `{update(t,dt), act(name), status}`。
3. 在 `creatures/manifest.js` 的 `GC.manifest` 陣列加入 `'<id>'`。

設定面板和動作按鈕會依 `settings` / `actions` 自動產生，不用改 `preview.html`。

## 三種鯨的移動設定（共用）

- **移動路線**：環游、8 字巡游、自由漫遊、手動操控、原地漂浮
- **可調**：游速、活動範圍、下潛深度、換氣週期、轉向靈活度、自動表演（開／關）
- **虎鯨**：躍身、探頭、拍尾、翻滾、噴氣
- **白鯨**：探頭、轉頭點頭（脖子可動）、唱歌 ♪、吐泡泡、翻滾、噴氣；游得慢、轉彎靈活，不躍身
- **獨角鯨**：舉牙探頭、仰泳、深潛（約 7 m）、拍尾、翻滾、噴氣；換氣週期較長，可下潛更深
- **手動操控**：W/↑ 加速、S/↓ 減速、A D/← → 轉向、Q 上浮、E 下潛、空白鍵躍身（虎鯨）；手機上有螢幕方向鍵

## 魚類（簡易繞圈）

鬼蝠魟、冬鰩、黑鰭礁鯊、雙髻鯊用 `GC.fish.brain`，只會繞圈游，可調游速、轉圈半徑、游動深度、順／逆時針。
各自的游法由模型的 `animate(phase, speed)` 決定：鯊魚尾柄左右擺、鬼蝠魟大翅膀慢慢拍、冬鰩圓盤邊緣波浪起伏。

再加一種鯊魚：在 `model.js` 呼叫 `GC.sharkKit.makeShark({...})` 填身形與鰭的大小；
再加一種魟／鰩：用 `GC.rayKit.rayBody({...})` 給外形曲線、厚度、上色與擺動函式。

## 本機預覽

可以直接雙擊 `preview.html`，或在這個資料夾執行：

```bash
python -m http.server 8765
```

然後打開 http://localhost:8765/preview.html

## 與遊戲同步

主遊戲已使用這七種模型。更新模型後，將 `shared/kit.js`、`shared/ray.js`、`shared/shark.js`、`creatures/manifest.js` 和清單內各物種的 `model.js`，依此順序同步到 `../index.html` 的 `BEGIN GRACE CREATURE MODELS` 和 `END GRACE CREATURE MODELS` 之間，保留區塊開頭的 `GC` 宣告。遊戲使用自己的巡游和紀錄規則，`behavior.js` 與操作面板供此目錄的預覽使用。新增物種時另需設定遊戲中的分類與解鎖條件。完成後執行 `node verify.cjs`。
