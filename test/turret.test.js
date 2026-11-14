import test from "node:test";
import assert from "node:assert/strict";
import { Room } from "../server/room.js";
import { COMBAT, MATCH, TURRET } from "../shared/constants.js";
import { getHero } from "../shared/heroes.js";

function fakeSocket() {
  return {
    readyState: 1,
    sent: [],
    send(raw) {
      this.sent.push(JSON.parse(raw));
    },
    close() {
      this.readyState = 3;
    },
  };
}

/** Dua manusia (Alpha tim 0, Bravo tim 1); bot disingkirkan jauh supaya tak mengganggu. */
function setupRoom(now = 1_000_000) {
  const room = new Room("TURRET1", "online");
  const socketA = fakeSocket();
  const socketB = fakeSocket();
  const playerA = room.addHuman({
    name: "Alpha",
    heroId: "bastion",
    skillLevel: 2,
    socket: socketA,
  }).player;
  const playerB = room.addHuman({
    name: "Bravo",
    heroId: "ember",
    skillLevel: 2,
    socket: socketB,
  }).player;
  room.setReady(playerA.id, true, now);
  room.setReady(playerB.id, true, now);
  room.lockHero(playerA.id, now);
  room.lockHero(playerB.id, now);
  room.tick(now + MATCH.countdown * 1000 + 50);
  const at = now + 20_000;
  for (const player of room.players.values()) {
    player.invulnUntil = 0;
    player.attackCd = 0;
    if (player.bot) {
      player.x = 100;
      player.y = 100;
    }
  }
  playerB.x = 2400;
  playerB.y = 1400;
  return { room, playerA, playerB, socketA, socketB, now: at };
}

const enemyOuterTower = (room) =>
  room.towers.find((tower) => tower.team === 1 && tower.tier === "outer");
const lastOfType = (socket, type) => [...socket.sent].reverse().find((message) => message.type === type);

test("serangan biasa hanya menggores menara (damage kecil lewat TURRET.normalMult)", () => {
  const { room, playerA, now } = setupRoom();
  room.covers.length = 0; // paksa proyektil langsung mengenai menara (tidak terhalang cover)
  const tower = enemyOuterTower(room);
  const damage = 30;
  const hpBefore = tower.hp;

  room.spawnProjectile({
    team: playerA.slot,
    ownerId: playerA.id,
    type: "shot",
    x: tower.x - (tower.radius + 8 + 12),
    y: tower.y,
    vx: 400,
    vy: 0,
    radius: 7,
    mass: 1,
    damage,
    knockback: 0,
    ttl: 1,
    bounces: 0,
    reflectable: false,
    now,
  });
  room.updateProjectiles(0.2, now);

  const lost = hpBefore - tower.hp;
  const expected = Math.max(TURRET.normalMin, damage * TURRET.normalMult);
  assert.ok(lost > 0, "menara harus terkena serangan biasa");
  assert.ok(Math.abs(lost - expected) < 1e-9, `damage ${lost} != ${expected}`);
  assert.ok(lost < damage, "damage serangan biasa wajib lebih kecil dari damage penuh");
});

test("serangan biasa ke menara tidak lagi membuka kuis menara", () => {
  const { room, playerA, now } = setupRoom();
  const tower = enemyOuterTower(room);
  playerA.x = tower.x - 300;
  playerA.y = tower.y;
  playerA.ammo = COMBAT.maxAmmo;
  playerA.attackCd = 0;
  const before = room.projectiles.length;

  room.tryBasicAttack(playerA, 1, 0, now);

  assert.equal(room.duels.size, 0, "tidak boleh membuka duel/kuis");
  assert.equal(room.projectiles.length, before + 1, "harus menembak proyektil biasa");
});

test("requestTowerQuiz membuka kuis menara saat menara lawan dibidik dan memakai ammo", () => {
  const { room, playerA, socketA, now } = setupRoom();
  const tower = enemyOuterTower(room);
  playerA.x = tower.x - 300;
  playerA.y = tower.y;
  playerA.ammo = COMBAT.maxAmmo;
  playerA.attackCd = 0;
  playerA.aimX = tower.x;
  playerA.aimY = tower.y;

  const result = room.requestTowerQuiz(playerA.id, now);

  assert.equal(result.accepted, true);
  assert.equal(playerA.ammo, COMBAT.maxAmmo - 1);
  const duel = [...room.duels.values()][0];
  assert.ok(duel, "kuis menara harus terbuka");
  assert.equal(duel.kind, "tower");
  assert.equal(duel.towerId, tower.id);
  assert.ok(lastOfType(socketA, "duelStart"), "attacker menerima soal menara");
});

test("jawaban benar pada kuis menara memberi damage jauh lebih besar dari serangan biasa", () => {
  const { room, playerA, now } = setupRoom();
  const tower = enemyOuterTower(room);
  playerA.x = tower.x - 300;
  playerA.y = tower.y;
  playerA.ammo = COMBAT.maxAmmo;
  playerA.attackCd = 0;
  playerA.aimX = tower.x;
  playerA.aimY = tower.y;
  const hero = getHero(playerA.heroId);

  room.requestTowerQuiz(playerA.id, now);
  const duel = [...room.duels.values()][0];
  const hpBefore = tower.hp;
  room.answerQuiz(playerA.id, duel.id, duel.question.answer, now + 100);

  const lost = hpBefore - tower.hp;
  const bigDamage = hero.damage + (playerA.level - 1) * 1.5;
  assert.ok(Math.abs(lost - bigDamage) < 1e-9, `damage kuis ${lost} != ${bigDamage}`);
  assert.ok(
    lost > Math.max(TURRET.normalMin, hero.damage * TURRET.normalMult),
    "damage kuis harus jauh lebih besar dari serangan biasa",
  );
  assert.equal(room.duels.size, 0, "kuis selesai setelah dijawab");
});

test("requestTowerQuiz tanpa menara lawan di bidikan tidak membuka kuis dan tidak memakai ammo", () => {
  const { room, playerA, socketA, now } = setupRoom();
  playerA.x = 1300;
  playerA.y = 750;
  playerA.ammo = COMBAT.maxAmmo;
  playerA.attackCd = 0;
  // membidik ke kiri (menjauhi semua menara tim 1)
  playerA.aimX = 200;
  playerA.aimY = 750;

  const result = room.requestTowerQuiz(playerA.id, now);

  assert.equal(result.accepted, false);
  assert.equal(result.reason, "no-target");
  assert.equal(room.duels.size, 0);
  assert.equal(playerA.ammo, COMBAT.maxAmmo, "ammo tidak boleh berkurang tanpa target");
  assert.equal(lastOfType(socketA, "toast")?.text, "Bidak menara lawan dulu, baru tekan SOAL.");
});
