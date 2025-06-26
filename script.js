// ゲーム初期化
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreElement = document.getElementById("score");
const livesElement = document.getElementById("lives");

const GRAVITY = 0.6;
const FLOOR_HEIGHT = 50;

// プレイヤー情報（2頭身おばさん）
const player = {
  x: 50,
  y: canvas.height - FLOOR_HEIGHT - 50,
  width: 35,
  height: 50,
  vy: 0,
  speed: 5,
  jumping: false
};

// ゲームオブジェクトの配列
let obstacles = [];
let crows = [];
let droppings = [];
let policemen = [];
let bullets = [];
let coins = [];
let bloodEffects = [];
let clouds = [];
let loveHotels = [];

// ゲーム状態
let scrollSpeed = 3;
let scrollOffset = 0;
let score = 0;
let gameRunning = true;
let lives = 3;
let continueCount = 0;
let frameCount = 0;

// キー管理
const keys = {};

// イベントリスナー
window.addEventListener("keydown", e => {
  keys[e.code] = true;
  
  // Xキーでコイン投げ
  if (e.code === 'KeyX' && gameRunning) {
    coins.push({
      x: player.x + player.width,
      y: player.y + 15,
      width: 12,
      height: 12,
      speed: 8
    });
  }
  
  e.preventDefault();
});

window.addEventListener("keyup", e => {
  keys[e.code] = false;
});

// オブジェクト生成関数
function addObstacle() {
  let gap = 150 + Math.random() * 200;
  let obstacleType = Math.random() > 0.5 ? 'schoolgirl' : 'businessman';
  
  obstacles.push({
    x: canvas.width + gap,
    y: canvas.height - FLOOR_HEIGHT - 45,
    width: 30,
    height: 45,
    type: obstacleType,
    hp: obstacleType === 'businessman' ? 1 : Infinity
  });
}

function addCloud() {
  clouds.push({
    x: canvas.width + Math.random() * 200,
    y: 50 + Math.random() * 100,
    width: 60 + Math.random() * 40,
    height: 30 + Math.random() * 20,
    speed: 0.5 + Math.random() * 1
  });
}

function addLoveHotel() {
  loveHotels.push({
    x: canvas.width + Math.random() * 300,
    y: canvas.height - FLOOR_HEIGHT - 120,
    width: 80,
    height: 120,
    speed: 1
  });
}

function addCrow() {
  crows.push({
    x: canvas.width + Math.random() * 200,
    y: 80 + Math.random() * 60,
    width: 25,
    height: 15,
    speed: 2 + Math.random(),
    dropTimer: 0,
    dropInterval: 60 + Math.random() * 120
  });
}

function addPoliceman() {
  policemen.push({
    x: canvas.width + 50,
    y: canvas.height - FLOOR_HEIGHT - 50,
    width: 35,
    height: 50,
    speed: 1.5,
    shootTimer: 0,
    shootInterval: 80 + Math.random() * 60,
    dropkickTimer: 0,
    dropkickInterval: 200 + Math.random() * 100,
    isDropkicking: false,
    dropkickDuration: 0,
    hp: 2
  });
}

// 描画関数
function drawPlayer() {
  const x = player.x;
  const y = player.y;
  
  // 頭（大きめ）
  ctx.fillStyle = "#fdbcb4";
  ctx.fillRect(x + 8, y, 20, 20);
  
  // くるくるパーマ
  ctx.fillStyle = "#8b4513";
  ctx.beginPath();
  ctx.arc(x + 12, y + 5, 4, 0, Math.PI * 2);
  ctx.arc(x + 18, y + 3, 4, 0, Math.PI * 2);
  ctx.arc(x + 24, y + 5, 4, 0, Math.PI * 2);
  ctx.arc(x + 15, y + 8, 3, 0, Math.PI * 2);
  ctx.arc(x + 21, y + 8, 3, 0, Math.PI * 2);
  ctx.fill();
  
  // 目
  ctx.fillStyle = "black";
  ctx.fillRect(x + 12, y + 10, 2, 2);
  ctx.fillRect(x + 20, y + 10, 2, 2);
  
  // 口
  ctx.fillStyle = "red";
  ctx.fillRect(x + 16, y + 15, 3, 1);
  
  // 体（小さめ）
  // オレンジのシャツ
  ctx.fillStyle = "#ff8c00";
  ctx.fillRect(x + 5, y + 20, 25, 15);
  
  // 緑チェックのスカート
  ctx.fillStyle = "#228b22";
  ctx.fillRect(x + 3, y + 35, 29, 12);
  // チェック模様
  ctx.fillStyle = "#006400";
  for(let i = 0; i < 3; i++) {
    ctx.fillRect(x + 5 + i * 8, y + 35, 2, 12);
    ctx.fillRect(x + 3, y + 37 + i * 3, 29, 1);
  }
  
  // 白い前掛け（フリフリ付き）
  ctx.fillStyle = "white";
  ctx.fillRect(x + 8, y + 25, 19, 18);
  // フリフリ
  ctx.beginPath();
  for(let i = 0; i < 5; i++) {
    ctx.arc(x + 10 + i * 4, y + 43, 2, 0, Math.PI * 2);
  }
  ctx.fill();
  
  // 腕
  ctx.fillStyle = "#fdbcb4";
  ctx.fillRect(x + 2, y + 22, 6, 8);
  ctx.fillRect(x + 27, y + 22, 6, 8);
  
  // 足
  ctx.fillStyle = "#fdbcb4";
  ctx.fillRect(x + 10, y + 47, 6, 3);
  ctx.fillRect(x + 19, y + 47, 6, 3);
  
  // 黒サンダル
  ctx.fillStyle = "black";
  ctx.fillRect(x + 9, y + 48, 8, 2);
  ctx.fillRect(x + 18, y + 48, 8, 2);
  
  // 買い物カゴ
  ctx.fillStyle = "#daa520";
  ctx.fillRect(x + 28, y + 25, 8, 6);
  ctx.strokeStyle = "#8b7355";
  ctx.lineWidth = 1;
  ctx.strokeRect(x + 28, y + 25, 8, 6);
  // カゴの編み目
  ctx.beginPath();
  ctx.moveTo(x + 30, y + 25);
  ctx.lineTo(x + 30, y + 31);
  ctx.moveTo(x + 32, y + 25);
  ctx.lineTo(x + 32, y + 31);
  ctx.moveTo(x + 34, y + 25);
  ctx.lineTo(x + 34, y + 31);
  ctx.stroke();
}

function drawSchoolgirl(x, y) {
  // 頭
  ctx.fillStyle = "#fdbcb4";
  ctx.fillRect(x + 8, y, 15, 15);
  
  // 髪（黒のロング）
  ctx.fillStyle = "black";
  ctx.fillRect(x + 6, y, 19, 20);
  ctx.fillStyle = "#fdbcb4";
  ctx.fillRect(x + 9, y + 2, 13, 13);
  
  // 目
  ctx.fillStyle = "black";
  ctx.fillRect(x + 11, y + 7, 2, 2);
  ctx.fillStyle = "black";
  ctx.fillRect(x + 16, y + 7, 2, 2);
  
  // セーラー服（上）
  ctx.fillStyle = "white";
  ctx.fillRect(x + 5, y + 15, 20, 15);
  // セーラー襟
  ctx.fillStyle = "navy";
  ctx.fillRect(x + 5, y + 15, 20, 3);
  ctx.fillRect(x + 8, y + 18, 14, 2);
  
  // スカート
  ctx.fillStyle = "navy";
  ctx.fillRect(x + 3, y + 30, 24, 12);
  
  // 足
  ctx.fillStyle = "#fdbcb4";
  ctx.fillRect(x + 8, y + 42, 5, 3);
  ctx.fillStyle = "#fdbcb4";
  ctx.fillRect(x + 17, y + 42, 5, 3);
  
  // 靴
  ctx.fillStyle = "black";
  ctx.fillRect(x + 7, y + 43, 7, 2);
  ctx.fillRect(x + 16, y + 43, 7, 2);
}

function drawBusinessman(x, y) {
  // 頭
  ctx.fillStyle = "#fdbcb4";
  ctx.fillRect(x + 8, y, 15, 15);
  
  // 髪（短め、黒）
  ctx.fillStyle = "black";
  ctx.fillRect(x + 8, y, 15, 8);
  
  // 目
  ctx.fillStyle = "black";
  ctx.fillRect(x + 11, y + 7, 2, 2);
  ctx.fillRect(x + 16, y + 7, 2, 2);
  
  // スーツ（グレー）
  ctx.fillStyle = "#404040";
  ctx.fillRect(x + 5, y + 15, 20, 20);
  
  // ワイシャツ
  ctx.fillStyle = "white";
  ctx.fillRect(x + 12, y + 15, 6, 20);
  
  // ネクタイ
  ctx.fillStyle = "red";
  ctx.fillRect(x + 14, y + 18, 2, 12);
  
  // ズボン
  ctx.fillStyle = "#202020";
  ctx.fillRect(x + 6, y + 35, 18, 10);
  
  // 足
  ctx.fillStyle = "#fdbcb4";
  ctx.fillRect(x + 8, y + 42, 5, 3);
  ctx.fillRect(x + 17, y + 42, 5, 3);
  
  // 革靴
  ctx.fillStyle = "black";
  ctx.fillRect(x + 7, y + 43, 7, 2);
  ctx.fillRect(x + 16, y + 43, 7, 2);
  
  // ブリーフケース
  ctx.fillStyle = "#8b4513";
  ctx.fillRect(x + 26, y + 25, 6, 8);
}

function drawLoveHotel(hotel) {
  const x = hotel.x;
  const y = hotel.y;
  
  // ビル本体（ピンク）
  ctx.fillStyle = "#ff69b4";
  ctx.fillRect(x, y, hotel.width, hotel.height);
  
  // 窓
  ctx.fillStyle = "#ffb6c1";
  for(let row = 0; row < 4; row++) {
    for(let col = 0; col < 3; col++) {
      ctx.fillRect(x + 10 + col * 20, y + 15 + row * 25, 12, 15);
    }
  }
  
  // 屋上
  ctx.fillStyle = "#dc143c";
  ctx.fillRect(x, y, hotel.width, 10);
  
  // LOVE看板
  ctx.fillStyle = "#ff1493";
  ctx.fillRect(x + 10, y - 15, 60, 20);
  
  // LOVE文字
  ctx.fillStyle = "white";
  ctx.font = "bold 12px Arial";
  ctx.textAlign = "center";
  ctx.fillText("LOVE", x + 40, y - 2);
  
  // ネオンサインのような効果
  ctx.strokeStyle = "#ff69b4";
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 10, y - 15, 60, 20);
}

function drawCrow(crow) {
  const x = crow.x;
  const y = crow.y;
  
  // カラスの体（黒）
  ctx.fillStyle = "black";
  ctx.fillRect(x + 5, y + 5, 15, 8);
  
  // カラスの頭
  ctx.fillRect(x, y + 3, 8, 6);
  
  // くちばし
  ctx.fillStyle = "#ffa500";
  ctx.fillRect(x - 2, y + 5, 3, 2);
  
  // 翼（羽ばたき効果）
  ctx.fillStyle = "black";
  if (Math.floor(Date.now() / 200) % 2) {
    // 翼上がり
    ctx.fillRect(x + 8, y, 12, 5);
    ctx.fillRect(x + 8, y + 10, 12, 5);
  } else {
    // 翼下がり
    ctx.fillRect(x + 8, y + 3, 12, 5);
    ctx.fillRect(x + 8, y + 7, 12, 5);
  }
  
  // 目
  ctx.fillStyle = "red";
  ctx.fillRect(x + 3, y + 4, 2, 2);
}

function drawPoliceman(policeman) {
  const x = policeman.x;
  const y = policeman.y;
  
  // 頭
  ctx.fillStyle = "#fdbcb4";
  ctx.fillRect(x + 10, y, 18, 18);
  
  // 警察帽子
  ctx.fillStyle = "#000080";
  ctx.fillRect(x + 8, y - 2, 22, 8);
  // 帽子のつば
  ctx.fillRect(x + 6, y + 4, 26, 3);
  // 警察マーク
  ctx.fillStyle = "gold";
  ctx.fillRect(x + 17, y + 1, 6, 3);
  
  // 目
  ctx.fillStyle = "black";
  ctx.fillRect(x + 13, y + 8, 2, 2);
  ctx.fillRect(x + 20, y + 8, 2, 2);
  
  // 警察服（上）- 紺色
  ctx.fillStyle = "#000080";
  ctx.fillRect(x + 7, y + 18, 24, 18);
  
  // ボタン
  ctx.fillStyle = "gold";
  for(let i = 0; i < 4; i++) {
    ctx.fillRect(x + 17, y + 20 + i * 4, 2, 2);
  }
  
  // 警察服（下）- ズボン
  ctx.fillStyle = "#000080";
  ctx.fillRect(x + 9, y + 36, 20, 14);
  
  // ドロップキック中の姿勢
  if (policeman.isDropkicking) {
    // 横向きで足を前に出す
    ctx.fillStyle = "#000080";
    ctx.fillRect(x - 10, y + 30, 15, 8);
    ctx.fillStyle = "red";
    ctx.fillRect(x - 12, y + 28, 8, 3);
  } else {
    // 通常の足
    ctx.fillStyle = "#fdbcb4";
    ctx.fillRect(x + 11, y + 47, 6, 3);
    ctx.fillStyle = "#fdbcb4";
    ctx.fillRect(x + 20, y + 47, 6, 3);
    
    // 警察靴
    ctx.fillStyle = "black";
    ctx.fillRect(x + 10, y + 48, 8, 2);
    ctx.fillRect(x + 19, y + 48, 8, 2);
  }
  
  // 腕
  ctx.fillStyle = "#fdbcb4";
  ctx.fillRect(x + 4, y + 22, 6, 10);
  ctx.fillRect(x + 28, y + 22, 6, 10);
  
  // 拳銃
  ctx.fillStyle = "black";
  ctx.fillRect(x + 30, y + 24, 8, 4);
  ctx.fillRect(x + 35, y + 25, 3, 2);
}

function drawCoin(coin) {
  // コインの本体（金色）
  ctx.fillStyle = "#ffd700";
  ctx.beginPath();
  ctx.arc(coin.x + coin.width/2, coin.y + coin.height/2, coin.width/2, 0, Math.PI * 2);
  ctx.fill();
  
  // Bの文字
  ctx.fillStyle = "black";
  ctx.font = "bold 8px Arial";
  ctx.textAlign = "center";
  ctx.fillText("B", coin.x + coin.width/2, coin.y + coin.height/2 + 3);
  
  // 光るエフェクト
  ctx.strokeStyle = "yellow";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(coin.x + coin.width/2, coin.y + coin.height/2, coin.width/2 + 2, 0, Math.PI * 2);
  ctx.stroke();
}

function drawBlood(blood) {
  ctx.fillStyle = "red";
  // 血しぶきをランダムに描画
  for(let i = 0; i < 8; i++) {
    const offsetX = (Math.random() - 0.5) * 30;
    const offsetY = (Math.random() - 0.5) * 30;
    const size = 2 + Math.random() * 4;
    ctx.fillRect(blood.x + 15 + offsetX, blood.y + 20 + offsetY, size, size);
  }
}

function drawCloud(cloud) {
  ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
  ctx.beginPath();
  ctx.arc(cloud.x, cloud.y, cloud.width/3, 0, Math.PI * 2);
  ctx.arc(cloud.x + cloud.width/3, cloud.y, cloud.width/4, 0, Math.PI * 2);
  ctx.arc(cloud.x + cloud.width/2, cloud.y, cloud.width/3, 0, Math.PI * 2);
  ctx.fill();
}

function drawDropping(dropping) {
  ctx.fillStyle = "#8b4513";
  ctx.fillRect(dropping.x, dropping.y, dropping.width, dropping.height);
  
  // フンのハイライト
  ctx.fillStyle = "#deb887";
  ctx.fillRect(dropping.x + 1, dropping.y + 1, 3, 3);
}

function drawBullet(bullet) {
  ctx.fillStyle = "#c0c0c0";
  ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
  
  // 光るエフェクト
  ctx.fillStyle = "white";
  ctx.fillRect(bullet.x + 1, bullet.y + 1, 2, 1);
}

// ゲーム更新関数
function update() {
  if (!gameRunning) return;
  
  frameCount++;
  score = Math.floor(frameCount / 10);
  scoreElement.textContent = score;
  livesElement.textContent = lives;

  // スクロール速度を徐々に上げる
  scrollSpeed = 3 + score / 500;

  // 雲の更新
  clouds.forEach(cloud => {
    cloud.x -= cloud.speed;
  });
  clouds = clouds.filter(cloud => cloud.x + cloud.width > 0);
  
  // ラブホテルの更新
  loveHotels.forEach(hotel => {
    hotel.x -= hotel.speed;
  });
  loveHotels = loveHotels.filter(hotel => hotel.x + hotel.width > 0);
  
  // カラスの更新
  crows.forEach(crow => {
    crow.x -= crow.speed;
    crow.dropTimer++;
    
    // フンを落とす
    if (crow.dropTimer >= crow.dropInterval) {
      droppings.push({
        x: crow.x + crow.width/2,
        y: crow.y + crow.height,
        width: 8,
        height: 8,
        speed: 4
      });
      crow.dropTimer = 0;
      crow.dropInterval = 60 + Math.random() * 120;
    }
  });
  crows = crows.filter(crow => crow.x + crow.width > 0);
  
  // フンの更新
  droppings.forEach(dropping => {
    dropping.y += dropping.speed;
  });
  droppings = droppings.filter(dropping => dropping.y < canvas.height);
  
  // お巡りさんの更新
  policemen.forEach(policeman => {
    policeman.x -= policeman.speed;
    policeman.shootTimer++;
    policeman.dropkickTimer++;
    
    // ドロップキック中の処理
    if (policeman.isDropkicking) {
      policeman.dropkickDuration++;
      if (policeman.dropkickDuration > 30) {
        policeman.isDropkicking = false;
        policeman.dropkickDuration = 0;
      }
    }
    
    // 弾丸を撃つ
    if (policeman.shootTimer >= policeman.shootInterval) {
      bullets.push({
        x: policeman.x,
        y: policeman.y + 20,
        width: 8,
        height: 3,
        speed: 4
      });
      policeman.shootTimer = 0;
      policeman.shootInterval = 80 + Math.random() * 60;
    }
    
    // ドロップキックをする
    if (policeman.dropkickTimer >= policeman.dropkickInterval && !policeman.isDropkicking) {
      const nearbySchoolgirl = obstacles.find(ob => 
        ob.type === 'schoolgirl' && 
        Math.abs(ob.x - policeman.x) < 80 && 
        Math.abs(ob.y - policeman.y) < 50
      );
      
      if (nearbySchoolgirl) {
        policeman.isDropkicking = true;
        policeman.dropkickTimer = 0;
        policeman.dropkickInterval = 200 + Math.random() * 100;
        
        const index = obstacles.indexOf(nearbySchoolgirl);
        if (index > -1) {
          obstacles.splice(index, 1);
        }
      }
    }
  });
  policemen = policemen.filter(policeman => policeman.x + policeman.width > 0);
  
  // 弾丸の更新
  bullets.forEach(bullet => {
    bullet.x -= bullet.speed;
  });
  bullets = bullets.filter(bullet => bullet.x + bullet.width > 0);
  
  // おばさんのコインの更新
  coins.forEach(coin => {
    coin.x += coin.speed;
  });
  coins = coins.filter(coin => coin.x < canvas.width);
  
  // 血のエフェクトの更新
  bloodEffects.forEach(blood => {
    blood.timer++;
  });
  bloodEffects = bloodEffects.filter(blood => blood.timer < 60);
  
  // コインと敵の衝突判定
  coins.forEach((coin, coinIndex) => {
    // 警察の弾丸との衝突
    bullets.forEach((bullet, bulletIndex) => {
      if (
        coin.x < bullet.x + bullet.width &&
        coin.x + coin.width > bullet.x &&
        coin.y < bullet.y + bullet.height &&
        coin.y + coin.height > bullet.y
      ) {
        coins.splice(coinIndex, 1);
        bullets.splice(bulletIndex, 1);
      }
    });
    
    // 警察官との衝突
    policemen.forEach((policeman, policeIndex) => {
      if (
        coin.x < policeman.x + policeman.width &&
        coin.x + coin.width > policeman.x &&
        coin.y < policeman.y + policeman.height &&
        coin.y + coin.height > policeman.y
      ) {
        coins.splice(coinIndex, 1);
        policeman.hp--;
        
        if (policeman.hp <= 0) {
          bloodEffects.push({
            x: policeman.x,
            y: policeman.y,
            timer: 0
          });
          policemen.splice(policeIndex, 1);
        }
      }
    });
    
    // サラリーマンとの衝突
    obstacles.forEach((obstacle, obstacleIndex) => {
      if (
        obstacle.type === 'businessman' &&
        coin.x < obstacle.x + obstacle.width &&
        coin.x + coin.width > obstacle.x &&
        coin.y < obstacle.y + obstacle.height &&
        coin.y + coin.height > obstacle.y
      ) {
        coins.splice(coinIndex, 1);
        obstacle.hp--;
        
        if (obstacle.hp <= 0) {
          bloodEffects.push({
            x: obstacle.x,
            y: obstacle.y,
            timer: 0
          });
          obstacles.splice(obstacleIndex, 1);
        }
      }
    });
  });
  
  // オブジェクト生成タイミング
  if (frameCount % 200 === 0) {
    addCloud();
  }
  
  if (frameCount % 400 === 0) {
    addLoveHotel();
  }
  
  if (frameCount % 300 === 0) {
    addCrow();
  }
  
  if (frameCount % 500 === 0) {
    addPoliceman();
  }

  // 障害物の更新
  obstacles.forEach(ob => {
    ob.x -= scrollSpeed;
  });
  obstacles = obstacles.filter(ob => ob.x + ob.width > 0);

  // 障害物を追加
  if (frameCount % Math.max(80 - Math.floor(score/100), 40) === 0) {
    addObstacle();
  }

  // プレイヤー移動
  if (keys["ArrowRight"] || keys["KeyD"]) {
    player.x += player.speed;
    if (player.x > canvas.width - player.width) {
      player.x = canvas.width - player.width;
    }
  }
  if (keys["ArrowLeft"] || keys["KeyA"]) {
    player.x -= player.speed;
    if (player.x < 0) player.x = 0;
  }

  // ジャンプ
  if ((keys["Space"] || keys["ArrowUp"] || keys["KeyW"]) && !player.jumping) {
    player.vy = -14;
    player.jumping = true;
  }

  // 重力を加算
  player.vy += GRAVITY;
  player.y += player.vy;

  // 床に着地判定
  if (player.y + player.height > canvas.height - FLOOR_HEIGHT) {
    player.y = canvas.height - FLOOR_HEIGHT - player.height;
    player.vy = 0;
    player.jumping = false;
  }

  // 衝突判定（地上の障害物）
  obstacles.forEach(ob => {
    if (
      player.x < ob.x + ob.width - 5 &&
      player.x + player.width > ob.x + 5 &&
      player.y < ob.y + ob.height - 5 &&
      player.y + player.height > ob.y + 5
    ) {
      continueCount++;
      gameOver();
    }
  });
  
  // 衝突判定（フン）
  droppings.forEach((dropping, index) => {
    if (
      player.x < dropping.x + dropping.width &&
      player.x + player.width > dropping.x &&
      player.y < dropping.y + dropping.height &&
      player.y + player.height > dropping.y
    ) {
      droppings.splice(index, 1);
      continueCount++;
      gameOver();
    }
  });
  
  // 衝突判定（弾丸）
  bullets.forEach((bullet, index) => {
    if (
      player.x < bullet.x + bullet.width &&
      player.x + player.width > bullet.x &&
      player.y < bullet.y + bullet.height &&
      player.y + player.height > bullet.y
    ) {
      bullets.splice(index, 1);
      continueCount++;
      gameOver();
    }
  });
}

// ゲームオーバー処理
function gameOver() {
  lives--;
  if (lives > 0) {
    gameRunning = false;
    setTimeout(() => {
      alert(`ライフが残り${lives}つあります！\nESCキーを押してコンティニューするか、\nページを更新してゲームを終了してください。`);
      
      const escapeHandler = (e) => {
        if (e.code === 'Escape') {
          e.preventDefault();
          player.x = 50;
          player.y = canvas.height - FLOOR_HEIGHT - player.height;
          player.vy = 0;
          player.jumping = false;
          obstacles = obstacles.filter(ob => ob.x > player.x + 100);
          droppings = droppings.filter(drop => drop.x > player.x + 100);
          bullets = bullets.filter(bullet => bullet.x > player.x + 100);
          coins = coins.filter(coin => coin.x < player.x || coin.x > player.x + 100);
          gameRunning = true;
          window.removeEventListener('keydown', escapeHandler);
        }
      };
      window.addEventListener('keydown', escapeHandler);
    }, 100);
  } else {
    gameRunning = false;
    setTimeout(() => {
      if (confirm(`ゲームオーバー！\nスコア: ${score}\nコンティニュー回数: ${continueCount}\n\n[OK] = もう一度プレイ\n[キャンセル] = 終了`)) {
        resetGame();
      }
    }, 100);
  }
}

// ゲームリセット
function resetGame() {
  player.x = 50;
  player.y = canvas.height - FLOOR_HEIGHT - player.height;
  player.vy = 0;
  player.jumping = false;
  obstacles = [];
  clouds = [];
  loveHotels = [];
  crows = [];
  droppings = [];
  policemen = [];
  bullets = [];
  coins = [];
  bloodEffects = [];
  frameCount = 0;
  score = 0;
  lives = 3;
  continueCount = 0;
  scrollSpeed = 3;
  gameRunning = true;
}

// 描画関数
function draw() {
  // 画面クリア（グラデーション背景）
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "#87ceeb");
  gradient.addColorStop(0.7, "#98d8e8");
  gradient.addColorStop(1, "#7ec850");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 雲を描画
  clouds.forEach(drawCloud);

  // ラブホテルを描画
  loveHotels.forEach(drawLoveHotel);

  // カラスを描画
  crows.forEach(drawCrow);

  // フンを描画
  droppings.forEach(drawDropping);

  // 地面描画
  ctx.fillStyle = "#654321";
  ctx.fillRect(0, canvas.height - FLOOR_HEIGHT, canvas.width, FLOOR_HEIGHT);
  
  // 草のテクスチャ
  ctx.fillStyle = "#4a5c2a";
  for (let i = 0; i < canvas.width; i += 10) {
    ctx.fillRect(i, canvas.height - FLOOR_HEIGHT, 2, -5);
  }

  // プレイヤー描画
  drawPlayer();

  // 障害物描画
  obstacles.forEach(ob => {
    if (ob.type === 'schoolgirl') {
      drawSchoolgirl(ob.x, ob.y);
    } else {
      drawBusinessman(ob.x, ob.y);
    }
  });

  // お巡りさんを描画
  policemen.forEach(drawPoliceman);

  // 弾丸を描画
  bullets.forEach(drawBullet);

  // 血のエフェクトを描画
  bloodEffects.forEach(drawBlood);

  // おばさんのコインを描画
  coins.forEach(drawCoin);

  // ゲームオーバー時の表示
  if (!gameRunning) {
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = "white";
    ctx.font = "bold 48px Arial";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", canvas.width/2, canvas.height/2 - 20);
    
    ctx.font = "24px Arial";
    ctx.fillText(`スコア: ${score}`, canvas.width/2, canvas.height/2 + 20);
    
    ctx.font = "16px Arial";
    ctx.fillText("ESCキーでコンティニューできます", canvas.width/2, canvas.height/2 + 50);
  }
}

// ゲームループ
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

// 初期要素を追加
for (let i = 0; i < 3; i++) {
  addCloud();
}
for (let i = 0; i < 1; i++) {
  addLoveHotel();
}
for (let i = 0; i < 2; i++) {
  addCrow();
}
for (let i = 0; i < 1; i++) {
  addPoliceman();
}

// ゲーム開始
loop();