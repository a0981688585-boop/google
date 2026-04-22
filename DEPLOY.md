# 擇日服務行事曆 - GitHub Pages 部署說明

## 快速部署步驟

### 方法一：手動上傳 dist 資料夾（最簡單）

1. 下載 `dist.zip` 檔案
2. 解壓縮後上傳到 GitHub：
   - 前往 https://github.com/a0981688585-boop/google
   - 點擊 "Add file" → "Upload files"
   - 把 dist 資料夾內的所有檔案拖進去
   - 點擊 "Commit changes"

3. 設定 GitHub Pages：
   - 進入 Repository Settings → Pages
   - Source 選擇 "Deploy from a branch"
   - Branch 選擇 "main" / "(root)"
   - 點擊 Save

4. 等待 1-2 分鐘，你的網站就會上線！

### 方法二：使用 GitHub Actions（自動部署）

1. 把這個資料夾的所有檔案上傳到你的 GitHub repo
2. GitHub 會自動偵測並部署
3. 一旦設定好 GitHub Pages，以後每次更新 push 都會自動部署

## 網址

部署完成後，你的網站會在：
`https://a0981688585-boop.github.io/google/`
