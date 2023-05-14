let zombies = [];
let fireballs = [];
let wave = 0;
let upgradeMenu = false;
let pause = false;
let player = {
  x: 200,
  y: 200,
  friction: 0.1,
  w: 40,
  h: 80,
  acc_X: 0,
  acc_Y: 0,
  picture: "./img/player.png",
  maxHealth: 100,
  health: 100,
  accelerationConst: 0.4,
  visability: true,
  center: 0,
};
let fireballCooldown = 0;
let aoeAttackCooldown = 0;
let damageMuliplier = 1;
let cooldownMultiplier = 1;
let backgroundMusic = new Audio("../audio/Background-music.mp3");
let damageSound = new Audio("../audio/Damage-soundeffekt.mp3");

//Funktion som tar input och ändrar spelarens accelation genom att plussa på en konstant för acceleration
function playerControl(player) {
  if (keyboard.d || keyboard.right) player.acc_X += player.accelerationConst;
  if (keyboard.a || keyboard.left) player.acc_X -= player.accelerationConst;
  if (keyboard.w || keyboard.up) player.acc_Y -= player.accelerationConst;
  if (keyboard.s || keyboard.down) player.acc_Y += player.accelerationConst;
}

//Funktion så att objekt kan röra sig
function movement(object) {
  //Plussar på värdet av objektets acceleration på x och y kordinaterna så att man kan röra på sig
  object.x += object.acc_X;
  object.y += object.acc_Y;

  //Minskar accelerationen hela tiden beroende på vad frictionen är och ser även till att objektet har en max hastighet
  object.acc_X *= 1 - object.friction;
  object.acc_Y *= 1 - object.friction;

  //Gör så att om ett objekts acceleration är tillräckligt lågt kommer accelerationen bli noll på den axeln så att objectet inte rör sig när den inte ska
  if (object.acc_X > 0 && object.acc_X < 0.2) object.acc_X = 0;
  if (object.acc_X < 0 && object.acc_X > -0.2) object.acc_X = 0;
  if (object.acc_Y > 0 && object.acc_Y < 0.2) object.acc_Y = 0;
  if (object.acc_Y < 0 && object.acc_Y > -0.2) object.acc_Y = 0;
}

//Funktion för att skapa nya fiender där man även kan specifiera vilken typ och hur många
function enemyCreate(zombie, buffZombies, zombieBoss) {
  //for loop som lägger till zombies i en lista. Några av värdena på zombiesen är även varierade för en mer varierat gameplay
  for (var i = 0; i < zombie; i++) {
    zombies.push({
      x: Math.random() * screen.width - 40, //Använde mig av Math.random (Math.random då random från simple.js inte fungerade) för att få ett random nummer mellan 0 och skärmbredden. -40 finns för att zombiens bredd är 40 px
      y: Math.random() * screen.height - 80, //Använde mig av Math.random (Math.random då random från simple.js inte fungerade) för att få ett random nummer mellan 0 och skärmhöjden. -80 finns för att zombiens bredd är 40 px
      w: 40,
      h: 80,
      friction: Math.floor(Math.random() * 4 + 1) / 10, //Match random för att få ett random nummer. * 4 för att få mellan 0 till 4 + 1 för att det lägsta värdet man ska kunna få är 1. / 10 för att få en decimal. Math.floor för att sedan avrunda nummret
      picture: "./img/zombie.png",
      visability: true,
      maxHealth: 100,
      health: 100,
      acc_X: 0,
      acc_Y: 0,
      accelerationConst: Math.floor(Math.random() * 4.5 + 1.5) / 10,
      damage: 10,
      damageCooldown: 0,
    });
  }
  for (var i = 0; i < buffZombies; i++) {
    zombies.push({
      x: Math.random() * screen.width,
      y: Math.random() * screen.height,
      w: 60,
      h: 100,
      friction: Math.floor(Math.random() * 4 + 1) / 10,
      picture: "./img/buffZombie.png",
      visability: true,
      maxHealth: 200,
      health: 200,
      acc_X: 0,
      acc_Y: 0,
      accelerationConst: Math.floor(Math.random() * 4.5 + 1.4) / 10,
      damage: 20,
      damageCooldown: 0,
    });
  }
  for (var i = 0; i < zombieBoss; i++) {
    zombies.push({
      x: Math.random() * screen.width,
      y: Math.random() * screen.height,
      w: 100,
      h: 140,
      friction: Math.floor(Math.random() * 4 + 1) / 10,
      picture: "./img/bossZombie.png",
      visability: true,
      maxHealth: 400,
      health: 400,
      acc_X: 0,
      acc_Y: 0,
      accelerationConst: Math.floor(Math.random() * 4.5 + 1.5) / 10,
      damage: 40,
      damageCooldown: 0,
    });
  }
}

//Funktion för att måla objekt och deras healthbar
function objectDraw(object) {
  if (object.visability === true) {
    //Målar upp objectet
    picture(object.x, object.y, object.picture);
    //Målar objectets healthbar
    rectangle(
      object.x,
      object.y - 10,
      object.w * (object.health / object.maxHealth),
      5,
      "red"
    );
  }
}

//Funktion så att object kan följa efter spelaren
function followPlayer(object) {
  //Ger avståndet till objekt
  this.enemyDistance = sqrt(
    (player.x - object.x) ** 2 + (player.y - object.y) ** 2
  );
  //Ändrar accelerationen på en axel beroende på var objektet är utifrån var player objektet är. Delar på distansen för att objektet ska röra sig jämnt mot player och inte hacka fram och tillbaka som skedde med koden från youtube-videon.
  object.acc_X =
    ((player.x - object.x) / this.enemyDistance) *
    object.accelerationConst *
    2.7;
  object.acc_Y =
    ((player.y - object.y) / this.enemyDistance) *
    object.accelerationConst *
    2.7;
}

//Kod som kollar ifall två objekt kolliderar. Om det sker så dras även lite utav objekt 1:s liv och en cooldown för att objekt 2 ska kunna attakera startar
function collission(obj1, obj2) {
  if (
    obj1.x < obj2.x + obj2.w &&
    obj1.x + obj1.w > obj2.x &&
    obj1.y < obj2.y + obj2.h &&
    obj1.h + obj1.y > obj2.y &&
    obj2.damageCooldown === 0
  ) {
    //Drar bort den mängd liv som objekt 2 skadar på objekt 1
    obj1.health -= obj2.damage;
    //Spelar ljudeffekt när obj2 och obj1 kolliderar
    damageSound.play();
    //Sätter en cooldown för objekt 2
    obj2.damageCooldown = 120;
  }
  //Om objekt 2 har en cooldown så börjar den minska
  if (obj2.damageCooldown > 0) obj2.damageCooldown--;
}

//Skapar en gräns så att spelaren inte kan gå utanför mappen
function border(object) {
  if (object.x <= 0) {
    object.x -= object.acc_X * (1 / (1 - object.friction));
  }
  if (object.y <= 0) {
    object.y -= object.acc_Y * (1 / (1 - object.friction));
  }
  if (object.x + object.w >= screen.width) {
    object.x -= object.acc_X * (1 / (1 - object.friction));
  }
  if (object.y + object.h >= screen.height) {
    object.y -= object.acc_Y * (1 / (1 - object.friction));
  }
}

//Funktion som skapar fireballs när man klickar på musknappen.
function fireball() {
  if (mouse.left === true && fireballCooldown === 0) {
    //tar reda på players mitt punkt
    player.center = { x: player.x + player.w / 2, y: player.y + player.h / 2 };
    //kollar vad avståndet på vardera axel är från spelares center till musens kordinat
    playerAimX = mouse.x - player.center.x;
    playerAimY = mouse.y - player.center.y;
    //Tar reda på avståndet till musen från spelaren. Använde mig av dethär sättet att räkna avstånd då simple.js funktioner ibland inte fungerar
    aimDistance = sqrt(playerAimX ** 2 + playerAimY ** 2);
    //Lägger till en ny eldboll i fireballslistan
    fireballs.push({
      x: player.center.x - 2.5,
      y: player.center.y - 2.5,
      w: 5,
      h: 5,
      friction: 0,
      color: "orange",
      acc_X: (4 * playerAimX) / aimDistance, //playerAimX / aimDistance och playerAimY / aimDistance är för att fireballs ska kunna få en jämare bana att åka på när dem skjuts iväg så att dem inte hackar framåt och tillbaka.
      acc_Y: (4 * playerAimY) / aimDistance,
      damage: 25,
    });
    //sätter en cooldown för fireballen
    fireballCooldown = 90;
  }

  //om fireball har en cooldown så ska den minska. Detta gör att om en cooldown har 150 kommer det vara en cooldown på en sekund då koden uppdateras 150 gångenr per sekund
  if (fireballCooldown > 0) {
    fireballCooldown--;
  }

  if (fireballs.length > 0) {
    for (var i = 0; i < fireballs.length; i++) {
      movement(fireballs[i]);
      rectangle(
        fireballs[i].x,
        fireballs[i].y,
        fireballs[i].w,
        fireballs[i].h,
        fireballs[i].color
      );
    }
  }
}

//till för att specifiera varje riktning eldkloten ska åka när spacebar används
aoeSpawnPoints = [
  { x: 5, y: 0 },
  { x: -5, y: 0 },
  { x: 0, y: 5 },
  { x: 0, y: -5 },
  { x: 2.24, y: 2.24 },
  { x: -2.24, y: -2.24 },
  { x: -2.24, y: 2.24 },
  { x: 2.24, y: -2.24 },
];

// function som används för att skapa en wide-range attack
function aoeAttack(object) {
  player.center = { x: player.x + player.w / 2, y: player.y + player.h / 2 };
  if (keyboard.space && aoeAttackCooldown === 0) {
    for (var i = 0; i < aoeSpawnPoints.length; i++) {
      fireballs.push({
        x: player.center.x - 3.5,
        y: player.center.y - 3.5,
        w: 10,
        h: 10,
        friction: 0,
        color: "orange",
        acc_X: aoeSpawnPoints[i].x,
        acc_Y: aoeSpawnPoints[i].y,
        damage: 100,
      });
    }
    aoeAttackCooldown = 1200;
  }
  if (aoeAttackCooldown > 0) aoeAttackCooldown--;
}

//Kollar om en fireball träffat ett objekt. Om detta sker tas blir objektets liv mindre och fireballen försvinner
function fireballCollisionChecker(object, iValue) {
  if (fireballs.length > 0) {
    for (var i = 0; i < fireballs.length; i++) {
      if (
        fireballs[i].x < object.x + object.w &&
        fireballs[i].x + fireballs[i].w > object.x &&
        fireballs[i].y < object.y + object.h &&
        fireballs[i].h + fireballs[i].y > object.y
      ) {
        object.health -= fireballs[i].damage;
        // .splice används för att ta bort ett objekt från list. i är positionen i listan och 1 står för hur många objekt som ska tas bort
        fireballs.splice(i, 1);
      }
    }
  }
  if (object.health <= 0) {
    object.health = 0;
    zombies.splice(iValue, 1);
  }
}

//Ändrar wave när alla zombies dödats under föregående. Skapar även nya zombies. Upgrade menyn öppnas även efter varje wave då upgradeMenu sätts till true
function waveChanger() {
  if (wave === 0) {
    enemyCreate(10, 0, 0);
    wave++;
  }
  if (zombies.length === 0 && wave === 1) {
    upgradeMenu = true;
    wave++;
    enemyCreate(5, 5, 0);
    player.health = player.maxHealth;
  }
  if (zombies.length === 0 && wave === 2) {
    upgradeMenu = true;
    wave++;
    enemyCreate(0, 5, 1);
    player.health = player.maxHealth;
  }
}

function update() {
  // kollar om man klickar p. Om p är klickat ändras pause till true
  if (keyboard.p && pause === false) pause = true;
  //Kollar ifall spelaren har tappat allt sitt liv
  if (wave === 3 && zombies.length === 0) {
    fill("green");
    text((screen.width/2) - 120, (screen.height/2) - 40, 40, "You Win", "red");
    //timeout som väntar 2000 millisekunder och sedan skickas man till index.html
    setTimeout(() => {
      window.open("./index.html", "_self");
    }, 5000);
    //stänger av musiken
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
    //stoppar update funktionen
    stopUpdate();
  }
  else if (player.health <= 0) {
    fill("green");
    text((screen.width/2) - 120, (screen.height/2) - 40, 40, "Game Over", "red");
    //timeout som väntar 2000 millisekunder och sedan skickas man till index.html
    setTimeout(() => {
      window.open("./index.html", "_self");
    }, 2000);
    //stänger av musiken
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
    //stoppar update funktionen
    stopUpdate();
  }
  //ändrar så att pause är true ifall p trycks ned

  // om pause är true så kommer spelet inte köras utan det kommer vara pausat
  else if (pause === false && upgradeMenu === false) {
    //spelar backgroundMusic
    backgroundMusic.play();
    //sätter sedan volymen till 0.5
    backgroundMusic.volume = 0.5;
    clearScreen();
    waveChanger();
    playerControl(player);
    movement(player);
    border(player);
    objectDraw(player);
    fireball();
    aoeAttack();
    //Loop för att göra så att funktionerna som läggs till finns på alla zombies
    for (var i = 0; i < zombies.length; i++) {
      followPlayer(zombies[i]);
      movement(zombies[i]);
      collission(player, zombies[i]);
      objectDraw(zombies[i]);
      fireballCollisionChecker(zombies[i], i);
    }
    //skriver ut vilken wave det är
    text(100, 100, 24, wave, "green");
    text(screen.width - 200, 100, 24, "AoE attack", "blue");
    text(
      screen.width - 100,
      150,
      24,
      Math.floor(aoeAttackCooldown / 120),
      "blue"
    );
  } else if (upgradeMenu === true) {
    fill("blue");
    text(100, 100, 36, "Wave cleared", "red");
    picture(
      screen.width / 2 - 100,
      screen.height / 2 - 100,
      "./img/maxHeathUpgrade.png"
    );
    if (
      mouse.x > screen.width / 2 - 100 &&
      mouse.x < screen.width / 2 + 100 &&
      mouse.y > screen.height / 2 - 100 &&
      mouse.y < screen.height / 2 + 100 &&
      mouse.left
    ) {
      player.maxHealth *= 1.1;
      upgradeMenu = false;
    }
  } else {
    //Kod som beskriver hur pausemenyn ska se ut
    clearScreen();
    text(
      screen.width / 2 - 110,
      screen.height / 2 - 20,
      24,
      "Paused",
      "orange"
    );
    text(
      screen.width / 2 - 110,
      screen.height / 2,
      24,
      "unpause with 'u'",
      "orange"
    );
    if (keyboard.u) pause = false; //Om man klickar u så blir pause falsk och nästa gång update körs igen kommer spelet inte vara pausat längre
  }
}
