let objectList = [];
let zombies = [];
let fireballs = [];
let player = {
  x: 200,
  y: 200,
  friction: 0.1,
  w: 40,
  h: 80,
  acc_X: 0,
  acc_Y: 0,
  picture: "./img/player.png",
  health: 100,
  accelerationConst: 0.4,
  visability: true,
  center: 0,
};
let fireballCooldown = 0;

var i = 0;
//while loop som lägger till zombies i en lista. Några av värdena på zombiesen är även varierade för en mer varierat gameplay
while (i < 15) {
  zombies.push({
    x: Math.random() * screen.width,
    y: Math.random() * screen.height,
    w: 40,
    h: 80,
    friction: Math.floor(Math.random() * 4 + 1) / 10,
    picture: "./img/zombie.png",
    visability: true,
    health: 100,
    acc_X: 0,
    acc_Y: 0,
    accelerationConst: Math.floor(Math.random() * 4.5 + 1.5) / 10,
    damageCooldown: 0,
  });
  i++;
}

//Funktion som tar input och ändrar spelarens accelation genom att plussa på en konstant för acceleration
function playerControl(player) {
  if (keyboard.d) player.acc_X += player.accelerationConst;
  if (keyboard.a) player.acc_X -= player.accelerationConst;
  if (keyboard.w) player.acc_Y -= player.accelerationConst;
  if (keyboard.s) player.acc_Y += player.accelerationConst;
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

//Funktion för att måla objekt och deras healthbar
function objectDraw(object) {
  if (object.visability === true) {
    //Målar upp objectet
    picture(object.x, object.y, object.picture);
    //Målar objectets healthbar
    rectangle(
      object.x,
      object.y - 10,
      object.w * (object.health / 100),
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
  multip = 1.2;
  if (
    obj1.x < obj2.x + obj2.w &&
    obj1.x + obj1.w > obj2.x &&
    obj1.y < obj2.y + obj2.h &&
    obj1.h + obj1.y > obj2.y &&
    obj2.damageCooldown === 0) {
    obj1.health -= 10;
    obj2.damageCooldown = 120;
  }
  //Om objekt 2 har en cooldown så börjar den minska
  if (obj2.damageCooldown > 0)
    obj2.damageCooldown--;
}

//Skapar en gräns så att spelaren inte kan gå utanför mappen
function border(object) {
  if (object.x <= 0) {
    object.x -= object.acc_X * (1 / (1 - object.friction));
  };
  if (object.y <= 0) {
    object.y -= object.acc_Y * (1 / (1 - object.friction));
  };
  if (object.x + object.w >= screen.width) {
    object.x -= object.acc_X * (1 / (1 - object.friction));
  };
  //Har ingen aning varför det ska vara multiplicerat med två men det fungerar inte annarss
  if (object.y + object.h >= screen.height) {
    object.y -= object.acc_Y * (1 / (1 - object.friction));
  };
}

function fireball() {
  if (mouse.left === true && fireballCooldown === 0) {
    player.center = { x: player.x + player.w / 2, y: player.y + player.h / 2 };
    playerAimX = mouse.x - player.center.x;
    playerAimY = mouse.y - player.center.y;
    aimDistance = sqrt(playerAimX ** 2 + playerAimY ** 2);
    fireballs.push({ x: player.center.x - 2.5, y: player.center.y - 2.5, w: 5, h: 5, friction: 0, color: "orange", acc_X: (4 * playerAimX) / aimDistance, acc_Y: (4 * playerAimY) / aimDistance });
    fireballCooldown = 90;
  }

  if (fireballCooldown > 0){
    fireballCooldown--;
  }
  if (fireballs.length > 0) {
    for (var i = 0; i < fireballs.length; i++) {
      movement(fireballs[i]);
      rectangle(fireballs[i].x, fireballs[i].y, fireballs[i].w, fireballs[i].h, fireballs[i].color);
    }
  }

  /*{
    if (fireballFire == true) {
      obj2.health -= 25;
      fireballFire = false;
      fireball.acc_X = 0;
      fireball.acc_Y = 0;
    }
    if (obj2.health <= 0) {
      obj2.health = 0;
      obj2.visability = false;
      fireball.acc_X = fireballMovement.x;
      fireball.acc_Y = fireballMovement.y;
    }
  }*/
}
function fireballCollisionChecker(object) {
  if (fireballs.length > 0) {
    for (var i = 0; i < fireballs.length; i++) {
      if (
        fireballs[i].x < object.x + object.w &&
        fireballs[i].x + fireballs[i].w > object.x &&
        fireballs[i].y < object.y + object.h &&
        fireballs[i].h + fireballs[i].y > object.y
      ) {
        object.health -= 25;
        fireballs.splice(i, 1);
      }
    }
  }
}

function update() {
  fill("white");
  border(player);
  playerControl(player);
  movement(player);
  objectDraw(player);
  fireball();
  //Loop för att göra så att funktionerna som läggs till finns på alla zombies
  for (var i = 0; i < zombies.length; i++) {
    //followPlayer(zombies[i]);
    movement(zombies[i]);
    collission(player, zombies[i]);
    objectDraw(zombies[i]);
    fireballCollisionChecker(zombies[i])
  }


  //Debug
  text(900, 100, 16, player.acc_X, "red");
  text(900, 120, 16, player.acc_Y, "red");
  text(200, 100, 16, player.y, "green");
  text(200, 120, 16, (player.y + player.h), "orange")
}
