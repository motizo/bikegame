//バイクゲーム

var c = document.createElement("canvas"); //htmlタグのcanvasを作成
var ctx = c.getContext("2d"); //canvasを描画する為に必要な記述
c.width = 1000;
c.height = 500;

//作ったコンテキストをhtmlのbodyにappendChildで追加していく
document.body.appendChild(c);

/* デコボコの斜面を描画する */
//パラメータを入れる為に配列permを用意する
var perm = [];
//permのlengthが255になるまで実行する
while (perm.length < 255) {
    // Math.random()関数は、0-1(0以上、1未満)の範囲で
    // 浮動小数点の疑似乱数を返します。
    // 255個の中からランダムで配列に追加する。
    while(perm.includes(val = Math.floor(Math.random() * 2 * 255)));
    perm.push(val);
}

//　lerpは線形分離のことです
// aベクトルとbベクトルを分断する図のところ
// 分離するベクトルを得ることができる
// なだらかにする。Math.cos(t * 円周率)/2で
var lerp = (a, b, t) => a + (b - a) * (1 - Math.cos(t * Math.PI)) / 2;

// 斜面を作成するために線形分離を使っているが、
// 自分の理想とする斜面が描画できればなんでもいい
// noise関数
var noise = x => {
    //x を255で割った余りをxに代入する 横幅いっぱいに坂道が広がる
    //0.01倍することで、細い線を拡大したようになる
    x = x * 0.01 % 255;
    //Math.ceilとは小数点繰り上げの処理
    return lerp(perm[Math.floor(x)], perm[Math.ceil(x)], x -
    Math.floor(x));
}

//メモ 「凸凹道の作成の箇所」
//xを255で割った余りをxに代入するところの説明
//配列permの要素数は255です
//c.widthは255以上の値になります
//なので配列のindexとしては不敵な値が入ります
//これを解決するために255で割った余りを配列のindexに指定します

/*プレイヤーを作成する*/
var player = new function() {
    this.x = c.width / 2;
    this.y = 0;
    this.ySpeed = 0;
    this.rot = 0;
    this.rSpeed = 0;

    this.img = new Image();
    this.img.src = "image/reimu.gif";
    this.draw = function() {
        var p1 = c.height - noise(t + this.x) * 0.25;
        var p2 = c.height - noise(t + 5 + this.x) * 0.25;

        //地面接地のフラグ
        var grounded = 0;

        if(p1 - 15 > this.y) {
            this.ySpeed += 0.1;
        } else {
            this.ySpeed -= this.y - (p1 - 15);
            this.y = p1 - 15;
            //地面に触れているかどうかを検知しやすくなります
            grounded = 1;
        }

        if(!playing || grounded && Math.abs(this.rot) > Math.PI * 0.5) {
            playing = false;
            this.rSpeed = 5;
            k.ArrowUp = 1;
            this.x -= speed * 5;
        }

        var angle = Math.atan2((p2 - 15) - this.y, (this.x + 5) - this.x);

        // this.rot = angle;

        this.y += this.ySpeed;

        if (grounded && playing) {
            this.rot -= (this.rot - angle) * 0.5;
            this.rSpeed = this.rSpeed - (angle - this.rot);
        }

        this.rSpeed += (k.ArrowLeft - k.ArrowRight) * 0.05;
        this.rot -= this.rSpeed * 0.1;

        if(this.rot > Math.PI) this.rot = -Math.PI;
        if(this.rot < -Math.PI) this.rot = Math.PI;

        //再描画するために必要何度もするため
        //saveしておくことでdrawImageの座標指定が簡単になります
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rot);
        ctx.drawImage(this.img, -15, -15, 30, 30);

        //再描画するために必要何度もするため
        //context.restore()描画状態を保存した時点のものに戻す
        ctx.restore();
    }
}

// tを増やして少しずつ斜面の山を作成する為に用意
var t = 0;
// 速さの初期値
var speed = 0;
// ゲームオーバーの設定
var playing = true;
// 矢印キー操作の為に変数を宣言
var k = {ArrowUp: 0, ArrowDown: 0, ArrowLeft: 0, ArrowRight: 0};

//アニメーションをする為にループする
function loop() {
    speed -= (speed - (k.ArrowUp - k.ArrowDown)) * 0.1;
    //速さを変える
    t += 10 * speed;
    //黒い背景を変える
    ctx.fillStyle = "#19f";
    //長方形を描画する関数
    //fillRect(x,y,w,h) 
    //x 四角形の左上のx座標
    //y 四角形の左上のy座標
    //w 四角形の幅
    //h 四角形の高さ
    ctx.fillRect(0, 0, c.width, c.height);

    // 凸凹の斜面を塗りつぶす設定をする
    ctx.fillStyle = "black";

    // 線を描画する時には、beginPath()を最初に宣言する
    ctx.beginPath();
    //context.moveTo(x,y) ctxってのはcontext
    //新しいサブパスの開始点を座標指定する
    //最初の支点を左下隅に設定している。
    ctx.moveTo(0, c.height);

    // 山の斜面を左隅から右にかけてどんどん描画する
    for (var i = 0; i < c.width; i++) {
        //lineTo(開始,終点)は、線を引く関数
        //0.25倍して線の高さを低く調整
        //noise(t+i)でnoiseの値も変わるのでアニメーションしているように見える
        ctx.lineTo(i, c.height - noise(t + i) * 0.25);
    }

    //四角形にノイズの部分がびっしり坂ができるように設定
    ctx.lineTo(c.width, c.height);

    ctx.fill();


    player.draw();
    //window.requestAnimationFrame();
    //ブラウザにアニメーションを行い隊ことを知らせ、
    //指定した関数を呼び出して、
    //次の再描画の前にアニメーションを更新することを要求します。
    //用するに短い時間の中でループする処理を実行できる。
    requestAnimationFrame(loop);
}

//キー操作の設定
//onkeydown = 押した時、onkeyup = 離した時
onkeydown = d => k[d.key] = 1;
onkeyup = d => k[d.key] = 0;

loop();