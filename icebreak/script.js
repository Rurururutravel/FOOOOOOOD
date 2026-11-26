import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, setDoc, updateDoc, arrayUnion, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ==========================================
// ★ Firebaseの設定をここに貼り付けてください
// ==========================================
const firebaseConfig = {
apiKey: "AIzaSyA2vGpLJ2HlSbgf58N6qdNGvu1C0AQzCm0",
authDomain: "groupwork-isd.firebaseapp.com",
projectId: "groupwork-isd",
storageBucket: "groupwork-isd.firebasestorage.app",
messagingSenderId: "638534197873",
appId: "1:638534197873:web:16230f4ebfea024b0631d0",
measurementId: "G-7W7CYHZ72C"
};

// Firebase初期化
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 10問の質問リスト
const questions = [
    { id: 1, axis: 'R', text: 'Q1. グループの中に、初対面やまだあまり話したことがない人がいる。' },
    { id: 2, axis: 'R', text: 'Q2. まだお互いに気を遣って、遠慮しているように感じる。' },
    { id: 3, axis: 'R', text: 'Q3. お互いの「得意なこと」や「趣味」などをまだあまり知らない。' },
    { id: 4, axis: 'E', text: 'Q4. 今のグループの雰囲気は静かで、活気がない。' },
    { id: 5, axis: 'E', text: 'Q5. このまま本題に入ると、特定の人だけが発言することになりそうだ。' },
    { id: 6, axis: 'E', text: 'Q6. くだらないことや、思いつきのアイデアは言いづらい雰囲気だ。' },
    { id: 7, axis: 'E', text: 'Q7. 全員がスマホやPCを見たまま、無言の時間が続くことがある。' },
    { id: 8, axis: 'M', text: 'Q8. 授業の最初や昼食後などで、少し眠気や疲れを感じる。' },
    { id: 9, axis: 'M', text: 'Q9. いきなり「アイデアを出して」と言われても、すぐには思い浮かばない。' },
    { id: 10, axis: 'M', text: 'Q10. グループワークに向けた心の準備・頭の体操がまだできていない。' }
];

// 8タイプの定義
const typesData = {
    "YES_YES_YES": { name: " まだ見ぬ原石たちの集い", features: "お互いをよく知らず、少し探り合っていて無言になりがち。しかし伸びしろは無限大！", advice: "まずは「正解」を出そうとせず、お互いの人間性を知ることに時間を使いましょう。", game: "おすすめゲーム：『他己紹介ゲーム』や『ワードウルフ』" },
    "YES_YES_NO": { name: " 秘めたる天才ハッカー集団", features: "頭の回転は早いのに、初対面で気を遣って様子見をしている状態。", advice: "素晴らしい思考力を持っているので、あとは「発言する勇気」だけ！", game: "おすすめゲーム：『共通点探しゲーム』" },
    "YES_NO_YES": { name: " 陽キャな即席サーカス団", features: "初対面なのにノリが良いけれど、ワークの本題からは少し遠ざかっているかも？", advice: "まずはゲームで楽しく仲を深めつつ、「今日目指すゴール」を確認しましょう。", game: "おすすめゲーム：『目標宣言セッション付きゲーム』" },
    "YES_NO_NO": { name: " 敏腕フリーランスのドリームチーム", features: "初対面でもすぐに的確な議論ができる即戦力集団！", advice: "業務的になりすぎず、ゲームを通して「素の自分」を見せ合ってみましょう。", game: "おすすめゲーム：『2択自己紹介アイスブレイク』" },
    "NO_YES_YES": { name: " 安心と信頼の老舗旅館", features: "お互いを知っていて居心地が良い反面、完全にリラックスモードに入っています。", advice: "脳を起こすために、少しテンションの上がるゲームでスパイスを加えましょう。", game: "おすすめゲーム：『カタカナーシ』や『古今東西ゲーム』" },
    "NO_YES_NO": { name: " 優しき平和主義者ギルド", features: "目的意識は揃っているのに、「失敗したくない」という優しさから場が硬くなっています。", advice: "あえて変な案を出すゲームを挟むことで、気軽に意見を言えるようになります。", game: "おすすめゲーム：『バッドアイデア出しゲーム』" },
    "NO_NO_YES": { name: " 仲良しアイデア暴走族", features: "仲が良く発言も活発ですが、楽しすぎて話が脱線しやすい傾向があります。", advice: "頭の準備体操をしつつ、最初に「今日決めること」を1つだけ明確にしましょう。", game: "おすすめゲーム：『連想ゲーム・謎解き』" },
    "NO_NO_NO": { name: " 完全無欠の勇者パーティー", features: "仲良し、活発、頭も冴えている奇跡のチームです！", advice: "アイスブレイクはサクッと済ませて、有り余るエネルギーを本題にぶつけましょう。", game: "おすすめゲーム：アイスブレイクなしで本題へ！" }
};

// 起動時に質問カードを自動生成
window.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('questions-container');
    if (container) {
        questions.forEach((q) => {
            const card = document.createElement('div');
            card.className = 'question-card';
            card.innerHTML = `
                <p><strong>${q.text}</strong></p>
                <div class="radio-group">
                    <label><input type="radio" name="q_${q.id}" value="1" required> 1.YES</label>
                    <label><input type="radio" name="q_${q.id}" value="2"> 2.ややYES</label>
                    <label><input type="radio" name="q_${q.id}" value="3"> 3.ややNO</label>
                    <label><input type="radio" name="q_${q.id}" value="4"> 4.NO</label>
                </div>
            `;
            container.appendChild(card);
        });
    }
});

// ルーム作成（ホスト）
window.createRoom = async function() {
    const roomName = document.getElementById('room-name').value.trim();
    const count = parseInt(document.getElementById('member-count').value);
    if (!roomName) { alert('ルーム名を入力してください'); return; }

    const roomId = Math.random().toString(36).substring(2, 6).toUpperCase();

    await setDoc(doc(db, "rooms", roomId), {
        roomName: roomName,
        totalMembers: count,
        answers: [],
        status: "waiting"
    });

    window.currentRoomId = roomId;
    document.getElementById('display-room-id').innerText = roomId;
    showScreen('wait-screen');
    listenRoomStatus(roomId);
};

// ルーム参加（メンバー）
// ルーム参加（メンバー）
window.joinRoom = function() {
    const roomId = document.getElementById('join-room-id').value.trim().toUpperCase();
    if (!roomId) { 
        alert('ルームIDを入力してください'); 
        return; 
    }
    window.currentRoomId = roomId;
    
    // ルームIDが存在するか確認してから画面を進める、または監視を開始
    startListeningJoinedRoom(roomId);
    
    // 質問画面へ切り替え
    showScreen('question-screen');
};

// 回答の送信
window.submitMyAnswers = async function() {
    const memberAnswers = {};
    for (let q of questions) {
        const selected = document.querySelector(`input[name="q_${q.id}"]:checked`);
        if (!selected) { alert('すべての質問に回答してください'); return; }
        memberAnswers[q.id] = parseInt(selected.value);
    }

    const roomRef = doc(db, "rooms", window.currentRoomId);
    await updateDoc(roomRef, {
        answers: arrayUnion(memberAnswers)
    });

    showScreen('wait-screen');
};

// ホスト側のルーム状態監視
function listenRoomStatus(roomId) {
    const roomRef = doc(db, "rooms", roomId);
    onSnapshot(roomRef, (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            const currentAnswersCount = data.answers.length;
            document.getElementById('counter-text').innerText = `${currentAnswersCount}人 / ${data.totalMembers}人 が回答完了`;

            if (currentAnswersCount >= data.totalMembers && data.status === "waiting") {
                calculateAndShowResults(data.answers);
            }
        }
    });
}

// 参加者側のルーム状態監視（【修正点】人数カウンターの更新を追加）
window.startListeningJoinedRoom = function(roomId) {
    const roomRef = doc(db, "rooms", roomId);
    onSnapshot(roomRef, (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            const currentAnswersCount = data.answers.length;
            
            // ★【追加】参加者側の待機画面でも、DBから取得した正しい総人数（totalMembers）を表示する
            document.getElementById('counter-text').innerText = `${currentAnswersCount}人 / ${data.totalMembers}人 が回答完了`;

            if (data.status === "finished") {
                displayResult(data.resultType);
            }
        }
    });
};

// 結果の計算と保存
window.calculateAndShowResults = async function(allResponses) {
    let sumR = 0, countR = 0;
    let sumE = 0, countE = 0;
    let sumM = 0, countM = 0;

    allResponses.forEach(ans => {
        questions.forEach(q => {
            const val = ans[q.id];
            if (q.axis === 'R') { sumR += val; countR++; }
            if (q.axis === 'E') { sumE += val; countE++; }
            if (q.axis === 'M') { sumM += val; countM++; }
        });
    });

    const isR_Yes = (sumR / countR) <= 2.5;
    const isE_Yes = (sumE / countE) <= 2.5;
    const isM_Yes = (sumM / countM) <= 2.5;

    const key = `${isR_Yes ? 'YES' : 'NO'}_${isE_Yes ? 'YES' : 'NO'}_${isM_Yes ? 'YES' : 'NO'}`;
    
    await updateDoc(doc(db, "rooms", window.currentRoomId), {
        status: "finished",
        resultType: key
    });

    displayResult(key);
};

// 結果画面の表示
window.displayResult = function(key) {
    const result = typesData[key];
    document.getElementById('result-type-name').innerText = result.name;
    document.getElementById('result-features').innerText = result.features;
    document.getElementById('result-advice').innerText = result.advice;
    document.getElementById('result-game').innerText = result.game;
    showScreen('result-screen');
};

// 画面切り替え用のヘルパー関数
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
    window.scrollTo(0, 0);
}