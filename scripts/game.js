let objectList = [];
let zombies = [];
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
    //Ger kordinaterna för spelarens mittpunkt
  //player.center = { x: player.x + player.w / 2, y: player.y + player.h / 2 };
  let enemyDistance = sqrt(
    (player./*center.*/x - object.x) ** 2 + (player./*center.*/y - object.y) ** 2
  );
  object.acc_X =
    ((player./*center.*/x - object.x) / enemyDistance) *
    object.accelerationConst *
    2.7;
  object.acc_Y =
    ((player./*center.*/y - object.y) / enemyDistance) *
    object.accelerationConst *
    2.7;
}

function update() {
  fill("white");
  playerControl(player);
  movement(player);
  objectDraw(player);
  //Loop för att göra så att funktionerna som läggs till finns på alla zombies
  for (var i = 0; i < zombies.length; i++) {
    followPlayer(zombies[i]);
    movement(zombies[i]);
    objectDraw(zombies[i]);
  }

  text(900, 100, 16, player.acc_X, "red");
  text(900, 120, 16, player.acc_Y, "red");
}
