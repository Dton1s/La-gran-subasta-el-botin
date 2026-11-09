import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS" };
const collections = ["basica", "banda", "cuchillo", "escudo", "dorado", "veneno"];
const effectsByValue = ["low-card-loss-five", "near-miss-five", "last-place-plus-five", "steal-leader-five", "rival-bid-minus-one", "bid-plus-one", "loss-compensation-3", "last-place-plus-five", "steal-leader-five"];
const hiddenEffects = [
  { type: "COFRE", label: "Cofre", value: 25, icon: "👑", colors: ["#f0ab36", "#a54e22"] },
  { type: "BOMBA", label: "Bomba", value: -12, icon: "💣", colors: ["#e74e5a", "#791f3c"] },
  { type: "STEAL_LEADER", label: "Bolsillo ligero", value: 10, icon: "🥷", colors: ["#8253bd", "#432763"], description: "ROBA 10 AL LÍDER" },
  { type: "LAST_PLACE", label: "Favorito del público", value: 15, icon: "🚀", colors: ["#36a978", "#205b4f"], description: "+15 SI VAS ÚLTIMO" },
  { type: "BLACK_HOLE", label: "Agujero negro", value: 0, icon: "🌀", colors: ["#433a77", "#17162f"], description: "EL POZO PASA A LA SIGUIENTE" },
  { type: "COMPENSATION", label: "Premio de consolación", value: 5, icon: "🛟", colors: ["#e49239", "#7a3a29"], description: "+5 A QUIEN NO GANE" },
  { type: "DOUBLE_POT", label: "Bóveda dorada", value: 2, icon: "✨", colors: ["#d9b43e", "#8d5524"], description: "DUPLICA EL BOTÍN · MÁX. 100 PTS" },
  { type: "WINNER_LOW_BONUS", label: "Golpe maestro", value: 5, icon: "🌟", colors: ["#4eb982", "#1f6656"], description: "+5 SI EL GANADOR JUGÓ 1–3" },
  { type: "WINNER_HIGH_TAX", label: "Impuesto al riesgo", value: -5, icon: "⚡", colors: ["#4d75cf", "#242f78"], description: "−5 AL BOTÍN SI GANÓ UN 8–9" },
];
const rules = {
  highest: { id: "highest", label: "PUJA MÁS ALTA", description: "Gana la carta con el valor más alto." },
  lowest: { id: "lowest", label: "PUJA MÁS BAJA", description: "Gana la carta con el valor más bajo." },
  "closest-five": { id: "closest-five", label: "A UN PASO DEL 5", description: "Gana la carta más cercana al 5." },
  "even-bids": { id: "even-bids", label: "RONDA PAR", description: "Gana la carta par más alta. Si nadie juega par, gana la más alta." },
};
const missions = [
  ["d-play", "diaria", "games", 35], ["d-bids", "diaria", "bids", 300], ["d-rounds", "diaria", "roundWins", 80], ["d-win", "diaria", "matchWins", 7], ["d-removal", "diaria", "removals", 1],
  ["w-play", "semanal", "games", 100], ["w-bids", "semanal", "bids", 900], ["w-rounds", "semanal", "roundWins", 230], ["w-win", "semanal", "matchWins", 18], ["w-removal", "semanal", "removals", 5],
  ["m-play", "mensual", "games", 400], ["m-bids", "mensual", "bids", 3600], ["m-rounds", "mensual", "roundWins", 900], ["m-win", "mensual", "matchWins", 70], ["m-removal", "mensual", "removals", 20],
];
const missionRewards: Record<string, { currency: "coins" | "gems"; amount: number }> = {
  "d-play": { currency: "coins", amount: 40 }, "d-bids": { currency: "coins", amount: 50 }, "d-rounds": { currency: "coins", amount: 30 }, "d-win": { currency: "gems", amount: 1 }, "d-removal": { currency: "coins", amount: 10 },
  "w-play": { currency: "coins", amount: 100 }, "w-bids": { currency: "coins", amount: 150 }, "w-rounds": { currency: "coins", amount: 200 }, "w-win": { currency: "gems", amount: 3 }, "w-removal": { currency: "coins", amount: 50 },
  "m-play": { currency: "coins", amount: 300 }, "m-bids": { currency: "coins", amount: 450 }, "m-rounds": { currency: "coins", amount: 600 }, "m-win": { currency: "gems", amount: 6 }, "m-removal": { currency: "coins", amount: 200 },
};

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
const pick = <T>(values: T[]) => values[Math.floor(Math.random() * values.length)];
const utcPeriodStart = (period: string) => {
  const now = new Date();
  if (period === "semanal") now.setUTCDate(now.getUTCDate() - ((now.getUTCDay() + 6) % 7));
  if (period === "mensual") now.setUTCDate(1);
  return now.toISOString().slice(0, 10);
};
const shuffle = <T>(items: T[]) => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [result[i], result[j]] = [result[j], result[i]]; }
  return result;
};
function createRules(mode: string) {
  const counts = mode === "classic" ? ["highest", "highest", "highest", "lowest", "lowest", "lowest", "closest-five", "closest-five", "closest-five", "even-bids"] : mode === "teams" ? ["highest", "highest", "lowest", "lowest", "closest-five", "closest-five", "closest-five", "even-bids"] : ["highest", "lowest", "closest-five", "closest-five", "even-bids"];
  for (let attempt = 0; attempt < 60; attempt++) { const ordered = shuffle(counts); if (ordered.every((item, i) => !i || item !== ordered[i - 1])) return ordered.map((id) => rules[id as keyof typeof rules]); }
  return shuffle(counts).map((id) => rules[id as keyof typeof rules]);
}
function cardEffect(deck: string, value: number) {
  if (deck === "cuchillo" && value === 8) return "steal-leader-15";
  if (deck === "cuchillo" && value === 4) return "last-place-plus-15";
  if (deck === "escudo" && value === 3) return "loss-compensation-5";
  if (deck === "dorado" && value === 6) return "steal-leader-15";
  if (deck === "veneno" && value === 9) return "rival-bid-minus-one";
  return effectsByValue[value - 1];
}
function cardPool(progress: any) {
  const owned = Array.isArray(progress?.ownedCards) ? progress.ownedCards.filter((x: unknown) => typeof x === "string") : [];
  const equipped = Array.isArray(progress?.equippedCards) ? progress.equippedCards.filter((x: unknown) => collections.includes(String(x))).slice(0, 3) : [];
  const decks = equipped.length ? equipped : ["basica"];
  const pool = collections.flatMap((deck) => Array.from({ length: 9 }, (_, i) => ({ deckId: deck, value: i + 1, cardKey: `${deck}-${i + 1}`, effectId: cardEffect(deck, i + 1) })))
    .filter((card) => decks.includes(card.deckId) && (owned.length === 0 ? card.deckId === "basica" : owned.includes(card.cardKey)));
  const safePool = pool.length ? pool : Array.from({ length: 9 }, (_, i) => ({ deckId: "basica", value: i + 1, cardKey: `basica-${i + 1}`, effectId: cardEffect("basica", i + 1) }));
  const completeSets = decks.filter((deck) => Array.from({ length: 9 }, (_, i) => owned.includes(`${deck}-${i + 1}`)).every(Boolean));
  return { pool: safePool, equipped: decks, completeSets };
}
const handFromPool = (pool: any[]) => Array.from({ length: 5 }, () => structuredClone(pick(pool))).sort((a, b) => a.value - b.value);
function hiddenLoot() { return structuredClone(pick(hiddenEffects)); }
function lootValues() { return Array.from({ length: 3 }, () => (Math.floor(Math.random() * 5) + 1) * 5); }
const ruleScore = (value: number, ruleId: string) => ruleId === "lowest" ? -value : ruleId === "closest-five" ? -Math.abs(value - 5) : ruleId === "even-bids" && value % 2 ? -Infinity : value;
function teamStrength(plays: any[], team: number, ruleId: string) {
  const rows = plays.filter((p) => p.team === team); const sum = (arr: any[]) => arr.reduce((acc, p) => acc + p.value, 0);
  if (ruleId === "lowest") return -sum(rows);
  if (ruleId === "closest-five") return -Math.abs(sum(rows) - 10);
  if (ruleId === "even-bids") { const any = plays.some((p) => p.face % 2 === 0); if (any) return sum(rows.filter((p) => p.face % 2 === 0)); }
  return sum(rows);
}

function resolveRound(state: any) {
  const mode = state.mode, roundRule = state.rules[state.round - 1], effect = state.hiddenLoot;
  const scores = { ...state.scores }, before = { ...state.scores }, players = state.players;
  const plays = players.map((player: any) => {
    const bid = state.bids[player.id], card = bid.card; let value = card.value;
    if (card.effectId === "bid-plus-one") value++;
    if (player.completeSets.includes("banda") && card.value <= 3) value += 2;
    if (player.completeSets.includes("veneno") && card.deckId === "veneno" && card.value >= 6) value++;
    const knifeAttacker = players.some((other: any) => other.id !== player.id && other.completeSets.includes("cuchillo") && (mode !== "teams" || other.team !== player.team));
    if (knifeAttacker) value = Math.max(1, value - 1);
    return { id: player.id, name: player.name, avatar: player.avatar, team: player.team, card, face: card.value, value };
  });
  for (const disruptor of plays.filter((p: any) => p.card.effectId === "rival-bid-minus-one")) {
    const rivals = plays.filter((p: any) => p.id !== disruptor.id && (mode !== "teams" || p.team !== disruptor.team)).sort((a: any, b: any) => b.value - a.value);
    if (rivals[0]) rivals[0].value = Math.max(1, rivals[0].value - 1);
  }
  let total = Math.min(100, state.lootValues.reduce((a: number, b: number) => a + b, 0) + state.carriedPot + (effect.type === "COFRE" ? effect.value : 0));
  let carriedPot = 0;
  if (effect.type === "BLACK_HOLE") { carriedPot = Math.min(50, total); total = 0; }
  if (effect.type === "DOUBLE_POT") total = Math.min(100, total * 2);
  let winners: string[] = [], message = "";
  const getPayout = (winningPlays: any[]) => Math.max(0, Math.min(100, Math.floor(total + (effect.type === "BOMBA" ? effect.value : 0) + (effect.type === "WINNER_HIGH_TAX" && winningPlays.some((p) => p.face >= 8) ? -5 : 0) + (effect.type === "WINNER_LOW_BONUS" && winningPlays.some((p) => p.face <= 3) ? 5 : 0))));
  if (mode === "teams") {
    const blue = teamStrength(plays, 1, roundRule.id), red = teamStrength(plays, 2, roundRule.id);
    winners = blue === red ? plays.map((p: any) => p.id) : plays.filter((p: any) => p.team === (blue > red ? 1 : 2)).map((p: any) => p.id);
    const winningPlays = plays.filter((p: any) => winners.includes(p.id));
    let payout = getPayout(winningPlays);
    if (winners.some((id) => players.find((p: any) => p.id === id)?.completeSets.includes("escudo")) && effect.type === "BOMBA") payout = Math.min(100, total);
    if (blue === red) { const share = Math.floor(payout / winners.length); for (const id of winners) scores[id] += share; message = `Empate de equipos: +${share} puntos para cada jugador.`; }
    else { for (const id of winners) scores[id] += payout; message = `Gana el equipo ${blue > red ? "Azul" : "Rojo"}: +${payout} puntos por integrante.`; }
  } else {
    const even = plays.filter((p: any) => p.face % 2 === 0);
    const contenders = roundRule.id === "even-bids" && even.length ? even : plays;
    const best = Math.max(...contenders.map((p: any) => ruleScore(p.value, roundRule.id)));
    winners = contenders.filter((p: any) => ruleScore(p.value, roundRule.id) === best).map((p: any) => p.id);
    const winningPlays = plays.filter((p: any) => winners.includes(p.id));
    let payout = getPayout(winningPlays);
    if (winners.some((id) => players.find((p: any) => p.id === id)?.completeSets.includes("escudo")) && effect.type === "BOMBA") payout = Math.min(100, total);
    const share = Math.floor(payout / winners.length);
    for (const id of winners) scores[id] += share;
    message = winners.length === 1 ? `${players.find((p: any) => p.id === winners[0]).name} gana y se lleva ${payout} puntos.` : `Empate entre ${winners.length}: +${share} puntos para cada participante.`;
  }
  const winnerSet = new Set(winners), nearMiss = new Set<string>();
  if (mode === "teams") {
    const winTeam = plays.find((p: any) => winnerSet.has(p.id))?.team;
    if (winTeam && winners.length < plays.length && Math.abs(teamStrength(plays, winTeam, roundRule.id) - teamStrength(plays, winTeam === 1 ? 2 : 1, roundRule.id)) <= 1) for (const p of plays) if (p.team !== winTeam) nearMiss.add(p.id);
  } else {
    const hasEven = roundRule.id === "even-bids" && plays.some((p: any) => p.face % 2 === 0);
    const score = (value: number) => roundRule.id === "even-bids" && !hasEven ? value : ruleScore(value, roundRule.id);
    const top = Math.max(...plays.filter((p: any) => winnerSet.has(p.id)).map((p: any) => score(p.value)));
    for (const p of plays) if (!winnerSet.has(p.id) && !(hasEven && p.face % 2) && top - score(p.value) <= 1) nearMiss.add(p.id);
  }
  for (const play of plays) {
    const player: any = players.find((p: any) => p.id === play.id), won = winnerSet.has(play.id);
    if (!won) {
      let bonus = ["loss-compensation-5", "loss-compensation-3"].includes(play.card.effectId) ? (play.card.effectId === "loss-compensation-5" ? 5 : 3) : 0;
      if (play.card.effectId === "low-card-loss-five" && play.face <= 3) bonus += 5;
      if (play.card.effectId === "near-miss-five" && nearMiss.has(play.id)) bonus += 5;
      if (effect.type === "COMPENSATION") bonus += effect.value;
      scores[play.id] += Math.min(8, bonus);
    }
    const last = Math.min(...Object.values(before));
    if (won && (play.card.effectId === "last-place-plus-15" || play.card.effectId === "last-place-plus-five" || effect.type === "LAST_PLACE") && before[play.id] <= last) scores[play.id] += play.card.effectId === "last-place-plus-15" ? 15 : play.card.effectId === "last-place-plus-five" ? 5 : effect.value;
    if (won && (["steal-leader-15", "steal-leader-five"].includes(play.card.effectId) || effect.type === "STEAL_LEADER")) {
      const leader = [...players].filter((p: any) => p.id !== play.id).sort((a: any, b: any) => before[b.id] - before[a.id])[0];
      if (leader) { const stolen = Math.min(effect.type === "STEAL_LEADER" ? effect.value : play.card.effectId === "steal-leader-15" ? 15 : 5, Math.max(0, scores[leader.id])); scores[leader.id] -= stolen; scores[play.id] += stolen; }
    }
  }
  const scoreChanges = players.map((p: any) => ({ id: p.id, delta: scores[p.id] - before[p.id] }));
  const revealed = plays.map((p: any) => ({ player_id: p.id, card: p.card, face_value: p.face, effective_value: p.value }));
  return { ...state, phase: "resolved", resultAt: Date.now(), scores, carriedPot, lastResult: { winnerIds: winners, message, scoreChanges, revealed, lootEffect: effect, lootValues: state.lootValues }, hands: Object.fromEntries(players.map((p: any) => [p.id, (state.hands[p.id] ?? []).filter((_: any, i: number) => i !== state.bids[p.id].index)])), bids: state.bids };
}

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  const token = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return json({ error: "not_authenticated" }, 401);
  const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: `Bearer ${token}` } }, auth: { persistSession: false } });
  const { data: authData, error: authError } = await userClient.auth.getUser(token);
  if (authError || !authData.user) return json({ error: "not_authenticated" }, 401);
  const userId = authData.user.id;
  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
  let body: any;
  try { body = await req.json(); } catch { return json({ error: "invalid_json" }, 400); }
  try {
    switch (body.action) {
      case "start_match": return json(await startMatch(admin, body.matchId, userId));
      case "state": return json(await readState(admin, body.matchId, userId));
      case "bid": return json(await submitBid(admin, body.matchId, userId, body.round, body.cardIndex));
      case "timeout": return json(await timeoutRound(admin, body.matchId, userId, body.round));
      case "advance": return json(await advanceRound(admin, body.matchId, userId));
      case "remove": return json(await removeCard(admin, userClient, body.matchId, userId, body.cardIndex, body.requestId));
      case "reward_state": return json(await readRewardState(admin, userId));
      case "spin": {
        const { data, error } = await admin.rpc("server_spin_roulette", { p_user_id: userId, p_paid: body.paid === true });
        if (error) throw error;
        return json(data);
      }
      case "claim_mission": {
        const { data, error } = await admin.rpc("server_claim_mission", { p_user_id: userId, p_mission_id: body.missionId });
        if (error) throw error;
        return json(data);
      }
      case "open_chest": {
        const { data, error } = await admin.rpc("server_claim_match_chest", { p_user_id: userId, p_chest_id: body.chestId, p_instant: body.instant === true });
        if (error) throw error;
        return json(data);
      }
      case "purchase_card": {
        const { data, error } = await admin.rpc("server_purchase_card", { p_user_id: userId, p_card_key: body.cardKey, p_request_id: body.requestId });
        if (error) throw error;
        return json(data);
      }
      case "equip_decks": {
        const { data, error } = await admin.rpc("server_set_card_loadout", { p_user_id: userId, p_deck_ids: body.deckIds });
        if (error) throw error;
        return json(data);
      }
      default: return json({ error: "unknown_action" }, 400);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "server_error";
    return json({ error: message }, 400);
  }
});

async function loadSession(admin: any, matchId: string) {
  const { data, error } = await admin.from("game_match_sessions").select("id,mode,is_online,expected_players,participant_ids,status,server_state,server_revision,started_at").eq("id", matchId).maybeSingle();
  if (error || !data) throw new Error("match_not_found");
  if (data.status === "waiting" || data.status === "cancelled") throw new Error("match_not_active");
  return data;
}
async function saveState(admin: any, session: any, state: any) {
  const { data, error } = await admin.from("game_match_sessions").update({ server_state: state, server_revision: session.server_revision + 1 }).eq("id", session.id).eq("server_revision", session.server_revision).eq("status", "active").select("id").maybeSingle();
  if (error) throw error;
  return Boolean(data);
}
function publicState(state: any, userId: string, sessionStatus: string, wallet?: any, chestRows: any[] = []) {
  const player = state.players.find((p: any) => p.id === userId);
  if (!player) throw new Error("not_match_participant");
  const players = state.players.map((p: any) => ({ id: p.id, name: p.name, avatar: p.avatar, score: state.scores[p.id] ?? 0, team: p.team, isUser: p.id === userId, hand: p.id === userId ? state.hands[p.id] ?? [] : [] }));
  const out: any = { status: sessionStatus, matchId: state.matchId, mode: state.mode, round: state.round, maxRounds: state.maxRounds, phase: state.phase, players, hand: state.hands[userId] ?? [], rule: state.rules[state.round - 1], roundRules: state.rules, lootValues: state.lootValues, carriedPot: state.carriedPot, hasSubmitted: Boolean(state.bids[userId]), bidsCount: Object.keys(state.bids).length, expectedPlayers: players.length, ownBid: state.bids[userId]?.index ?? null, result: state.lastResult ?? null, turnDeadline: state.turnDeadline, removalsUsed: state.removals[userId] ?? 0 };
  if (sessionStatus === "completed") Object.assign(out, { winnerIds: state.winner_ids ?? state.lastResult?.winnerIds ?? [], rewardCoins: wallet?.reward_coins ?? 0, coins: wallet?.coins ?? 0, gems: wallet?.gems ?? 0, chests: chestRows.map((c: any) => ({ id: c.id, matchId: c.match_id, createdAt: Date.parse(c.created_at), readyAt: Date.parse(c.ready_at) })), chestAdded: chestRows.some((c: any) => c.match_id === state.matchId) });
  return out;
}
async function startMatch(admin: any, matchId: string, userId: string) {
  let session = await loadSession(admin, matchId);
  if (!session.participant_ids.includes(userId)) throw new Error("not_match_participant");
  if (session.server_state) return publicState(session.server_state, userId, session.status);
  if (session.status !== "active") throw new Error("match_not_active");
  const [{ data: profiles }, { data: progressRows }, { data: participants }, { data: entitlementRows }, { data: loadoutRows }] = await Promise.all([
    admin.from("profiles").select("id,username,display_name,avatar_id").in("id", session.participant_ids),
    admin.from("player_game_progress").select("user_id,progress").in("user_id", session.participant_ids),
    admin.from("game_match_participants").select("user_id,team").eq("match_id", matchId),
    admin.from("player_card_entitlements").select("user_id,card_key").in("user_id", session.participant_ids),
    admin.from("player_card_loadouts").select("user_id,deck_ids").in("user_id", session.participant_ids),
  ]);
  const pmap = new Map((profiles ?? []).map((x: any) => [x.id, x]));
  const gmap = new Map((progressRows ?? []).map((x: any) => [x.user_id, x.progress ?? {}]));
  const tmap = new Map((participants ?? []).map((x: any) => [x.user_id, x.team]));
  const ownedMap = new Map<string, string[]>();
  for (const item of entitlementRows ?? []) ownedMap.set(item.user_id, [...(ownedMap.get(item.user_id) ?? []), item.card_key]);
  const deckMap = new Map((loadoutRows ?? []).map((x: any) => [x.user_id, x.deck_ids]));
  for (const id of session.participant_ids) {
    const progress: any = gmap.get(id) ?? {};
    progress.ownedCards = ownedMap.get(id) ?? [];
    progress.equippedCards = deckMap.get(id) ?? ["basica"];
    gmap.set(id, progress);
  }
  const players = session.participant_ids.map((id: string) => {
    const p: any = pmap.get(id), prog: any = gmap.get(id) ?? {}, cards = cardPool(prog);
    return { id, name: p?.username || p?.display_name || "Capitán", avatar: p?.avatar_id || "🐱", team: session.is_online ? (tmap.get(id) ?? 0) : (session.mode === "teams" ? 1 : 0), score: 0, equipped: cards.equipped, completeSets: cards.completeSets };
  });
  const pools: Record<string, any[]> = Object.fromEntries(session.participant_ids.map((id: string) => [id, cardPool(gmap.get(id) ?? {}).pool]));
  if (!session.is_online) {
    const botRoster = session.mode === "duel" ? [{ suffix: "vega", name: "VEGA", avatar: "🐺", team: 0 }] : [
      { suffix: "vega", name: "VEGA", avatar: "🐺", team: session.mode === "teams" ? 2 : 0 },
      { suffix: "sombra", name: "SOMBRA", avatar: "🐱", team: session.mode === "teams" ? 1 : 0 },
      { suffix: "luna", name: "LUNA", avatar: "🤖", team: session.mode === "teams" ? 2 : 0 },
    ];
    for (const bot of botRoster) {
      const id = `cpu:${matchId}:${bot.suffix}`;
      players.push({ id, name: bot.name, avatar: bot.avatar, team: bot.team, score: 0, equipped: ["basica"], completeSets: [] });
      pools[id] = cardPool({}).pool;
    }
  }
  const maxRounds = session.mode === "classic" ? 10 : session.mode === "teams" ? 8 : 5;
  const allRules = createRules(session.mode);
  const state = { matchId, mode: session.mode, maxRounds, round: 1, phase: "bidding", players, scores: Object.fromEntries(players.map((p: any) => [p.id, 0])), pools, hands: Object.fromEntries(players.map((p: any) => [p.id, handFromPool(pools[p.id])])), rules: allRules, lootValues: lootValues(), hiddenLoot: hiddenLoot(), carriedPot: 0, bids: {}, removals: Object.fromEntries(players.map((p: any) => [p.id, 0])), lastResult: null, turnDeadline: Date.now() + 30_000 };
  const saved = await saveState(admin, session, state);
  if (!saved) { session = await loadSession(admin, matchId); return publicState(session.server_state, userId, session.status); }
  return publicState(state, userId, session.status);
}
async function ensureState(admin: any, matchId: string, userId: string) {
  let session = await loadSession(admin, matchId);
  if (!session.participant_ids.includes(userId)) throw new Error("not_match_participant");
  if (!session.server_state) return { session, view: await startMatch(admin, matchId, userId) };
  return { session, view: null };
}
async function readState(admin: any, matchId: string, userId: string) {
  let { session } = await ensureState(admin, matchId, userId);
  session = await loadSession(admin, matchId);
  let state = session.server_state;
  if (session.status === "active" && state.phase === "bidding" && Date.now() >= state.turnDeadline) {
    for (const player of state.players) if (!state.bids[player.id]) state.bids[player.id] = { index: Math.floor(Math.random() * state.hands[player.id].length), automatic: true };
    if (Object.keys(state.bids).length === state.players.length) state = resolveRound(state);
    if (await saveState(admin, session, state)) {
      for (const player of state.players) if (session.participant_ids.includes(player.id) && state.bids[player.id]?.automatic) await recordMetric(admin, player.id, "bids", 1);
      session = await loadSession(admin, matchId);
    } else { session = await loadSession(admin, matchId); state = session.server_state; }
  }
  if (state.phase === "completed_pending") return finalizeMatch(admin, session, state, userId);
  if (session.status === "completed") return await completedView(admin, session, state, userId);
  return publicState(state, userId, session.status);
}
async function submitBid(admin: any, matchId: string, userId: string, round: number, cardIndex: number) {
  for (let tries = 0; tries < 8; tries++) {
    let { session } = await ensureState(admin, matchId, userId); session = await loadSession(admin, matchId);
    const state = session.server_state;
    if (state.round !== Number(round) || state.phase !== "bidding") throw new Error("round_not_accepting_bids");
    if (!Number.isInteger(cardIndex) || cardIndex < 0 || cardIndex >= state.hands[userId].length) throw new Error("invalid_card_index");
    if (state.bids[userId]) return publicState(state, userId, session.status);
    const card = state.hands[userId][cardIndex];
    state.bids[userId] = { index: cardIndex, card };
    if (!session.is_online) {
      for (const player of state.players) {
        if (player.id === userId || state.bids[player.id]) continue;
        const hand = state.hands[player.id] ?? [];
        const ruleId = state.rules[state.round - 1]?.id;
        const options = hand.map((entry: any, i: number) => ({ entry, i }));
        const even = options.filter(({ entry }: any) => entry.value % 2 === 0);
        const choices = ruleId === "even-bids" && even.length ? even : options;
        const selected = choices.reduce((best: any, current: any) => ruleScore(current.entry.value, ruleId) > ruleScore(best.entry.value, ruleId) ? current : best, choices[0]);
        state.bids[player.id] = { index: selected?.i ?? 0, card: structuredClone(selected?.entry ?? hand[0]), automatic: true };
      }
    }
    if (await saveState(admin, session, state)) {
      await recordMetric(admin, userId, "bids", 1);
      for (const player of state.players) if (session.participant_ids.includes(player.id) && state.bids[player.id]?.automatic) await recordMetric(admin, player.id, "bids", 1);
      if (Object.keys(state.bids).length === state.players.length) {
        const resolved = resolveRound(state);
        const current = await loadSession(admin, matchId);
        if (current.server_state.phase === "bidding") await saveState(admin, current, resolved);
      }
      return await readState(admin, matchId, userId);
    }
  }
  throw new Error("match_state_busy_retry");
}
async function timeoutRound(admin: any, matchId: string, userId: string, round: number) {
  const { session } = await ensureState(admin, matchId, userId); const state = session.server_state;
  if (state.round !== Number(round) || state.phase !== "bidding") return publicState(state, userId, session.status);
  if (Date.now() < state.turnDeadline) throw new Error("turn_still_open");
  return await readState(admin, matchId, userId);
}
async function advanceRound(admin: any, matchId: string, userId: string) {
  for (let tries = 0; tries < 6; tries++) {
    let session = await loadSession(admin, matchId); const state = session.server_state;
    if (!session.participant_ids.includes(userId)) throw new Error("not_match_participant");
    if (session.status === "completed") return completedView(admin, session, state, userId);
    if (state.phase !== "resolved") return publicState(state, userId, session.status);
    if (Date.now() < state.resultAt + 3600) return publicState(state, userId, session.status);
    const winners: string[] = state.lastResult.winnerIds;
    if (state.round >= state.maxRounds) {
      const finalState = { ...state, phase: "completed_pending", winner_ids: matchWinners(state) };
      if (await saveState(admin, session, finalState)) {
        for (const id of winners) if (session.participant_ids.includes(id)) await recordMetric(admin, id, "roundWins", 1);
        return finalizeMatch(admin, await loadSession(admin, matchId), finalState, userId);
      }
      continue;
    }
    const nextRound = state.round + 1;
    const next = { ...state, round: nextRound, phase: "bidding", hands: Object.fromEntries(state.players.map((p: any) => [p.id, handFromPool(state.pools[p.id])])), bids: {}, lootValues: lootValues(), hiddenLoot: hiddenLoot(), lastResult: null, turnDeadline: Date.now() + 30_000 };
    if (await saveState(admin, session, next)) { for (const id of winners) if (session.participant_ids.includes(id)) await recordMetric(admin, id, "roundWins", 1); return publicState(next, userId, session.status); }
  }
  throw new Error("match_state_busy_retry");
}
function matchWinners(state: any) {
  if (state.mode === "teams") {
    const blue = state.players.filter((p: any) => p.team === 1).reduce((s: number, p: any) => s + state.scores[p.id], 0);
    const red = state.players.filter((p: any) => p.team === 2).reduce((s: number, p: any) => s + state.scores[p.id], 0);
    return blue === red ? [] : state.players.filter((p: any) => p.team === (blue > red ? 1 : 2)).map((p: any) => p.id);
  }
  const max = Math.max(...Object.values(state.scores) as number[]);
  const top = state.players.filter((p: any) => state.scores[p.id] === max);
  return top.length === 1 ? [top[0].id] : [];
}
async function finalizeMatch(admin: any, session: any, state: any, userId: string) {
  const { data, error } = session.is_online
    ? await admin.rpc("server_finalize_online_match", { p_match_id: session.id, p_final_state: { ...state, requester_id: userId } })
    : await admin.rpc("server_finalize_offline_match", { p_match_id: session.id, p_final_state: { ...state, requester_id: userId } });
  if (error) throw error;
  const refreshed = await loadSession(admin, session.id);
  return completedView(admin, refreshed, refreshed.server_state, userId, data);
}
async function completedView(admin: any, session: any, state: any, userId: string, settlement?: any) {
  const { data: wallet } = await admin.from("player_wallets").select("coins,gems").eq("user_id", userId).maybeSingle();
  const { data: tx } = await admin.from("wallet_transactions").select("amount").eq("user_id", userId).eq("reference_id", `${session.is_online ? "online_match" : "offline_match"}:${session.id}`).eq("currency", "coins").maybeSingle();
  const { data: chests } = await admin.from("player_server_chests").select("id,match_id,created_at,ready_at").eq("user_id", userId).is("opened_at", null).order("created_at");
  return publicState(state, userId, "completed", { coins: wallet?.coins, gems: wallet?.gems, reward_coins: tx?.amount ?? settlement?.reward_coins ?? 0 }, chests ?? []);
}
async function removeCard(admin: any, userClient: any, matchId: string, userId: string, cardIndex: number, requestId: string) {
  for (let tries = 0; tries < 6; tries++) {
    let session = await loadSession(admin, matchId); const state = session.server_state;
    if (!session.participant_ids.includes(userId) || state.phase !== "bidding" || state.bids[userId]) throw new Error("card_removal_unavailable");
    const hand = state.hands[userId] ?? [];
    if (!Number.isInteger(cardIndex) || cardIndex < 0 || cardIndex >= hand.length) throw new Error("invalid_card_index");
    const used = state.removals[userId] ?? 0, cost = Math.min(5 + used * 5, 25);
    const { error: spendError } = await userClient.rpc("spend_wallet_balance", { p_currency: "gems", p_amount: cost, p_reason: "card_removal", p_request_id: requestId });
    if (spendError) throw spendError;
    const replacement = pick(state.pools[userId]);
    state.hands[userId] = hand.map((card: any, i: number) => i === cardIndex ? structuredClone(replacement) : card).sort((a: any, b: any) => a.value - b.value);
    state.removals[userId] = used + 1;
    if (await saveState(admin, session, state)) { await recordMetric(admin, userId, "removals", 1); return await readState(admin, matchId, userId); }
  }
  throw new Error("match_state_busy_retry");
}
async function recordMetric(admin: any, userId: string, metric: string, amount: number) {
  if (amount <= 0) return;
  const { error } = await admin.rpc("server_record_game_metric", { p_user_id: userId, p_metric: metric, p_amount: amount });
  if (error) throw error;
}
async function readRewardState(admin: any, userId: string) {
  const { data: metricRows, error: metricError } = await admin.from("player_game_metrics").select("period,period_start,metric,value").eq("user_id", userId);
  if (metricError) throw metricError;
  const { data: claimRows, error: claimError } = await admin.from("player_mission_claims").select("mission_id,period_start").eq("user_id", userId);
  if (claimError) throw claimError;
  const { data: roulette } = await admin.from("player_roulette_state").select("last_free_at,paid_spin_date,paid_spin_count").eq("user_id", userId).maybeSingle();
  const { data: chests, error: chestError } = await admin.from("player_server_chests").select("id,created_at,ready_at").eq("user_id", userId).is("opened_at", null).order("created_at");
  if (chestError) throw chestError;
  const current = new Map((metricRows ?? []).filter((r: any) => r.period_start === utcPeriodStart(r.period)).map((r: any) => [`${r.period}:${r.metric}`, Number(r.value)]));
  const claimed = new Set((claimRows ?? []).filter((r: any) => r.period_start === utcPeriodStart(missions.find((m: any) => m[0] === r.mission_id)?.[1] ?? "diaria")).map((r: any) => r.mission_id));
  return { missionProgress: Object.fromEntries(missions.map(([id, period, metric, target]: any) => [id, { progress: Math.min(target, current.get(`${period}:${metric}`) ?? 0), claimed: claimed.has(id) }])), roulette: roulette ?? { last_free_at: null, paid_spin_date: null, paid_spin_count: 0 }, chests: (chests ?? []).map((c: any) => ({ id: c.id, createdAt: Date.parse(c.created_at), readyAt: Date.parse(c.ready_at) })) };
}
