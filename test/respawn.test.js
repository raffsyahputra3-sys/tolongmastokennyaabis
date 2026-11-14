import test from "node:test";
import assert from "node:assert/strict";
import { Room } from "../server/room.js";
import { MATCH, REVIVE, SPAWNS } from "../shared/constants.js";

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
function setupRoom(startAt = 1_000_000) {
  const room = new Room("RESPAWN1", "online");
  const socketA = fakeSocket();
  const socketB = fakeSocket();
  const playerA = room.addHuman({ name: "Alpha", heroId: "bastion", skillLevel: 2, socket: socketA }).player;
  const playerB = room.addHuman({ name: "Bravo", heroId: "ember", skillLevel: 2, socket: socketB }).player;
  room.setReady(playerA.id, true, startAt);
  room.setReady(playerB.id, true, startAt);
  room.lockHero(playerA.id, startAt);
  room.lockHero(playerB.id, startAt);
  room.tick(startAt + MATCH.countdown * 1000 + 50);
  const now = startAt + 20_000;
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
  return { room, playerA, playerB, socketA, socketB, now };
}

const lastOfType = (socket, type) => [...socket.sent].reverse().find((message) => message.type === type);
const reviveDuel = (room) => [...room.duels.values()].find((duel) => duel.kind === "revive");
const wrongOption = (duel) => (duel.question.answer + 1) % 4;

/** Bunuh pemain lalu buka kuis hidup kembali; return duel revive aktif. */
function openRevive(ctx, player = ctx.playerA) {
  const { room, now } = ctx;
  room.killPlayer(player, null, now);
  room.requestReviveQuiz(player.id, now);
  return reviveDuel(room);
}

test("pemain tumbang tidak punya timer respawn otomatis", () => {
  const ctx = setupRoom();
  const { room, playerA, now } = ctx;
  room.killPlayer(playerA, null, now);

  assert.equal(playerA.alive, false);
  assert.equal(playerA.respawnAt, 0, "manusia tidak memakai timer");
  assert.equal(playerA.reviveCorrect, 0);
  assert.equal(room.serializePlayer(playerA, now).needsRevive, true);
  assert.equal(room.serializePlayer(playerA, now).respawnIn, 0);

  const later = now + MATCH.respawn * 1000 + 500;
  assert.equal(room.serializePlayer(playerA, later).needsRevive, true);
  room.tick(later);
  assert.equal(playerA.alive, false, "tidak hidup sendiri walau timer match lewat");
});

test("requestReviveQuiz membuka duel kind revive tanpa batas waktu", () => {
  const ctx = setupRoom();
  const { room, playerA, socketA, now } = ctx;
  const duel = openRevive(ctx);

  assert.ok(duel, "kuis hidup kembali terbuka");
  assert.equal(duel.endsAt, null, "tanpa timer");
  assert.equal(playerA.reviveDuelId, duel.id);
  const start = lastOfType(socketA, "duelStart");
  assert.ok(start, "pemain menerima soal");
  assert.equal(start.duel.kind, "revive");
  assert.equal(start.duel.opponent, "HIDUP KEMBALI");
  assert.equal(start.duel.target, REVIVE.questions);
  assert.equal(start.duel.remaining, null);
});

test("satu jawaban benar menambah progres tapi belum hidup", () => {
  const ctx = setupRoom();
  const { room, playerA, socketA, now } = ctx;
  const duel = openRevive(ctx);

  room.answerQuiz(playerA.id, duel.id, duel.question.answer, now + 100);

  assert.equal(playerA.reviveCorrect, 1);
  assert.equal(playerA.alive, false, "masih butuh satu soal lagi");
  const result = lastOfType(socketA, "duelResult");
  assert.ok(result, "server mengirim hasil kuis");
  assert.equal(result.duel.outcome, "correct");
  assert.equal(result.duel.progress, 1);
});

test("dua jawaban benar hidup kembali di titik spawn dengan hp penuh", () => {
  const ctx = setupRoom();
  const { room, playerA, socketA, now } = ctx;
  const duel = openRevive(ctx);
  const duelId = duel.id;

  room.answerQuiz(playerA.id, duelId, duel.question.answer, now + 100);
  const t2 = now + REVIVE.nextQuestionDelay + 200;
  room.tick(t2);
  const next = [...room.duels.values()].find((item) => item.id === duelId);
  assert.ok(next, "kuis masih terbuka menunggu soal berikutnya");
  const starts = socketA.sent.filter((message) => message.type === "duelStart" && message.duel.id === duelId);
  assert.equal(starts.length, 2, "soal baru dikirim setelah jeda");

  room.answerQuiz(playerA.id, duelId, next.question.answer, t2 + 100);

  assert.equal(playerA.alive, true, "hidup setelah 2 jawaban benar");
  assert.equal(room.duels.size, 0, "kuis ditutup");
  assert.equal(playerA.reviveDuelId, null);
  assert.equal(playerA.hp, playerA.maxHp);
  const spawn = SPAWNS[playerA.slot][playerA.seat];
  assert.equal(playerA.x, spawn.x);
  assert.equal(playerA.y, spawn.y);
  assert.equal(room.serializePlayer(playerA, t2 + 200).needsRevive, false);
});

test("jawaban salah tidak menambah progres dan memberi soal baru tanpa timer", () => {
  const ctx = setupRoom();
  const { room, playerA, socketA, now } = ctx;
  const duel = openRevive(ctx);

  room.answerQuiz(playerA.id, duel.id, wrongOption(duel), now + 100);

  assert.equal(playerA.reviveCorrect, 0);
  assert.equal(playerA.alive, false);
  assert.equal(room.duels.size, 1, "kuis tetap menunggu soal berikutnya");
  const result = lastOfType(socketA, "duelResult");
  assert.equal(result.duel.outcome, "wrong");
  assert.equal(result.duel.correctIndex, duel.question.answer);

  const t2 = now + REVIVE.nextQuestionDelay + 200;
  room.tick(t2);
  const next = reviveDuel(room);
  assert.ok(next);
  assert.equal(next.answers.attacker, null, "kunci jawaban dibuka untuk soal berikutnya");
  const starts = socketA.sent.filter((message) => message.type === "duelStart");
  assert.equal(starts.length, 2, "soal lain dikirim, tanpa timer");
});

test("jawaban kedua pada soal yang sama ditolak (tidak menambah progres)", () => {
  const ctx = setupRoom();
  const { room, playerA, now } = ctx;
  const duel = openRevive(ctx);

  room.answerQuiz(playerA.id, duel.id, duel.question.answer, now + 100);
  const again = room.answerQuiz(playerA.id, duel.id, duel.question.answer, now + 150);

  assert.equal(again.accepted, false);
  assert.equal(again.reason, "locked");
  assert.equal(playerA.reviveCorrect, 1);
});

test("bot tumbang hidup otomatis lewat MATCH.respawn", () => {
  const { room, now } = setupRoom();
  const bot = [...room.players.values()].find((player) => player.bot);
  assert.ok(bot, "room punya bot");
  room.killPlayer(bot, null, now);

  assert.equal(bot.respawnAt, now + MATCH.respawn * 1000);
  assert.equal(room.serializePlayer(bot, now).needsRevive, false);
  room.tick(now + MATCH.respawn * 1000 + 500);
  assert.equal(bot.alive, true, "bot hidup lewat timer");
});

test("pemain terputus saat tumbang memakai timer AI takeover", () => {
  const ctx = setupRoom();
  const { room, playerA, now } = ctx;
  openRevive(ctx);

  room.handleDisconnect(playerA.id, now + 100);

  assert.equal(playerA.bot, true);
  assert.equal(playerA.respawnAt, now + 100 + MATCH.respawn * 1000);
  assert.equal(room.duels.size, 0, "kuis dibatalkan saat terputus");
  room.tick(now + 100 + MATCH.respawn * 1000 + 500);
  assert.equal(playerA.alive, true, "AI takeover hidup lewat timer");
});
