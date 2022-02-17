參考網址: https://www.youtube.com/watch?v=svlEVg0To_c

利用Nextjs+Firebase做出Whatapps的聊天軟體，目前只有用到nextjs的前端部分。

使用方法，需要新增firebaseConfig.tsx放到跟目錄，裡面要幫含fiebase的設定，export 出 firebaseConfig 。

目前只適用於Desktop


代辦事項
1. Mobile無法滿眶
2. chat/[id].tsx會loading太慢
3. 往上滾會自動載入以前資料，但是卻不小心沒有監聽其他人傳訊息的資料，因為要重新整理才會有訊息跑出來，原本使用array新增訊息，想要改成用hook做

