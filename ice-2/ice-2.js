import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, arrayUnion, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ==========================================
// Firebaseの設定（ご友人の設定値を引き継ぎ）
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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 1. 質問データセット（3問・5問・10問バージョン）
const questionSets = {
  3: [
    { axis: "R", text: "グループの中に、初対面やまだあまり話したことがない人がいる。" },
    { axis: "E", text: "今のグループの雰囲気は静かで、議論が盛り上がるか少し不安だ。" },
    { axis: "M", text: "正直まだ頭が本調子ではなく、いきなり本題を考えるのはしんどい。" }
  ],
  5: [
    { axis: "R", text: "グループの中に、初対面やまだあまり話したことがない人がいる。" },
    { axis: "R", text: "お互いの『得意なこと』や『趣味』などをまだあまり知らない。" },
    { axis: "E", text: "失敗したり、的外れな意見を言ったりしたら恥ずかしい空気がある。" },
    { axis: "E", text: "今のグループの雰囲気は静かで、議論が盛り上がるか少し不安だ。" },
    { axis: "M", text: "正直まだ頭が本調子ではなく、いきなり本題を考えるのはしんどい。" }
  ],
  10: [
    { axis: "R", text: "グループの中に、初対面やまだあまり話したことがない人がいる。" },
    { axis: "R", text: "まだお互いに気を遣って、遠慮しているように感じる。" },
    { axis: "R", text: "お互いの『得意なこと』や『趣味』などをまだあまり知らない。" },
    { axis: "E", text: "今のグループの雰囲気は静かで、活気がない。" },
    { axis: "E", text: "このまま本題に入ると、特定の人だけが発言することになりそうだ。" },
    { axis: "E", text: "くだらないことや、思いつきのアイデアは言いづらい雰囲気だ。" },
    { axis: "E", text: "全員がスマホやPCを見たまま、無言の時間が続くことがある。" },
    { axis: "M", text: "授業の最初や昼食後などで、少し眠気や疲れを感じる。" },
    { axis: "M", text: "いきなり『アイデアを出して』と言われても、すぐには思い浮かばない。" },
    { axis: "M", text: "グループワークに向けた心の準備・頭の体操がまだできていない。" }
  ]
};

// 2. 全15個のゲームデータベース（専用イラスト＆お助けツール付き）
const games = [
  {
    id: 1,
    name: "2つの本当と1つの嘘",
    image: "images/game-1.png",
    categories: ["know"],
    time: "10分",
    rule: "自分のエピソードを3つ話し、そのうち1つだけ混ぜた『嘘』を他のメンバーが当てるゲームです！順番に1人ずつ発表しましょう。",
    toolType: "roulette",
    toolTitle: "🎲 トークテーマ・ルーレット",
    items: ["テーマ：幼少期の思い出", "テーマ：最近のちょっとした失敗談", "テーマ：実は密かに自慢できること", "テーマ：休日の過ごし方", "テーマ：今までで一番驚いた出来事"]
  },
  {
    id: 2,
    name: "NGワードゲーム",
    image: "images/game-2.png",
    categories: ["know", "bond"],
    time: "10分",
    rule: "1人ずつスマホを見て自分の『NGワード』を確認し、他の人にバレないように会話します（またはお題を引いて相手に言わせよう）！",
    toolType: "secret",
    toolTitle: "👁️ 1人ずつこっそりNGワードを引く",
    items: ["NGワード：『えーと』", "NGワード：『なるほど』", "NGワード：『確かに』", "NGワード：『すごい』", "NGワード：『マジで』", "NGワード：『でも』", "NGワード：『大学』"]
  },
  {
    id: 3,
    name: "ito（イト）",
    image: "images/game-3.png",
    categories: ["know", "bond"],
    time: "15分",
    rule: "1〜100の数字を1人1つ思い浮かべ、お題に沿って自分の数字の大きさを言葉だけで表現し、小さい順に並べましょう！",
    toolType: "roulette",
    toolTitle: "🎲 ito（イト）のお題ルーレット",
    items: ["お題：人気のコンビニ商品（1:不人気 〜 100:超人気）", "お題：無人島に持っていきたいもの（1:不要 〜 100:必須）", "お題：強そうな動物（1:最弱 〜 100:最強）", "お題：嬉しいプレゼント（1:微妙 〜 100:最高）", "お題：言われて嬉しい褒め言葉（1:微妙 〜 100:最高）"]
  },
  {
    id: 4,
    name: "ビンゴ自己紹介",
    image: "images/game-4.png",
    categories: ["know", "bond"],
    time: "10分",
    rule: "紙に3×3のマスを描き、下のルーレットで出た質問や条件を書き入れます。お互いに質問し合って当てはまる人がいたらマスを開けよう！",
    toolType: "roulette",
    toolTitle: "🎲 ビンゴのマス目お題ルーレット",
    items: ["条件：犬派より猫派だ", "条件：一人暮らしをしている", "条件：インドア派だ", "条件：辛いものが大好き", "条件：アルバイトをしている", "条件：朝より夜型だ", "条件：旅行が好き"]
  },
  {
    id: 5,
    name: "性格診断ゲーム",
    image: "images/game-5.png",
    categories: ["know", "warmup"],
    time: "10分",
    rule: "下の2択質問を出し合い、自分のタイプやグループワークで得意な役割（アイデア出し・まとめ役など）を共有しよう！",
    toolType: "roulette",
    toolTitle: "🎲 価値観2択ルーレット",
    items: ["質問：旅行に行くなら『綿密に計画派』or『行き当たりばったり派』？", "質問：作業するなら『先に全部終わらせる派』or『締切ギリギリ派』？", "質問：議論では『アイデアを出す派』or『意見をまとめる派』？", "質問：休日は『外に出かけたい派』or『家でゆっくり派』？"]
  },
  {
    id: 6,
    name: "はぁって言うゲーム",
    image: "images/game-6.png",
    categories: ["speak", "bond"],
    time: "10分",
    rule: "下のボタンで1人ずつこっそり『お題の感情』を引き、指定された短い言葉をその感情だけで演じてみんなに当ててもらいましょう！",
    toolType: "secret",
    toolTitle: "👁️ 演者だけこっそりお題を確認",
    items: ["『はぁ』（怒りの「はぁ」）", "『はぁ』（感心・納得の「はぁ」）", "『はぁ』（失恋・ショックの「はぁ」）", "『えー』（嬉しい驚きの「えー」）", "『えー』（不満・ブーイングの「えー」）", "『なんで』（笑いながらツッコむ「なんで」）", "『なんで』（ガチギレの「なんで」）"]
  },
  {
    id: 7,
    name: "ウミガメのスープ",
    image: "images/game-7.png",
    categories: ["speak", "warmup"],
    time: "15分",
    rule: "1人が出題者になり、下の問題文を読み上げます。解答者は『はい』『いいえ』『関係ありません』で答えられる質問を繰り返して真相を暴こう！",
    toolType: "quiz",
    toolTitle: "🐢 ウミガメのスープ問題集",
    items: [
      {
        q: "【問題1】ある男がレストランで『ウミガメのスープ』を一口飲んだ。男は店員に『これは本当にウミガメのスープですか？』と尋ね、店員が『はい』と答えると、男は絶望した。なぜ？",
        a: "【真相】男は昔、遭難して仲間と飢えをしのいだ際、仲間から『これはウミガメのスープだ』と飲まされたスープがあった。しかしレストランで本物を飲んだことで、あの時飲まされたのは別のもの（仲間の肉など）だったと気づいてしまったから。"
      },
      {
        q: "【問題2】ある男がマンションの10階に住んでいる。毎日エレベーターで1階まで降りて出勤するが、帰りは7階までしかエレベーターに乗らず、残りの3階分は階段で上がる。なぜ？",
        a: "【真相】男は背が低く（または子供で）、エレベーターの『7階』のボタンまでしか手が届かないから。（雨の日は傘を使って10階のボタンを押せる）"
      },
      {
        q: "【問題3】ある女性が自分の母親の葬式で、見知らぬイケメンの男性に一目惚れした。数日後、女性は自分の姉を殺してしまった。なぜ？",
        a: "【真相】『また葬式を開けば、あの男性に会えるかもしれない』と考えたから。"
      }
    ]
  },
  {
    id: 8,
    name: "お絵かき伝言ゲーム",
    image: "images/game-8.png",
    categories: ["speak", "bond"],
    time: "10分",
    rule: "最初の人だけが下のルーレットでお題を見て『絵』を描き、次の人は絵を見て『文字』を書き、さらに次の人が『絵』を描く…と伝言しよう！",
    toolType: "roulette",
    toolTitle: "🎲 お絵かきお題ルーレット",
    items: ["お題：自転車に乗るパンダ", "お題：スマホをいじる宇宙人", "お題：ラーメンを食べるライオン", "お題：空を飛ぶ冷蔵庫", "お題：ギターを弾くゴリラ", "お題：スキーをするペンギン"]
  },
  {
    id: 9,
    name: "ジェスチャーゲーム",
    image: "images/game-9.png",
    categories: ["speak", "bond", "tension"],
    time: "10分",
    rule: "出題者は声を出さずに身振り手振りだけでお題を表現し、他のメンバーは何を表しているか当てましょう！下のタイマーを使って挑戦！",
    toolType: "roulette",
    toolTitle: "🎲 ジェスチャーお題ルーレット",
    items: ["お題：ボウリングでストライクを取る人", "お題：熱いラーメンをフーフーして食べる人", "お題：満員電車で耐える人", "お題：ゾンビ", "お題：ゴリラ", "お題：サーフィンをする人", "お題：カメラマン"]
  },
  {
    id: 10,
    name: "指スマ（いっせーのーせ）",
    image: "images/game-10.png",
    categories: ["speak", "tension"],
    time: "5分",
    rule: "『いっせーのーせ、〇！』の掛け声とともに親指を上げ、全員の上がった親指の合計数を当てます。勝者や敗者の特典は下のルーレットで！",
    toolType: "punishment",
    toolTitle: "🎯 勝者・敗者イベントルーレット",
    items: ["結果：最後まで残った人が今日の『書記』に決定！", "結果：最初に抜けた人が『最初の意見』を発表！", "結果：最後まで残った人は『最近嬉しかったこと』を1つ発表！", "結果：最初に抜けた人が『グループのチーム名』を命名！"]
  },
  {
    id: 11,
    name: "ワードウルフ",
    image: "images/game-11.png",
    categories: ["speak", "warmup"],
    time: "10分",
    rule: "全員に共通のお題が配られますが、1人だけ微妙に違うお題（ウルフ）が配られます。下のボタンから人数を選んで、1人ずつこっそり確認しよう！",
    toolType: "wolf",
    toolTitle: "🐺 ワードウルフお題配布ツール",
    items: [
      { citizen: "うどん", wolf: "そば" },
      { citizen: "ディズニーランド", wolf: "USJ（ユニバ）" },
      { citizen: "マクドナルド", wolf: "ケンタッキー" },
      { citizen: "LINE", wolf: "Instagram" },
      { citizen: "夏休み", wolf: "春休み" },
      { citizen: "たけのこの里", wolf: "きのこの山" }
    ]
  },
  {
    id: 12,
    name: "たけのこニョッキ",
    image: "images/game-12.png",
    categories: ["tension"],
    time: "5分",
    rule: "『1ニョッキ！』『2ニョッキ！』と他の人と被らないように順番に宣言して立ち上がります。被った人や最後まで残った人は下のルーレットへ！",
    toolType: "punishment",
    toolTitle: "🎯 アウトになった人の罰ゲームルーレット",
    items: ["罰ゲーム：語尾に『〜ニョッキ』をつけて1分間話す！", "罰ゲーム：自分の『推し』や『好きなもの』を熱く語る！", "罰ゲーム：今日のグループワークの『意気込み』を叫ぶ！", "罰ゲーム：次のゲームの『進行役』を担当する！"]
  },
  {
    id: 13,
    name: "文字数制限しりとり",
    image: "images/game-13.png",
    categories: ["tension", "warmup"],
    time: "10分",
    rule: "ルーレットで指定された文字数の言葉だけでしりとりをします。リズムよく10秒以内に答えましょう！",
    toolType: "roulette",
    toolTitle: "🎲 指定文字数ルーレット",
    items: ["ルール：【 3文字 】の言葉限定！", "ルール：【 4文字 】の言葉限定！", "ルール：【 5文字 】の言葉限定！", "ルール：【 3文字 → 4文字 → 3文字… 】と交互！"]
  },
  {
    id: 14,
    name: "山手線ゲーム",
    image: "images/game-14.png",
    categories: ["tension", "warmup"],
    time: "10分",
    rule: "ルーレットで出たお題に沿って、手拍子のリズムに合わせながら順番に単語を言っていくゲームです！",
    toolType: "roulette",
    toolTitle: "🎲 山手線ゲームお題ルーレット",
    items: ["お題：赤いもの", "お題：コンビニで買えるもの", "お題：都道府県", "お題：漢字一文字の動物", "お題：学校の教室にあるもの", "お題：丸いもの", "お題：カタカナ3文字の言葉"]
  },
  {
    id: 15,
    name: "マジカルバナナ",
    image: "images/game-15.png",
    categories: ["tension", "warmup"],
    time: "10分",
    rule: "下のボタンで最初の単語を決め、『〇〇と言ったら△△』と前の人が言った言葉から連想される言葉をリズムに合わせて繋いでいこう！",
    toolType: "roulette",
    toolTitle: "🎲 スタート単語ルーレット",
    items: ["スタート単語：『バナナ』", "スタート単語：『大学生』", "スタート単語：『スマホ』", "スタート単語：『夏休み』", "スタート単語：『コンビニ』", "スタート単語：『東京』"]
  }
];

// 3. MBTI風診断データ（ポジティブ特化版・全8タイプ）
const mbtiResults = {
  "FQP": {
    name: "💎 まだ見ぬ原石たちの集い",
    purposeId: "know",
    purposeName: "① メンバーについて知りたい",
    feature: "お互いをよく知らず、少し探り合っていて無言になりがち。しかし裏を返せば『誰がどんな才能を秘めているか分からない』伸びしろ無限大の状態です！",
    advice: "まずは『正解』を出そうとせず、お互いの人間性を知ることに時間を使いましょう。思いっきり笑い合えば最強チームに化けます！"
  },
  "FQR": {
    name: "🧠 秘めたる天才ハッカー集団",
    purposeId: "speak",
    purposeName: "② 発言しやすくしたい",
    feature: "頭の回転は早くワークへの意識も高いのに、初対面で気を遣って様子見をしている状態。内に秘めたアイデアの質はピカイチです！",
    advice: "素晴らしい思考力を持っているので、あとは『発言する勇気』だけ！くだらない意見でも否定しない空気でアウトプットを増やしましょう。"
  },
  "FAP": {
    name: "🎪 陽キャな即席サーカス団",
    purposeId: "bond",
    purposeName: "③ もっと仲を深めたい",
    feature: "初対面なのにノリが良く、コミュニケーション能力が非常に高いグループ！ただ、楽しすぎてワークの本題からは少し遠ざかっているかも？",
    advice: "持ち前の明るさは最大の武器です！ゲームで仲を深めつつ、『今日目指すゴール』を確認してから勢いよくスタートしましょう。"
  },
  "FAR": {
    name: "👔 敏腕フリーランスのドリームチーム",
    purposeId: "know",
    purposeName: "① メンバーについて知りたい",
    feature: "初対面でもすぐに的確な議論ができる即戦力集団！目的意識が高く、すぐにでも素晴らしい成果を出せるエリートたちです。",
    advice: "完璧な滑り出しですが、業務的になりすぎると息切れすることも。お互いの『素の自分』を知ることで予想以上の化学反応が起きます！"
  },
  "KQP": {
    name: "♨️ 安心と信頼の老舗旅館",
    purposeId: "tension",
    purposeName: "④ テンションを上げたい",
    feature: "既にお互いを知っていて居心地が良い反面、完全にリラックスモードに入っていてエンジンがかかっていません。この『安心感』は最高の土台です！",
    advice: "誰が何を言っても受け入れてくれる温かい空気があるので、あとは脳を起こすだけ！少しテンションの上がるゲームで議論モードへ移行しましょう。"
  },
  "KQR": {
    name: "🕊️ 優しき平和主義者ギルド",
    purposeId: "speak",
    purposeName: "② 発言しやすくしたい",
    feature: "目的意識は揃っているのに、『誰かの意見を否定したくない』『失敗したくない』という優しさから、少し場が硬くなっています。",
    advice: "相手を思いやれる最高のチームです！少しルールを緩めるゲームを挟むことで、安心して自分の意見をぶつけ合えるようになります。"
  },
  "KAP": {
    name: "🚀 仲良しアイデア暴走族",
    purposeId: "warmup",
    purposeName: "⑤ 頭の準備体操をしたい",
    feature: "仲が良く発言も活発ですが、楽しすぎて目的意識がバラバラになり、話が脱線しやすい傾向があります。",
    advice: "盛り上がる力は抜群です！頭の準備体操になるゲームを挟みつつ、最初に『今日決めること』を1つ紙に書いてから本題に入りましょう。"
  },
  "KAR": {
    name: "👑 完全無欠の勇者パーティー",
    purposeId: "warmup",
    purposeName: "⑤ 頭の準備体操をしたい",
    feature: "仲良し！活発！頭も冴えている！グループワークを成功させるための全ての条件が最初から揃った、奇跡のチームです。",
    advice: "皆さんのポテンシャルはすでにMAXです！アイスブレイクはサクッと頭をほぐす程度に留め、有り余るエネルギーを本題にぶつけてください！"
  }
};

// アプリの状態を記憶する変数
let currentRoomId = null;
let unsubscribeRoom = null;
let hasSubmitted = false;
let activeQuestions = [];
let currentQuestionIndex = 0;
let scoreData = { R: { total: 0, count: 0 }, E: { total: 0, count: 0 }, M: { total: 0, count: 0 } };
let currentResultCode = "FQP";
let currentRuleText = "";
let currentGame = null;
let timerInterval = null;
let defaultSeconds = 60;
let remainingSeconds = 60;
let wolfRoles = [];
let currentTurtleIndex = 0;

// 画面を切り替える共通関数
window.showScreen = function(screenId) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  const target = document.getElementById(screenId);
  if (target) {
    target.classList.add("active");
  }
  window.scrollTo(0, 0);
};

// ==========================================
// 1. ルーム作成・参加・リアルタイム集計（Firebase）
// ==========================================

// ホスト：ルームを作成する
window.createRoom = async function() {
  const roomName = document.getElementById("room-name").value.trim();
  const count = parseInt(document.getElementById("member-count").value);
  const qCount = parseInt(document.getElementById("question-count-select").value);

  if (!roomName) {
    alert("ルーム名を入力してください（例：Aチーム）");
    return;
  }
  if (!count || count < 1) {
    alert("参加人数を1人以上で入力してください");
    return;
  }

  const roomId = Math.random().toString(36).substring(2, 6).toUpperCase();
  currentRoomId = roomId;
  hasSubmitted = false;

  try {
    await setDoc(doc(db, "rooms", roomId), {
      roomName: roomName,
      totalMembers: count,
      questionCount: qCount,
      answers: [],
      status: "waiting",
      resultCode: ""
    });

    document.getElementById("wait-room-name").innerText = `ルーム：${roomName}`;
    document.getElementById("display-room-id").innerText = roomId;
    document.getElementById("counter-text").innerText = `0人 / ${count}人 が回答完了`;
    
    // ホスト自身も回答できるようにボタンを表示
    document.getElementById("btn-go-quiz").style.display = "block";
    document.getElementById("already-submitted-msg").style.display = "none";

    activeQuestions = questionSets[qCount] || questionSets[5];
    startListeningRoom(roomId);
    window.showScreen("screen-wait");
  } catch (e) {
    console.error(e);
    alert("ルームの作成に失敗しました。インターネット接続を確認してください。");
  }
};

// 参加者：ルームに参加する
window.joinRoom = async function() {
  const roomId = document.getElementById("join-room-id").value.trim().toUpperCase();
  if (!roomId) {
    alert("4桁のルームIDを入力してください");
    return;
  }

  try {
    const roomRef = doc(db, "rooms", roomId);
    const docSnap = await getDoc(roomRef);

    if (!docSnap.exists()) {
      alert("そのルームIDは見つかりませんでした。IDをもう一度確認してください。");
      return;
    }

    const data = docSnap.data();
    currentRoomId = roomId;
    hasSubmitted = false;

    document.getElementById("wait-room-name").innerText = `ルーム：${data.roomName}`;
    document.getElementById("display-room-id").innerText = roomId;
    document.getElementById("counter-text").innerText = `${data.answers.length}人 / ${data.totalMembers}人 が回答完了`;

    // ホストが設定した質問数（3問/5問/10問）をセット
    const qCount = data.questionCount || 5;
    activeQuestions = questionSets[qCount] || questionSets[5];

    startListeningRoom(roomId);

    // すでに診断が完了しているルームに入った場合は直接ゲーム提案へ
    if (data.status === "ready" && data.resultCode) {
      applyGroupResultAndShowGames(data.resultCode);
    } else {
      startQuizSession();
    }
  } catch (e) {
    console.error(e);
    alert("ルームへの参加に失敗しました。");
  }
};

// 待機画面からホストが自分の回答を開始する
window.goToQuizFromWait = function() {
  startQuizSession();
};

// 質問セッションを初期化して開始
function startQuizSession() {
  currentQuestionIndex = 0;
  scoreData = { R: { total: 0, count: 0 }, E: { total: 0, count: 0 }, M: { total: 0, count: 0 } };
  updateQuizScreen();
  window.showScreen("screen-quiz");
}

function updateQuizScreen() {
  const q = activeQuestions[currentQuestionIndex];
  document.getElementById("quiz-progress").innerText = `質問 ${currentQuestionIndex + 1} / ${activeQuestions.length}`;
  document.getElementById("quiz-question").innerText = q.text;

  const percent = ((currentQuestionIndex + 1) / activeQuestions.length) * 100;
  document.getElementById("progress-bar-fill").style.width = `${percent}%`;
}

// 1問ずつ回答（1〜4ポイント）
window.answerQuiz = function(point) {
  const axis = activeQuestions[currentQuestionIndex].axis;
  scoreData[axis].total += point;
  scoreData[axis].count += 1;

  currentQuestionIndex++;
  if (currentQuestionIndex < activeQuestions.length) {
    updateQuizScreen();
  } else {
    submitMyAnswersToFirebase();
  }
};

// 全問回答後、自分の平均スコアをFirebaseへ送信する
async function submitMyAnswersToFirebase() {
  const myAvgR = scoreData.R.total / scoreData.R.count;
  const myAvgE = scoreData.E.total / scoreData.E.count;
  const myAvgM = scoreData.M.total / scoreData.M.count;

  hasSubmitted = true;
  document.getElementById("btn-go-quiz").style.display = "none";
  document.getElementById("already-submitted-msg").style.display = "block";

  // まずは待機画面へ移動
  window.showScreen("screen-wait");

  try {
    const roomRef = doc(db, "rooms", currentRoomId);
    await updateDoc(roomRef, {
      answers: arrayUnion({
        R: myAvgR,
        E: myAvgE,
        M: myAvgM,
        submittedAt: Date.now()
      })
    });
  } catch (e) {
    console.error(e);
    alert("回答の送信中にエラーが発生しました。");
  }
}

// ルームの回答状況をリアルタイム監視する（ホスト・参加者共通）
function startListeningRoom(roomId) {
  if (unsubscribeRoom) {
    unsubscribeRoom();
  }

  const roomRef = doc(db, "rooms", roomId);
  unsubscribeRoom = onSnapshot(roomRef, async (docSnap) => {
    if (!docSnap.exists()) return;
    const data = docSnap.data();

    const currentCount = data.answers.length;
    const totalCount = data.totalMembers;
    document.getElementById("counter-text").innerText = `${currentCount}人 / ${totalCount}人 が回答完了`;

    // 全員の回答が揃ったら集計してステータスを "ready" に更新
    if (currentCount >= totalCount && data.status === "waiting") {
      let sumR = 0, sumE = 0, sumM = 0;
      data.answers.forEach(ans => {
        sumR += ans.R;
        sumE += ans.E;
        sumM += ans.M;
      });

      const groupAvgR = sumR / currentCount;
      const groupAvgE = sumE / currentCount;
      const groupAvgM = sumM / currentCount;

      const rCode = groupAvgR <= 2.5 ? "F" : "K";
      const eCode = groupAvgE <= 2.5 ? "Q" : "A";
      const mCode = groupAvgM <= 2.5 ? "P" : "R";
      const finalCode = rCode + eCode + mCode;

      await updateDoc(roomRef, {
        status: "ready",
        resultCode: finalCode
      });
    }

    // 集計が完了したら、待機中・回答中のメンバー全員をゲーム提案画面へ自動遷移させる
    if (data.status === "ready" && data.resultCode) {
      const activeScreen = document.querySelector(".screen.active");
      if (activeScreen && (activeScreen.id === "screen-wait" || activeScreen.id === "screen-quiz")) {
        applyGroupResultAndShowGames(data.resultCode);
      }
    }
  });
}

// 集計されたグループタイプをもとにゲーム提案画面を表示
function applyGroupResultAndShowGames(code) {
  currentResultCode = mbtiResults[code] ? code : "FQP";
  const resultData = mbtiResults[currentResultCode];

  document.getElementById("recommended-purpose").innerText = resultData.purposeName;
  window.renderSuggestedGames();
  window.showScreen("screen-games");
}

// ==========================================
// 2. ゲーム提案・プレイ・お助けツール・タイマー
// ==========================================

window.renderSuggestedGames = function() {
  const resultData = mbtiResults[currentResultCode];
  const matchedGames = games.filter(g => g.categories.includes(resultData.purposeId));
  
  const shuffled = [...matchedGames].sort(() => Math.random() - 0.5);
  const pickedGames = shuffled.slice(0, 3);

  const container = document.getElementById("game-cards-container");
  container.innerHTML = "";

  pickedGames.forEach(game => {
    const card = document.createElement("div");
    card.className = "game-card";
    card.innerHTML = `
      <h3>${game.name}（目安：${game.time}）</h3>
      <p>${game.rule}</p>
      <button class="btn-select-game" onclick="selectGame(${game.id})">このゲームで遊ぶ</button>
    `;
    container.appendChild(card);
  });
};

window.selectGame = function(gameId) {
  const selected = games.find(g => g.id === gameId);
  if (!selected) return;

  currentGame = selected;
  document.getElementById("play-game-title").innerText = selected.name;
  document.getElementById("play-game-rule").innerText = selected.rule;
  currentRuleText = selected.rule;

  const illustImg = document.getElementById("play-game-illust");
  illustImg.src = selected.image;

  renderGameTool(selected);
  
  window.stopTimer();
  defaultSeconds = 60;
  remainingSeconds = 60;
  updateTimerDisplay();

  window.showScreen("screen-play");
};

function renderGameTool(game) {
  const container = document.getElementById("tool-container");
  container.innerHTML = `<p class="tool-title">${game.toolTitle}</p>`;

  if (game.toolType === "roulette" || game.toolType === "punishment") {
    container.innerHTML += `
      <div id="roulette-result" class="roulette-display">ボタンを押してお題を引こう！</div>
      <button class="btn-tool" onclick="spinRoulette()">🎲 ルーレットを回す！</button>
    `;
  } else if (game.toolType === "secret") {
    container.innerHTML += `
      <div id="secret-result" class="roulette-display">🙈 隠れています</div>
      <button class="btn-tool" onclick="drawSecretItem()">👁️ 新しいお題を引いて見る</button>
      <button class="btn-tool-sub" onclick="hideSecretItem()">🙈 隠して次の人へ渡す</button>
    `;
  } else if (game.toolType === "wolf") {
    container.innerHTML += `
      <div>
        <button class="btn-tool-sub" onclick="setupWolf(3)">3人で遊ぶ</button>
        <button class="btn-tool-sub" onclick="setupWolf(4)">4人で遊ぶ</button>
        <button class="btn-tool-sub" onclick="setupWolf(5)">5人で遊ぶ</button>
      </div>
      <div id="wolf-area"></div>
    `;
  } else if (game.toolType === "quiz") {
    container.innerHTML += `
      <div id="quiz-problem-text" style="text-align:left; font-size:0.9rem; line-height:1.5; margin-bottom:8px;"></div>
      <div id="quiz-answer-text" class="quiz-answer" style="display:none;"></div>
      <button class="btn-tool-sub" onclick="toggleQuizAnswer()">💡 真相（答え）を見る / 隠す</button>
      <button class="btn-tool-sub" onclick="nextTurtleQuiz()">🔄 別の問題にする</button>
    `;
    currentTurtleIndex = 0;
    showTurtleQuiz();
  }
}

window.spinRoulette = function() {
  const items = currentGame.items;
  const display = document.getElementById("roulette-result");
  display.classList.remove("pop-anim");

  let count = 0;
  const interval = setInterval(() => {
    const tempItem = items[Math.floor(Math.random() * items.length)];
    display.innerText = tempItem;
    count++;
    if (count >= 8) {
      clearInterval(interval);
      const finalItem = items[Math.floor(Math.random() * items.length)];
      display.innerText = finalItem;
      void display.offsetWidth;
      display.classList.add("pop-anim");
    }
  }, 50);
};

window.drawSecretItem = function() {
  const items = currentGame.items;
  const randomItem = items[Math.floor(Math.random() * items.length)];
  document.getElementById("secret-result").innerText = randomItem;
};

window.hideSecretItem = function() {
  document.getElementById("secret-result").innerText = "🙈 隠れています（次の人に渡してね）";
};

window.setupWolf = function(playerCount) {
  const pair = currentGame.items[Math.floor(Math.random() * currentGame.items.length)];
  wolfRoles = Array(playerCount).fill(pair.citizen);
  const wolfIndex = Math.floor(Math.random() * playerCount);
  wolfRoles[wolfIndex] = pair.wolf;

  let buttonsHtml = `<div class="wolf-players">`;
  for (let i = 0; i < playerCount; i++) {
    buttonsHtml += `<button class="btn-tool-sub" onclick="revealWolf(${i})">${i + 1}人目を見る</button>`;
  }
  buttonsHtml += `</div>
    <div id="wolf-display" class="roulette-display">🙈 自分の番号を押して確認！</div>
    <button class="btn-tool-sub" onclick="hideWolf()">🙈 隠す</button>`;
  
  document.getElementById("wolf-area").innerHTML = buttonsHtml;
};

window.revealWolf = function(index) {
  document.getElementById("wolf-display").innerText = `あなたのお題：【 ${wolfRoles[index]} 】`;
};

window.hideWolf = function() {
  document.getElementById("wolf-display").innerText = "🙈 隠れています（次の人へ）";
};

function showTurtleQuiz() {
  const quiz = currentGame.items[currentTurtleIndex];
  document.getElementById("quiz-problem-text").innerText = quiz.q;
  document.getElementById("quiz-answer-text").innerText = quiz.a;
  document.getElementById("quiz-answer-text").style.display = "none";
}

window.toggleQuizAnswer = function() {
  const ansBox = document.getElementById("quiz-answer-text");
  ansBox.style.display = ansBox.style.display === "none" ? "block" : "none";
};

window.nextTurtleQuiz = function() {
  currentTurtleIndex = (currentTurtleIndex + 1) % currentGame.items.length;
  showTurtleQuiz();
};

// カスタムタイマー機能
window.adjustTimer = function(deltaSeconds) {
  if (timerInterval === null) {
    const nextSeconds = remainingSeconds + deltaSeconds;
    if (nextSeconds >= 60 && nextSeconds <= 3600) {
      remainingSeconds = nextSeconds;
      defaultSeconds = nextSeconds;
      updateTimerDisplay();
    }
  } else {
    if (remainingSeconds + deltaSeconds > 0 && remainingSeconds + deltaSeconds <= 3600) {
      remainingSeconds += deltaSeconds;
      updateTimerDisplay();
    }
  }
};

window.startTimer = function() {
  if (timerInterval !== null) return;

  if (remainingSeconds <= 0) {
    remainingSeconds = defaultSeconds;
    updateTimerDisplay();
  }

  timerInterval = setInterval(() => {
    remainingSeconds--;
    updateTimerDisplay();

    if (remainingSeconds <= 0) {
      window.stopTimer();
      document.getElementById("timer-display").innerText = "終了！";
      if ("speechSynthesis" in window) {
        const uttr = new SpeechSynthesisUtterance("時間終了です！");
        uttr.lang = "ja-JP";
        window.speechSynthesis.speak(uttr);
      }
    }
  }, 1000);
};

window.stopTimer = function() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
};

window.resetTimer = function() {
  window.stopTimer();
  remainingSeconds = defaultSeconds;
  updateTimerDisplay();
};

function updateTimerDisplay() {
  const mins = String(Math.floor(remainingSeconds / 60)).padStart(2, "0");
  const secs = String(remainingSeconds % 60).padStart(2, "0");
  document.getElementById("timer-display").innerText = `${mins}:${secs}`;
}

window.speakRule = function() {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    const uttr = new SpeechSynthesisUtterance(currentRuleText);
    uttr.lang = "ja-JP";
    window.speechSynthesis.speak(uttr);
  }
};

// ==========================================
// 3. ゲーム終了後：MBTI風診断結果の表示
// ==========================================

window.finishGame = function() {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
  window.stopTimer();
  const resultData = mbtiResults[currentResultCode];
  
  document.getElementById("result-code").innerText = `${currentResultCode} 型`;
  document.getElementById("result-name").innerText = resultData.name;
  document.getElementById("result-feature").innerText = resultData.feature;
  document.getElementById("result-advice").innerText = resultData.advice;

  window.showScreen("screen-result");
};

window.resetApp = function() {
  if (unsubscribeRoom) {
    unsubscribeRoom();
    unsubscribeRoom = null;
  }
  window.stopTimer();
  currentRoomId = null;
  hasSubmitted = false;
  window.showScreen("screen-home");
};