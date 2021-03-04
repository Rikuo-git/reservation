# 機器予約システム
研究室で使う用にGoogle Apps Scriptを使って予約システムを作りました。  
デモサイトは[こちら](https://script.google.com/macros/s/AKfycbyUpPECRqmDzbQapx0qWaaYIhll98Kc_cVb-Q0ATGsTZK1FFL-GnUqS/exec)。

## 概要
内部の構造としてはこんな感じです。
- 機器ごとにgoogle calendarを作成。
- フォームを介してGASからgoogle calendarに予定を追加、削除。
- htmlにiframeでcalendarを表示。

機器のリストはスプレッドシートで管理しています（[サンプルのスプレッドシート](https://docs.google.com/spreadsheets/d/15kxbRYtUJem2hDERSDJHMg7RkWKmEXUtwdrx7ZHfZYM/edit?usp=sharing))。  
残念ながら今のところカレンダーを自動で生成することはできないので、新しい機器を追加したい時は手動でカレンダーを作成してスプレッドシートにそのカレンダーのidを入力する必要があります。

## 使い方
### 追加
1. 機器を選択して、名前を入力
2. 開始時間と終了時間を入力

### 編集と削除
1. 機器を選択して、名前を入力
2. 確認を押して、リストを表示
3. 編集する場合は詳細をクリック、削除する場合は削除をクリック

## 現在確認できてる問題点
- デスクトップのsafariでは日時の入力でpickerが出てこない。
- 読み込みから機器の選択肢が出るまでラグがある。
