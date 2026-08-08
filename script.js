// ===============================
// CANVAS
// ===============================

const canvas =
    document.getElementById("gameCanvas");

const ctx =
    canvas.getContext("2d");


// ===============================
// HTML ELEMENTS
// ===============================

const scoreElement =
    document.getElementById("score");

const bestElement =
    document.getElementById("best");

const overlay =
    document.getElementById("overlay");

const gameTitle =
    document.getElementById("gameTitle");

const gameMessage =
    document.getElementById("gameMessage");

const startBtn =
    document.getElementById("startBtn");

const restartBtn =
    document.getElementById("restartBtn");


// ===============================
// GAME VARIABLES
// ===============================

let player;

let enemies = [];

let stars = [];

let particles = [];

let keys = {};

let score = 0;

let best =
    Number(
        localStorage.getItem("neonBest")
    ) || 0;

let gameRunning = false;

let enemyTimer = 0;

let starTimer = 0;

let gameSpeed = 3;

let lastTime = 0;


// Display best score

bestElement.textContent = best;


// ===============================
// RANDOM NUMBER
// ===============================

function random(min, max) {

    return Math.random() *
        (max - min) + min;

}


// ===============================
// CREATE PLAYER
// ===============================

function createPlayer() {

    player = {

        x: canvas.width / 2,

        y: canvas.height - 50,

        width: 45,

        height: 22,

        speed: 7

    };

}


// ===============================
// CREATE ENEMY
// ===============================

function createEnemy() {

    enemies.push({

        x:
            random(
                20,
                canvas.width - 20
            ),

        y: -30,

        radius:
            random(12, 22),

        speed:
            gameSpeed +
            random(0, 2)

    });

}


// ===============================
// CREATE STAR
// ===============================

function createStar() {

    stars.push({

        x:
            random(
                20,
                canvas.width - 20
            ),

        y: -20,

        radius: 10,

        speed:
            gameSpeed * 0.7

    });

}


// ===============================
// CREATE PARTICLES
// ===============================

function createParticles(x, y) {

    for (let i = 0; i < 15; i++) {

        particles.push({

            x: x,

            y: y,

            vx:
                random(-3, 3),

            vy:
                random(-3, 3),

            life: 1

        });

    }

}


// ===============================
// COLLISION
// ===============================

function collision(player, object) {

    const closestX =
        Math.max(
            player.x -
                player.width / 2,

            Math.min(
                object.x,

                player.x +
                    player.width / 2
            )
        );


    const closestY =
        Math.max(
            player.y -
                player.height / 2,

            Math.min(
                object.y,

                player.y +
                    player.height / 2
            )
        );


    const dx =
        object.x - closestX;


    const dy =
        object.y - closestY;


    return (
        dx * dx +
        dy * dy
    ) < object.radius *
        object.radius;

}


// ===============================
// UPDATE GAME
// ===============================

function update(deltaTime) {


    // PLAYER LEFT

    if (
        keys["ArrowLeft"] ||
        keys["a"]
    ) {

        player.x -=
            player.speed *
            deltaTime *
            60;

    }


    // PLAYER RIGHT

    if (
        keys["ArrowRight"] ||
        keys["d"]
    ) {

        player.x +=
            player.speed *
            deltaTime *
            60;

    }


    // PLAYER LIMIT

    player.x =
        Math.max(
            player.width / 2,

            Math.min(
                canvas.width -
                    player.width / 2,

                player.x
            )
        );


    // =========================
    // ENEMY TIMER
    // =========================

    enemyTimer -= deltaTime;


    if (enemyTimer <= 0) {

        createEnemy();

        enemyTimer =
            Math.max(
                0.25,

                0.8 -
                    score / 300
            );

    }


    // =========================
    // STAR TIMER
    // =========================

    starTimer -= deltaTime;


    if (starTimer <= 0) {

        createStar();

        starTimer =
            random(1, 2);

    }


    // Increase difficulty

    gameSpeed +=
        deltaTime * 0.03;


    // =========================
    // ENEMIES
    // =========================

    for (
        let i =
            enemies.length - 1;

        i >= 0;

        i--
    ) {

        const enemy =
            enemies[i];


        enemy.y +=
            enemy.speed *
            deltaTime *
            60;


        // Remove enemy

        if (
            enemy.y -
                enemy.radius >
            canvas.height
        ) {

            enemies.splice(i, 1);

            continue;

        }


        // Player collision

        if (
            collision(
                player,
                enemy
            )
        ) {

            createParticles(
                player.x,
                player.y
            );

            gameOver();

            return;

        }

    }


    // =========================
    // STARS
    // =========================

    for (
        let i =
            stars.length - 1;

        i >= 0;

        i--
    ) {

        const star =
            stars[i];


        star.y +=
            star.speed *
            deltaTime *
            60;


        // Remove star

        if (
            star.y -
                star.radius >
            canvas.height
        ) {

            stars.splice(i, 1);

            continue;

        }


        // Collect star

        if (
            collision(
                player,
                star
            )
        ) {

            score += 10;


            scoreElement.textContent =
                score;


            createParticles(
                star.x,
                star.y
            );


            stars.splice(i, 1);

        }

    }


    // =========================
    // PARTICLES
    // =========================

    for (
        let i =
            particles.length - 1;

        i >= 0;

        i--
    ) {

        const particle =
            particles[i];


        particle.x +=
            particle.vx;


        particle.y +=
            particle.vy;


        particle.life -=
            deltaTime * 2;


        if (
            particle.life <= 0
        ) {

            particles.splice(i, 1);

        }

    }

}


// ===============================
// DRAW GAME
// ===============================

function draw() {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // =========================
    // BACKGROUND GRID
    // =========================

    ctx.strokeStyle =
        "rgba(80,110,210,0.1)";

    ctx.lineWidth = 1;


    for (
        let x = 0;

        x < canvas.width;

        x += 45
    ) {

        ctx.beginPath();

        ctx.moveTo(x, 0);

        ctx.lineTo(
            x,
            canvas.height
        );

        ctx.stroke();

    }


    for (
        let y = 0;

        y < canvas.height;

        y += 45
    ) {

        ctx.beginPath();

        ctx.moveTo(0, y);

        ctx.lineTo(
            canvas.width,
            y
        );

        ctx.stroke();

    }


    // =========================
    // STARS
    // =========================

    stars.forEach(star => {

        ctx.save();


        ctx.translate(
            star.x,
            star.y
        );


        ctx.rotate(
            Date.now() / 500
        );


        ctx.fillStyle =
            "#ffe66d";


        ctx.shadowBlur = 20;

        ctx.shadowColor =
            "#ffe66d";


        ctx.beginPath();


        for (
            let i = 0;

            i < 10;

            i++
        ) {

            const radius =
                i % 2 === 0
                    ? 10
                    : 4;


            const angle =
                -Math.PI / 2 +
                i * Math.PI / 5;


            ctx.lineTo(

                Math.cos(angle) *
                    radius,

                Math.sin(angle) *
                    radius

            );

        }


        ctx.closePath();

        ctx.fill();

        ctx.restore();

    });


    // =========================
    // ENEMIES
    // =========================

    enemies.forEach(enemy => {

        ctx.fillStyle =
            "#ff3d71";


        ctx.shadowBlur = 20;

        ctx.shadowColor =
            "#ff174f";


        ctx.beginPath();


        ctx.arc(

            enemy.x,

            enemy.y,

            enemy.radius,

            0,

            Math.PI * 2

        );


        ctx.fill();


        ctx.shadowBlur = 0;


        // Enemy eyes

        ctx.fillStyle =
            "white";


        ctx.beginPath();


        ctx.arc(

            enemy.x - 5,

            enemy.y - 3,

            2.5,

            0,

            Math.PI * 2

        );


        ctx.arc(

            enemy.x + 5,

            enemy.y - 3,

            2.5,

            0,

            Math.PI * 2

        );


        ctx.fill();

    });


    // =========================
    // PLAYER
    // =========================

    ctx.save();


    ctx.translate(
        player.x,
        player.y
    );


    ctx.fillStyle =
        "#4da3ff";


    ctx.shadowBlur = 25;

    ctx.shadowColor =
        "#4da3ff";


    ctx.beginPath();


    ctx.roundRect(

        -player.width / 2,

        -player.height / 2,

        player.width,

        player.height,

        8

    );


    ctx.fill();


    ctx.shadowBlur = 0;


    // Player lights

    ctx.fillStyle =
        "#ffffff";


    ctx.beginPath();


    ctx.arc(

        -10,

        0,

        3,

        0,

        Math.PI * 2

    );


    ctx.arc(

        10,

        0,

        3,

        0,

        Math.PI * 2

    );


    ctx.fill();


    ctx.restore();


    // =========================
    // PARTICLES
    // =========================

    particles.forEach(
        particle => {

            ctx.globalAlpha =
                particle.life;


            ctx.fillStyle =
                "#8fc7ff";


            ctx.fillRect(

                particle.x,

                particle.y,

                4,

                4

            );

        }
    );


    ctx.globalAlpha = 1;

}


// ===============================
// GAME LOOP
// ===============================

function gameLoop(time) {

    if (!gameRunning) {

        return;

    }


    const deltaTime =
        Math.min(

            (time - lastTime) /
                1000,

            0.03

        );


    lastTime = time;


    update(deltaTime);

    draw();


    if (gameRunning) {

        requestAnimationFrame(
            gameLoop
        );

    }

}


// ===============================
// START GAME
// ===============================

function startGame() {

    createPlayer();


    enemies = [];

    stars = [];

    particles = [];


    score = 0;

    gameSpeed = 3;

    enemyTimer = 0;

    starTimer = 0;


    gameRunning = true;


    scoreElement.textContent =
        0;


    overlay.classList.add(
        "hidden"
    );


    lastTime =
        performance.now();


    requestAnimationFrame(
        gameLoop
    );

}


// ===============================
// GAME OVER
// ===============================

function gameOver() {

    gameRunning = false;


    // New best score

    if (score > best) {

        best = score;


        localStorage.setItem(
            "neonBest",
            best
        );


        bestElement.textContent =
            best;

    }


    gameTitle.textContent =
        "💥 GAME OVER";


    gameMessage.textContent =
        "Your Score: " +
        score +
        " | Best: " +
        best;


    startBtn.textContent =
        "PLAY AGAIN";


    overlay.classList.remove(
        "hidden"
    );

}


// ===============================
// RESTART
// ===============================

function restartGame() {

    startGame();

}


// ===============================
// KEYBOARD CONTROLS
// ===============================

document.addEventListener(
    "keydown",
    function(event) {

        if (

            event.key ===
                "ArrowLeft" ||

            event.key ===
                "ArrowRight" ||

            event.key === " "

        ) {

            event.preventDefault();

        }


        keys[event.key] = true;

    }
);


document.addEventListener(
    "keyup",
    function(event) {

        keys[event.key] = false;

    }
);


// ===============================
// BUTTON EVENTS
// ===============================

startBtn.addEventListener(
    "click",
    startGame
);


restartBtn.addEventListener(
    "click",
    restartGame
);


// ===============================
// INITIALIZE
// ===============================

createPlayer();