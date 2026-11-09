import { useEffect, useRef, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase, supabaseConfigured, supabaseRedirectUrl } from "./lib/supabase";
import { REAL_MONEY_CATALOG, formatPackagePrice } from "./data/realMoneyCatalog";

type IconName =
  | "gem"
  | "coin"
  | "chest"
  | "lock"
  | "menu"
  | "settings"
  | "chat"
  | "crown"
  | "spark"
  | "cards";

function GameIcon({
  name,
  size = 24,
  className = "",
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 48 48",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    className,
    "aria-hidden": true,
  };

  if (name === "gem") {
    return (
      <svg {...common}>
        <path
          d="M7 17 15 7h18l8 10-17 25L7 17Z"
          fill="#42E4FF"
          stroke="#082B4A"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path
          d="m7 17 10 2L15 7m26 10-10 2 2-12M17 19l7 23 7-23M17 19h14L24 9 17 19Z"
          fill="#8EF4FF"
          stroke="#168BAF"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path d="m18 10 3-1-2 5-4 2 3-6Z" fill="white" opacity=".9" />
      </svg>
    );
  }

  if (name === "coin") {
    return (
      <svg {...common}>
        <circle cx="24" cy="24" r="18" fill="#FFB92D" stroke="#69340E" strokeWidth="4" />
        <circle cx="24" cy="24" r="13" fill="#FFD95B" stroke="#E58A16" strokeWidth="2" />
        <path
          d="m24 13 3.2 6.5 7.2 1-5.2 5.1 1.2 7.2-6.4-3.4-6.4 3.4 1.2-7.2-5.2-5.1 7.2-1L24 13Z"
          fill="#F49315"
        />
        <path d="M16 17c3-4 8-5 12-3" stroke="#FFF6B3" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === "chest") {
    return (
      <svg {...common}>
        <path
          d="M8 20c0-8 5-13 16-13s16 5 16 13v5H8v-5Z"
          fill="#D96D2C"
          stroke="#3B1B16"
          strokeWidth="3.5"
        />
        <path
          d="M7 22h34v18H7V22Z"
          fill="#9D4227"
          stroke="#3B1B16"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        <path d="M10 25h28M13 9l4 14m18-14-4 14" stroke="#FFD04A" strokeWidth="4" />
        <path d="M19 22h10v12H19V22Z" fill="#FFC53E" stroke="#623317" strokeWidth="3" />
        <path d="M22 28a2 2 0 1 1 4 0v3h-4v-3Z" fill="#64321A" />
      </svg>
    );
  }

  if (name === "lock") {
    return (
      <svg {...common}>
        <path
          d="M15 22v-6a9 9 0 0 1 18 0v6"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <rect
          x="10"
          y="20"
          width="28"
          height="23"
          rx="6"
          fill="currentColor"
          stroke="#1A1421"
          strokeWidth="3"
        />
        <circle cx="24" cy="31" r="4" fill="#251D2C" />
        <path d="M24 34v4" stroke="#251D2C" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === "menu") {
    return (
      <svg {...common}>
        <path
          d="M10 14h28M10 24h28M10 34h19"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (name === "settings") {
    return (
      <svg {...common}>
        <path
          d="m27 7 2 5 5 2 5-1 3 6-4 4v4l4 4-3 6-5-1-5 2-2 5h-7l-2-5-5-2-5 1-3-6 4-4v-4l-4-4 3-6 5 1 5-2 2-5h7Z"
          fill="currentColor"
          stroke="#24182A"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <circle cx="24" cy="25" r="7" fill="#33233B" stroke="#F7D074" strokeWidth="3" />
      </svg>
    );
  }

  if (name === "chat") {
    return (
      <svg {...common}>
        <path d="M8 10a5 5 0 0 1 5-5h22a5 5 0 0 1 5 5v16a5 5 0 0 1-5 5H21l-10 8v-8a5 5 0 0 1-3-5V10Z" fill="#F4D27B" stroke="#493023" strokeWidth="4" strokeLinejoin="round" />
        <circle cx="17" cy="18" r="2.5" fill="#604054" /><circle cx="24" cy="18" r="2.5" fill="#604054" /><circle cx="31" cy="18" r="2.5" fill="#604054" />
      </svg>
    );
  }

  if (name === "cards") {
    return (
      <svg {...common}>
        <rect
          x="9"
          y="8"
          width="25"
          height="34"
          rx="5"
          fill="#664A82"
          stroke="#21182B"
          strokeWidth="3"
          transform="rotate(-8 9 8)"
        />
        <rect
          x="16"
          y="6"
          width="25"
          height="35"
          rx="5"
          fill="#F2C25D"
          stroke="#3B261A"
          strokeWidth="3"
        />
        <path
          d="m28.5 14 3.2 6.2 6.8 1-5 4.8 1.2 6.8-6.2-3.2-6.1 3.2 1.1-6.8-4.9-4.8 6.8-1 3.1-6.2Z"
          fill="#D86035"
        />
      </svg>
    );
  }

  if (name === "crown") {
    return (
      <svg {...common}>
        <path
          d="m7 15 10 8 7-13 7 13 10-8-4 23H11L7 15Z"
          fill="#FFD744"
          stroke="#5B2C12"
          strokeWidth="3"
          strokeLinejoin="round"
        />
        <path d="M13 32h22" stroke="#F18A1B" strokeWidth="3" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <path
        d="m24 4 4.5 13.5L42 22l-13.5 4.5L24 40l-4.5-13.5L6 22l13.5-4.5L24 4Z"
        fill="currentColor"
      />
    </svg>
  );
}

const opponents = [
  { name: "VEGA", score: 19, color: "#F06145", hair: "#582A30", skin: "#F7B782" },
  { name: "SOMBRA", score: 16, color: "#7454C7", hair: "#202344", skin: "#936C75" },
  { name: "LUNA", score: 13, color: "#298EB6", hair: "#173D5E", skin: "#E6A67C" },
];

const handTone = ["coral", "violet", "blue", "gold", "green", "orange", "pink"];
const generateLootValues = () => Array.from({ length: 3 }, () => (Math.floor(Math.random() * 5) + 1) * 5);

const cardCollections = [
  {
    id: "basica",
    base: "amber",
    name: "Deck base",
    shortName: "Base",
    description: "Tu colección inicial, sencilla y equilibrada. Las cartas numeradas muestran su fuerza de puja.",
    colors: ["#efb72f", "#d05b30"],
    accent: "#fff0a8",
    emblem: "",
    passiveEffect: "none",
    passiveDescription: "Sin bonus de set. Tu baraja inicial.",
    price: 0,
  },
  {
    id: "banda",
    base: "violet",
    name: "Banda de Ninjas",
    shortName: "Banda",
    description: "Un grupo de asaltantes que prepara remates bajos y precisos.",
    colors: ["#7250bd", "#37265f"],
    accent: "#e1d3ff",
    emblem: "🥷",
    passiveEffect: "low-card-plus-two",
    passiveDescription: "Golpe coordinado: tus cartas de valor 1–3 suman +2 a la puja.",
    price: 300,
  },
  {
    id: "cuchillo",
    base: "rose",
    name: "Ladrones del Botín",
    shortName: "Ladrones",
    description: "Una banda ágil que debilita las pujas de sus rivales.",
    colors: ["#ef5c69", "#a82e59"],
    accent: "#ffd1d5",
    emblem: "💰",
    passiveEffect: "rival-bid-minus-one",
    passiveDescription: "Ladrón: −1 a cada puja rival durante la resolución de la ronda.",
    price: 350,
  },
  {
    id: "escudo",
    base: "blue",
    name: "Templarios del Escudo",
    shortName: "Templarios",
    description: "Una orden defensiva capaz de resistir las trampas más peligrosas.",
    colors: ["#358fcc", "#304e9d"],
    accent: "#c8edff",
    emblem: "🛡️",
    passiveEffect: "ignore-bomb",
    passiveDescription: "Escudo: anula el daño de Bomba si tú ganas el botín.",
    price: 400,
  },
  {
    id: "dorado",
    base: "amber",
    name: "Rey Midas",
    shortName: "Midas",
    description: "La fortuna favorece al rey: las victorias de ronda generan monedas extra.",
    colors: ["#f0bb35", "#b76625"],
    accent: "#fff2ad",
    emblem: "👑",
    passiveEffect: "bonus-coins-on-round-win",
    passiveDescription: "Midas: +1 moneda cada vez que ganas una ronda.",
    price: 550,
  },
  {
    id: "veneno",
    base: "emerald",
    name: "Banda Tóxica",
    shortName: "Tóxicos",
    description: "Una baraja química con cartas de valor entre 3 y 9.",
    colors: ["#42b875", "#216454"],
    accent: "#c9ffd2",
    emblem: "🧪",
    passiveEffect: "high-hand-and-tie-break",
    passiveDescription: "Tóxico: tus cartas de valor 6–9 suman +1 a la puja.",
    price: 450,
  },
];

type CardEffectId = "bid-plus-one" | "steal-leader-15" | "steal-leader-five" | "last-place-plus-15" | "last-place-plus-five" | "loss-compensation-5" | "loss-compensation-3" | "rival-bid-minus-one" | "low-card-loss-five" | "near-miss-five";
const cardEffects: Record<string, { id: CardEffectId; name: string; description: string }> = {};
const cardEffectPattern: { id: CardEffectId; name: string; description: string }[] = [
  { id: "low-card-loss-five", name: "Salida segura", description: "Si pierdes con esta carta baja, recibes +5 puntos." },
  { id: "near-miss-five", name: "Por los pelos", description: "Si pierdes por 1 punto, recibes +5 puntos." },
  { id: "last-place-plus-five", name: "Remontada", description: "Si vas último y ganas, recibes +5 puntos extra." },
  { id: "steal-leader-five", name: "Carterista", description: "Si ganas, roba 5 puntos al líder actual." },
  { id: "rival-bid-minus-one", name: "Interferencia", description: "Reduce en 1 la puja rival más alta esta ronda." },
  { id: "bid-plus-one", name: "Empuje", description: "Esta carta suma +1 a tu puja." },
  { id: "loss-compensation-3", name: "Plan de escape", description: "Si no ganas esta ronda, recibes +3 puntos." },
  { id: "last-place-plus-five", name: "Apuesta de remontada", description: "Si vas último y ganas, recibes +5 puntos extra." },
  { id: "steal-leader-five", name: "Manos rápidas", description: "Si ganas, roba 5 puntos al líder actual." },
];
for (const collection of cardCollections) for (let value = 1; value <= 9; value++) cardEffects[`${collection.id}-${value}`] = cardEffectPattern[value - 1];
Object.assign(cardEffects, {
  "cuchillo-8": { id: "steal-leader-15", name: "Carterista experto", description: "Si ganas, roba 15 puntos al líder actual." },
  "cuchillo-4": { id: "last-place-plus-15", name: "Remontada", description: "Si vas último y ganas, recibes +15 puntos extra." },
  "escudo-3": { id: "loss-compensation-5", name: "Red de seguridad", description: "Si pierdes la ronda, recibes +5 puntos." },
  "dorado-6": { id: "steal-leader-15", name: "Impuesto real", description: "Si ganas, roba 15 puntos al líder actual." },
  "veneno-9": { id: "rival-bid-minus-one", name: "Nube tóxica", description: "Reduce en 1 la puja rival más alta esta ronda." },
});
const inventoryCards = cardCollections.flatMap((collection) => Array.from({ length: 9 }, (_, index) => {
  const value = index + 1;
  const cardKey = `${collection.id}-${value}`;
  return { ...collection, value, cardKey, cardPrice: collection.price, effect: cardEffects[cardKey] ?? null, status: "available" as "available" | "used" | "locked" };
}));
const hasDeckCard = (ownedCards: string[], deckId: string) => ownedCards.some((cardKey) => cardKey.startsWith(`${deckId}-`));
const hasCompleteDeck = (ownedCards: string[], deckId: string) => Array.from({ length: 9 }, (_, index) => ownedCards.includes(`${deckId}-${index + 1}`)).every(Boolean);
const hasActiveSet = (profile: PlayerProfile, deckId: string) => profile.equippedCards.includes(deckId) && hasCompleteDeck(profile.ownedCards, deckId);

const publicAsset = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\/+/, "")}`;
const soundFiles = {
  click: publicAsset("sigma/audio/oneshots/click_001.ogg"),
  cardSelect: publicAsset("sigma/audio/oneshots/card_select_01.ogg"),
  cardHover: publicAsset("sigma/audio/oneshots/card_hover_01.ogg"),
  confirm: publicAsset("sigma/audio/oneshots/card_place_01.ogg"),
  flip: publicAsset("sigma/audio/oneshots/card_flip_01.ogg"),
  cardSlide: publicAsset("sigma/audio/oneshots/card_slide_01.ogg"),
  handWin: publicAsset("sigma/audio/oneshots/hand_win_01.ogg"),
  handLose: publicAsset("sigma/audio/oneshots/hand_lose_01.ogg"),
  deal: publicAsset("sigma/audio/oneshots/card_deal_01.ogg"),
  score: publicAsset("sigma/audio/oneshots/score_tick_01.ogg"),
};

type AppScreen = "auth" | "menu" | "modes" | "online-modes" | "social" | "game" | "settings" | "ranking" | "season-ranking" | "profile" | "missions" | "roulette";

type GameMode = "classic" | "teams" | "duel";
type VictoryMode = "classic" | "teams" | "duel";
type RankingPeriod = "weekly" | "monthly" | "total";
type RoundRuleId = "highest" | "lowest" | "closest-five" | "even-bids";
type RoundRule = { id: RoundRuleId; label: string; description: string };
type ChatEmoteCategory = "normales" | "conejitos" | "furry" | "animados";
type ChatEmote = { id: string; label: string; image: string; category: ChatEmoteCategory };
type PlayerChest = { id: string; createdAt: number; readyAt: number };
type ScheduledGameEvent = { id: string; period: "DIARIO" | "SEMANAL" | "MENSUAL"; mode: GameMode; icon: string; title: string; description: string; rewardText: string; reward: { coinMultiplier?: number; coinBonus?: number; gemBonus?: number }; endsAt: number };
type LiveChatMessage = { id: string; sender: string; avatar: string; text?: string; emoteId?: string; time: number; isUser?: boolean };
type PlayerCard = { value: number; deckId: string; effectId?: CardEffectId };
type MatchPlayer = { id: string; name: string; avatar: string; score: number; hand: PlayerCard[]; team: 1 | 2 | 0; isUser: boolean };
type OnlinePublicProfile = { id: string; username: string | null; display_name: string; avatar_id: string; avatar_color?: string; frame_id?: string };
type OnlineFriendship = { requester_id: string; addressee_id: string; status: "pending" | "accepted" };
type OnlinePartyInvite = { id: string; party_id: string; inviter_id: string; invitee_id: string; status: "pending" | "accepted" | "declined" };
type OnlineRosterPlayer = { id: string; username: string; avatar: string; deckIds: string[]; ownedCards: string[]; team: 1 | 2 | 0 };
type OnlineMatchSetup = { id: string; mode: GameMode; hostId: string; roster: OnlineRosterPlayer[]; players: MatchPlayer[]; rules: RoundRule[]; lootValues: number[]; lootEffect: LootEffect };
type PausableGameTimeout = { callback: () => void; remainingMs: number; startedAt: number; timeoutId: number | null; start: () => void };
type LootEffect = { type: string; label: string; value: number; icon: string; colors: [string, string]; description?: string };
type PlayerMission = { id: string; desc: string; metric: string; period: "diaria" | "semanal" | "mensual"; difficulty: "FÁCIL" | "MEDIA" | "DIFÍCIL"; resetAt: number; target: number; progress: number; rewardAmt: number; rewardType: "coins" | "gems"; claimed: boolean };
type PlayerProfile = {
  name: string;
  avatar: string;
  lastNameChange: number;
  coins: number;
  gems: number;
  ownedCards: string[];
  equippedCard: string;
  equippedCards: string[];
  removalsUsed: number;
  ownedAvatars: string[];
  ownedFrames: string[];
  equippedFrame: string;
  ownedAvatarColors: string[];
  equippedAvatarColor: string;
  ownedChatEmotes: string[];
  chests: PlayerChest[];
  paidSpinsToday: number;
  paidSpinDate: string | null;
  winsByMode: Record<VictoryMode, Record<string, number>>;
  winsByPeriod: { weekly: Record<VictoryMode, Record<string, number>>; monthly: Record<VictoryMode, Record<string, number>> };
  winsPeriodResetAt: { weekly: number; monthly: number };
  missions: PlayerMission[];
  lastSpinTime: number | null;
};

const profileAvatarOptions = ["👤", "🦊", "🐉", "👽", "🤡", "👻", "🤖", "🐱", "🐺", "🦄", "🦝", "🐸", "🐙", "🦖", "🐼", "🦈", "🐵", "🐧"];
const transparentAvatarFiles = import.meta.glob<string>("../Chat, Emotes, Avatar y Marcos/Extraidos/free-fantasy-character-avatar-icons-pixel-art/PNG/Transperent/*.png", { eager: true, query: "?url", import: "default" });
const backgroundAvatarFiles = import.meta.glob<string>("../Chat, Emotes, Avatar y Marcos/Extraidos/free-fantasy-character-avatar-icons-pixel-art/PNG/Background/*.png", { eager: true, query: "?url", import: "default" });
const avatarNames: Record<string, string> = {
  "1": "Caballero encapuchado", "2": "Aventurera", "3": "Arquero", "4": "Rey enano", "5": "Hechicera pelirroja", "6": "Elfa exploradora", "7": "Goblin", "8": "Hechicera de fuego", "9": "Ninja rojo", "10": "Mago anciano", "11": "Demonio de cuernos", "12": "Ninja de las sombras", "13": "Cíclope", "14": "Orco", "15": "Guardián del bosque", "16": "Chamán goblin", "17": "Araña gigante", "18": "Espectro armado", "19": "Caballero infernal", "20": "Monje guerrero", "21": "Calavera maldita", "22": "Espectro encapuchado", "23": "Calavera dorada", "24": "Vampiro", "25": "Gólem de hierro", "26": "Demonio rojo", "27": "Dragón dorado", "28": "Dragón violeta", "29": "Dragón rojo", "30": "Fénix", "31": "Hombre lobo", "32": "Cuervo sombrío", "33": "Rey simio", "34": "Zombi", "35": "Yeti", "36": "Serpiente", "37": "Demonio de fuego", "38": "Dragón ancestral", "39": "Orco de hielo", "40": "Bestia acorazada", "41": "Espíritu del bosque", "42": "Dragón oscuro",
};
const avatarAssetItems = [
  ...Object.entries(transparentAvatarFiles).map(([path, image]) => ({ path, image, variant: "transparente" })),
  ...Object.entries(backgroundAvatarFiles).map(([path, image]) => ({ path, image, variant: "fondo" })),
].sort((a, b) => a.path.localeCompare(b.path, undefined, { numeric: true })).map(({ path, image, variant }) => {
  const number = path.match(/con(\d+)\.png$/i)?.[1] ?? path.split("/").pop()?.replace(".png", "") ?? "0";
  const id = `avatar-${variant}-${number}`;
  const name = avatarNames[number] ?? `Personaje fantástico ${number}`;
  return { id, name: variant === "fondo" ? `${name} · Fondo integrado` : name, currency: "gems" as const, price: variant === "fondo" ? 600 : 500, image };
});
const profileAvatarOptionsAll = [...profileAvatarOptions, ...avatarAssetItems.map((item) => item.id)];
const avatarStoreItems = [
  { id: "👤", name: "Capitán clásico", currency: "gems" as const, price: 350 },
  { id: "🐱", name: "Gato de la mesa", currency: "gems" as const, price: 350 },
  { id: "🦊", name: "Zorro", currency: "gems" as const, price: 350 },
  { id: "🐉", name: "Dragón", currency: "gems" as const, price: 350 },
  { id: "👽", name: "Alien", currency: "gems" as const, price: 350 },
  { id: "🤡", name: "Bufón", currency: "gems" as const, price: 350 },
  { id: "👻", name: "Fantasma", currency: "gems" as const, price: 350 },
  { id: "🤖", name: "Robot", currency: "gems" as const, price: 350 },
  { id: "🐺", name: "Lobo", currency: "gems" as const, price: 350 },
  { id: "🦄", name: "Unicornio", currency: "gems" as const, price: 350 },
  { id: "🦝", name: "Mapache bandido", currency: "gems" as const, price: 350 },
  { id: "🐸", name: "Rana saltarina", currency: "gems" as const, price: 350 },
  { id: "🐙", name: "Pulpo pirata", currency: "gems" as const, price: 350 },
  { id: "🦖", name: "Dino feroz", currency: "gems" as const, price: 350 },
  { id: "🐼", name: "Panda ninja", currency: "gems" as const, price: 350 },
  { id: "🦈", name: "Tiburón", currency: "gems" as const, price: 350 },
  { id: "🐵", name: "Mono travieso", currency: "gems" as const, price: 350 },
  { id: "🐧", name: "Pingüino", currency: "gems" as const, price: 350 },
  ...avatarAssetItems,
].map((item) => ({ ...item, price: item.id.startsWith("avatar-") ? (item.id.startsWith("avatar-fondo-") ? 600 : 500) : 350 }));
const normalizeAvatarId = (id: unknown): string => typeof id === "string" && /^avatar-\d+$/.test(id) ? `avatar-transparente-${id.slice("avatar-".length)}` : typeof id === "string" ? id : "🐱";
const emoteFiles = import.meta.glob<string>("../Chat, Emotes, Avatar y Marcos/Extraidos/Viral Emojis */Viral Emojis */128x128/*.png", { eager: true, query: "?url", import: "default" });
const bunnyEmoteFiles = import.meta.glob<string>("../Chat, Emotes, Avatar y Marcos/Extraidos/bunny-emotes/PNGs/*.png", { eager: true, query: "?url", import: "default" });
const pipoyaEmoteFiles = import.meta.glob<string>("./assets/chat-emotes/pipoya/*.png", { eager: true, query: "?url", import: "default" });
const furryEmoteFiles = import.meta.glob<string>("../Chat, Emotes, Avatar y Marcos/Extraidos/EazyD_FurryPixelPins_VRChat_Free_v1.0/EazyD_FurryPixelPins_Free/256px/*.png", { eager: true, query: "?url", import: "default" });
const animatedEmotePreviewFiles = import.meta.glob<string>([
  "../Chat, Emotes, Avatar y Marcos/Extraidos/itch/187x187/1/Scene1_046.png",
  "../Chat, Emotes, Avatar y Marcos/Extraidos/itch/187x187/2/Scene1_046.png",
  "../Chat, Emotes, Avatar y Marcos/Extraidos/itch/187x187/3/Scene1_049.png",
  "../Chat, Emotes, Avatar y Marcos/Extraidos/itch/187x187/4/Scene1_050.png",
  "../Chat, Emotes, Avatar y Marcos/Extraidos/itch/187x187/5/Scene1_040.png",
  "../Chat, Emotes, Avatar y Marcos/Extraidos/itch/187x187/6/Scene1_032.png",
  "../Chat, Emotes, Avatar y Marcos/Extraidos/itch/187x187/7/Scene1_040.png",
  "../Chat, Emotes, Avatar y Marcos/Extraidos/itch/187x187/8/Scene1_032.png",
  "../Chat, Emotes, Avatar y Marcos/Extraidos/itch/187x187/9/Scene1_032.png",
  "../Chat, Emotes, Avatar y Marcos/Extraidos/itch/187x187/10/Scene1_040.png",
  "../Chat, Emotes, Avatar y Marcos/Extraidos/itch/187x187/11/Scene1_040.png",
  "../Chat, Emotes, Avatar y Marcos/Extraidos/itch/187x187/12/Scene1_046.png",
  "../Chat, Emotes, Avatar y Marcos/Extraidos/itch/187x187/13/Scene1_032.png",
  "../Chat, Emotes, Avatar y Marcos/Extraidos/itch/187x187/14/Scene1_033.png",
  "../Chat, Emotes, Avatar y Marcos/Extraidos/itch/187x187/15/Scene1_040.png",
  "../Chat, Emotes, Avatar y Marcos/Extraidos/itch/187x187/16/Scene1_050.png",
], { eager: true, query: "?url", import: "default" });
const chatEmotes: ChatEmote[] = [
  ...Object.entries(emoteFiles).sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true })).map(([path, image], index) => ({ id: `normal-${index}`, label: path.match(/ViralEmoji - (\d+)/)?.[1] ?? `Emoji ${index + 1}`, image, category: "normales" as const })),
  ...Object.entries(bunnyEmoteFiles).sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true })).map(([path, image], index) => ({ id: `bunny-${index}`, label: path.split("/").at(-1)?.replace(/\.png$/i, "") ?? `Conejito ${index + 1}`, image, category: "conejitos" as const })),
  ...Object.entries(pipoyaEmoteFiles).sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true })).map(([, image], index) => ({ id: `pipoya-${index}`, label: `Pipoya ${index + 1}`, image, category: "normales" as const })),
  ...Object.entries(furryEmoteFiles).sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true })).map(([path, image], index) => ({ id: `furry-${index}`, label: path.split("/").at(-1)?.replace(/\.png$/i, "").replace(/^\d+_/, "") ?? `Furry ${index + 1}`, image, category: "furry" as const })),
  ...Object.entries(animatedEmotePreviewFiles).sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true })).map(([path, image]) => {
    const folder = path.match(/itch\/187x187\/([^/]+)\//i)?.[1] ?? "0";
    return { id: `animated-${folder}`, label: `Animado ${folder}`, image, category: "animados" as const };
  }),
];
const chatEmoteCategoryTabs: { id: "todos" | ChatEmoteCategory; label: string }[] = [
  { id: "todos", label: "TODOS" }, { id: "normales", label: "NORMALES" }, { id: "conejitos", label: "CONEJOS" },
  { id: "furry", label: "FURRY" }, { id: "animados", label: "ANIMADOS" },
];
const freeChatEmoteIds = chatEmotes.filter((emote) => emote.category === "normales").map((emote) => emote.id);
const CHAT_EMOTE_PRICES: Record<ChatEmoteCategory, number> = { normales: 0, conejitos: 30, furry: 60, animados: 100 };
const chatEmotePrice = (emote: ChatEmote) => CHAT_EMOTE_PRICES[emote.category];
const CHEST_WAIT_MS = 10 * 60 * 1000;
const CHEST_SKIP_GEMS = 25;
const MAX_CHESTS = 3;
const CHEST_DUPLICATE_COINS = 75;
const DUPLICATE_CARD_COINS = 60;
const CARD_REMOVAL_BASE_GEMS = 5;
const CARD_REMOVAL_INCREMENT_GEMS = 5;
const CARD_REMOVAL_MAX_GEMS = 25;
const PAID_ROULETTE_BASE_GEMS = 5;
const PAID_ROULETTE_INCREMENT_GEMS = 5;
const PAID_ROULETTE_MAX_GEMS = 25;
const NAME_CHANGE_GEMS = 250;
const rankBadgeFiles = import.meta.glob<string>([
  "../Chat, Emotes, Avatar y Marcos/Extraidos/RankBadges/RankBadges/128x128/color/iron/badge_iron_01.png",
  "../Chat, Emotes, Avatar y Marcos/Extraidos/RankBadges/RankBadges/128x128/color/bronze/badge_bronze_01.png",
  "../Chat, Emotes, Avatar y Marcos/Extraidos/RankBadges/RankBadges/128x128/color/silver/badge_silver_03.png",
  "../Chat, Emotes, Avatar y Marcos/Extraidos/RankBadges/RankBadges/128x128/color/gold/badge_gold_01.png",
  "../Chat, Emotes, Avatar y Marcos/Extraidos/RankBadges/RankBadges/128x128/color/gold/badge_gold_06.png",
  "../Chat, Emotes, Avatar y Marcos/Extraidos/RankBadges/RankBadges/128x128/color/frost/badge_frost_10.png",
  "../Chat, Emotes, Avatar y Marcos/Extraidos/RankBadges/RankBadges/128x128/color/crystal/badge_crystal_05.png",
  "../Chat, Emotes, Avatar y Marcos/Extraidos/RankBadges/RankBadges/128x128/color/amethyst/badge_amethyst_08.png",
  "../Chat, Emotes, Avatar y Marcos/Extraidos/RankBadges/RankBadges/128x128/color/amethyst/badge_amethyst_10.png",
], { eager: true, query: "?url", import: "default" });
const rankBadgeByPath = Object.entries(rankBadgeFiles).reduce<Record<string, string>>((map, [path, image]) => { const filename = path.split("/").at(-1); if (filename) map[filename] = image; return map; }, {});
const avatarFrameStoreItems = ([
  { id: "base", name: "Dorado clásico", price: 0, currency: "gems" as const },
  { id: "bronze", name: "Bronce pulido", price: 350, currency: "gems" as const },
  { id: "silver", name: "Plata brillante", price: 350, currency: "gems" as const },
  { id: "gold", name: "Oro real", price: 350, currency: "gems" as const },
  { id: "ruby", name: "Rojo rubí", price: 350, currency: "gems" as const },
  { id: "sapphire", name: "Azul zafiro", price: 350, currency: "gems" as const },
  { id: "emerald", name: "Verde esmeralda", price: 350, currency: "gems" as const },
  { id: "violet", name: "Violeta eléctrico", price: 350, currency: "gems" as const },
  { id: "rainbow", name: "Arcoíris", price: 350, currency: "gems" as const },
  { id: "neon", name: "Neón brillante", price: 350, currency: "gems" as const },
  { id: "frost", name: "Escarcha", price: 350, currency: "gems" as const },
  { id: "flame", name: "Llamas", price: 350, currency: "gems" as const },
  { id: "galaxy", name: "Galaxia", price: 350, currency: "gems" as const },
  { id: "candy", name: "Caramelo", price: 350, currency: "gems" as const },
  { id: "shadow", name: "Sombra", price: 350, currency: "gems" as const },
  { id: "mint", name: "Menta", price: 350, currency: "gems" as const },
  { id: "rose-gold", name: "Oro rosa", price: 350, currency: "gems" as const },
  { id: "copper", name: "Cobre incandescente", price: 350, currency: "gems" as const },
  { id: "ice", name: "Hielo cristalino", price: 350, currency: "gems" as const },
  { id: "toxic", name: "Tóxico", price: 350, currency: "gems" as const },
  { id: "aurora", name: "Aurora boreal", price: 350, currency: "gems" as const },
  { id: "prism", name: "Prisma", price: 350, currency: "gems" as const },
  { id: "electric", name: "Electricidad", price: 350, currency: "gems" as const },
  { id: "sunset", name: "Atardecer", price: 350, currency: "gems" as const },
  { id: "ocean", name: "Océano", price: 350, currency: "gems" as const },
  { id: "white-gold", name: "Oro blanco", price: 350, currency: "gems" as const },
  { id: "cherry", name: "Cereza", price: 350, currency: "gems" as const },
  { id: "cosmic", name: "Cósmico", price: 350, currency: "gems" as const },
  { id: "heartbeat", name: "Latido rubí", price: 350, currency: "gems" as const },
  { id: "gold-shimmer", name: "Destello dorado", price: 350, currency: "gems" as const },
  { id: "blue-pulse", name: "Pulso zafiro", price: 350, currency: "gems" as const },
  { id: "starlight", name: "Luz estelar", price: 350, currency: "gems" as const },
  { id: "aurora-flow", name: "Aurora danzante", price: 350, currency: "gems" as const },
  { id: "pink-neon", name: "Neón rosa", price: 350, currency: "gems" as const },
  { id: "electric-pulse", name: "Chispa eléctrica", price: 350, currency: "gems" as const },
  { id: "frost-glow", name: "Brillo glaciar", price: 350, currency: "gems" as const },
  { id: "ember", name: "Ascua viva", price: 350, currency: "gems" as const },
  { id: "prism-wave", name: "Onda prisma", price: 350, currency: "gems" as const },
  { id: "moonlight", name: "Luz lunar", price: 350, currency: "gems" as const },
  { id: "toxic-pulse", name: "Pulso tóxico", price: 350, currency: "gems" as const },
]).map((frame) => ({
  ...frame,
  price: frame.id === "base" ? 0 : ["rainbow", "neon", "frost", "flame", "galaxy", "aurora", "prism", "electric", "cosmic", "heartbeat", "gold-shimmer", "blue-pulse", "starlight", "aurora-flow", "pink-neon", "electric-pulse", "frost-glow", "ember", "prism-wave", "moonlight", "toxic-pulse"].includes(frame.id) ? 700 : 350,
}));
const avatarFrameClass = (id: string): string => `avatar-frame-static avatar-frame-${avatarFrameStoreItems.some((frame) => frame.id === id) ? id : "base"}`;
const avatarBackdropPalette = ["#7a394d", "#34516f", "#315d51", "#66477a", "#80523d", "#375f69", "#6d3e58", "#4b5730"];
const avatarBackdropColor = (avatar: string): string => {
  let hash = 0;
  for (let index = 0; index < avatar.length; index += 1) hash = (hash * 31 + avatar.charCodeAt(index)) | 0;
  return avatarBackdropPalette[Math.abs(hash) % avatarBackdropPalette.length];
};
const avatarDisplayStyle = (avatar: string): React.CSSProperties => ({ "--avatar-fill": avatarBackdropColor(avatar) } as React.CSSProperties);
const rankForWins = (wins: number) => {
  const tiers = [
    { min: 0, name: "Sin rango", material: "iron", asset: "badge_iron_01.png", next: 1, nextName: "Bronce", coins: 0, gems: 0 },
    { min: 1, name: "Bronce", material: "bronze", asset: "badge_bronze_01.png", next: 30, nextName: "Plata", coins: 60, gems: 0 },
    { min: 30, name: "Plata", material: "silver", asset: "badge_silver_03.png", next: 70, nextName: "Oro", coins: 150, gems: 1 },
    { min: 70, name: "Oro", material: "gold", asset: "badge_gold_06.png", next: 120, nextName: "Escarcha", coins: 300, gems: 1 },
    { min: 120, name: "Escarcha", material: "frost", asset: "badge_frost_10.png", next: 180, nextName: "Cristal", coins: 500, gems: 2 },
    { min: 180, name: "Cristal", material: "crystal", asset: "badge_crystal_05.png", next: 250, nextName: "Amatista", coins: 800, gems: 3 },
    { min: 250, name: "Amatista", material: "amethyst", asset: "badge_amethyst_08.png", next: 330, nextName: "Leyenda", coins: 1200, gems: 5 },
    { min: 330, name: "Leyenda", material: "amethyst", asset: "badge_amethyst_10.png", next: Infinity, nextName: "Rango máximo", coins: 2000, gems: 8 },
  ];
  return [...tiers].reverse().find((tier) => wins >= tier.min) ?? tiers[0];
};
const rankBadgeUrl = (asset: string) => rankBadgeByPath[asset] ?? Object.values(rankBadgeByPath)[0] ?? "";
const eventCatalog: Record<ScheduledGameEvent["period"], Omit<ScheduledGameEvent, "id" | "period" | "endsAt">[]> = {
  DIARIO: [
    { mode: "classic", icon: "⚔️", title: "MESA 4P x2", description: "Gana en Clásico 4P y dobla las monedas.", rewardText: "x2 MONEDAS", reward: { coinMultiplier: 2 } },
    { mode: "teams", icon: "🤝", title: "EQUIPO x2", description: "Gana en Equipos 2v2 y dobla las monedas.", rewardText: "x2 MONEDAS", reward: { coinMultiplier: 2 } },
    { mode: "duel", icon: "🔥", title: "DUELO x2", description: "Gana un Duelo 1v1 y dobla las monedas.", rewardText: "x2 MONEDAS", reward: { coinMultiplier: 2 } },
  ],
  SEMANAL: [
    { mode: "classic", icon: "🏅", title: "SEMANA DE 4P", description: "Cada victoria clásica suma 15 monedas extra.", rewardText: "+15 MONEDAS", reward: { coinBonus: 15 } },
    { mode: "teams", icon: "💎", title: "TESORO EN EQUIPO", description: "Gana en 2v2 y llévate 15 monedas extra.", rewardText: "+15 MONEDAS", reward: { coinBonus: 15 } },
    { mode: "duel", icon: "🪙", title: "DUELO DE ORO", description: "Cada victoria 1v1 suma 10 monedas extra.", rewardText: "+10 MONEDAS", reward: { coinBonus: 10 } },
  ],
  MENSUAL: [
    { mode: "classic", icon: "👑", title: "MES DE LA SUBASTA", description: "Gana en 4P y recibe 10 monedas extra.", rewardText: "+10 MONEDAS", reward: { coinBonus: 10 } },
    { mode: "teams", icon: "✨", title: "GRAN ALIANZA", description: "Gana en 2v2 y consigue 10 monedas extra.", rewardText: "+10 MONEDAS", reward: { coinBonus: 10 } },
    { mode: "duel", icon: "🎯", title: "CAMPEÓN DEL DUELO", description: "Gana en 1v1 y recibe un 25% más de monedas.", rewardText: "x1,25 MONEDAS", reward: { coinMultiplier: 1.25 } },
  ],
};
const utcPeriodKey = (date: Date, period: ScheduledGameEvent["period"]): string => {
  const y = date.getUTCFullYear(); const m = String(date.getUTCMonth() + 1).padStart(2, "0"); const d = String(date.getUTCDate()).padStart(2, "0");
  if (period === "DIARIO") return `${y}-${m}-${d}`;
  if (period === "MENSUAL") return `${y}-${m}`;
  const monday = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  monday.setUTCDate(monday.getUTCDate() - ((monday.getUTCDay() + 6) % 7));
  return `W-${monday.toISOString().slice(0, 10)}`;
};
const eventPeriodEnd = (date: Date, period: ScheduledGameEvent["period"]): number => {
  const end = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  if (period === "DIARIO") end.setUTCDate(end.getUTCDate() + 1);
  if (period === "SEMANAL") { end.setUTCDate(end.getUTCDate() + 7 - ((end.getUTCDay() + 6) % 7)); }
  if (period === "MENSUAL") { end.setUTCMonth(end.getUTCMonth() + 1, 1); }
  return end.getTime();
};
const stableHash = (value: string): number => { let hash = 2166136261; for (let index = 0; index < value.length; index += 1) hash = Math.imul(hash ^ value.charCodeAt(index), 16777619); return hash >>> 0; };
function getActiveEvents(date = new Date()): ScheduledGameEvent[] {
  const usedModes = new Set<GameMode>();
  return (["DIARIO", "SEMANAL", "MENSUAL"] as const).map((period) => {
    const options = eventCatalog[period].filter((event) => !usedModes.has(event.mode));
    const key = utcPeriodKey(date, period);
    const selected = options[stableHash(`${period}:${key}`) % options.length];
    usedModes.add(selected.mode);
    return { ...selected, id: `${period}:${key}:${selected.mode}`, period, endsAt: eventPeriodEnd(date, period) };
  });
}
const formatCountdown = (milliseconds: number): string => {
  const seconds = Math.max(0, Math.ceil(milliseconds / 1000));
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
};
const formatPeriodRemaining = (milliseconds: number): string => {
  const minutes = Math.ceil(Math.max(0, milliseconds) / 60_000);
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  if (days > 0) return `${days} D · ${String(hours).padStart(2, "0")} H`;
  const remainingMinutes = minutes % 60;
  return `${hours} H · ${String(remainingMinutes).padStart(2, "0")} MIN`;
};
function AvatarFace({ avatar, className = "" }: { avatar: string; className?: string }) {
  const normalizedAvatar = normalizeAvatarId(avatar);
  const item = avatarStoreItems.find((entry) => entry.id === normalizedAvatar && "image" in entry) as (typeof avatarStoreItems)[number] & { image?: string } | undefined;
  const fallback = profileAvatarOptions.includes(normalizedAvatar) ? normalizedAvatar : "👤";
  const artKind = normalizedAvatar.startsWith("avatar-fondo-") ? "avatar-art-with-background" : "avatar-art-transparent";
  return item?.image ? <><img className={`avatar-art ${artKind} ${className}`} src={item.image} alt="" onError={(event) => { event.currentTarget.style.display = "none"; const sibling = event.currentTarget.nextElementSibling as HTMLElement | null; sibling?.classList.add("is-visible"); }} /><span className={`profile-avatar-emoji avatar-art-fallback ${className}`} aria-hidden="true">{fallback}</span></> : <span className={`profile-avatar-emoji avatar-basic-emoji ${className}`}>{fallback}</span>;
}
function ChatEmoteImage({ emote, className = "" }: { emote: ChatEmote; className?: string }) {
  return <img className={className} src={emote.image} alt={emote.label} loading="lazy" />;
}
const roulettePrizes = [
  { label: "5 🪙", coins: 5, gems: 0, weight: 230 }, { label: "3 💎", coins: 0, gems: 3, weight: 12 },
  { label: "10 🪙", coins: 10, gems: 0, weight: 190 }, { label: "6 💎", coins: 0, gems: 6, weight: 3 },
  { label: "15 🪙", coins: 15, gems: 0, weight: 160 }, { label: "NADA", coins: 0, gems: 0, weight: 129 },
  { label: "20 🪙", coins: 20, gems: 0, weight: 130 }, { label: "15 💎", coins: 0, gems: 15, weight: 1 },
  { label: "30 🪙", coins: 30, gems: 0, weight: 90 }, { label: "30 💎", coins: 0, gems: 30, weight: 0.2 },
  { label: "50 🪙", coins: 50, gems: 0, weight: 40 }, { label: "100 🪙", coins: 100, gems: 0, weight: 15 },
];
const DAILY_MS = 24 * 60 * 60 * 1000;
const MATCH_ENTRY_FEE = 10;
const missionResetAt = (period: PlayerMission["period"], now = new Date()) => {
  const reset = new Date(now);
  reset.setHours(0, 0, 0, 0);
  if (period === "diaria") reset.setDate(reset.getDate() + 1);
  if (period === "semanal") {
    const daysToMonday = (8 - (reset.getDay() || 7)) % 7 || 7;
    reset.setDate(reset.getDate() + daysToMonday);
  }
  if (period === "mensual") reset.setMonth(reset.getMonth() + 1, 1);
  return reset.getTime();
};
function createMissions(now = new Date()): PlayerMission[] {
  const templates: Omit<PlayerMission, "resetAt" | "progress" | "claimed">[] = [
    { id: "d-play", period: "diaria", difficulty: "DIFÍCIL", desc: "Juega 35 partidas", metric: "games", target: 35, rewardAmt: 40, rewardType: "coins" },
    { id: "d-bids", period: "diaria", difficulty: "MEDIA", desc: "Haz 300 pujas", metric: "bids", target: 300, rewardAmt: 50, rewardType: "coins" },
    { id: "d-rounds", period: "diaria", difficulty: "MEDIA", desc: "Gana 80 rondas", metric: "roundWins", target: 80, rewardAmt: 30, rewardType: "coins" },
    { id: "d-win", period: "diaria", difficulty: "DIFÍCIL", desc: "Gana 7 partidas", metric: "matchWins", target: 7, rewardAmt: 1, rewardType: "gems" },
    { id: "d-removal", period: "diaria", difficulty: "MEDIA", desc: "Retira una carta de tu mano", metric: "removals", target: 1, rewardAmt: 10, rewardType: "coins" },
    { id: "w-play", period: "semanal", difficulty: "MEDIA", desc: "Juega 100 partidas", metric: "games", target: 100, rewardAmt: 100, rewardType: "coins" },
    { id: "w-bids", period: "semanal", difficulty: "MEDIA", desc: "Haz 900 pujas", metric: "bids", target: 900, rewardAmt: 150, rewardType: "coins" },
    { id: "w-rounds", period: "semanal", difficulty: "DIFÍCIL", desc: "Gana 230 rondas", metric: "roundWins", target: 230, rewardAmt: 200, rewardType: "coins" },
    { id: "w-win", period: "semanal", difficulty: "DIFÍCIL", desc: "Gana 18 partidas", metric: "matchWins", target: 18, rewardAmt: 3, rewardType: "gems" },
    { id: "w-removal", period: "semanal", difficulty: "DIFÍCIL", desc: "Retira 5 cartas de tu mano", metric: "removals", target: 5, rewardAmt: 50, rewardType: "coins" },
    { id: "m-play", period: "mensual", difficulty: "DIFÍCIL", desc: "Juega 400 partidas", metric: "games", target: 400, rewardAmt: 300, rewardType: "coins" },
    { id: "m-bids", period: "mensual", difficulty: "DIFÍCIL", desc: "Haz 3.600 pujas", metric: "bids", target: 3600, rewardAmt: 450, rewardType: "coins" },
    { id: "m-rounds", period: "mensual", difficulty: "DIFÍCIL", desc: "Gana 900 rondas", metric: "roundWins", target: 900, rewardAmt: 600, rewardType: "coins" },
    { id: "m-win", period: "mensual", difficulty: "DIFÍCIL", desc: "Gana 70 partidas", metric: "matchWins", target: 70, rewardAmt: 6, rewardType: "gems" },
    { id: "m-removal", period: "mensual", difficulty: "DIFÍCIL", desc: "Retira 20 cartas de tu mano", metric: "removals", target: 20, rewardAmt: 200, rewardType: "coins" },
  ];
  return templates.map((mission) => ({ ...mission, resetAt: missionResetAt(mission.period, now), progress: 0, claimed: false }));
}
function normalizeMissions(saved: unknown): PlayerMission[] {
  const fresh = createMissions();
  if (!Array.isArray(saved)) return fresh;
  const legacyMap: Record<string, string> = { play: "d-play", win: "d-win", bid: "d-bids" };
  return fresh.map((template) => {
    const old = saved.find((item: any) => item?.id === template.id || legacyMap[item?.id] === template.id) as Partial<PlayerMission> | undefined;
    if (!old || (Number.isFinite(old.resetAt) && Number(old.resetAt) <= Date.now())) return template;
    return { ...template, progress: Math.min(template.target, Math.max(0, Number(old.progress) || 0)), claimed: old.claimed === true };
  });
}
const emptyWins = (): PlayerProfile["winsByMode"] => ({
  classic: { player: 0, VEGA: 0, SOMBRA: 0, LUNA: 0 },
  teams: { player: 0, VEGA: 0, SOMBRA: 0, LUNA: 0 },
  duel: { player: 0, VEGA: 0 },
});
const emptyPeriodWins = (): PlayerProfile["winsByPeriod"] => ({ weekly: emptyWins(), monthly: emptyWins() });
const nextRankingReset = (period: "weekly" | "monthly") => missionResetAt(period === "weekly" ? "semanal" : "mensual");
function syncRankingPeriods(
  savedWins: PlayerProfile["winsByPeriod"],
  savedResetAt: PlayerProfile["winsPeriodResetAt"],
  now = Date.now(),
) {
  const winsByPeriod = emptyPeriodWins();
  const winsPeriodResetAt = { weekly: 0, monthly: 0 };
  let rewardCoins = 0;
  let rewardGems = 0;
  for (const period of ["weekly", "monthly"] as const) {
    const isCurrent = Number.isFinite(savedResetAt?.[period]) && savedResetAt[period] > now;
    if (isCurrent) {
      for (const mode of ["classic", "teams", "duel"] as const) {
        winsByPeriod[period][mode] = { ...winsByPeriod[period][mode], ...(savedWins?.[period]?.[mode] || {}) };
      }
    } else if (period === "monthly" && Number.isFinite(savedResetAt?.monthly) && savedResetAt.monthly <= now) {
      for (const mode of ["classic", "teams", "duel"] as const) {
        const reward = rankForWins(Number(savedWins?.monthly?.[mode]?.player) || 0);
        rewardCoins += reward.coins;
        rewardGems += reward.gems;
      }
    }
    winsPeriodResetAt[period] = isCurrent ? savedResetAt[period] : nextRankingReset(period);
  }
  return { winsByPeriod, winsPeriodResetAt, rewardCoins, rewardGems };
}

function readPlayerProfile(accountId?: string): PlayerProfile {
  try {
    const sigma = JSON.parse(localStorage.getItem(accountId ? `sigmaPlayerProfile:${accountId}` : "sigmaPlayerProfile") || "{}");
    const gemini = accountId ? {} : JSON.parse(localStorage.getItem("botinProfileV2") || "{}");
    const legacy = accountId ? {} : JSON.parse(localStorage.getItem("elBotinProfile") || "{}");
    const saved = { ...gemini, ...legacy, ...sigma };
    const wins = emptyWins();
    for (const mode of ["classic", "teams", "duel"] as const) {
      wins[mode] = { ...wins[mode], ...(saved.winsByMode?.[mode] || {}) };
    }
    const rankingWindows = syncRankingPeriods(saved.winsByPeriod, saved.winsPeriodResetAt);
    const { winsByPeriod, winsPeriodResetAt } = rankingWindows;
    const monthlySeasonExpired = rankingWindows.rewardCoins > 0 || rankingWindows.rewardGems > 0 || (Number.isFinite(saved.winsPeriodResetAt?.monthly) && saved.winsPeriodResetAt.monthly <= Date.now());
    const legacyOwned = Array.isArray(saved.ownedCards) ? saved.ownedCards.filter((id: unknown): id is string => typeof id === "string") : [];
    const migratedOwned = legacyOwned.flatMap((id: string) => cardCollections.some((deck) => deck.id === id) ? Array.from({ length: 9 }, (_, index) => `${id}-${index + 1}`) : [id]);
    const ownedCards = [...new Set([...Array.from({ length: 9 }, (_, index) => `basica-${index + 1}`), ...migratedOwned.filter((key: string) => inventoryCards.some((card) => card.cardKey === key))])];
    const rawSavedDecks: unknown[] = Array.isArray(saved.equippedCards) ? saved.equippedCards : [saved.equippedCard || "basica"];
    const savedDecks = rawSavedDecks.filter((id): id is string => typeof id === "string");
    const equippedCards = [...new Set(savedDecks.filter((id) => hasDeckCard(ownedCards, id)))].slice(0, 3);
    if (!equippedCards.length) equippedCards.push("basica");
    const savedAvatar = normalizeAvatarId(saved.avatar);
    const avatar = profileAvatarOptionsAll.includes(savedAvatar) ? savedAvatar : "🐱";
    const ownedAvatars = Array.isArray(saved.ownedAvatars) ? [...new Set(["🐱", "👤", ...saved.ownedAvatars.map(normalizeAvatarId)])] : ["🐱", "👤"];
    if (!ownedAvatars.includes(avatar)) ownedAvatars.push(avatar);
    const ownedFrames = Array.isArray(saved.ownedFrames) ? [...new Set(["base", ...saved.ownedFrames.filter((item: unknown): item is string => typeof item === "string")])] : ["base"];
    const ownedAvatarColors = Array.isArray(saved.ownedAvatarColors) ? [...new Set(["#ffe477", ...saved.ownedAvatarColors.filter((item: unknown): item is string => typeof item === "string")])] : ["#ffe477"];
    const ownedChatEmotes = [...new Set([...freeChatEmoteIds, ...(Array.isArray(saved.ownedChatEmotes) ? saved.ownedChatEmotes.filter((id: unknown): id is string => typeof id === "string" && chatEmotes.some((emote) => emote.id === id)) : [])])];
    const chests: PlayerChest[] = Array.isArray(saved.chests) ? saved.chests.filter((chest: any) => typeof chest?.id === "string" && Number.isFinite(chest.createdAt) && Number.isFinite(chest.readyAt)).slice(0, MAX_CHESTS) : [];
    const today = new Date().toDateString();
    const profile: PlayerProfile = {
      name: typeof saved.name === "string" && saved.name.trim() ? saved.name : "Anto",
      avatar,
      lastNameChange: Number.isFinite(saved.lastNameChange) ? saved.lastNameChange : 0,
      coins: (Number.isFinite(saved.coins) ? Math.max(0, saved.coins) : 100) + rankingWindows.rewardCoins,
      gems: (Number.isFinite(saved.gems) ? Math.max(0, saved.gems) : 10) + rankingWindows.rewardGems,
      ownedCards,
      equippedCards,
      equippedCard: equippedCards[0],
      removalsUsed: Number.isFinite(saved.removalsUsed) ? Math.max(0, saved.removalsUsed) : 0,
      ownedAvatars,
      ownedFrames,
      equippedFrame: ownedFrames.includes(saved.equippedFrame) ? saved.equippedFrame : "base",
      ownedAvatarColors,
      equippedAvatarColor: ownedAvatarColors.includes(saved.equippedAvatarColor) ? saved.equippedAvatarColor : "#ffe477",
      ownedChatEmotes,
      chests,
      paidSpinsToday: saved.paidSpinDate === today && Number.isFinite(saved.paidSpinsToday) ? Math.max(0, saved.paidSpinsToday) : 0,
      paidSpinDate: saved.paidSpinDate === today ? today : null,
      winsByMode: wins,
      winsByPeriod,
      winsPeriodResetAt,
      missions: normalizeMissions(saved.missions),
      lastSpinTime: Number.isFinite(saved.lastSpinTime) ? saved.lastSpinTime : null,
    };
    if (monthlySeasonExpired) {
      savePlayerProfile(profile, accountId);
      try { sessionStorage.setItem("sigmaSeasonRewardNotice", JSON.stringify({ coins: rankingWindows.rewardCoins, gems: rankingWindows.rewardGems })); } catch { /* storage may be unavailable */ }
    }
    return profile;
  } catch {
    return { name: "Anto", avatar: "🐱", lastNameChange: 0, coins: 100, gems: 10, ownedCards: Array.from({ length: 9 }, (_, index) => `basica-${index + 1}`), equippedCard: "basica", equippedCards: ["basica"], removalsUsed: 0, ownedAvatars: ["🐱", "👤"], ownedFrames: ["base"], equippedFrame: "base", ownedAvatarColors: ["#ffe477"], equippedAvatarColor: "#ffe477", ownedChatEmotes: freeChatEmoteIds, chests: [], paidSpinsToday: 0, paidSpinDate: null, winsByMode: emptyWins(), winsByPeriod: emptyPeriodWins(), winsPeriodResetAt: { weekly: nextRankingReset("weekly"), monthly: nextRankingReset("monthly") }, missions: createMissions(), lastSpinTime: null };
  }
}

function savePlayerProfile(profile: PlayerProfile, accountId?: string) {
  try {
    localStorage.setItem(accountId ? `sigmaPlayerProfile:${accountId}` : "sigmaPlayerProfile", JSON.stringify(profile));
    if (accountId) return;
    const gemini = JSON.parse(localStorage.getItem("botinProfileV2") || "{}");
    localStorage.setItem("botinProfileV2", JSON.stringify({ ...gemini, ...profile }));
    const legacy = JSON.parse(localStorage.getItem("elBotinProfile") || "{}");
    localStorage.setItem("elBotinProfile", JSON.stringify({ ...legacy, coins: profile.coins, gems: profile.gems }));
  } catch { /* local storage may be unavailable */ }
}

function advanceMission(profile: PlayerProfile, metric: string, amount = 1): PlayerProfile {
  const missions = profile.missions.map((mission) => mission.metric === metric && !mission.claimed
    ? { ...mission, progress: Math.min(mission.target, mission.progress + amount) }
    : mission);
  return { ...profile, missions };
}

function readAudioSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem("sigmaAudioSettings") || "{}");
    return {
      music: saved.music !== false,
      sfx: saved.sfx !== false,
      musicVolume: typeof saved.musicVolume === "number" ? saved.musicVolume : 0.24,
      sfxVolume: typeof saved.sfxVolume === "number" ? saved.sfxVolume : 0.72,
    };
  } catch {
    return { music: true, sfx: true, musicVolume: 0.24, sfxVolume: 0.72 };
  }
}

const hiddenLootEffects: LootEffect[] = [
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

const roundRuleDetails: Record<RoundRuleId, RoundRule> = {
  highest: { id: "highest", label: "PUJA MÁS ALTA", description: "Gana la carta con el valor más alto." },
  lowest: { id: "lowest", label: "PUJA MÁS BAJA", description: "Gana la carta con el valor más bajo." },
  "closest-five": { id: "closest-five", label: "A UN PASO DEL 5", description: "Gana la carta más cercana al 5." },
  "even-bids": { id: "even-bids", label: "RONDA PAR", description: "Gana la carta par más alta. Si nadie juega par, gana la más alta." },
};

function roundRuleScore(value: number, rule: RoundRule): number {
  if (rule.id === "lowest") return -value;
  if (rule.id === "closest-five") return -Math.abs(value - 5);
  if (rule.id === "even-bids" && value % 2 !== 0) return Number.NEGATIVE_INFINITY;
  return value;
}

function teamStrengthForRound(plays: { player: MatchPlayer; value: number; faceValue?: number }[], team: 1 | 2, rule: RoundRule): number {
  const teamPlays = plays.filter((play) => play.player.team === team);
  const total = teamPlays.reduce((sum, play) => sum + play.value, 0);
  if (rule.id === "lowest") return -total;
  if (rule.id === "closest-five") return -Math.abs(total - 10);
  if (rule.id === "even-bids") {
    const anyEven = plays.some((play) => (play.faceValue ?? play.value) % 2 === 0);
    if (anyEven) return teamPlays.filter((play) => (play.faceValue ?? play.value) % 2 === 0).reduce((sum, play) => sum + play.value, 0);
  }
  return total;
}

function createRoundRules(roundCount: number): RoundRule[] {
  const counts: Record<RoundRuleId, number> = roundCount === 10
    ? { highest: 3, lowest: 3, "closest-five": 3, "even-bids": 1 }
    : roundCount === 8
      ? { highest: 2, lowest: 2, "closest-five": 3, "even-bids": 1 }
      : { highest: 1, lowest: 1, "closest-five": 2, "even-bids": 1 };
  const rules = (Object.entries(counts) as [RoundRuleId, number][]).flatMap(([id, count]) => Array.from({ length: count }, () => id));
  for (let attempt = 0; attempt < 80; attempt++) {
    for (let index = rules.length - 1; index > 0; index--) {
      const other = Math.floor(Math.random() * (index + 1));
      [rules[index], rules[other]] = [rules[other], rules[index]];
    }
    if (rules.every((id, index) => index === 0 || id !== rules[index - 1])) break;
  }
  return rules.map((id) => roundRuleDetails[id]);
}

function dealHand(deckIds: string[], count = 5, ownedCardKeys?: string[]): PlayerCard[] {
  const selectedDecks = deckIds.length ? deckIds : ["basica"];
  const pool = inventoryCards.filter((card) => selectedDecks.includes(card.id) && (!ownedCardKeys || ownedCardKeys.includes(card.cardKey)));
  const safePool = pool.length ? pool : inventoryCards.filter((card) => card.id === "basica");
  return Array.from({ length: count }, () => {
    const card = safePool[Math.floor(Math.random() * safePool.length)];
    return { value: card.value, deckId: card.id, effectId: card.effect?.id };
  }).sort((a, b) => a.value - b.value);
}

function createMatchPlayers(mode: GameMode, profile: PlayerProfile, deckIds: string[]): MatchPlayer[] {
  const roster = mode === "duel" ? [opponents[0]] : opponents;
  const bots: MatchPlayer[] = roster.map((player, index) => ({
    id: player.name.toLowerCase(),
    name: player.name,
    avatar: ["🐺", "🐱", "🤖"][index],
    score: 0,
    hand: dealHand(["basica"]),
    team: mode === "teams" ? ([2, 1, 2][index] as 1 | 2) : 0,
    isUser: false,
  }));
  return [{ id: "player", name: profile.name, avatar: profile.avatar, score: 0, hand: dealHand(deckIds, 5, profile.ownedCards), team: mode === "teams" ? 1 : 0, isUser: true }, ...bots];
}

function modeRoundCount(mode: GameMode) {
  return mode === "duel" ? 5 : mode === "teams" ? 8 : 10;
}

function GeminiCardFace({ deckId, value, className = "" }: { deckId: string; value: number; className?: string }) {
  const deck = cardCollections.find((collection) => collection.id === deckId) ?? cardCollections[0];
  const passive = cardEffects[`${deckId}-${value}`];
  const passiveIcon = passive?.id.startsWith("bid-plus") ? "⚡" : passive?.id.startsWith("steal") ? "🪙" : passive?.id.startsWith("last-place") ? "🚀" : passive?.id.startsWith("loss-compensation") || passive?.id.includes("loss-five") ? "🛟" : passive?.id.includes("near-miss") ? "🎯" : "🌀";
  return <div className={`gemini-card-face ${deck.base} ${className}`} aria-label={`${deck.name}, carta ${value}`}>
    <span className="gemini-card-corner top">{value}</span>
    {passive && <span className="card-passive-mark" title={passive.description} aria-label={`Pasiva: ${passive.description}`}>{passiveIcon}</span>}
    {deckId === "basica" ? <span className="gemini-card-center-number" aria-hidden="true">{value}</span> : <span className="gemini-card-icon" aria-hidden="true">{deck.emblem}</span>}
    <span className="gemini-card-corner bottom">{value}</span>
  </div>;
}

function Avatar({ player }: { player: (typeof opponents)[number] }) {
  const character = player.name === "VEGA" ? "fox" : player.name === "SOMBRA" ? "mask" : "cat";

  return (
    <div className="avatar" style={{ background: player.color }}>
      {character === "fox" && (
        <svg viewBox="0 0 64 64" aria-hidden="true">
          <path
            d="M9 13 25 20 13 34 9 13Zm46 0L39 20l12 14 4-21Z"
            fill="#8C312D"
            stroke="#351D2B"
            strokeWidth="3"
          />
          <path d="M13 17 22 22l-7 6-2-11Zm38 0-9 5 7 6 2-11Z" fill="#F5B06D" />
          <path
            d="M11 30c3-15 14-20 21-20s18 5 21 20c1 13-8 25-21 25S10 43 11 30Z"
            fill="#E75A35"
            stroke="#351D2B"
            strokeWidth="3"
          />
          <path
            d="M17 34c7-1 11 2 15 12 4-10 8-13 15-12-1 11-6 17-15 17s-14-6-15-17Z"
            fill="#FFF0CC"
          />
          <path d="m27 39 5-3 5 3-5 5-5-5Z" fill="#31202B" />
          <path
            d="M18 29c4-3 8-3 11 0m6 0c3-3 7-3 11 0"
            stroke="#31202B"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      )}
      {character === "mask" && (
        <svg viewBox="0 0 64 64" aria-hidden="true">
          <circle cx="32" cy="34" r="21" fill="#45274F" stroke="#21162B" strokeWidth="3" />
          <path
            d="M10 29 21 12l7 12m26 5L43 12l-7 12"
            fill="#251A32"
            stroke="#21162B"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path d="M13 28c10-9 28-9 38 0l-6 18c-7 8-19 8-26 0l-6-18Z" fill="#8A4BA8" />
          <path
            d="M17 29c6-5 13-6 15 2-6 5-11 5-15-2Zm30 0c-6-5-13-6-15 2 6 5 11 5 15-2Z"
            fill="#15131E"
          />
          <circle cx="25" cy="31" r="2" fill="#BFFF73" />
          <circle cx="39" cy="31" r="2" fill="#BFFF73" />
          <path d="M27 44c3 2 7 2 10 0" stroke="#E3A7CB" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      )}
      {character === "cat" && (
        <svg viewBox="0 0 64 64" aria-hidden="true">
          <path
            d="m10 12 17 9H37l17-9-4 21H14l-4-21Z"
            fill="#294766"
            stroke="#172539"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path d="m14 17 9 5-7 5-2-10Zm36 0-9 5 7 5 2-10Z" fill="#E8A86E" />
          <path
            d="M13 30c0-12 8-19 19-19s19 7 19 19v7c0 11-8 19-19 19s-19-8-19-19v-7Z"
            fill="#D6A370"
            stroke="#172539"
            strokeWidth="3"
          />
          <path
            d="M16 29c5-4 10-3 15 2-7 5-12 4-15-2Zm32 0c-5-4-10-3-15 2 7 5 12 4 15-2Z"
            fill="#F7EDB7"
          />
          <path d="m28 39 4-3 4 3-4 4-4-4Z" fill="#4D2A35" />
          <path
            d="M20 40 7 38m14 6L8 47m36-7 13-2m-14 6 13 3"
            stroke="#F7EDB7"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      )}
    </div>
  );
}

function PrizeCard({
  type,
  title,
  points,
  secret = false,
  effect,
}: {
  type: IconName;
  title: string;
  points: string;
  secret?: boolean;
  effect?: LootEffect;
}) {
  return (
    <div className={`prize-card ${secret ? "secret" : ""}`}>
      <div className="prize-corner">★</div>
      <div className="prize-art">
        {secret ? (
          <><img className="secret-card-back" src={publicAsset("sigma/ui/card_back.png")} alt="Reverso de la carta secreta" /><span className="secret-question" aria-hidden="true">?</span></>
        ) : effect ? (
          <div className="revealed-effect-art" style={{ "--effect-a": effect.colors[0], "--effect-b": effect.colors[1] } as React.CSSProperties}>
            <span>{effect.icon}</span>
          </div>
        ) : (
          <GameIcon name={type} size={62} />
        )}
      </div>
      <div className="prize-copy">
        <strong>{title}</strong>
        <span>{points}</span>
      </div>
    </div>
  );
}

function CollectionEmblem({ type }: { type: string }) {
  if (["🥷", "💰", "🛡️", "👑", "🧪"].includes(type)) {
    return <span className="collection-emoji" aria-hidden="true">{type}</span>;
  }
  if (type === "mask") {
    return (
      <svg viewBox="0 0 80 80" aria-hidden="true">
        <path
          d="M14 28c16-12 36-12 52 0l-8 30c-10 12-26 12-36 0l-8-30Z"
          fill="#4A2434"
          stroke="#2A1721"
          strokeWidth="5"
        />
        <path
          d="M21 34c9-7 17-7 20 3-9 7-16 6-20-3Zm38 0c-9-7-17-7-20 3 9 7 16 6 20-3Z"
          fill="#FFF1B8"
        />
        <path d="M32 54c5 4 11 4 16 0" stroke="#E88755" strokeWidth="4" strokeLinecap="round" />
        <path
          d="m17 28 8-17 13 14m25 3-8-17-13 14"
          fill="#713047"
          stroke="#2A1721"
          strokeWidth="4"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (type === "blade") {
    return (
      <svg viewBox="0 0 80 80" aria-hidden="true">
        <path d="m17 57 9 7 13-16-8-8-14 17Z" fill="#8B4B2C" stroke="#20253B" strokeWidth="4" />
        <path
          d="M30 43 60 13c4-4 8-2 7 4-2 14-10 27-27 36L30 43Z"
          fill="#DDF7FF"
          stroke="#20253B"
          strokeWidth="5"
          strokeLinejoin="round"
        />
        <path d="m26 38 17 17" stroke="#F5C24F" strokeWidth="6" strokeLinecap="round" />
        <path d="m47 22 9-4" stroke="white" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === "moon") {
    return (
      <svg viewBox="0 0 80 80" aria-hidden="true">
        <path
          d="M55 12c-17 4-27 20-23 36 4 14 16 22 31 20-7 6-16 9-26 7C18 72 6 54 10 35 14 16 34 5 55 12Z"
          fill="#F4D87B"
          stroke="#2C2144"
          strokeWidth="5"
          strokeLinejoin="round"
        />
        <path d="m56 30 3 7 8 1-6 5 2 8-7-4-7 4 2-8-6-5 8-1 2-7Z" fill="#9B69CF" />
      </svg>
    );
  }

  if (type === "rune") {
    return (
      <svg viewBox="0 0 80 80" aria-hidden="true">
        <path
          d="m40 7 28 16v34L40 73 12 57V23L40 7Z"
          fill="#B7E77E"
          stroke="#1D443B"
          strokeWidth="5"
          strokeLinejoin="round"
        />
        <path
          d="M40 18v45M25 29l15 12 15-12M24 55l16-14 16 14"
          stroke="#2D765A"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="40" cy="41" r="6" fill="#FFE889" stroke="#1D443B" strokeWidth="3" />
      </svg>
    );
  }

  if (type === "anchor") {
    return (
      <svg viewBox="0 0 80 80" aria-hidden="true">
        <circle cx="40" cy="16" r="8" fill="#E5F7EF" stroke="#173653" strokeWidth="5" />
        <path d="M40 24v39M25 32h30" stroke="#E5F7EF" strokeWidth="7" strokeLinecap="round" />
        <path
          d="M17 48c3 14 12 22 23 22s20-8 23-22l-10 7M17 48l10 7"
          fill="none"
          stroke="#173653"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M40 25v37" stroke="#6BC9D3" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 80 80" aria-hidden="true">
      <circle cx="40" cy="40" r="28" fill="#FFC940" stroke="#6A3517" strokeWidth="6" />
      <circle cx="40" cy="40" r="21" fill="#FFE477" stroke="#E58A1D" strokeWidth="3" />
      <path d="m40 23 5 10 11 2-8 8 2 11-10-5-10 5 2-11-8-8 11-2 5-10Z" fill="#E87922" />
    </svg>
  );
}

function InventoryPage({ onBack, equippedCollections, onEquip, onPurchase, ownedCards, coins, gems, accountWallet, ownedAvatars, ownedFrames, equippedFrame, currentAvatar, equippedAvatarColor, ownedChatEmotes, onPurchaseChatEmote, onPurchaseCosmetic, onChooseAvatar, onEquipFrame, mode, onChangeMode }: { onBack: () => void; equippedCollections: string[]; onEquip: (id: string) => void; onPurchase: (id: string) => void; ownedCards: string[]; coins: number; gems: number; accountWallet: { coins: number; gems: number } | null; ownedAvatars: string[]; ownedFrames: string[]; equippedFrame: string; currentAvatar: string; equippedAvatarColor: string; ownedChatEmotes: string[]; onPurchaseChatEmote: (id: string) => void; onPurchaseCosmetic: (kind: "avatar" | "frame", id: string) => void; onChooseAvatar: (avatar: string) => void; onEquipFrame: (frame: string) => void; mode: "inventory" | "shop"; onChangeMode: (mode: "inventory" | "shop") => void }) {
  const initialShopCollection = cardCollections.find((collection) => collection.price > 0)?.id ?? "all";
  const [filter, setFilter] = useState(mode === "inventory" && equippedCollections.length ? equippedCollections[0] : mode === "shop" ? initialShopCollection : "basica");
  const [selectedCard, setSelectedCard] = useState(mode === "shop" ? "basica-7" : "basica-1");
  const [shopSection, setShopSection] = useState<"decks" | "packages" | "gems" | "avatars" | "frames" | "emojis">("decks");
  const [emojiFilter, setEmojiFilter] = useState<"todos" | ChatEmoteCategory>("todos");
  useEffect(() => { setFilter(mode === "inventory" ? equippedCollections[0] ?? "basica" : initialShopCollection); }, [mode, equippedCollections, initialShopCollection]);
  useEffect(() => { if (mode === "inventory" && (shopSection === "packages" || shopSection === "gems" || shopSection === "emojis")) setShopSection("decks"); }, [mode, shopSection]);
  const setCards = inventoryCards.map((card) => ({ ...card, status: mode === "shop" || ownedCards.includes(card.cardKey) ? "available" as const : "locked" as const }));
  const catalogCards = mode === "shop" ? setCards.filter((card) => card.cardPrice > 0) : setCards;
  const visibleCards = filter === "all" ? catalogCards : catalogCards.filter((card) => card.id === filter);
  const selected = visibleCards.find((card) => card.cardKey === selectedCard) ?? visibleCards[0] ?? catalogCards[0] ?? setCards[0];
  const selectedSetComplete = hasCompleteDeck(ownedCards, selected.id);
  const selectedSetEquipped = equippedCollections.includes(selected.id);
  const availableCount = ownedCards.length;
  const availableEmotes = ownedChatEmotes.length;
  const cosmeticTabs: { id: "decks" | "packages" | "gems" | "avatars" | "frames" | "emojis"; label: string }[] = [
    { id: "decks", label: "CARTAS" },
    ...(mode === "shop" ? [{ id: "packages" as const, label: "PAQUETES" }, { id: "gems" as const, label: "SOLO GEMAS" }] : []),
    { id: "avatars", label: "AVATARES" }, { id: "frames", label: "MARCOS" },
    ...(mode === "shop" ? [{ id: "emojis" as const, label: "EMOJIS DE CHAT" }] : []),
  ];
  const sectionTitle = shopSection === "avatars" ? "AVATARES" : shopSection === "frames" ? "MARCOS CUADRADOS" : shopSection === "packages" ? "PAQUETES DE SUBASTA" : shopSection === "gems" ? "COMPRAR SOLO GEMAS" : "EMOJIS DE CHAT";
  const paidEmotes = chatEmotes.filter((emote) => chatEmotePrice(emote) > 0);
  const storeEmoteTabs = chatEmoteCategoryTabs.filter((tab) => tab.id === "todos" || tab.id !== "normales");
  const filteredEmotes = paidEmotes.filter((emote) => emojiFilter === "todos" || emote.category === emojiFilter);

  return (
    <section className="inventory-page">
      <header className="inventory-header">
        <button className="back-button" onClick={onBack}><span>‹</span>VOLVER A LA MESA</button>
        <div className="inventory-title">
          <span>COLECCIÓN DEL JUGADOR</span>
          <h1>{mode === "shop" ? shopSection === "emojis" ? "TIENDA DE EMOJIS" : shopSection === "packages" || shopSection === "gems" ? "TIENDA DE GEMAS" : "TIENDA DE COLECCIONES" : "INVENTARIO DE CARTAS"}</h1>
          <p>{mode === "shop" ? shopSection === "emojis" ? "Desbloquea reacciones para usar directamente en el chat." : shopSection === "packages" || shopSection === "gems" ? "Paquetes en euros · acreditación segura tras confirmación de pago." : "Cartas con monedas. Avatares y marcos cosméticos con gemas." : "Gestiona tus barajas y equipa avatares y marcos cuadrados."}</p>
          <nav className="catalog-mode" aria-label="Sección de colecciones"><button className={mode === "shop" ? "active" : ""} onClick={() => onChangeMode("shop")}>TIENDA</button><button className={mode === "inventory" ? "active" : ""} onClick={() => onChangeMode("inventory")}>INVENTARIO</button></nav>
        </div>
        <div className="collection-count"><GameIcon name={mode === "shop" && shopSection === "emojis" ? "chat" : mode === "shop" && (shopSection === "packages" || shopSection === "gems") ? "gem" : "cards"} size={35} /><div><strong>{mode === "shop" && shopSection === "emojis" ? availableEmotes : mode === "shop" && (shopSection === "packages" || shopSection === "gems") ? REAL_MONEY_CATALOG.filter((item) => item.kind === (shopSection === "gems" ? "gems" : "bundle")).length : availableCount}</strong><span>{mode === "shop" && shopSection === "emojis" ? "EMOJIS DESBLOQUEADOS" : mode === "shop" && (shopSection === "packages" || shopSection === "gems") ? "PAQUETES DISPONIBLES" : "CARTAS EN PROPIEDAD"}</span></div><em>/ {mode === "shop" && shopSection === "emojis" ? paidEmotes.length : mode === "shop" && (shopSection === "packages" || shopSection === "gems") ? "7" : inventoryCards.length}</em></div>
      </header>
      <nav className="shop-categories" aria-label={mode === "shop" ? "Categorías de tienda" : "Categorías de inventario"}>{cosmeticTabs.map((tab) => <button key={tab.id} className={shopSection === tab.id ? "active" : ""} onClick={() => setShopSection(tab.id)}>{tab.label}</button>)}</nav>
      <div className={`inventory-body ${shopSection !== "decks" ? "shop-cosmetic-mode" : ""}`}>
        {shopSection === "decks" && <aside className="inventory-sidebar">
          <div className="selected-preview"><span>CARTA {selected.value} · {selected.shortName.toUpperCase()}</span><div className="preview-card"><GeminiCardFace deckId={selected.id} value={selected.value} /></div><h2>{selected.name} · {selected.value}</h2><p>{selected.description}</p><div className="passive-description card-passive"><strong>PASIVA INDIVIDUAL · {selected.effect?.name.toUpperCase()}</strong><span>{selected.effect?.description}</span></div><div className="passive-description set-passive"><strong>BONUS GLOBAL DEL SET · {selectedSetComplete && selectedSetEquipped ? "ACTIVO" : "INACTIVO"}</strong><span>{selected.passiveDescription} {!selectedSetComplete ? "Desbloquea las 9 cartas para activarlo." : !selectedSetEquipped ? "Equipa este set para activarlo." : ""}</span></div>
            {mode === "shop" && <button className="equip-set-button" disabled={ownedCards.includes(selected.cardKey) || selected.cardPrice > coins} onClick={() => onPurchase(selected.cardKey)}>{ownedCards.includes(selected.cardKey) ? "OBTENIDA" : selected.cardPrice > coins ? "MONEDAS INSUFICIENTES" : selected.cardPrice === 0 ? "OBTENER · GRATIS" : `COMPRAR CARTA · ${selected.cardPrice} MONEDAS`}</button>}
            <div className={`status-badge ${ownedCards.includes(selected.cardKey) ? "available" : "locked"}`}>{ownedCards.includes(selected.cardKey) ? "CARTA DESBLOQUEADA" : mode === "shop" ? `${selected.cardPrice} MONEDAS` : "BLOQUEADA · VISITA LA TIENDA"}</div>
          </div>
        </aside>}
        <div className={`inventory-catalog ${shopSection === "decks" ? "deck-catalog" : "cosmetic-catalog-wrap"}`}>
          {(shopSection === "packages" || shopSection === "gems") ? <section className="cosmetic-catalog real-money-catalog"><div className="catalog-heading"><div><span>XSOLLA · PROYECTO 320352 · MONEDERO DE CUENTA</span><strong>{sectionTitle}</strong></div><p>{accountWallet ? <>{accountWallet.coins.toLocaleString("es-ES")} 🪙 · {accountWallet.gems.toLocaleString("es-ES")} 💎</> : "Saldo de cuenta no disponible"}</p></div><p className="real-money-intro">{shopSection === "gems" ? "Paquetes de gemas sin monedas adicionales." : "Incluyen gemas premium y monedas para cartas, entradas y otros gastos de la mesa."} Los premios son fijos; no hay recompensas aleatorias en estas compras.</p><div className="real-money-pack-grid">{REAL_MONEY_CATALOG.filter((item) => item.kind === (shopSection === "gems" ? "gems" : "bundle")).map((item) => <article className={`real-money-pack-card ${item.featured ? "featured" : ""}`} key={item.sku}>{item.featured && <span className="real-money-featured">MÁS ELEGIDO</span>}<div className="real-money-pack-gems"><GameIcon name="gem" size={30} /><strong>{item.gems.toLocaleString("es-ES")}</strong><small>GEMAS</small></div><strong className="real-money-pack-title">{item.name}</strong>{item.coins > 0 ? <span className="real-money-pack-coins">+ {item.coins.toLocaleString("es-ES")} 🪙</span> : <span className="real-money-pack-coins">Solo gemas</span>}<b className="real-money-price">{formatPackagePrice(item.priceCents)}</b><button type="button" disabled title="El pago se habilitará al configurar las claves privadas y el catálogo de Xsolla">EN CONFIGURACIÓN</button></article>)}</div><p className="real-money-setup-note" role="status">Las compras aún no están activadas. Primero se configura el catálogo de Xsolla y el servidor de pagos; el saldo se acreditará solo al recibir una confirmación verificada.</p></section> : shopSection === "emojis" ? <section className="cosmetic-catalog emoji-shop-catalog"><div className="catalog-heading"><div><span>REACCIONES PARA EL CHAT</span><strong>EMOJIS DESBLOQUEABLES</strong></div><p>{gems} 💎</p></div><p className="emoji-shop-note">Los emojis gratuitos están en tu chat. Aquí solo aparecen colecciones premium: 30, 60 o 100 gemas.</p><nav className="emoji-shop-filters" aria-label="Filtrar emojis de la tienda">{storeEmoteTabs.map((tab) => { const count = tab.id === "todos" ? paidEmotes.length : paidEmotes.filter((emote) => emote.category === tab.id).length; return <button key={tab.id} className={emojiFilter === tab.id ? "active" : ""} onClick={() => setEmojiFilter(tab.id)}>{tab.label}<small>{count}</small></button>; })}</nav><div className="cosmetic-grid chat-emote-store-grid">{filteredEmotes.map((emote) => { const owned = ownedChatEmotes.includes(emote.id); const price = chatEmotePrice(emote); return <article className={`cosmetic-card chat-emote-store-card ${owned ? "owned" : "locked"}`} key={emote.id}><div className="chat-emote-store-preview"><ChatEmoteImage emote={emote} />{!owned && <span className="chat-emote-lock" aria-label="Bloqueado">🔒</span>}</div><strong>{emote.label}</strong><small>{`${price} 💎 · ${emote.category.toUpperCase()}`}</small><button disabled={owned || gems < price} onClick={() => onPurchaseChatEmote(emote.id)}>{owned ? "OBTENIDO" : `COMPRAR · ${price} 💎`}</button></article>; })}</div></section> : shopSection !== "decks" ? <section className="cosmetic-catalog"><div className="catalog-heading"><div><span>{mode === "shop" ? "PERSONALIZA TU PERFIL" : "COSMÉTICOS EN PROPIEDAD"}</span><strong>{sectionTitle}</strong></div><p>{coins} 🪙 · {gems} 💎</p></div>
            {shopSection === "avatars" && <div className="cosmetic-grid">{avatarStoreItems.filter((item) => mode !== "shop" || item.price > 0).map((item) => { const owned = ownedAvatars.includes(item.id); const afford = (item.currency === "gems" ? gems : coins) >= item.price; return <article className={`cosmetic-card ${owned ? "owned" : "locked"}`} key={item.id}><div className={`cosmetic-avatar-preview ${avatarFrameClass(equippedFrame)}`} style={avatarDisplayStyle(item.id)}><AvatarFace avatar={item.id} />{mode === "shop" && !owned && <span className="store-item-lock" aria-label="Bloqueado"><GameIcon name="lock" size={20} /></span>}</div><strong>{item.name}</strong><small className="avatar-kind-note">{item.id.startsWith("avatar-fondo-") ? "Fondo integrado en el avatar" : item.id.startsWith("avatar-transparente-") ? "Avatar sin fondo integrado" : "Avatar clásico"}</small><small>{item.price} {item.currency === "gems" ? "💎" : "🪙"}</small><button disabled={mode === "shop" ? owned || !afford : !owned || currentAvatar === item.id} onClick={() => mode === "shop" ? onPurchaseCosmetic("avatar", item.id) : onChooseAvatar(item.id)}>{mode === "shop" ? owned ? "OBTENIDO" : "COMPRAR" : currentAvatar === item.id ? "EQUIPADO" : "EQUIPAR"}</button></article>; })}</div>}
            {shopSection === "frames" && <div className="cosmetic-grid frame-grid">{avatarFrameStoreItems.filter((item) => mode !== "shop" || item.price > 0).map((item) => { const owned = ownedFrames.includes(item.id); const afford = gems >= item.price; return <article className={`cosmetic-card ${owned ? "owned" : "locked"}`} key={item.id}><div className={`cosmetic-frame-preview ${avatarFrameClass(item.id)}`} style={{ "--avatar-fill": equippedAvatarColor } as React.CSSProperties}><AvatarFace avatar={currentAvatar} />{mode === "shop" && !owned && <span className="store-item-lock" aria-label="Bloqueado"><GameIcon name="lock" size={20} /></span>}</div><strong>{item.name}</strong><small>{`${item.price} 💎`}</small><button disabled={mode === "shop" ? owned || !afford : !owned || equippedFrame === item.id} onClick={() => mode === "shop" ? onPurchaseCosmetic("frame", item.id) : onEquipFrame(item.id)}>{mode === "shop" ? owned ? "OBTENIDO" : "COMPRAR" : equippedFrame === item.id ? "EQUIPADO" : "EQUIPAR"}</button></article>; })}</div>}
          </section> : <>
            {mode === "inventory" && <nav className="deck-equip-controls" aria-label="Barajas activas en partida"><span>DECKS EN USO · {equippedCollections.length}/3</span>{cardCollections.filter((deck) => hasDeckCard(ownedCards, deck.id)).map((deck) => <button key={deck.id} className={equippedCollections.includes(deck.id) ? "active" : ""} disabled={!equippedCollections.includes(deck.id) && equippedCollections.length >= 3} onClick={() => onEquip(deck.id)}>{deck.emblem || "#"} {deck.shortName} {equippedCollections.includes(deck.id) ? "✓" : "+"}</button>)}</nav>}
            <nav className="collection-filters" aria-label="Filtrar colecciones"><button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>TODAS <span>{catalogCards.length}</span></button>{cardCollections.filter((collection) => mode !== "shop" || collection.price > 0).map((collection) => <button key={collection.id} className={filter === collection.id ? "active" : ""} onClick={() => { setFilter(collection.id); setSelectedCard(`${collection.id}-1`); }}>{collection.shortName} <span>{ownedCards.filter((key) => key.startsWith(`${collection.id}-`)).length}/9</span><small>{collection.passiveDescription}</small></button>)}</nav>
            <div className="catalog-scroll-area">
              <div className="catalog-heading"><div><span>{mode === "shop" ? "COMPRA POR CARTA" : "COLECCIÓN"}</span><strong>{filter === "all" ? "Todas las cartas" : cardCollections.find((item) => item.id === filter)?.name}</strong></div></div>
              <div className="card-grid">{visibleCards.map((card) => { const cardKey = card.cardKey; const isOwned = ownedCards.includes(cardKey); return <button key={cardKey} className={`inventory-card ${isOwned ? "available" : "locked"} ${selectedCard === cardKey ? "is-selected" : ""}`} onClick={() => setSelectedCard(cardKey)}><div className="inventory-card-art"><GeminiCardFace deckId={card.id} value={card.value} />{!isOwned && <span className="card-state" aria-label="Carta bloqueada"><GameIcon name="lock" size={19} /></span>}</div><small>{card.shortName} · {card.value}{isOwned ? " ✓" : ""}</small></button>; })}</div>
            </div>
          </>}
        </div>
      </div>
    </section>
  );
}

export default function App() {
  const [isFullscreen, setIsFullscreen] = useState(Boolean(document.fullscreenElement));
  useEffect(() => {
    const updateFullscreen = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", updateFullscreen);
    return () => document.removeEventListener("fullscreenchange", updateFullscreen);
  }, []);
  const toggleFullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void document.documentElement.requestFullscreen?.();
  };
  const fullscreenButton = (className = "fullscreen-toggle") => (
    <button type="button" className={className} onClick={toggleFullscreen} aria-label={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"} title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}>
      <span aria-hidden="true">⛶</span><span className="fullscreen-label">{isFullscreen ? "SALIR" : "PANTALLA COMPLETA"}</span>
    </button>
  );
  const [screen, setScreen] = useState<AppScreen>("auth");
  const [orientationBlocked, setOrientationBlocked] = useState(false);
  const orientationBlockedRef = useRef(false);
  const pausableGameTimeoutsRef = useRef(new Set<PausableGameTimeout>());
  const [homeUtilityPanel, setHomeUtilityPanel] = useState<"events" | "chests" | null>(null);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [handValues, setHandValues] = useState<PlayerCard[]>([]);
  const [bidPlaced, setBidPlaced] = useState(false);
  const [turnSeconds, setTurnSeconds] = useState(30);
  const [round, setRound] = useState(1);
  const activeRoundRef = useRef(1);
  activeRoundRef.current = round;
  const [roundRules, setRoundRules] = useState<RoundRule[]>([]);
  const [gameMode, setGameMode] = useState<GameMode>("classic");
  const [matchPlayers, setMatchPlayers] = useState<MatchPlayer[]>([]);
  const [revealedBids, setRevealedBids] = useState<PlayerCard[] | null>(null);
  const [removeMode, setRemoveMode] = useState(false);
  const [revealedLoot, setRevealedLoot] = useState(false);
  const [lootEffect, setLootEffect] = useState<LootEffect>(hiddenLootEffects[0]);
  const [lootValues, setLootValues] = useState(generateLootValues);
  const [carriedPot, setCarriedPot] = useState(0);
  const [resolutionMessage, setResolutionMessage] = useState("");
  const [resolutionStage, setResolutionStage] = useState<"idle" | "bids" | "loot" | "result">("idle");
  const [resolutionWinnerIds, setResolutionWinnerIds] = useState<string[]>([]);
  const [roundScoreChanges, setRoundScoreChanges] = useState<{ id: string; delta: number }[]>([]);
  const [matchResult, setMatchResult] = useState<{ title: string; winner: string; rows: { name: string; score: number }[]; coinReward: number; gemReward: number; eventBonus?: string; chestAdded: boolean; matchWon: boolean } | null>(null);
  const [profile, setProfile] = useState(readPlayerProfile);
  const profileRef = useRef(profile);
  const [accountWallet, setAccountWallet] = useState<{ coins: number; gems: number } | null>(null);
  const [accountWalletLoading, setAccountWalletLoading] = useState(false);
  const [accountWalletMessage, setAccountWalletMessage] = useState("");
  const accountWalletRefreshRef = useRef<() => Promise<void>>(async () => {});
  const walletMutationQueueRef = useRef<Promise<void>>(Promise.resolve());
  const wallet = accountWallet ?? { coins: profile.coins, gems: profile.gems };
  const [profileNameDraft, setProfileNameDraft] = useState(profile.name);
  const [profileMessage, setProfileMessage] = useState("");
  const [authSession, setAuthSession] = useState<Session | null>(null);
  const authUserIdRef = useRef<string | null>(null);
  const [authBootComplete, setAuthBootComplete] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [authMessage, setAuthMessage] = useState("");
  const [usernameDraft, setUsernameDraft] = useState("");
  const [usernameRequired, setUsernameRequired] = useState(false);
  const [usernameChecked, setUsernameChecked] = useState(false);
  const [usernameMessage, setUsernameMessage] = useState("");
  const [socialProfiles, setSocialProfiles] = useState<OnlinePublicProfile[]>([]);
  const [friendProfiles, setFriendProfiles] = useState<OnlinePublicProfile[]>([]);
  const [pendingFriendProfiles, setPendingFriendProfiles] = useState<OnlinePublicProfile[]>([]);
  const [partyProfiles, setPartyProfiles] = useState<OnlinePublicProfile[]>([]);
  const [friendships, setFriendships] = useState<OnlineFriendship[]>([]);
  const [partyInvites, setPartyInvites] = useState<OnlinePartyInvite[]>([]);
  const [partyId, setPartyId] = useState<string | null>(null);
  const [socialBusy, setSocialBusy] = useState(false);
  const [socialMessage, setSocialMessage] = useState("");
  const [onlineUserIds, setOnlineUserIds] = useState<string[]>([]);
  const [onlineQueueMode, setOnlineQueueMode] = useState<GameMode | null>(null);
  const [onlineQueueCount, setOnlineQueueCount] = useState(1);
  const [onlineQueueMessage, setOnlineQueueMessage] = useState("");
  const [onlineMatch, setOnlineMatch] = useState<OnlineMatchSetup | null>(null);
  const [onlineRoomReady, setOnlineRoomReady] = useState(false);
  const [onlineSubmittedBids, setOnlineSubmittedBids] = useState<Record<string, number>>({});
  const onlinePresenceRef = useRef<ReturnType<NonNullable<typeof supabase>["channel"]> | null>(null);
  const onlineQueueChannelRef = useRef<ReturnType<NonNullable<typeof supabase>["channel"]> | null>(null);
  const onlineGameChannelRef = useRef<ReturnType<NonNullable<typeof supabase>["channel"]> | null>(null);
  const onlineResolvedRoundRef = useRef(0);
  const socialRefreshRef = useRef<() => Promise<void>>(async () => {});
  const onlineMatchHandlerRef = useRef<(setup: OnlineMatchSetup) => void>(() => {});
  const onlineRoundAdvanceHandlerRef = useRef<(payload: any) => void>(() => {});
  const onlineFinishMatchRef = useRef<(players: MatchPlayer[]) => void>(() => {});
  const [rankingMode, setRankingMode] = useState<GameMode>("classic");
  const [rankingPeriod, setRankingPeriod] = useState<RankingPeriod>("total");
  const [missionTab, setMissionTab] = useState<PlayerMission["period"]>("diaria");
  const [bonusCoinsWon, setBonusCoinsWon] = useState(0);
  const [rouletteSpinning, setRouletteSpinning] = useState(false);
  const [rouletteRotation, setRouletteRotation] = useState(0);
  const [rouletteResult, setRouletteResult] = useState("");
  const [rouletteNow, setRouletteNow] = useState(Date.now());
  const [serviceNow, setServiceNow] = useState(Date.now());
  const [chestNotice, setChestNotice] = useState("");
  const [audioSettings, setAudioSettings] = useState(readAudioSettings);
  const [settingsReturn, setSettingsReturn] = useState<AppScreen>("menu");
  const audioRef = useRef<{ music: HTMLAudioElement | null; unlocked: boolean }>({ music: null, unlocked: false });
  const [animationKey, setAnimationKey] = useState(0);
  const [panel, setPanel] = useState<"menu" | "settings" | null>(null);
  const [page, setPage] = useState<"game" | "inventory" | "shop">("game");
  const [chatOpen, setChatOpen] = useState(false);
  const [chatEmotesOpen, setChatEmotesOpen] = useState(false);
  const [chatDraft, setChatDraft] = useState("");
  const [chatMessages, setChatMessages] = useState<LiveChatMessage[]>([]);
  const [removalsUsedThisMatch, setRemovalsUsedThisMatch] = useState(0);
  const [chatEmoteCategory, setChatEmoteCategory] = useState<"todos" | ChatEmoteCategory>("normales");
  const [chatSessionId, setChatSessionId] = useState("initial");
  const [chatConnection, setChatConnection] = useState<"local" | "connecting" | "online">("local");
  const chatChannelRef = useRef<BroadcastChannel | null>(null);
  const chatSocketRef = useRef<WebSocket | null>(null);
  const requestedChatRoomId = useRef(new URLSearchParams(window.location.search).get("match"));
  const chatRoomId = useRef(requestedChatRoomId.current || "sigma-offline-table");
  const matchEventsRef = useRef<ScheduledGameEvent[]>(getActiveEvents());
  const resolutionRunRef = useRef(0);
  const playerScore = matchPlayers.find((player) => player.isUser)?.score ?? 0;
  const maxRounds = modeRoundCount(gameMode);
  const activeRoundRule = roundRules[round - 1] ?? roundRuleDetails.highest;
  const removeGemCost = Math.min(CARD_REMOVAL_BASE_GEMS + removalsUsedThisMatch * CARD_REMOVAL_INCREMENT_GEMS, CARD_REMOVAL_MAX_GEMS);
  const activeMenuEvents = getActiveEvents(new Date(serviceNow));

  const refreshSocialData = async () => {
    if (!supabase || !authSession) return;
    const userId = authSession.user.id;
    const [friendResult, inviteResult, partyResult] = await Promise.all([
      supabase.from("game_friendships").select("requester_id,addressee_id,status").or(`requester_id.eq.${userId},addressee_id.eq.${userId}`),
      supabase.from("game_party_invites").select("id,party_id,inviter_id,invitee_id,status").or(`inviter_id.eq.${userId},invitee_id.eq.${userId}`).eq("status", "pending"),
      supabase.from("game_party_members").select("party_id").eq("user_id", userId).maybeSingle(),
    ]);
    if (friendResult.error || inviteResult.error) { setSocialMessage("No se pudieron cargar las listas. Comprueba que la migración social esté aplicada."); return; }
    const friendRows = (friendResult.data ?? []) as OnlineFriendship[];
    const invites = (inviteResult.data ?? []) as OnlinePartyInvite[];
    setFriendships(friendRows);
    setPartyInvites(invites);
    const acceptedIds = friendRows.filter((edge) => edge.status === "accepted").map((edge) => edge.requester_id === userId ? edge.addressee_id : edge.requester_id);
    const incomingIds = invites.filter((invite) => invite.invitee_id === userId).map((invite) => invite.inviter_id);
    const outgoingIds = invites.filter((invite) => invite.inviter_id === userId).map((invite) => invite.invitee_id);
    const profileIds = [...new Set([...acceptedIds, ...incomingIds, ...outgoingIds])];
    if (profileIds.length) {
      const { data } = await supabase.from("profiles").select("id,username,display_name,avatar_id,avatar_color,frame_id").in("id", profileIds);
      const profiles = (data ?? []) as OnlinePublicProfile[];
      setFriendProfiles(profiles.filter((p) => acceptedIds.includes(p.id)));
      setPendingFriendProfiles(profiles.filter((p) => friendRows.some((edge) => edge.status === "pending" && edge.addressee_id === userId && edge.requester_id === p.id)));
    } else { setFriendProfiles([]); setPendingFriendProfiles([]); }
    const activePartyId = partyResult.data?.party_id ?? null;
    setPartyId(activePartyId);
    if (activePartyId) {
      const { data: members } = await supabase.from("game_party_members").select("user_id").eq("party_id", activePartyId);
      const memberIds = (members ?? []).map((member) => member.user_id);
      const { data: memberProfiles } = memberIds.length ? await supabase.from("profiles").select("id,username,display_name,avatar_id,avatar_color,frame_id").in("id", memberIds) : { data: [] };
      setPartyProfiles((memberProfiles ?? []) as OnlinePublicProfile[]);
    } else setPartyProfiles([]);
  };

  const refreshRandomPlayers = async () => {
    if (!supabase || !authSession) return;
    setSocialBusy(true);
    try {
      const { data, error } = await supabase.from("profiles").select("id,username,display_name,avatar_id,avatar_color,frame_id").not("username", "is", null).neq("id", authSession.user.id).limit(120);
      if (error) throw error;
      const knownIds = new Set([...friendships.flatMap((edge) => [edge.requester_id, edge.addressee_id]), ...partyInvites.flatMap((invite) => [invite.inviter_id, invite.invitee_id]), authSession.user.id]);
      const candidates = ((data ?? []) as OnlinePublicProfile[]).filter((item) => item.username && !knownIds.has(item.id));
      for (let index = candidates.length - 1; index > 0; index -= 1) { const target = Math.floor(Math.random() * (index + 1)); [candidates[index], candidates[target]] = [candidates[target], candidates[index]]; }
      setSocialProfiles(candidates.slice(0, 8));
      setSocialMessage("");
    } catch (error) { setSocialMessage(error instanceof Error ? error.message : "No se pudieron actualizar las sugerencias."); }
    finally { setSocialBusy(false); }
  };

  socialRefreshRef.current = refreshSocialData;

  const scheduleGameTimeout = (callback: () => void, delayMs: number) => {
    const task: PausableGameTimeout = { callback, remainingMs: delayMs, startedAt: 0, timeoutId: null, start: () => {} };
    task.start = () => {
      task.startedAt = performance.now();
      task.timeoutId = window.setTimeout(() => {
        pausableGameTimeoutsRef.current.delete(task);
        task.callback();
      }, task.remainingMs);
    };
    pausableGameTimeoutsRef.current.add(task);
    if (!orientationBlockedRef.current) task.start();
  };

  useEffect(() => {
    const updateViewport = () => {
      // Match the layout viewport used by CSS media queries. visualViewport can
      // be wider/taller than the CSS viewport in Chrome's device toolbar and
      // while browser chrome or the on-screen keyboard is changing.
      const width = document.documentElement.clientWidth || window.innerWidth;
      const height = document.documentElement.clientHeight || window.innerHeight;
      const touchCapable = window.matchMedia("(pointer: coarse)").matches || navigator.maxTouchPoints > 0;
      const shouldBlock = touchCapable && width <= 1024 && height > width;
      if (shouldBlock === orientationBlockedRef.current) return;
      orientationBlockedRef.current = shouldBlock;
      setOrientationBlocked(shouldBlock);
      for (const task of pausableGameTimeoutsRef.current) {
        if (shouldBlock && task.timeoutId !== null) {
          window.clearTimeout(task.timeoutId);
          task.timeoutId = null;
          task.remainingMs = Math.max(0, task.remainingMs - (performance.now() - task.startedAt));
        } else if (!shouldBlock && task.timeoutId === null) task.start();
      }
    };
    updateViewport();
    window.addEventListener("resize", updateViewport, { passive: true });
    window.addEventListener("orientationchange", updateViewport, { passive: true });
    window.visualViewport?.addEventListener("resize", updateViewport, { passive: true });
    return () => {
      window.removeEventListener("resize", updateViewport);
      window.removeEventListener("orientationchange", updateViewport);
      window.visualViewport?.removeEventListener("resize", updateViewport);
      for (const task of pausableGameTimeoutsRef.current) if (task.timeoutId !== null) window.clearTimeout(task.timeoutId);
      pausableGameTimeoutsRef.current.clear();
    };
  }, []);

  useEffect(() => {
    const inGameSurface = (target: EventTarget | null) => target instanceof Element ? target.closest(".game-shell") : null;
    const preventContextMenu = (event: Event) => {
      if (inGameSurface(event.target) && (window.matchMedia("(pointer: coarse)").matches || navigator.maxTouchPoints > 0)) event.preventDefault();
    };
    const preventGesture = (event: Event) => { if (inGameSurface(event.target)) event.preventDefault(); };
    const preventGamePageScroll = (event: TouchEvent) => {
      if (!inGameSurface(event.target) || (event.target instanceof Element && event.target.closest(".live-chat-panel, .inventory-page, .menu-subpanel"))) return;
      event.preventDefault();
    };
    document.addEventListener("contextmenu", preventContextMenu);
    document.addEventListener("gesturestart", preventGesture, { passive: false });
    document.addEventListener("touchmove", preventGamePageScroll, { passive: false });
    return () => {
      document.removeEventListener("contextmenu", preventContextMenu);
      document.removeEventListener("gesturestart", preventGesture);
      document.removeEventListener("touchmove", preventGamePageScroll);
    };
  }, []);

  useEffect(() => {
    if (!orientationBlocked) return;
    const overlay = document.createElement("div");
    overlay.className = "orientation-warning";
    overlay.setAttribute("role", "alert");
    overlay.setAttribute("aria-live", "assertive");
    overlay.innerHTML = '<span class="orientation-warning-icon" aria-hidden="true">↻</span><strong>Por favor, gira tu dispositivo en horizontal para jugar</strong><small>La partida continuará al volver a la posición horizontal.</small>';
    document.body.appendChild(overlay);
    return () => overlay.remove();
  }, [orientationBlocked]);

  useEffect(() => {
    if (screen !== "social" || !authSession || usernameRequired) return;
    const refreshId = window.setInterval(() => { void socialRefreshRef.current(); }, 10000);
    return () => window.clearInterval(refreshId);
  }, [screen, authSession?.user.id, usernameRequired]);

  useEffect(() => {
    if (!supabase || !authSession || !usernameChecked || usernameRequired) return;
    const client = supabase;
    const userId = authSession.user.id;
    const channel = client.channel("sigma:online-presence", { config: { presence: { key: userId } } });
    onlinePresenceRef.current = channel;
    channel.on("presence", { event: "sync" }, () => setOnlineUserIds(Object.keys(channel.presenceState())));
    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") void channel.track({ user_id: userId, username: profile.name, avatar: profile.avatar, party_id: partyId, active_at: Date.now() });
    });
    return () => { onlinePresenceRef.current = null; void client.removeChannel(channel); };
  }, [authSession?.user.id, usernameChecked, usernameRequired, profile.name, profile.avatar, partyId]);

  useEffect(() => {
    if (!supabase || !authSession || !onlineMatch) { setOnlineRoomReady(false); return; }
    const client = supabase;
    const ownId = authSession.user.id;
    const channel = client.channel(`sigma:match:${onlineMatch.id}`, { config: { broadcast: { ack: true, self: false } } });
    onlineGameChannelRef.current = channel;
    channel.on("broadcast", { event: "bid" }, ({ payload }) => {
      if (payload?.match_id !== onlineMatch.id || payload?.round !== activeRoundRef.current) return;
      setOnlineSubmittedBids((current) => ({ ...current, [payload.player_id]: payload.card_index }));
    });
    channel.on("broadcast", { event: "round-reveal" }, ({ payload }) => {
      if (payload?.round !== activeRoundRef.current) return;
      setBidPlaced(true);
      setSelected(null);
      setRevealedBids(payload.bids);
      setResolutionStage("bids");
      setResolutionMessage("");
      setAnimationKey((key) => key + 1);
      playSfx("flip");
    });
    channel.on("broadcast", { event: "loot-reveal" }, ({ payload }) => {
      if (payload?.round !== activeRoundRef.current) return;
      setLootEffect(payload.lootEffect);
      setRevealedLoot(true);
      setResolutionStage("loot");
      playSfx("flip");
    });
    channel.on("broadcast", { event: "round-result" }, ({ payload }) => {
      if (payload?.round !== activeRoundRef.current) return;
      const players = (payload.players as MatchPlayer[]).map((player) => ({ ...player, isUser: player.id === ownId }));
      setMatchPlayers(players);
      setHandValues(players.find((player) => player.isUser)?.hand ?? []);
      setResolutionStage("result");
      setResolutionWinnerIds(payload.winnerIds ?? []);
      setRoundScoreChanges(payload.scoreChanges ?? []);
      setResolutionMessage(payload.message ?? "");
      if ((payload.winnerIds ?? []).includes(ownId)) commitProfile(advanceMission(profileRef.current, "roundWins"));
      if ((payload.winnerIds ?? []).includes(ownId)) playSfx("handWin"); else playSfx("handLose");
    });
    channel.on("broadcast", { event: "round-next" }, ({ payload }) => onlineRoundAdvanceHandlerRef.current(payload));
    channel.on("broadcast", { event: "match-finished" }, ({ payload }) => {
      const players = (payload.players as MatchPlayer[]).map((player) => ({ ...player, isUser: player.id === ownId }));
      setMatchPlayers(players);
      setHandValues(players.find((player) => player.isUser)?.hand ?? []);
      onlineFinishMatchRef.current(players);
    });
    channel.on("broadcast", { event: "chat" }, ({ payload }) => {
      if (!payload || payload.sender_id === ownId) return;
      const emote = chatEmotes.find((item) => item.id === payload.emoteId);
      if (typeof payload.text === "string" || emote) setChatMessages((current) => [...current.slice(-49), { id: crypto.randomUUID(), sender: String(payload.sender ?? "Jugador").slice(0, 20), avatar: String(payload.avatar ?? "🐱"), text: typeof payload.text === "string" ? payload.text.slice(0, 180) : undefined, emoteId: emote?.id, time: Date.now() }]);
    });
    channel.subscribe((status) => setOnlineRoomReady(status === "SUBSCRIBED"));
    return () => {
      onlineGameChannelRef.current = null;
      setOnlineRoomReady(false);
      void client.removeChannel(channel);
    };
  }, [authSession?.user.id, onlineMatch?.id]);

  useEffect(() => {
    setServiceNow(Date.now());
    const interval = window.setInterval(() => setServiceNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!supabase) { setAuthBootComplete(true); return; }
    let mounted = true;
    const applySession = (session: Session | null) => {
      const nextUserId = session?.user.id ?? null;
      const userChanged = authUserIdRef.current !== nextUserId;
      authUserIdRef.current = nextUserId;
      if (session) {
        // Auth emits INITIAL_SESSION and TOKEN_REFRESHED for the same account.
        // Keep the resolved username state across those events; otherwise the
        // app shows onboarding again without reloading the profile.
        if (userChanged) {
          setAccountWallet(null);
          setAccountWalletLoading(true);
          setUsernameChecked(false);
          setUsernameRequired(false);
          setUsernameMessage("");
        }
        const accountProfile = readPlayerProfile(session.user.id);
        profileRef.current = accountProfile;
        setProfile(accountProfile);
        setProfileNameDraft(accountProfile.name);
      } else if (userChanged) {
        setUsernameChecked(false);
        setUsernameRequired(false);
        setUsernameMessage("");
      }
      setAuthSession(session);
      setAuthBootComplete(true);
    };
    void supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;
      if (error) setAuthMessage("No se pudo recuperar la sesión. Vuelve a iniciar sesión.");
      applySession(data.session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) applySession(session);
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!supabase || !authSession) return;
    let active = true;
    const userId = authSession.user.id;
    setAccountWallet(null);
    setAccountWalletLoading(true);
    const accountProfile = readPlayerProfile(userId);
    profileRef.current = accountProfile;
    setProfile(accountProfile);
    setProfileNameDraft(accountProfile.name);
    void supabase.from("profiles").select("display_name, username, username_changed_at, avatar_id").eq("id", userId).maybeSingle().then(({ data, error }) => {
      if (!active) return;
      if (error) { setAuthMessage("No se pudo cargar el perfil. Comprueba que la migración de usuarios esté aplicada en Supabase."); setUsernameRequired(true); setUsernameMessage("Falta configurar los nombres de usuario en la base de datos."); setUsernameChecked(true); return; }
      if (!data) { setAuthMessage("Cuenta conectada. El perfil se creará al completar el primer registro."); setUsernameRequired(true); setUsernameChecked(true); return; }
      const current = readPlayerProfile(userId);
      const avatar = profileAvatarOptionsAll.includes(data.avatar_id) ? data.avatar_id : current.avatar;
      const lastNameChange = data.username_changed_at ? Date.parse(data.username_changed_at) : 0;
      const next = { ...current, name: data.username || data.display_name || current.name, avatar, lastNameChange: Number.isFinite(lastNameChange) ? lastNameChange : 0 };
      profileRef.current = next;
      setProfile(next);
      setProfileNameDraft(next.name);
      savePlayerProfile(next, userId);
      setUsernameDraft(data.username ?? "");
      setUsernameRequired(!data.username);
      setUsernameChecked(true);
      setAuthMessage("");
    });
    return () => { active = false; };
  }, [authSession?.user.id]);

  useEffect(() => {
    if (!supabase || !authSession) {
      setAccountWallet(null);
      setAccountWalletLoading(false);
      accountWalletRefreshRef.current = async () => {};
      return;
    }
    const client = supabase;
    const userId = authSession.user.id;
    let active = true;
    let requestPending = false;
    const refresh = async () => {
      if (!active || requestPending) return;
      requestPending = true;
      setAccountWalletLoading(true);
      const { data, error } = await client.from("player_wallets").select("coins,gems").eq("user_id", userId).maybeSingle();
      if (active) {
        if (error) {
          setAccountWalletMessage("No se pudo leer el monedero seguro de la cuenta.");
        } else if (!data) {
          setAccountWallet(null);
          setAccountWalletMessage("La cuenta todavía no tiene un monedero inicializado.");
        } else {
          const balance = { coins: Math.max(0, Number(data.coins) || 0), gems: Math.max(0, Number(data.gems) || 0) };
          setAccountWallet(balance);
          const current = profileRef.current;
          if (current.coins !== balance.coins || current.gems !== balance.gems) {
            const synchronized = { ...current, ...balance };
            profileRef.current = synchronized;
            setProfile(synchronized);
            savePlayerProfile(synchronized, userId);
          }
          setAccountWalletMessage("");
        }
        setAccountWalletLoading(false);
      }
      requestPending = false;
    };
    accountWalletRefreshRef.current = refresh;
    void refresh();
    const poll = window.setInterval(() => {
      if (document.visibilityState === "visible") void refresh();
    }, 20_000);
    const onFocus = () => { void refresh(); };
    window.addEventListener("focus", onFocus);
    return () => {
      active = false;
      requestPending = false;
      window.clearInterval(poll);
      window.removeEventListener("focus", onFocus);
      accountWalletRefreshRef.current = async () => {};
    };
  }, [authSession?.user.id]);

  useEffect(() => {
    if (!authBootComplete) return;
    if (authSession) {
      if (!usernameChecked || usernameRequired) return;
      setPage("game");
      if (window.location.hash === "#inventario" || window.location.hash === "#tienda") window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
      setScreen((current) => current === "auth" ? "menu" : current);
    } else {
      setPage("game");
      setScreen("auth");
      setPanel(null);
      setHomeUtilityPanel(null);
    }
  }, [authSession?.user.id, authBootComplete, usernameChecked, usernameRequired]);

  useEffect(() => {
    const music = new Audio(publicAsset("sigma/audio/Raise_or_Fold_loop.ogg"));
    music.loop = true;
    music.preload = "auto";
    audioRef.current.music = music;
    return () => {
      music.pause();
      audioRef.current.music = null;
    };
  }, []);

  useEffect(() => {
    try { localStorage.setItem("sigmaAudioSettings", JSON.stringify(audioSettings)); } catch { /* storage may be unavailable */ }
    const music = audioRef.current.music;
    if (!music) return;
    music.volume = audioSettings.musicVolume;
    if (!audioSettings.music) music.pause();
    else if (audioRef.current.unlocked) void music.play().catch(() => {});
  }, [audioSettings]);

  useEffect(() => {
    if (screen !== "game" || page !== "game" || orientationBlocked || (bidPlaced && !onlineMatch)) return;
    const timerId = window.setInterval(() => setTurnSeconds((seconds) => orientationBlockedRef.current ? seconds : Math.max(0, seconds - 1)), 1000);
    return () => window.clearInterval(timerId);
  }, [screen, page, bidPlaced, onlineMatch?.id, orientationBlocked]);

  useEffect(() => {
    if (screen !== "game" || page !== "game") return;
    const receive = (message: LiveChatMessage) => setChatMessages((current) => [...current.slice(-49), message]);
    const channel = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel(`sigma-live-chat:${chatRoomId.current}`) : null;
    chatChannelRef.current = channel;
    if (channel) channel.onmessage = (event: MessageEvent<LiveChatMessage>) => {
      const data = event.data;
      if (data && typeof data.sender === "string" && (typeof data.text === "string" || typeof data.emoteId === "string")) receive({ ...data, isUser: false });
    };
    const env = (import.meta as ImportMeta & { env: ImportMetaEnv & { VITE_CHAT_WS_URL?: string } }).env;
    const endpoint = env.VITE_CHAT_WS_URL;
    if (endpoint) {
      setChatConnection("connecting");
      try {
        const socket = new WebSocket(endpoint);
        chatSocketRef.current = socket;
        socket.onopen = () => { setChatConnection("online"); socket.send(JSON.stringify({ type: "join", roomId: chatRoomId.current, name: profileRef.current.name, avatar: profileRef.current.avatar })); };
        socket.onmessage = (event) => {
          try {
            const data = JSON.parse(String(event.data));
            if (data?.type !== "chat" || typeof data.sender !== "string") return;
            const emote = chatEmotes.find((item) => item.id === data.emoteId);
            if (typeof data.text === "string") receive({ id: crypto.randomUUID(), sender: data.sender.slice(0, 20), avatar: typeof data.avatar === "string" ? data.avatar : "✦", text: data.text.slice(0, 180), time: Date.now() });
            else if (emote) receive({ id: crypto.randomUUID(), sender: data.sender.slice(0, 20), avatar: typeof data.avatar === "string" ? data.avatar : "✦", emoteId: emote.id, time: Date.now() });
          } catch { /* ignore malformed server frames */ }
        };
        socket.onclose = () => setChatConnection("local");
        socket.onerror = () => setChatConnection("local");
      } catch { setChatConnection("local"); }
    } else setChatConnection(onlineMatch ? "online" : "local");
    return () => {
      channel?.close();
      if (chatChannelRef.current === channel) chatChannelRef.current = null;
      const socket = chatSocketRef.current;
      if (socket) { socket.close(); chatSocketRef.current = null; }
      setChatConnection("local");
    };
  }, [screen, page, chatSessionId, onlineMatch?.id]);

  useEffect(() => {
    if (screen !== "roulette") return;
    setRouletteNow(Date.now());
    const interval = window.setInterval(() => setRouletteNow(Date.now()), 60_000);
    return () => window.clearInterval(interval);
  }, [screen]);

  const unlockAudio = () => {
    audioRef.current.unlocked = true;
    if (audioSettings.music && audioRef.current.music) {
      audioRef.current.music.volume = audioSettings.musicVolume;
      void audioRef.current.music.play().catch(() => {});
    }
  };

  const playSfx = (name: keyof typeof soundFiles, volume = 1) => {
    unlockAudio();
    if (!audioSettings.sfx) return;
    const effect = new Audio(soundFiles[name]);
    effect.preload = "auto";
    effect.volume = Math.min(1, audioSettings.sfxVolume * volume);
    void effect.play().catch(() => {});
  };

  const sendLiveChat = (payload: { text?: string; emoteId?: string }) => {
    const text = payload.text?.trim().slice(0, 180);
    const emoteId = payload.emoteId && profileRef.current.ownedChatEmotes.includes(payload.emoteId) && chatEmotes.some((emote) => emote.id === payload.emoteId) ? payload.emoteId : undefined;
    if (!text && !emoteId) return;
    const message: LiveChatMessage = { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, sender: profileRef.current.name, avatar: profileRef.current.avatar, text, emoteId, time: Date.now(), isUser: true };
    setChatMessages((current) => [...current.slice(-49), message]);
    const wireMessage = { type: "chat", roomId: chatRoomId.current, sender: message.sender, avatar: message.avatar, text, emoteId };
    if (onlineMatch && authSession) void onlineGameChannelRef.current?.send({ type: "broadcast", event: "chat", payload: { sender_id: authSession.user.id, sender: message.sender, avatar: message.avatar, text, emoteId } });
    else if (chatSocketRef.current?.readyState === WebSocket.OPEN) chatSocketRef.current.send(JSON.stringify(wireMessage));
    else chatChannelRef.current?.postMessage(message);
    playSfx("click", 0.35);
  };

  const commitProfile = (next: PlayerProfile) => {
    const previous = profileRef.current;
    const hasWallet = accountWallet !== null;
    const coinDelta = hasWallet ? Math.trunc(next.coins - previous.coins) : 0;
    const gemDelta = hasWallet ? Math.trunc(next.gems - previous.gems) : 0;
    if ((coinDelta !== 0 || gemDelta !== 0) && (!supabase || !authSession)) {
      setAccountWalletMessage("Inicia sesión para usar y guardar monedas o gemas en tu monedero de cuenta.");
      return;
    }
    if (!hasWallet) next = { ...next, coins: previous.coins, gems: previous.gems };
    profileRef.current = next;
    setProfile(next);
    savePlayerProfile(next, authSession?.user.id);
    if (supabase && authSession && (next.name !== previous.name || next.avatar !== previous.avatar)) {
      void supabase.from("profiles").update({ display_name: next.name, avatar_id: next.avatar }).eq("id", authSession.user.id).then(({ error }) => {
        if (error) setAuthMessage("Cambios guardados localmente, pero no se sincronizó el perfil remoto.");
      });
    }
    if ((coinDelta !== 0 || gemDelta !== 0) && supabase && authSession) {
      const client = supabase;
      const requestId = crypto.randomUUID();
      walletMutationQueueRef.current = walletMutationQueueRef.current.then(async () => {
        const { data, error } = await client.rpc("apply_game_wallet_delta", {
          p_coins_delta: coinDelta,
          p_gems_delta: gemDelta,
          p_request_id: requestId,
        });
        if (error) throw error;
        const row = Array.isArray(data) ? data[0] : data;
        if (row && Number.isFinite(Number(row.coins)) && Number.isFinite(Number(row.gems))) {
          const balance = { coins: Math.max(0, Number(row.coins)), gems: Math.max(0, Number(row.gems)) };
          setAccountWallet(balance);
          const latest = profileRef.current;
          const synchronized = { ...latest, ...balance };
          profileRef.current = synchronized;
          setProfile(synchronized);
          savePlayerProfile(synchronized, authSession.user.id);
          setAccountWalletMessage("");
        } else await accountWalletRefreshRef.current();
      }).catch(async (error: unknown) => {
        const rawMessage = error instanceof Error ? error.message : "";
        const message = rawMessage.includes("daily_coin_earning_limit")
          ? "Has alcanzado el límite diario de monedas obtenidas jugando."
          : rawMessage.includes("daily_gem_earning_limit")
            ? "Has alcanzado el límite diario de gemas obtenidas jugando."
            : rawMessage.includes("insufficient_funds")
              ? "El saldo de cuenta no alcanza para completar esta operación."
              : rawMessage ? `No se pudo actualizar el monedero: ${rawMessage}` : "No se pudo actualizar el monedero de cuenta.";
        setAccountWalletMessage(message);
        const latest = profileRef.current;
        const rolledBack = { ...latest } as PlayerProfile;
        for (const key of Object.keys(next) as (keyof PlayerProfile)[]) {
          if (key === "coins" || key === "gems") continue;
          if (latest[key] === next[key] && latest[key] !== previous[key]) (rolledBack as any)[key] = previous[key];
        }
        profileRef.current = rolledBack;
        setProfile(rolledBack);
        savePlayerProfile(rolledBack, authSession.user.id);
        await accountWalletRefreshRef.current();
      });
    }
  };

  const submitEmailAuth = async () => {
    if (!supabase || authBusy) return;
    const email = authEmail.trim().toLowerCase();
    if (!email || authPassword.length < 8) { setAuthMessage("Introduce un correo válido y una contraseña de al menos 8 caracteres."); return; }
    setAuthBusy(true);
    setAuthMessage("");
    try {
      if (authMode === "register") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password: authPassword,
          options: {
            emailRedirectTo: supabaseRedirectUrl(),
            data: { display_name: profileRef.current.name, avatar_id: profileRef.current.avatar },
          },
        });
        if (error) throw error;
        setAuthMessage(data.session ? "Cuenta creada y sesión iniciada." : "Cuenta creada. Revisa tu correo para confirmar la dirección antes de iniciar sesión.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password: authPassword });
        if (error) throw error;
        setAuthMessage("Sesión iniciada.");
      }
    } catch (error) {
      setAuthMessage(error instanceof Error ? error.message : "No se pudo completar la operación.");
    } finally {
      setAuthBusy(false);
    }
  };

  const checkUsernameAvailability = async () => {
    if (!supabase || !authSession) return;
    const username = usernameDraft.trim();
    if (!/^[A-Za-z0-9]{5,16}$/.test(username)) {
      setUsernameChecked(false);
      setUsernameMessage("Usa entre 5 y 16 caracteres: solo letras y números.");
      return;
    }
    setSocialBusy(true);
    setUsernameMessage("");
    try {
      const { data, error } = await supabase.rpc("check_username_available", { requested_username: username });
      if (error) throw error;
      if (!data) {
        setUsernameChecked(false);
        setUsernameMessage("Este nick ya existe. Prueba con otro.");
      } else {
        setUsernameChecked(true);
        setUsernameMessage("Nick disponible. Puedes continuar.");
      }
    } catch (error) {
      setUsernameChecked(false);
      setUsernameMessage(error instanceof Error ? error.message : "No se pudo comprobar el nick.");
    } finally { setSocialBusy(false); }
  };

  const saveUsername = async () => {
    if (!supabase || !authSession) return;
    const username = usernameDraft.trim();
    if (!/^[A-Za-z0-9]{5,16}$/.test(username)) { setUsernameChecked(false); setUsernameMessage("Usa entre 5 y 16 caracteres: solo letras y números."); return; }
    setSocialBusy(true);
    setUsernameMessage("");
    try {
      const { data, error } = await supabase.rpc("claim_username", { requested_username: username });
      if (error) throw error;
      if (data === "taken") { setUsernameChecked(false); setUsernameMessage("Este nick ya existe. Prueba con otro."); return; }
      if (data !== "ok") { setUsernameChecked(false); setUsernameMessage(data === "invalid" ? "Formato no válido. Solo letras y números, entre 5 y 16 caracteres." : "No se pudo guardar el nick. Vuelve a intentarlo."); return; }
      const next = { ...profileRef.current, name: username };
      profileRef.current = next;
      setProfile(next);
      setProfileNameDraft(username);
      savePlayerProfile(next, authSession.user.id);
      setUsernameRequired(false);
      setUsernameChecked(true);
      setScreen("menu");
      playSfx("handWin");
    } catch (error) { setUsernameChecked(false); setUsernameMessage(error instanceof Error ? error.message : "No se pudo guardar el nick."); }
    finally { setSocialBusy(false); }
  };

  const sendFriendRequest = async (targetId: string) => {
    if (!supabase) return;
    setSocialBusy(true);
    try {
      const { data, error } = await supabase.rpc("send_friend_request", { target_user: targetId });
      if (error) throw error;
      setSocialMessage(data === "sent" ? "Solicitud enviada." : data === "exists" ? "Ya hay una solicitud o amistad con este jugador." : "No se encontró ese jugador.");
      await refreshSocialData();
      await refreshRandomPlayers();
    } catch (error) { setSocialMessage(error instanceof Error ? error.message : "No se pudo enviar la solicitud."); }
    finally { setSocialBusy(false); }
  };

  const acceptFriendRequest = async (requesterId: string) => {
    if (!supabase || !authSession) return;
    setSocialBusy(true);
    const { error } = await supabase.from("game_friendships").update({ status: "accepted" }).eq("requester_id", requesterId).eq("addressee_id", authSession.user.id);
    setSocialMessage(error ? error.message : "Amistad añadida.");
    await refreshSocialData();
    await refreshRandomPlayers();
    setSocialBusy(false);
  };

  const removeFriend = async (friendId: string) => {
    if (!supabase || !authSession) return;
    setSocialBusy(true);
    const userId = authSession.user.id;
    const { error } = await supabase.from("game_friendships").delete().or(`and(requester_id.eq.${userId},addressee_id.eq.${friendId}),and(requester_id.eq.${friendId},addressee_id.eq.${userId})`);
    setSocialMessage(error ? error.message : "Amigo eliminado de la lista.");
    await refreshSocialData();
    await refreshRandomPlayers();
    setSocialBusy(false);
  };

  const createGameParty = async () => {
    if (!supabase) return;
    setSocialBusy(true);
    const { data, error } = await supabase.rpc("create_game_party");
    if (error) setSocialMessage(error.message);
    else { setPartyId(data as string); setSocialMessage("Grupo creado. Invita a un amigo para completar tu equipo 2v2."); await refreshSocialData(); }
    setSocialBusy(false);
  };

  const inviteFriendToParty = async (friendId: string) => {
    if (!supabase || !partyId) return;
    setSocialBusy(true);
    const { error } = await supabase.rpc("invite_to_game_party", { target_party: partyId, target_user: friendId });
    setSocialMessage(error ? error.message : "Invitación de grupo enviada.");
    await refreshSocialData();
    setSocialBusy(false);
  };

  const answerPartyInvite = async (inviteId: string, accept: boolean) => {
    if (!supabase) return;
    setSocialBusy(true);
    const { data, error } = await supabase.rpc("respond_to_game_party_invite", { invite_id: inviteId, accept_invite: accept });
    if (error) setSocialMessage(error.message);
    else { if (accept) setPartyId(data as string); setSocialMessage(accept ? "Ya estás en el grupo 2v2." : "Invitación rechazada."); }
    await refreshSocialData();
    setSocialBusy(false);
  };

  const signInWithProvider = async () => {
    if (!supabase || authBusy) return;
    setAuthBusy(true);
    setAuthMessage("");
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: supabaseRedirectUrl() } });
      if (error) setAuthMessage(error.message);
    } catch (error) {
      setAuthMessage(error instanceof Error ? error.message : "No se pudo iniciar el acceso social.");
    } finally {
      setAuthBusy(false);
    }
  };

  const signOutAccount = async () => {
    if (!supabase || authBusy) return;
    setAuthBusy(true);
    try {
      const { error } = await supabase.auth.signOut();
      setAuthMessage(error ? error.message : "Sesión cerrada.");
    } catch (error) {
      setAuthMessage(error instanceof Error ? error.message : "No se pudo cerrar la sesión.");
    } finally {
      setAuthBusy(false);
    }
  };

  const openChest = (chestId: string, instant = false) => {
    const activeProfile = profileRef.current;
    const chest = activeProfile.chests.find((item) => item.id === chestId);
    if (!chest) return;
    const now = Date.now();
    const ready = now >= chest.readyAt;
    if (!ready && (!instant || activeProfile.gems < CHEST_SKIP_GEMS)) return;
    let nextProfile: PlayerProfile = {
      ...activeProfile,
      gems: activeProfile.gems - (!ready ? CHEST_SKIP_GEMS : 0),
      chests: activeProfile.chests.filter((item) => item.id !== chestId),
    };
    let result = "";
    const roll = Math.random();
    if (roll < 0.62) {
      const coins = [20, 30, 40, 50][Math.floor(Math.random() * 4)];
      nextProfile = { ...nextProfile, coins: nextProfile.coins + coins };
      result = `+${coins} monedas`;
    } else if (roll < 0.82) {
      const card = inventoryCards[Math.floor(Math.random() * inventoryCards.length)];
      if (nextProfile.ownedCards.includes(card.cardKey)) {
        nextProfile = { ...nextProfile, coins: nextProfile.coins + DUPLICATE_CARD_COINS };
        result = `REPETIDA · ${card.name} · +${DUPLICATE_CARD_COINS} monedas`;
      } else {
        nextProfile = { ...nextProfile, ownedCards: [...nextProfile.ownedCards, card.cardKey] };
        result = `¡Nueva carta! ${card.name} · ${card.value}`;
      }
    } else if (roll < 0.924) {
      const coins = [75, 100, 125, 150][Math.floor(Math.random() * 4)];
      nextProfile = { ...nextProfile, coins: nextProfile.coins + coins };
      result = `¡Gran premio! +${coins} monedas`;
    } else if (roll < 0.925) {
      const premiumItems = [
        ...avatarStoreItems.map((item) => ({ kind: "avatar" as const, id: item.id, label: item.name })),
        ...avatarFrameStoreItems.filter((item) => item.price > 0).map((item) => ({ kind: "frame" as const, id: item.id, label: item.name })),
        ...chatEmotes.filter((item) => item.category !== "normales").map((item) => ({ kind: "emote" as const, id: item.id, label: item.label })),
      ];
      const prize = premiumItems[Math.floor(Math.random() * premiumItems.length)];
      const owned = prize.kind === "avatar" ? nextProfile.ownedAvatars.includes(prize.id) : prize.kind === "frame" ? nextProfile.ownedFrames.includes(prize.id) : nextProfile.ownedChatEmotes.includes(prize.id);
      if (owned) {
        nextProfile = { ...nextProfile, coins: nextProfile.coins + CHEST_DUPLICATE_COINS };
        result = `REPETIDO · ${prize.label} · +${CHEST_DUPLICATE_COINS} monedas`;
      } else {
        nextProfile = prize.kind === "avatar" ? { ...nextProfile, ownedAvatars: [...nextProfile.ownedAvatars, prize.id] } : prize.kind === "frame" ? { ...nextProfile, ownedFrames: [...nextProfile.ownedFrames, prize.id] } : { ...nextProfile, ownedChatEmotes: [...nextProfile.ownedChatEmotes, prize.id] };
        result = `¡Premio especial! ${prize.label}`;
      }
    } else if (roll < 0.975) {
      const gems = 15;
      nextProfile = { ...nextProfile, gems: nextProfile.gems + gems };
      result = `¡Gemas encontradas! +${gems} 💎`;
    } else if (roll < 0.995) {
      const gems = 30;
      nextProfile = { ...nextProfile, gems: nextProfile.gems + gems };
      result = `¡Gran hallazgo! +${gems} 💎`;
    } else {
      const gems = 60;
      nextProfile = { ...nextProfile, gems: nextProfile.gems + gems };
      result = `¡Premio extraordinario! +${gems} 💎`;
    }
    commitProfile(nextProfile);
    setChestNotice(result);
    window.setTimeout(() => setChestNotice((current) => current === result ? "" : current), 6500);
    playSfx("handWin");
  };

  useEffect(() => {
    try {
      const reward = JSON.parse(sessionStorage.getItem("sigmaSeasonRewardNotice") || "null");
      if (reward && (reward.coins > 0 || reward.gems > 0)) setProfileMessage(`Recompensa de la temporada anterior: +${reward.coins} monedas · +${reward.gems} gemas.`);
      sessionStorage.removeItem("sigmaSeasonRewardNotice");
    } catch { /* storage may be unavailable */ }
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      const activeProfile = profileRef.current;
      const missions = normalizeMissions(activeProfile.missions);
      const rankingWindows = syncRankingPeriods(activeProfile.winsByPeriod, activeProfile.winsPeriodResetAt);
      const { winsByPeriod, winsPeriodResetAt, rewardCoins: seasonCoins, rewardGems: seasonGems } = rankingWindows;
      const nextProfile = { ...activeProfile, missions, winsByPeriod, winsPeriodResetAt, coins: activeProfile.coins + seasonCoins, gems: activeProfile.gems + seasonGems };
      if (seasonCoins || seasonGems) setProfileMessage(`Recompensa de temporada: +${seasonCoins} monedas · +${seasonGems} gemas.`);
      if (JSON.stringify(nextProfile) !== JSON.stringify(activeProfile)) commitProfile(nextProfile);
    }, 60_000);
    return () => window.clearInterval(interval);
  }, []);

  const equipDeck = (id: string) => {
    if (!hasDeckCard(profile.ownedCards, id)) return;
    let equippedCards = profile.equippedCards;
    if (equippedCards.includes(id)) {
      if (equippedCards.length <= 1) return;
      equippedCards = equippedCards.filter((deckId) => deckId !== id);
    } else {
      if (equippedCards.length >= 3) return;
      equippedCards = [...equippedCards, id];
    }
    commitProfile({ ...profile, equippedCards, equippedCard: equippedCards[0] });
    playSfx("click");
  };

  const purchaseDeck = (id: string) => {
    const card = inventoryCards.find((entry) => entry.cardKey === id);
    if (!card || profile.ownedCards.includes(id) || wallet.coins < card.cardPrice) return;
    commitProfile({ ...profile, coins: profile.coins - card.cardPrice, ownedCards: [...profile.ownedCards, id] });
    playSfx("handWin");
  };

  const purchaseCosmetic = (kind: "avatar" | "frame", id: string) => {
    if (kind === "avatar") {
      const item = avatarStoreItems.find((entry) => entry.id === id);
      if (!item || profile.ownedAvatars.includes(id) || profile[item.currency] < item.price) return;
      commitProfile({ ...profile, [item.currency]: profile[item.currency] - item.price, ownedAvatars: [...profile.ownedAvatars, id] });
    } else if (kind === "frame") {
      const item = avatarFrameStoreItems.find((entry) => entry.id === id);
      if (!item || profile.ownedFrames.includes(id) || profile[item.currency] < item.price) return;
      commitProfile({ ...profile, [item.currency]: profile[item.currency] - item.price, ownedFrames: [...profile.ownedFrames, id] });
    }
    playSfx("handWin");
  };

  const purchaseChatEmote = (id: string) => {
    const emote = chatEmotes.find((item) => item.id === id);
    const activeProfile = profileRef.current;
    const price = emote ? chatEmotePrice(emote) : 0;
    if (!emote || price === 0 || activeProfile.ownedChatEmotes.includes(id) || activeProfile.gems < price) return;
    commitProfile({ ...activeProfile, gems: activeProfile.gems - price, ownedChatEmotes: [...activeProfile.ownedChatEmotes, id] });
    playSfx("handWin");
  };

  const chooseAvatar = (avatar: string) => {
    if (!profile.ownedAvatars.includes(avatar) || !profileAvatarOptionsAll.includes(avatar)) return;
    commitProfile({ ...profile, avatar });
    playSfx("click");
  };

  const equipAvatarFrame = (frame: string) => {
    if (!profile.ownedFrames.includes(frame)) return;
    commitProfile({ ...profile, equippedFrame: frame });
    playSfx("click");
  };

  const claimMission = (id: PlayerMission["id"]) => {
    const mission = profileRef.current.missions.find((item) => item.id === id);
    if (!mission || mission.claimed || mission.progress < mission.target) return;
    const missions = profileRef.current.missions.map((item) => item.id === id ? { ...item, claimed: true } : item);
    commitProfile({
      ...profileRef.current,
      missions,
      coins: profileRef.current.coins + (mission.rewardType === "coins" ? mission.rewardAmt : 0),
      gems: profileRef.current.gems + (mission.rewardType === "gems" ? mission.rewardAmt : 0),
    });
    setProfileMessage(`Recompensa reclamada: +${mission.rewardAmt} ${mission.rewardType === "gems" ? "gemas" : "monedas"}.`);
    playSfx("handWin");
  };

  const spinRoulette = (paid = false) => {
    const activeProfile = profileRef.current;
    const freeReady = !activeProfile.lastSpinTime || Date.now() - activeProfile.lastSpinTime >= 24 * 60 * 60 * 1000;
    const today = new Date().toDateString();
    const paidSpinsToday = activeProfile.paidSpinDate === today ? activeProfile.paidSpinsToday : 0;
    const paidCost = Math.min(PAID_ROULETTE_BASE_GEMS + paidSpinsToday * PAID_ROULETTE_INCREMENT_GEMS, PAID_ROULETTE_MAX_GEMS);
    if (rouletteSpinning || (!paid && !freeReady) || (paid && activeProfile.gems < paidCost)) return;
    commitProfile(paid
      ? { ...activeProfile, gems: activeProfile.gems - paidCost, paidSpinsToday: paidSpinsToday + 1, paidSpinDate: today }
      : { ...activeProfile, lastSpinTime: Date.now() });
    setRouletteResult("");
    setRouletteSpinning(true);
    let rouletteRoll = Math.random() * roulettePrizes.reduce((sum, prize) => sum + prize.weight, 0);
    let prizeIndex = roulettePrizes.length - 1;
    for (let index = 0; index < roulettePrizes.length; index += 1) {
      rouletteRoll -= roulettePrizes[index].weight;
      if (rouletteRoll < 0) { prizeIndex = index; break; }
    }
    setRouletteRotation((rotation) => {
      const sectorCenter = prizeIndex * (360 / roulettePrizes.length) + 180 / roulettePrizes.length;
      const currentAngle = ((rotation % 360) + 360) % 360;
      const correction = (360 - ((sectorCenter + currentAngle) % 360)) % 360;
      return rotation + 1800 + correction;
    });
    playSfx("cardSlide");
    window.setTimeout(() => {
      const reward = roulettePrizes[prizeIndex];
      const latest = profileRef.current;
      commitProfile({ ...latest, coins: latest.coins + reward.coins, gems: latest.gems + reward.gems });
      setRouletteResult(reward.label === "NADA" ? "Esta vez no ha tocado premio." : `¡Has ganado ${reward.label}!`);
      setRouletteSpinning(false);
      if (reward.coins || reward.gems) playSfx("handWin"); else playSfx("handLose");
    }, 3050);
  };

  const startMatch = (mode: GameMode) => {
    if (!authSession || !accountWallet) { setScreen("auth"); return; }
    setOnlineMatch(null);
    setOnlineSubmittedBids({});
    setOnlineRoomReady(false);
    const activeProfile = profileRef.current;
    if (activeProfile.coins < MATCH_ENTRY_FEE) return;
    matchEventsRef.current = getActiveEvents(new Date());
    const nextChatSession = crypto.randomUUID();
    chatRoomId.current = requestedChatRoomId.current || nextChatSession;
    setChatSessionId(nextChatSession);
    setChatMessages([]);
    setChatDraft("");
    setChatEmotesOpen(false);
    setChatEmoteCategory("normales");
    resolutionRunRef.current += 1;
    const decks = activeProfile.equippedCards.filter((id) => hasDeckCard(activeProfile.ownedCards, id)).slice(0, 3);
    const selectedDecks = decks.length ? decks : ["basica"];
    const players = createMatchPlayers(mode, { ...activeProfile, equippedCard: selectedDecks[0] }, selectedDecks);
    setGameMode(mode);
    setRound(1);
    setRoundRules(createRoundRules(modeRoundCount(mode)));
    setMatchPlayers(players);
    setHandValues(players[0].hand);
    setSelected(null);
    setRemovalsUsedThisMatch(0);
    setRemoveMode(false);
    setBidPlaced(false);
    setTurnSeconds(30);
    setRevealedBids(null);
    setRevealedLoot(false);
    setResolutionStage("idle");
    setResolutionWinnerIds([]);
    setRoundScoreChanges([]);
    setLootEffect(hiddenLootEffects[Math.floor(Math.random() * hiddenLootEffects.length)]);
    setLootValues(generateLootValues());
    setCarriedPot(0);
    setResolutionMessage("");
    setMatchResult(null);
    setChestNotice("");
    setBonusCoinsWon(0);
    setPage("game");
    setScreen("game");
    setPanel(null);
    commitProfile(advanceMission({ ...activeProfile, coins: activeProfile.coins - MATCH_ENTRY_FEE }, "games"));
    playSfx("deal");
  };

  const receiveOnlineMatch = (setup: OnlineMatchSetup) => {
    if (!authSession || !setup.roster.some((member) => member.id === authSession?.user.id)) return;
    if (onlineQueueChannelRef.current && supabase) { void supabase.removeChannel(onlineQueueChannelRef.current); onlineQueueChannelRef.current = null; }
    setOnlineQueueMode(null);
    setOnlineQueueMessage("");
    setOnlineMatch(setup);
    setOnlineRoomReady(false);
    onlineResolvedRoundRef.current = 0;
    setOnlineSubmittedBids({});
    chatRoomId.current = setup.id;
    setChatSessionId(crypto.randomUUID());
    setChatConnection("online");
    setChatMessages([]);
    setChatDraft("");
    setChatEmotesOpen(false);
    setChatEmoteCategory("normales");
    resolutionRunRef.current += 1;
    setGameMode(setup.mode);
    setRound(1);
    setRoundRules(setup.rules);
    const players = setup.players.map((player) => ({ ...player, isUser: player.id === authSession.user.id }));
    setMatchPlayers(players);
    const localPlayer = players.find((player) => player.isUser);
    setHandValues(localPlayer?.hand ?? []);
    setSelected(null);
    setRemovalsUsedThisMatch(0);
    setRemoveMode(false);
    setBidPlaced(false);
    setTurnSeconds(30);
    setRevealedBids(null);
    setRevealedLoot(false);
    setResolutionStage("idle");
    setResolutionWinnerIds([]);
    setRoundScoreChanges([]);
    setLootEffect(setup.lootEffect);
    setLootValues(setup.lootValues);
    setCarriedPot(0);
    setResolutionMessage("");
    setMatchResult(null);
    setPage("game");
    setScreen("game");
    setPanel(null);
    const current = profileRef.current;
    if (current.coins >= MATCH_ENTRY_FEE) commitProfile(advanceMission({ ...current, coins: current.coins - MATCH_ENTRY_FEE }, "games"));
    matchEventsRef.current = getActiveEvents(new Date());
    playSfx("deal");
  };

  onlineMatchHandlerRef.current = receiveOnlineMatch;

  onlineRoundAdvanceHandlerRef.current = (payload) => {
    if (!authSession) return;
    const players = (payload.players as MatchPlayer[]).map((player) => ({ ...player, isUser: player.id === authSession.user.id }));
    setRound(payload.round);
    setMatchPlayers(players);
    setHandValues(players.find((player) => player.isUser)?.hand ?? []);
    setRoundRules(payload.rules);
    setSelected(null);
    setRemoveMode(false);
    setBidPlaced(false);
    setRevealedBids(null);
    setRevealedLoot(false);
    setLootEffect(payload.lootEffect);
    setLootValues(payload.lootValues);
    setResolutionStage("idle");
    setResolutionWinnerIds([]);
    setRoundScoreChanges([]);
    setResolutionMessage("");
    setOnlineSubmittedBids({});
    setTurnSeconds(30);
    onlineResolvedRoundRef.current = payload.round - 1;
    playSfx("deal");
  };

  const cancelOnlineQueue = () => {
    if (onlineQueueChannelRef.current && supabase) void supabase.removeChannel(onlineQueueChannelRef.current);
    onlineQueueChannelRef.current = null;
    setOnlineQueueMode(null);
    setOnlineQueueCount(1);
    setOnlineQueueMessage("");
  };

  const joinOnlineQueue = (mode: GameMode) => {
    if (!supabase || !authSession || !usernameChecked || !accountWallet || accountWallet.coins < MATCH_ENTRY_FEE) return;
    setOnlineMatch(null);
    cancelOnlineQueue();
    setOnlineQueueMode(mode);
    setOnlineQueueCount(1);
    setOnlineQueueMessage("Conectando con la mesa online…");
    const userId = authSession.user.id;
    const expected = mode === "duel" ? 2 : 4;
    let claimed = false;
    const channel = supabase.channel("sigma:matchmaking", { config: { presence: { key: userId }, broadcast: { ack: true, self: false } } });
    onlineQueueChannelRef.current = channel;
    channel.on("broadcast", { event: "match-found" }, ({ payload }) => onlineMatchHandlerRef.current(payload as OnlineMatchSetup));
    channel.on("presence", { event: "sync" }, () => {
      const candidates = Object.entries(channel.presenceState()).flatMap(([key, metas]) => metas.map((meta: any) => ({ ...meta, user_id: meta.user_id || key })))
        .filter((entry: any) => entry.mode === mode && entry.user_id && entry.username)
        .sort((a: any, b: any) => Number(a.joined_at) - Number(b.joined_at));
      setOnlineQueueCount(candidates.length);
      setOnlineQueueMessage(`Buscando jugadores… ${Math.min(candidates.length, expected)}/${expected}`);
      if (claimed || candidates.length < expected) return;

      let groups: any[][];
      if (mode === "teams") {
        const grouped = new Map<string, any[]>();
        const solo: any[][] = [];
        for (const candidate of candidates) {
          if (!candidate.party_id) solo.push([candidate]);
          else grouped.set(candidate.party_id, [...(grouped.get(candidate.party_id) ?? []), candidate]);
        }
        const completeParties = [...grouped.values()].filter((group) => group.length === 2)
          .sort((a, b) => Number(a[0].joined_at) - Number(b[0].joined_at));
        solo.sort((a, b) => Number(a[0].joined_at) - Number(b[0].joined_at));
        // Keep each premade duo adjacent so the team split never separates partners.
        groups = [...completeParties, ...solo];
        const selected: any[][] = [];
        let seats = 0;
        for (const group of groups) { if (seats + group.length > expected) continue; selected.push(group); seats += group.length; if (seats === expected) break; }
        groups = selected;
      } else groups = candidates.map((candidate: any) => [candidate]);
      const rosterEntries = groups.flat();
      if (rosterEntries.length !== expected || rosterEntries[0]?.user_id !== userId) return;
      claimed = true;
      const roster: OnlineRosterPlayer[] = rosterEntries.map((entry: any, index: number) => ({
        id: entry.user_id,
        username: entry.username,
        avatar: entry.avatar || "🐱",
        deckIds: Array.isArray(entry.deck_ids) ? entry.deck_ids.slice(0, 3) : ["basica"],
        ownedCards: Array.isArray(entry.owned_cards) ? entry.owned_cards : [],
        team: mode === "teams" ? (Math.floor(index / 2) === 0 ? 1 : 2) : 0,
      }));
      const players: MatchPlayer[] = roster.map((member) => ({ id: member.id, name: member.username, avatar: member.avatar, score: 0, hand: dealHand(member.deckIds, 5, member.ownedCards), team: member.team, isUser: member.id === userId }));
      const setup: OnlineMatchSetup = { id: crypto.randomUUID(), mode, hostId: userId, roster, players, rules: createRoundRules(modeRoundCount(mode)), lootValues: generateLootValues(), lootEffect: hiddenLootEffects[Math.floor(Math.random() * hiddenLootEffects.length)] };
      void channel.send({ type: "broadcast", event: "match-found", payload: setup });
      onlineMatchHandlerRef.current(setup);
    });
    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        setOnlineQueueMessage(`Buscando rivales para ${mode === "classic" ? "Clásico 4P" : mode === "teams" ? "Equipos 2v2" : "Duelo 1v1"}…`);
        void channel.track({ user_id: userId, username: profile.name, avatar: profile.avatar, mode, party_id: mode === "teams" ? partyId : null, deck_ids: profile.equippedCards, owned_cards: profile.ownedCards, joined_at: Date.now() });
      } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") setOnlineQueueMessage("No se pudo conectar a la cola online. Comprueba tu conexión y vuelve a intentarlo.");
    });
  };

  const removeHandCard = (index: number) => {
    const activeProfile = profileRef.current;
    const cost = Math.min(CARD_REMOVAL_BASE_GEMS + removalsUsedThisMatch * CARD_REMOVAL_INCREMENT_GEMS, CARD_REMOVAL_MAX_GEMS);
    if (bidPlaced || activeProfile.gems < cost || !handValues[index]) return;
    const nextHand = [...handValues];
    nextHand[index] = dealHand(activeProfile.equippedCards, 1, activeProfile.ownedCards)[0];
    commitProfile({ ...advanceMission(activeProfile, "removals"), gems: activeProfile.gems - cost });
    setRemovalsUsedThisMatch((count) => count + 1);
    setHandValues(nextHand);
    setMatchPlayers((players) => players.map((player) => player.isUser ? { ...player, hand: [...nextHand] } : player));
    setSelected(null);
    setRemoveMode(false);
    setResolutionMessage(`Carta retirada · coste: ${cost} gemas. La siguiente retirada costará ${Math.min(cost + CARD_REMOVAL_INCREMENT_GEMS, CARD_REMOVAL_MAX_GEMS)} gemas.`);
    playSfx("deal");
  };

  const finishMatch = (players: MatchPlayer[], roundBonusCoins = 0) => {
    const activeProfile = profileRef.current;
    let winningTeam: number | null = null;
    let winners: MatchPlayer[] = [];
    if (gameMode === "teams") {
      const blueScore = players.filter((player) => player.team === 1).reduce((sum, player) => sum + player.score, 0);
      const redScore = players.filter((player) => player.team === 2).reduce((sum, player) => sum + player.score, 0);
      if (blueScore !== redScore) winningTeam = blueScore > redScore ? 1 : 2;
      winners = winningTeam === null ? [] : players.filter((player) => player.team === winningTeam);
    } else {
      const highScore = Math.max(...players.map((player) => player.score));
      winners = players.filter((player) => player.score === highScore);
    }
    const winningPlayers = gameMode === "teams" ? winners : winners.length === 1 ? winners : [];
    const playerWon = winningPlayers.some((player) => player.isUser);
    const won = gameMode === "teams" ? winners.length > 0 && playerWon : winners.length === 1 && playerWon;
    const winnerLabel = gameMode === "teams" ? (winningTeam === 1 ? "Equipo Azul" : winningTeam === 2 ? "Equipo Rojo" : "Empate") : winners.length === 1 ? winners[0].name : winners.length ? "Empate" : "Empate";
    const rows = gameMode === "teams"
      ? [1, 2].map((team) => ({ name: team === 1 ? "Equipo Azul" : "Equipo Rojo", score: Math.floor(players.filter((player) => player.team === team).reduce((sum, player) => sum + player.score, 0)) })).sort((a, b) => b.score - a.score)
      : [...players].sort((a, b) => b.score - a.score).map((player) => ({ name: player.isUser ? activeProfile.name : player.name, score: Math.floor(player.score) }));
    const modeKey = gameMode;
    const rankingWindows = syncRankingPeriods(activeProfile.winsByPeriod, activeProfile.winsPeriodResetAt);
    const winsByMode = { ...activeProfile.winsByMode, [modeKey]: { ...activeProfile.winsByMode[modeKey] } };
    const winsByPeriod = {
      weekly: { ...rankingWindows.winsByPeriod.weekly, [modeKey]: { ...rankingWindows.winsByPeriod.weekly[modeKey] } },
      monthly: { ...rankingWindows.winsByPeriod.monthly, [modeKey]: { ...rankingWindows.winsByPeriod.monthly[modeKey] } },
    };
    for (const winner of winningPlayers) {
      const key = winner.isUser ? "player" : winner.name;
      winsByMode[modeKey][key] = (winsByMode[modeKey][key] ?? 0) + 1;
      winsByPeriod.weekly[modeKey][key] = (winsByPeriod.weekly[modeKey][key] ?? 0) + 1;
      winsByPeriod.monthly[modeKey][key] = (winsByPeriod.monthly[modeKey][key] ?? 0) + 1;
    }
    let rewardCoins = (won ? gameMode === "duel" ? 25 : gameMode === "teams" ? 40 : 50 : 5) + bonusCoinsWon + roundBonusCoins;
    let rewardGems = 0;
    const completedEvent = won ? matchEventsRef.current.find((event) => event.mode === gameMode) : undefined;
    if (completedEvent) {
      if (completedEvent.reward.coinMultiplier) rewardCoins = Math.floor(rewardCoins * completedEvent.reward.coinMultiplier);
      rewardCoins += completedEvent.reward.coinBonus ?? 0;
      rewardGems += completedEvent.reward.gemBonus ?? 0;
    }
    const chestAdded = won && activeProfile.chests.length < MAX_CHESTS;
    const chests = chestAdded ? [...activeProfile.chests, { id: crypto.randomUUID(), createdAt: Date.now(), readyAt: Date.now() + CHEST_WAIT_MS }] : activeProfile.chests;
    const progressProfile = won ? advanceMission(activeProfile, "matchWins") : activeProfile;
    commitProfile({ ...progressProfile, coins: progressProfile.coins + rewardCoins + rankingWindows.rewardCoins, gems: progressProfile.gems + rewardGems + rankingWindows.rewardGems, winsByMode, winsByPeriod, winsPeriodResetAt: rankingWindows.winsPeriodResetAt, chests });
    if (rankingWindows.rewardCoins || rankingWindows.rewardGems) setProfileMessage(`Recompensa de temporada: +${rankingWindows.rewardCoins} monedas · +${rankingWindows.rewardGems} gemas.`);
    setMatchResult({ title: winnerLabel === "Empate" ? "¡EMPATE!" : won ? (gameMode === "teams" ? "¡VICTORIA DE EQUIPO!" : "¡VICTORIA!") : (gameMode === "teams" ? "¡DERROTA DE EQUIPO!" : "DERROTA"), winner: winnerLabel, rows, coinReward: rewardCoins, gemReward: rewardGems, eventBonus: completedEvent?.rewardText, chestAdded, matchWon: won });
    if (won) playSfx("handWin"); else playSfx("handLose");
  };

  onlineFinishMatchRef.current = (players) => finishMatch(players);

  const resolveRound = (chosenIndex = selected, bidIndexes: Record<string, number> = {}) => {
    if (chosenIndex === null || (bidPlaced && !onlineMatch) || resolutionStage !== "idle" || !matchPlayers.length) return;
    const activeProfile = profileRef.current;
    const activeRule = activeRoundRule;
    if (!onlineMatch) commitProfile(advanceMission(activeProfile, "bids"));
    const humanCard = handValues[chosenIndex] ?? handValues[0] ?? { value: 1, deckId: "basica" };
    const humanValue = humanCard.value;
    const knifePassive = hasActiveSet(activeProfile, "cuchillo");
    const ninjaPassive = hasActiveSet(activeProfile, "banda");
    const toxicSetPassive = hasActiveSet(activeProfile, "veneno");
    const playersForRound = matchPlayers.map((player) => ({ ...player, score: Math.floor(player.score), hand: [...player.hand] }));
    const startingScores = new Map(playersForRound.map((player) => [player.id, player.score]));
    const previousLeader = [...playersForRound].sort((a, b) => b.score - a.score)[0];
    const previousLastScore = Math.min(...playersForRound.map((player) => player.score));
    const passiveNotes: string[] = [];
    const plays = playersForRound.map((player, index) => {
      const hand = player.isUser ? handValues : player.hand;
      let cardIndex = player.isUser ? chosenIndex : 0;
      if (onlineMatch) cardIndex = bidIndexes[player.id] ?? cardIndex;
      else if (!player.isUser) {
        const candidates = hand.map((card, cardPosition) => ({ card, cardPosition }));
        const evenCandidates = candidates.filter(({ card }) => card.value % 2 === 0);
        const ruleCandidates = activeRule.id === "even-bids" && evenCandidates.length ? evenCandidates : candidates;
        const chosen = ruleCandidates.reduce((best, current) => {
          if (activeRule.id === "lowest") return current.card.value < best.card.value ? current : best;
          if (activeRule.id === "closest-five") return Math.abs(current.card.value - 5) < Math.abs(best.card.value - 5) ? current : best;
          return current.card.value > best.card.value ? current : best;
        }, ruleCandidates[0] ?? candidates[0]);
        cardIndex = chosen?.cardPosition ?? 0;
      }
      const playedCard = player.isUser ? humanCard : hand[cardIndex] ?? { value: 1, deckId: "basica" };
      const rawValue = player.isUser ? humanValue : playedCard.value;
      const isRival = gameMode !== "teams" || player.team !== playersForRound[0].team;
      let value = rawValue;
      if (playedCard.effectId === "bid-plus-one") value += 1;
      if (player.isUser && ninjaPassive && rawValue <= 3) { value += 2; passiveNotes.push("Banda: +2 a tu puja baja"); }
      if (player.isUser && toxicSetPassive && playedCard.deckId === "veneno" && rawValue >= 6) { value += 1; passiveNotes.push("Tóxicos: +1 a la puja"); }
      if (!player.isUser && knifePassive && isRival) value = Math.max(1, value - 1);
      player.hand.splice(cardIndex, 1);
      return { player, value, faceValue: rawValue, card: playedCard };
    });

    setSelected(chosenIndex);
    setBidPlaced(true);
    playSfx("confirm");
    setAnimationKey((key) => key + 1);
    playSfx("flip");
    window.setTimeout(() => playSfx("cardSlide", 0.8), 420);

    const effect = lootEffect;
    const lowestWins = activeRule.id === "lowest";
    const nearestFiveWins = activeRule.id === "closest-five";
    let finalPoints = Math.min(100, lootValues.reduce((sum, value) => sum + value, 0) + carriedPot + (effect.type === "COFRE" ? effect.value : 0));
    if (effect.type === "BLACK_HOLE") {
      setCarriedPot(Math.min(50, finalPoints));
      finalPoints = 0;
    } else {
      setCarriedPot(0);
    }
    if (effect.type === "DOUBLE_POT") finalPoints = Math.min(100, finalPoints * 2);
    let bombDamage = effect.type === "BOMBA" ? effect.value : 0;
    const interferencePlays = plays.filter((play) => play.card.effectId === "rival-bid-minus-one");
    for (const disruptor of interferencePlays) {
      const rivalPlays = plays.filter((play) => play.player.id !== disruptor.player.id && (gameMode !== "teams" || play.player.team !== disruptor.player.team));
      const strongestRival = rivalPlays.reduce<(typeof plays)[number] | null>((best, play) => !best || play.value > best.value ? play : best, null);
      if (strongestRival) {
        strongestRival.value = Math.max(1, strongestRival.value - 1);
        passiveNotes.push(`${disruptor.player.isUser ? "Tú" : disruptor.player.name}: Interferencia −1 a ${strongestRival.player.name}`);
      }
    }
    if (knifePassive && gameMode !== "duel") passiveNotes.push("Ladrones: −1 a las pujas rivales");
    setRevealedBids(plays.map((play) => ({ ...play.card, value: play.faceValue })));
    if (onlineMatch && authSession) {
      setBidPlaced(true);
      void onlineGameChannelRef.current?.send({ type: "broadcast", event: "round-reveal", payload: { round, bids: plays.map((play) => ({ ...play.card, value: play.faceValue })) } });
    }

    let winners: MatchPlayer[] = [];
    let message = "";
    const payoutFor = (winningPlays: typeof plays) => {
      let payout = finalPoints + bombDamage;
      if (effect.type === "WINNER_HIGH_TAX" && winningPlays.some((play) => play.faceValue >= 8)) payout -= 5;
      if (effect.type === "WINNER_LOW_BONUS" && winningPlays.some((play) => play.faceValue <= 3)) payout += 5;
      return Math.min(100, Math.max(0, Math.floor(payout)));
    };
    if (gameMode === "teams") {
      const blueTotal = plays.filter((play) => play.player.team === 1).reduce((sum, play) => sum + play.value, 0);
      const redTotal = plays.filter((play) => play.player.team === 2).reduce((sum, play) => sum + play.value, 0);
      const blueStrength = teamStrengthForRound(plays, 1, activeRule);
      const redStrength = teamStrengthForRound(plays, 2, activeRule);
      if (blueStrength === redStrength) {
        winners = [...playersForRound];
        const totalToSplit = payoutFor(plays);
        const share = Math.floor(totalToSplit / winners.length);
        const remainder = totalToSplit - share * winners.length;
        winners.forEach((winner) => { winner.score += share; });
        message = `Empate de equipos (${blueTotal}–${redTotal}): +${share} pts para cada jugador${remainder ? `; ${remainder} punto${remainder === 1 ? "" : "s"} sobrante${remainder === 1 ? "" : "s"} va${remainder === 1 ? "" : "n"} a la banca` : ""}.`;
      } else {
        const winningTeam: 1 | 2 = blueStrength > redStrength ? 1 : 2;
        winners = playersForRound.filter((player) => player.team === winningTeam);
        if (winners.some((winner) => winner.isUser) && hasActiveSet(activeProfile, "escudo") && effect.type === "BOMBA") { bombDamage = 0; passiveNotes.push("Escudo: Bomba anulada"); }
        const winningPlays = plays.filter((play) => play.player.team === winningTeam);
        const payout = payoutFor(winningPlays);
        winners.forEach((winner) => { winner.score += payout; });
        message = `Gana el equipo ${winningTeam === 1 ? "Azul" : "Rojo"} y cada integrante recibe ${payout} puntos.`;
      }
    } else {
      const evenPlays = plays.filter((play) => play.faceValue % 2 === 0);
      const contenders = activeRule.id === "even-bids" && evenPlays.length ? evenPlays : plays;
      const ruleScore = (value: number) => lowestWins ? -value : nearestFiveWins ? -Math.abs(value - 5) : value;
      const bestValue = Math.max(...contenders.map((play) => ruleScore(play.value)));
      const tied = contenders.filter((play) => ruleScore(play.value) === bestValue);
      if (tied.length === 1) {
        winners = [tied[0].player];
        if (winners[0].isUser && hasActiveSet(activeProfile, "escudo") && effect.type === "BOMBA") { bombDamage = 0; passiveNotes.push("Escudo: Bomba anulada"); }
        const payout = payoutFor(tied);
        winners[0].score += payout;
        message = `${winners[0].isUser ? "¡TÚ GANAS" : `${winners[0].name} gana`} y se lleva ${payout} puntos.`;
      } else {
        winners = tied.map((play) => play.player);
        const totalToSplit = payoutFor(tied);
        const share = Math.floor(totalToSplit / winners.length);
        const remainder = totalToSplit - share * winners.length;
        winners.forEach((winner) => { winner.score += share; });
        message = `¡Empate entre ${winners.length}! +${share} pts para cada participante${remainder ? `; ${remainder} punto${remainder === 1 ? "" : "s"} sobrante${remainder === 1 ? "" : "s"} va${remainder === 1 ? "" : "n"} a la banca` : ""}.`;
      }
    }

    const winnerIds = new Set(winners.map((winner) => winner.id));
    const nearMissIds = new Set<string>();
    if (gameMode === "teams") {
      const winningTeams = new Set(winners.map((winner) => winner.team));
      if (winningTeams.size === 1) {
        const winningTeam = winners[0].team as 1 | 2;
        const losingTeam: 1 | 2 = winningTeam === 1 ? 2 : 1;
        const winningStrength = teamStrengthForRound(plays, winningTeam, activeRule);
        const losingStrength = teamStrengthForRound(plays, losingTeam, activeRule);
        if (Math.abs(winningStrength - losingStrength) <= 1) playersForRound.filter((player) => player.team === losingTeam).forEach((player) => nearMissIds.add(player.id));
      }
    } else {
      const winningPlays = plays.filter((play) => winnerIds.has(play.player.id));
      const hasEvenBids = activeRule.id === "even-bids" && plays.some((candidate) => candidate.faceValue % 2 === 0);
      const scoreForRule = (value: number) => activeRule.id === "even-bids" && !hasEvenBids ? value : roundRuleScore(value, activeRule);
      const winningScore = Math.max(...winningPlays.map((play) => scoreForRule(play.value)));
      plays.filter((play) => !winnerIds.has(play.player.id)).forEach((play) => {
        if (hasEvenBids && play.faceValue % 2 !== 0) return;
        if (winningScore - scoreForRule(play.value) <= 1) nearMissIds.add(play.player.id);
      });
    }
    for (const play of plays) {
      const wonRound = winnerIds.has(play.player.id);
      if (!wonRound) {
        let consolation = 0;
        const consolationSources: string[] = [];
        if (play.card.effectId === "loss-compensation-5" || play.card.effectId === "loss-compensation-3") { consolation += play.card.effectId === "loss-compensation-5" ? 5 : 3; consolationSources.push("Red de seguridad"); }
        if (play.card.effectId === "low-card-loss-five" && play.faceValue <= 3) { consolation += 5; consolationSources.push("Salida segura"); }
        if (play.card.effectId === "near-miss-five" && nearMissIds.has(play.player.id)) { consolation += 5; consolationSources.push("Por los pelos"); }
        if (effect.type === "COMPENSATION") consolation += effect.value;
        const consolationAwarded = Math.min(8, consolation);
        play.player.score += consolationAwarded;
        if (consolationAwarded) passiveNotes.push(`${play.player.isUser ? "Tú" : play.player.name}: ${consolationSources.join(" + ") || "Consolación"} +${consolationAwarded}`);
      }
      if (wonRound && (play.card.effectId === "last-place-plus-15" || play.card.effectId === "last-place-plus-five" || effect.type === "LAST_PLACE") && (startingScores.get(play.player.id) ?? 0) <= previousLastScore) {
        const comebackBonus = play.card.effectId === "last-place-plus-15" ? 15 : play.card.effectId === "last-place-plus-five" ? 5 : effect.value;
        play.player.score += comebackBonus;
        passiveNotes.push(`${play.player.isUser ? "Tú" : play.player.name}: Remontada +${comebackBonus}`);
      }
      if (!wonRound) continue;
      if (["steal-leader-15", "steal-leader-five"].includes(play.card.effectId ?? "") || effect.type === "STEAL_LEADER") {
        const victim = previousLeader && previousLeader.id !== play.player.id ? playersForRound.find((player) => player.id === previousLeader.id) : [...playersForRound].filter((player) => player.id !== play.player.id).sort((a, b) => b.score - a.score)[0];
        if (victim) {
          const stolen = Math.min(effect.type === "STEAL_LEADER" ? effect.value : play.card.effectId === "steal-leader-15" ? 15 : 5, Math.max(0, victim.score));
          victim.score -= stolen;
          play.player.score += stolen;
          passiveNotes.push(`${play.player.isUser ? "Tú" : play.player.name}: robo de ${stolen} a ${victim.name}`);
        }
      }
    }
    const scoreChanges = playersForRound.map((player) => ({ id: player.id, delta: player.score - (startingScores.get(player.id) ?? 0) }));

    setSelected(null);
    const roundCoinBonus = winners.some((winner) => winner.isUser) && hasActiveSet(activeProfile, "dorado") ? 1 : 0;
    if (roundCoinBonus) passiveNotes.push("Midas: +1 moneda");
    if (winners.some((winner) => winner.isUser)) commitProfile(advanceMission(profileRef.current, "roundWins"));
    if (roundCoinBonus) setBonusCoinsWon((coins) => coins + roundCoinBonus);
    const winnerIdsForDisplay = winners.map((winner) => winner.id);
    const effectText = effect.description ?? `${effect.value > 0 ? "+" : ""}${effect.value} pts`;
    const outcomeSummary = `${effect.label.toUpperCase()}: ${effectText} · ${message}${passiveNotes.length ? ` · ${passiveNotes.join(" · ")}` : ""}`;
    const sequence = ++resolutionRunRef.current;
    setResolutionStage("bids");
    setResolutionMessage("");
    scheduleGameTimeout(() => {
      if (sequence !== resolutionRunRef.current) return;
      setResolutionStage("loot");
      setRevealedLoot(true);
      playSfx("flip");
      if (onlineMatch && authSession?.user.id === onlineMatch.hostId) void onlineGameChannelRef.current?.send({ type: "broadcast", event: "loot-reveal", payload: { round, lootEffect: effect } });
      scheduleGameTimeout(() => {
        if (sequence !== resolutionRunRef.current) return;
        setMatchPlayers(playersForRound);
        setHandValues(plays.find((play) => play.player.isUser)?.player.hand ?? []);
        setResolutionStage("result");
        setResolutionWinnerIds(winnerIdsForDisplay);
        setRoundScoreChanges(scoreChanges);
        setResolutionMessage(outcomeSummary);
        if (onlineMatch && authSession?.user.id === onlineMatch.hostId) void onlineGameChannelRef.current?.send({ type: "broadcast", event: "round-result", payload: { round, players: playersForRound, winnerIds: winnerIdsForDisplay, scoreChanges, message: outcomeSummary } });
        if (winners.some((winner) => winner.isUser)) playSfx("handWin"); else if (winners.length) playSfx("handLose");
        scheduleGameTimeout(() => {
          if (sequence !== resolutionRunRef.current) return;
          setResolutionMessage("");
          setResolutionStage("idle");
          const nextRound = round + 1;
          if (nextRound > maxRounds) {
            if (onlineMatch && authSession?.user.id === onlineMatch.hostId) void onlineGameChannelRef.current?.send({ type: "broadcast", event: "match-finished", payload: { players: playersForRound } });
            finishMatch(playersForRound, roundCoinBonus);
            return;
          }
          if (onlineMatch && authSession?.user.id !== onlineMatch.hostId) return;
          const dealt = playersForRound.map((player) => ({ ...player, hand: dealHand(onlineMatch ? (onlineMatch.roster.find((member) => member.id === player.id)?.deckIds ?? ["basica"]) : player.isUser ? activeProfile.equippedCards : ["basica"], 5, onlineMatch ? onlineMatch.roster.find((member) => member.id === player.id)?.ownedCards : player.isUser ? activeProfile.ownedCards : undefined) }));
          const nextLootValues = generateLootValues();
          const nextLootEffect = hiddenLootEffects[Math.floor(Math.random() * hiddenLootEffects.length)];
          if (onlineMatch && authSession?.user.id === onlineMatch.hostId) {
            const payload = { round: nextRound, players: dealt, rules: roundRules, lootValues: nextLootValues, lootEffect: nextLootEffect };
            void onlineGameChannelRef.current?.send({ type: "broadcast", event: "round-next", payload });
            onlineRoundAdvanceHandlerRef.current(payload);
            return;
          }
          setRound(nextRound);
          setMatchPlayers(dealt);
          setHandValues(dealt[0].hand);
          setSelected(null);
          setRemoveMode(false);
          setBidPlaced(false);
          setRevealedBids(null);
          setRevealedLoot(false);
          setLootEffect(nextLootEffect);
          setLootValues(nextLootValues);
          setTurnSeconds(30);
          setResolutionWinnerIds([]);
          setRoundScoreChanges([]);
          playSfx("deal");
        }, 2600);
      }, 1200);
    }, 2000);
  };

  const placeBid = (chosenIndex = selected) => {
    if (chosenIndex === null || bidPlaced || resolutionStage !== "idle" || !matchPlayers.length) return;
    if (!onlineMatch) { resolveRound(chosenIndex); return; }
    if (!onlineRoomReady || !authSession || onlineSubmittedBids[authSession.user.id] !== undefined) return;
    const submitted = { match_id: onlineMatch.id, round, player_id: authSession.user.id, card_index: chosenIndex };
    setOnlineSubmittedBids((current) => ({ ...current, [authSession.user.id]: chosenIndex }));
    setSelected(chosenIndex);
    setBidPlaced(true);
    commitProfile(advanceMission(profileRef.current, "bids"));
    playSfx("confirm");
    void onlineGameChannelRef.current?.send({ type: "broadcast", event: "bid", payload: submitted });
  };

  useEffect(() => {
    if (!onlineMatch || !authSession || screen !== "game" || page !== "game" || resolutionStage !== "idle") return;
    if (authSession.user.id !== onlineMatch.hostId || onlineResolvedRoundRef.current === round) return;
    const bidIds = Object.keys(onlineSubmittedBids);
    if (!onlineMatch.roster.every((player) => bidIds.includes(player.id))) return;
    const ownIndex = onlineSubmittedBids[authSession.user.id];
    if (ownIndex === undefined) return;
    onlineResolvedRoundRef.current = round;
    resolveRound(ownIndex, onlineSubmittedBids);
  }, [onlineMatch?.id, authSession?.user.id, onlineSubmittedBids, screen, page, resolutionStage, round]);

  useEffect(() => {
    if (screen === "game" && page === "game" && resolutionStage === "idle" && turnSeconds === 0 && (!bidPlaced || Boolean(onlineMatch && authSession?.user.id === onlineMatch.hostId))) {
      const chosen = selected ?? Math.floor(Math.random() * Math.max(1, handValues.length));
      if (onlineMatch && authSession?.user.id === onlineMatch.hostId && onlineRoomReady) {
        const completedBids = { ...onlineSubmittedBids };
        const ownBidMissing = completedBids[authSession.user.id] === undefined;
        if (ownBidMissing) {
          completedBids[authSession.user.id] = chosen;
          void onlineGameChannelRef.current?.send({ type: "broadcast", event: "bid", payload: { match_id: onlineMatch.id, round, player_id: authSession.user.id, card_index: chosen, automatic: true } });
        }
        for (const player of onlineMatch.roster) {
          if (completedBids[player.id] !== undefined) continue;
          const hand = matchPlayers.find((entry) => entry.id === player.id)?.hand ?? [];
          const fallbackIndex = Math.floor(Math.random() * Math.max(1, hand.length));
          completedBids[player.id] = fallbackIndex;
          void onlineGameChannelRef.current?.send({ type: "broadcast", event: "bid", payload: { match_id: onlineMatch.id, round, player_id: player.id, card_index: fallbackIndex, automatic: true } });
        }
        if (!ownBidMissing && Object.keys(completedBids).length === Object.keys(onlineSubmittedBids).length) return;
        setOnlineSubmittedBids(completedBids);
        setSelected(chosen);
        setBidPlaced(true);
        if (ownBidMissing) commitProfile(advanceMission(profileRef.current, "bids"));
      } else placeBid(chosen);
    }
  }, [screen, page, turnSeconds, bidPlaced, selected, onlineMatch?.id, onlineSubmittedBids, onlineRoomReady, matchPlayers, resolutionStage]);

  if (!authBootComplete || !authSession) {
    return (
      <main className="game-shell start-screen auth-start-screen">
        {fullscreenButton()}
        <div className="ambient ambient-one" />
        <div className="ambient ambient-two" />
        <div className="menu-coin-spark spark-a">✦</div><div className="menu-coin-spark spark-b">✧</div>
        <div className="menu-board-art auth-board-art" aria-hidden="true"><div className="menu-board-card card-one"><GeminiCardFace deckId="cuchillo" value={3} /></div><div className="menu-board-card card-two"><GeminiCardFace deckId="escudo" value={7} /></div><div className="menu-board-card card-three"><GeminiCardFace deckId="dorado" value={5} /></div><img className="menu-board-coin" src={publicAsset("sigma/ui/diamond.png")} alt="" /></div>
        <section className="auth-menu-content">
          <img className="brand-logo-image auth-brand-logo" src={publicAsset("sigma/ui/la-gran-subasta-logo.png")} alt="La gran subasta: El botín" />
          <p className="menu-tagline">Inicia sesión o crea tu cuenta para entrar en la subasta.</p>
          <section className="account-panel auth-entry-card" aria-labelledby="account-entry-title">
            <div className="account-panel-heading"><span><small>BIENVENIDO A LA MESA</small><strong id="account-entry-title">{authMode === "login" ? "INICIAR SESIÓN" : "CREAR CUENTA"}</strong></span></div>
            <div className="account-auth-tabs"><button type="button" className={authMode === "login" ? "active" : ""} onClick={() => { setAuthMode("login"); setAuthMessage(""); }}>INICIAR SESIÓN</button><button type="button" className={authMode === "register" ? "active" : ""} onClick={() => { setAuthMode("register"); setAuthMessage(""); }}>CREAR CUENTA</button></div>
            <form className="account-auth-form" onSubmit={(event) => { event.preventDefault(); void submitEmailAuth(); }}>
              <label htmlFor="entry-email">CORREO ELECTRÓNICO</label><input id="entry-email" type="email" autoComplete="email" required maxLength={254} value={authEmail} onChange={(event) => setAuthEmail(event.target.value)} placeholder="tu@correo.com" />
              <label htmlFor="entry-password">CONTRASEÑA</label><input id="entry-password" type="password" autoComplete={authMode === "register" ? "new-password" : "current-password"} required minLength={8} value={authPassword} onChange={(event) => setAuthPassword(event.target.value)} placeholder="Mínimo 8 caracteres" />
              <button className="account-submit" type="submit" disabled={authBusy || !supabaseConfigured}>{authBusy ? "CONECTANDO…" : authMode === "register" ? "CREAR CUENTA CON CORREO" : "ENTRAR CON CORREO"}</button>
            </form>
            <div className="account-provider-divider"><span>o continúa con</span></div>
            <div className="account-provider-buttons"><button type="button" onClick={() => void signInWithProvider()} disabled={authBusy || !supabaseConfigured}><b>G</b> Continuar con Google</button></div>
            {!supabaseConfigured && <p className="account-feedback" role="status">La conexión de acceso no está configurada en esta versión.</p>}
            {authMessage && <p className="account-feedback" role="status">{authMessage}</p>}
            <small className="account-privacy-note">Tu contraseña la gestiona Supabase Auth; nunca se guarda en el juego.</small>
          </section>
        </section>
      </main>
    );
  }

  if (!usernameChecked || usernameRequired) {
    return (
      <main className="game-shell start-screen auth-start-screen">
        {fullscreenButton()}
        <div className="ambient ambient-one" /><div className="ambient ambient-two" />
        <div className="menu-board-art auth-board-art" aria-hidden="true"><div className="menu-board-card card-one"><GeminiCardFace deckId="cuchillo" value={3} /></div><div className="menu-board-card card-two"><GeminiCardFace deckId="escudo" value={7} /></div><div className="menu-board-card card-three"><GeminiCardFace deckId="dorado" value={5} /></div></div>
        <section className="auth-menu-content username-onboarding">
          <img className="brand-logo-image auth-brand-logo" src={publicAsset("sigma/ui/la-gran-subasta-logo.png")} alt="La gran subasta: El botín" />
          <p className="menu-tagline">Elige tu nick para que los demás te encuentren en la mesa.</p>
          <section className="account-panel auth-entry-card" aria-labelledby="username-title">
            <div className="account-panel-heading"><span><small>IDENTIDAD DE JUGADOR</small><strong id="username-title">TU NOMBRE DE USUARIO</strong></span></div>
            <label className="username-label" htmlFor="player-username">NICK · 5–16 CARACTERES</label>
            <input id="player-username" className="username-input" autoComplete="nickname" maxLength={16} value={usernameDraft} onChange={(event) => { setUsernameDraft(event.target.value.replace(/[^A-Za-z0-9]/g, "")); setUsernameChecked(false); setUsernameMessage(""); }} placeholder="Ejemplo: Capitan123" />
            <small className="username-rules">Solo letras y números, sin espacios ni símbolos. Debe ser único.</small>
            <div className="username-actions"><button type="button" onClick={() => void checkUsernameAvailability()} disabled={socialBusy || !supabaseConfigured}>COMPROBAR NICK</button><button type="button" className="username-next" onClick={() => void saveUsername()} disabled={socialBusy || !usernameChecked}>SIGUIENTE ›</button></div>
            {usernameMessage && <p className={`account-feedback ${usernameMessage.includes("disponible") ? "success" : "error"}`} role="status">{usernameMessage}</p>}
            {!supabaseConfigured && <p className="account-feedback error">El servicio de perfiles no está configurado.</p>}
          </section>
        </section>
      </main>
    );
  }

  if (authSession && !accountWallet) {
    return (
      <main className="game-shell start-screen auth-start-screen">
        {fullscreenButton()}
        <section className="account-panel auth-entry-card" role="status" aria-live="polite">
          <div className="account-panel-heading"><span><small>CUENTA VINCULADA</small><strong>{accountWalletLoading ? "CARGANDO MONEDERO" : "MONEDERO NO DISPONIBLE"}</strong></span></div>
          <p className="account-status">El juego usa un único saldo de cuenta para las partidas contra IA y las partidas online. Conecta con el servidor para continuar.</p>
          {accountWalletMessage && <p className="account-feedback" role="alert">{accountWalletMessage}</p>}
          <button className="account-submit" type="button" onClick={() => void accountWalletRefreshRef.current()} disabled={accountWalletLoading}>{accountWalletLoading ? "CARGANDO…" : "REINTENTAR CONEXIÓN"}</button>
        </section>
      </main>
    );
  }

  if (screen !== "game" && page === "game") {
    const modeTitles: Record<GameMode, string> = { classic: "4P CLÁSICO", teams: "EQUIPOS 2v2", duel: "DUELO 1v1" };
    const selectedRanking = rankingPeriod === "total" ? profile.winsByMode[rankingMode] : profile.winsByPeriod[rankingPeriod][rankingMode];
    const rankingResetAt = rankingPeriod === "weekly" ? profile.winsPeriodResetAt.weekly : profile.winsPeriodResetAt.monthly;
    const rankingPeriodStatus = rankingPeriod === "total" ? "Este ranking no se reinicia nunca." : `Se reinicia en ${formatPeriodRemaining(rankingResetAt - serviceNow)}.`;
    const rankingRows = Object.entries(selectedRanking)
      .map(([id, wins]) => ({ id, name: id === "player" ? profile.name : id, wins, color: id === "player" ? "#42bfd0" : opponents.find((opponent) => opponent.name === id)?.color ?? "#7454c7" }))
      .filter((player) => player.wins > 0)
      .sort((a, b) => b.wins - a.wins || a.name.localeCompare(b.name))
      .slice(0, 50);
    const nameCooldownMs = 30 * 24 * 60 * 60 * 1000;
    const nameCooldownLeft = Math.max(0, nameCooldownMs - (Date.now() - profile.lastNameChange));
    const renameGems = authSession ? (accountWallet?.gems ?? 0) : profile.gems;
    const canChangeName = nameCooldownLeft === 0 && /^[A-Za-z0-9]{5,16}$/.test(profileNameDraft.trim()) && profileNameDraft.trim() !== profile.name && renameGems >= NAME_CHANGE_GEMS;
    const rouletteCooldown = profile.lastSpinTime ? Math.max(0, 24 * 60 * 60 * 1000 - (rouletteNow - profile.lastSpinTime)) : 0;
    const rouletteReady = rouletteCooldown === 0;
    const rouletteTimeLabel = `${Math.floor(rouletteCooldown / 3_600_000)}h ${Math.floor((rouletteCooldown % 3_600_000) / 60_000)}m`;
    const today = new Date(rouletteNow).toDateString();
    const paidSpinsToday = profile.paidSpinDate === today ? profile.paidSpinsToday : 0;
    const paidSpinCost = Math.min(PAID_ROULETTE_BASE_GEMS + paidSpinsToday * PAID_ROULETTE_INCREMENT_GEMS, PAID_ROULETTE_MAX_GEMS);
    const goTo = (next: AppScreen) => {
      playSfx("click");
      setHomeUtilityPanel(null);
      if (next === "settings") setSettingsReturn(screen);
      if (next === "social") { setSocialMessage(""); void refreshSocialData(); void refreshRandomPlayers(); }
      setScreen(next);
    };

    return (
      <main className={`game-shell start-screen ${screen !== "menu" ? "subscreen" : ""}`}>
        {fullscreenButton()}
        <div className="ambient ambient-one" />
        <div className="ambient ambient-two" />
        <div className="menu-coin-spark spark-a">✦</div><div className="menu-coin-spark spark-b">✧</div>
        <section className="menu-player-card">
          <div className={`menu-avatar-frame ${avatarFrameClass(profile.equippedFrame)}`} style={{ "--avatar-fill": profile.equippedAvatarColor } as React.CSSProperties}><AvatarFace avatar={profile.avatar} /></div>
          <div className="menu-profile-copy"><span>CAPITÁN</span><strong>{profile.name}</strong>
            <div className="menu-wallet"><span><img src={publicAsset("sigma/ui/coin.png")} alt="" /> {wallet.coins}</span><span><img src={publicAsset("sigma/ui/diamond.png")} alt="" /> {wallet.gems}</span></div>
          </div>
          <button className="profile-open" onClick={() => goTo("profile")} aria-label="Abrir mi perfil">↗</button>
        </section>
        <div className="menu-season-pill"><span className="season-pill-label"><i className="season-dot" />TEMPORADA MENSUAL</span><b>{new Date(serviceNow).toLocaleDateString("es-ES", { month: "long", year: "numeric" }).toUpperCase()}</b><small>CIERRA EN {formatPeriodRemaining(profile.winsPeriodResetAt.monthly - serviceNow)}</small></div>
        <div className="menu-board-art" aria-hidden="true"><div className="menu-board-card card-one"><GeminiCardFace deckId="cuchillo" value={3} /></div><div className="menu-board-card card-two"><GeminiCardFace deckId="escudo" value={7} /></div><div className="menu-board-card card-three"><GeminiCardFace deckId="dorado" value={5} /></div><img className="menu-board-coin" src={publicAsset("sigma/ui/diamond.png")} alt="" /></div>

        {screen === "menu" ? <>
          <section className="main-menu-content">
            <img className="brand-logo-image menu-brand-logo" src={publicAsset("sigma/ui/la-gran-subasta-logo.png")} alt="La gran subasta: El botín" />
            <p className="menu-tagline">La mesa está lista. ¿Te atreves a pujar?</p>
            <div className="play-mode-actions">
              <button className="play-now-button play-offline-button" onClick={() => { playSfx("click"); setScreen("modes"); }}><span className="play-icon">▶</span><span><strong>JUGAR OFFLINE</strong><small>CON RIVALES IA</small></span><b>›</b></button>
              <button className="play-now-button play-online-button" disabled={!accountWallet} onClick={() => { playSfx("click"); setOnlineQueueMessage(""); setScreen("online-modes"); }}><span className="play-icon">🌐</span><span><strong>JUGAR ONLINE</strong><small>{accountWallet ? "BUSCAR JUGADORES" : "CARGANDO SALDO…"}</small></span><b>›</b></button>
            </div>
            <div className="menu-shortcuts main-menu-shortcuts">
              <button onClick={() => goTo("season-ranking")}><img className="menu-option-icon rank-shortcut-icon" src={rankBadgeUrl("badge_gold_01.png")} alt="" /><span>RANKING DE RANGOS</span></button>
              <button onClick={() => goTo("ranking")}><img className="menu-option-icon" src={publicAsset("sigma/ui/trophy.png")} alt="" /><span>RANKING VICTORIAS</span></button>
              <button onClick={() => goTo("missions")}><span className="menu-option-emoji">🏆</span><span>MISIONES Y RECOMPENSAS</span></button>
              <button onClick={() => { playSfx("click"); setPage("shop"); }}><span className="menu-option-emoji">🃏</span><span>TIENDA / INVENTARIO</span></button>
              <button onClick={() => goTo("profile")}><AvatarFace avatar={profile.avatar} className="menu-option-emoji" /><span>MI PERFIL</span></button>
              <button onClick={() => goTo("settings")}><img className="menu-option-icon" src={publicAsset("sigma/ui/settings.png")} alt="" /><span>AJUSTES</span></button>
            </div>
            <button className="roulette-banner" onClick={() => goTo("roulette")}><span>🎡</span><div><strong>RULETA DIARIA</strong><small>{rouletteReady ? "¡Tienes un giro gratis!" : `Siguiente giro gratis en ${rouletteTimeLabel}`}</small></div><b>GIRAR ›</b></button>
          </section>
          <button className="rules-info-button" onClick={() => { playSfx("click"); setRulesOpen(true); }} aria-label="Cómo se juega"><span>i</span><strong>¿CÓMO SE JUEGA?</strong></button>
          <nav className="home-quick-rail" aria-label="Accesos de temporada">
            <button className="home-quick-button friends-quick-button" onClick={() => goTo("social")} aria-label="Amigos y grupos"><span className="home-quick-icon">👥</span><strong>AMIGOS</strong><i>{friendProfiles.length}</i></button>
            <button className={`home-quick-button event-quick-button ${homeUtilityPanel === "events" ? "active" : ""}`} onClick={() => { playSfx("click"); setHomeUtilityPanel((open) => open === "events" ? null : "events"); }} aria-expanded={homeUtilityPanel === "events"} aria-label="Ver eventos activos"><span className="home-quick-icon">🎉</span><strong>EVENTOS</strong><i>{activeMenuEvents.length}</i></button>
            <button className={`home-quick-button chest-quick-button ${homeUtilityPanel === "chests" ? "active" : ""}`} onClick={() => { playSfx("click"); setHomeUtilityPanel((open) => open === "chests" ? null : "chests"); }} aria-expanded={homeUtilityPanel === "chests"} aria-label={`Ver cofres, ${profile.chests.length} de ${MAX_CHESTS}`}><span className="home-quick-icon"><GameIcon name="chest" size={29} /></span><strong>COFRES</strong><i>{profile.chests.length}/{MAX_CHESTS}</i></button>
          </nav>
          {homeUtilityPanel && <aside className={`home-utility-panel ${homeUtilityPanel}`} aria-label={homeUtilityPanel === "events" ? "Eventos activos" : "Cofres de subasta"}>
            <header><div><span>{homeUtilityPanel === "events" ? "LA MESA ESTÁ EN MOVIMIENTO" : "PREMIOS POR PARTIDA"}</span><strong>{homeUtilityPanel === "events" ? "EVENTOS ACTIVOS" : `COFRES · ${profile.chests.length}/${MAX_CHESTS}`}</strong></div><button onClick={() => setHomeUtilityPanel(null)} aria-label="Cerrar panel">×</button></header>
            {homeUtilityPanel === "events" ? <><div className="home-event-list">{activeMenuEvents.map((event) => { const hours = Math.max(1, Math.ceil((event.endsAt - serviceNow) / 3_600_000)); return <button className="home-event-card" key={event.id} onClick={() => { playSfx("click"); setHomeUtilityPanel(null); setScreen("modes"); }}><span className="home-event-icon">{event.icon}</span><span className="home-event-copy"><small>{event.period} · {hours < 24 ? `${hours} H` : `${Math.ceil(hours / 24)} D`}</small><strong>{event.title}</strong><em>{event.description}</em></span><b className="home-event-reward">{event.rewardText}</b></button>; })}</div><small className="home-utility-footnote">Los eventos se renuevan automáticamente y sus bonus se aplican al ganar.</small></> : <><header className="home-chest-panel-subheader"><span>ESPACIO DE COFRES</span><b>{profile.chests.length}/{MAX_CHESTS}</b></header>{profile.chests.length ? <div className="home-chest-list">{profile.chests.map((chest, index) => { const ready = serviceNow >= chest.readyAt; return <article className={`home-chest-card ${ready ? "ready" : "waiting"}`} key={chest.id}><GameIcon name="chest" size={32} /><span><strong>COFRE {index + 1}</strong><small>{ready ? "LISTO PARA ABRIR" : `EN ${formatCountdown(chest.readyAt - serviceNow)}`}</small></span><button disabled={!ready && wallet.gems < CHEST_SKIP_GEMS} onClick={() => openChest(chest.id, !ready)}>{ready ? "ABRIR" : wallet.gems >= CHEST_SKIP_GEMS ? `ABRIR · ${CHEST_SKIP_GEMS} 💎` : "ESPERAR"}</button></article>; })}</div> : <div className="home-chest-empty"><GameIcon name="chest" size={36} /><span>Completa una partida para conseguir tu primer cofre.</span></div>}{chestNotice && <p className="home-chest-notice" role="status">{chestNotice}</p>}<small className="home-utility-footnote">Apertura gratis tras 10 min · instantánea: {CHEST_SKIP_GEMS} 💎 · 15 💎: 5% · 30 💎: 2% · 60 💎: 0,5% · cosmético raro: 0,1%</small></>}
          </aside>}
          {rulesOpen && <div className="rules-modal-backdrop" onClick={() => setRulesOpen(false)}><section className="rules-modal" role="dialog" aria-modal="true" aria-labelledby="rules-modal-title" onClick={(event) => event.stopPropagation()}><button className="rules-modal-close" onClick={() => setRulesOpen(false)} aria-label="Cerrar reglas">×</button><span className="menu-section-kicker">GUÍA DE LA SUBASTA</span><h2 id="rules-modal-title">CÓMO SE JUEGA</h2><p className="rules-modal-intro">Elige bien cuándo gastar tus cartas: cada ronda cambia el criterio para ganar.</p><div className="rules-mode-grid"><article><strong>CLÁSICO 4P</strong><span>10 rondas · 4 jugadores</span></article><article><strong>EQUIPOS 2v2</strong><span>8 rondas · suma de pujas por equipo</span></article><article><strong>DUELO 1v1</strong><span>5 rondas · cara a cara</span></article></div><ol className="rules-modal-steps"><li><b>1</b><span>Al entrar pagas una entrada de {MATCH_ENTRY_FEE} monedas y recibes una mano de 5 cartas.</span></li><li><b>2</b><span>Tienes 30 segundos para elegir una carta. La regla de la ronda aparece antes de pujar: puede ganar la puja más alta, la más baja, la más cercana al 5 o la carta par más alta.</span></li><li><b>3</b><span>Todos revelan a la vez. La carta jugada se consume y las pasivas individuales y de set se aplican según su descripción.</span></li><li><b>4</b><span>El ganador recibe el botín central. Si hay empate, se divide en puntos enteros y el sobrante va a la banca. La carta sorpresa puede cambiar el valor del botín o aplicar un efecto.</span></li><li><b>5</b><span>Al terminar la partida recibes monedas según el modo y el resultado. Solo quien gana obtiene un cofre; puede abrirse tras 10 minutos o al instante por 25 gemas.</span></li></ol><button className="play-now-button rules-modal-action" onClick={() => setRulesOpen(false)}>¡ENTENDIDO!</button></section></div>}
        </> : screen === "online-modes" ? (
          <section className="menu-subpanel modes-panel online-modes-panel">
            <button className="menu-back-link" onClick={() => { cancelOnlineQueue(); goTo("menu"); }}>‹ VOLVER AL MENÚ</button>
            <span className="menu-section-kicker">MESA MULTIJUGADOR · EN DIRECTO</span><h1>JUGAR ONLINE</h1>
            <p className="entry-fee-note">Emparejamiento en tiempo real · entrada: <strong>{MATCH_ENTRY_FEE} monedas</strong> · saldo de cuenta: {wallet.coins} 🪙</p>
            {partyId && <div className="online-party-summary"><span>🤝</span><div><strong>GRUPO 2v2 · {partyProfiles.length}/2</strong><small>{partyProfiles.map((member) => member.username).join(" + ")}</small></div><button onClick={() => goTo("social")}>GESTIONAR</button></div>}
            <div className="mode-choice-list">
              <button className="mode-choice classic-mode" disabled={!accountWallet || wallet.coins < MATCH_ENTRY_FEE || Boolean(onlineQueueMode)} onClick={() => joinOnlineQueue("classic")}><span className="mode-choice-icon">⚔️</span><span><b>CLÁSICO 4P · ONLINE</b><small>10 rondas · busca 3 jugadores reales</small></span><i>›</i></button>
              <button className="mode-choice teams-mode" disabled={!accountWallet || wallet.coins < MATCH_ENTRY_FEE || Boolean(onlineQueueMode)} onClick={() => joinOnlineQueue("teams")}><span className="mode-choice-icon">🤝</span><span><b>EQUIPOS 2v2 · ONLINE</b><small>8 rondas · juega en grupo o busca un equipo</small></span><i>›</i></button>
              <button className="mode-choice duel-mode" disabled={!accountWallet || wallet.coins < MATCH_ENTRY_FEE || Boolean(onlineQueueMode)} onClick={() => joinOnlineQueue("duel")}><span className="mode-choice-icon">🔥</span><span><b>DUELO 1v1 · ONLINE</b><small>5 rondas rápidas · busca un rival real</small></span><i>›</i></button>
            </div>
            {onlineQueueMode && <div className="online-search-card" role="status"><span className="online-search-orbit">◉</span><div><strong>{onlineQueueMessage || "Buscando jugadores…"}</strong><small>En la cola: {onlineQueueCount} · necesarios: {onlineQueueMode === "duel" ? 2 : 4}</small></div><button onClick={cancelOnlineQueue}>CANCELAR</button></div>}
            <button className="social-inline-link" onClick={() => goTo("social")}>AMIGOS Y GRUPOS 2v2 <b>›</b></button>
          </section>
        ) : screen === "social" ? (
          <section className="menu-subpanel social-panel">
            <button className="menu-back-link" onClick={() => goTo("menu")}>‹ VOLVER AL MENÚ</button>
            <span className="menu-section-kicker">JUEGA CON TU GENTE</span><h1>AMIGOS Y GRUPOS</h1>
            <div className="social-columns">
              <section className="social-list-section"><header><strong>AMIGOS</strong><small>{friendProfiles.length} amigos · {friendProfiles.filter((friend) => onlineUserIds.includes(friend.id)).length} online</small></header>
                {friendships.filter((edge) => edge.status === "pending" && edge.addressee_id === authSession?.user.id).map((edge) => { const sender = pendingFriendProfiles.find((player) => player.id === edge.requester_id); return <article className="social-player-row" key={`request-${edge.requester_id}`}><span className="social-player-avatar"><AvatarFace avatar={sender?.avatar_id ?? "🐱"} /></span><span><strong>{sender?.username ?? "Solicitud recibida"}</strong><small>QUIERE AÑADIRTE</small></span><button onClick={() => void acceptFriendRequest(edge.requester_id)} disabled={socialBusy}>ACEPTAR</button></article>; })}
                {friendProfiles.length ? friendProfiles.map((friend) => <article className="social-player-row" key={friend.id}><span className="social-player-avatar"><AvatarFace avatar={friend.avatar_id} /></span><span><strong>{friend.username}</strong><small><i className={onlineUserIds.includes(friend.id) ? "presence-dot online" : "presence-dot"} />{onlineUserIds.includes(friend.id) ? "EN LÍNEA" : "DESCONECTADO"}</small></span>{partyId && partyProfiles.length < 2 && <button onClick={() => void inviteFriendToParty(friend.id)} disabled={socialBusy}>INVITAR 2v2</button>}<button className="social-remove" onClick={() => void removeFriend(friend.id)} disabled={socialBusy} aria-label={`Eliminar a ${friend.username}`}>×</button></article>) : <p className="social-empty">Todavía no tienes amigos. Descubre jugadores y envíales una solicitud.</p>}
              </section>
              <section className="social-list-section"><header><strong>DESCUBRIR JUGADORES</strong><button className="social-refresh-button" onClick={() => void refreshRandomPlayers()} disabled={socialBusy}>↻ ACTUALIZAR</button></header>
                {socialProfiles.map((candidate) => <article className="social-player-row" key={candidate.id}><span className="social-player-avatar"><AvatarFace avatar={candidate.avatar_id} /></span><span><strong>{candidate.username}</strong><small><i className={onlineUserIds.includes(candidate.id) ? "presence-dot online" : "presence-dot"} />{onlineUserIds.includes(candidate.id) ? "EN LÍNEA" : "JUGADOR"}</small></span><button onClick={() => void sendFriendRequest(candidate.id)} disabled={socialBusy}>AÑADIR</button></article>)}
                {!socialProfiles.length && <p className="social-empty">Pulsa actualizar para descubrir jugadores.</p>}
              </section>
            </div>
            <section className="party-lobby-card"><header><span><small>EQUIPOS 2v2</small><strong>{partyId ? `TU GRUPO · ${partyProfiles.length}/2` : "CREA UN GRUPO DE DOS"}</strong></span>{!partyId && <button onClick={() => void createGameParty()} disabled={socialBusy}>CREAR GRUPO</button>}</header>
              {partyId ? <><div className="party-member-list">{partyProfiles.map((member) => <span key={member.id}><AvatarFace avatar={member.avatar_id} />{member.id === authSession?.user.id ? "TÚ" : member.username}</span>)}</div><button className="party-ready-button" disabled={partyProfiles.length < 2} onClick={() => setScreen("online-modes")}>{partyProfiles.length < 2 ? "INVITA A UN AMIGO PARA CONTINUAR" : "BUSCAR PARTIDA 2v2 ›"}</button><p>Para entrar juntos, ambos miembros deben ponerse en cola en Equipos 2v2.</p></> : <p>Invita a un amigo desde la lista para entrar juntos a una partida online 2v2.</p>}
            </section>
            {partyInvites.filter((invite) => invite.invitee_id === authSession?.user.id).map((invite) => <div className="party-invite-row" key={invite.id}><span>Invitación de grupo 2v2 recibida</span><button onClick={() => void answerPartyInvite(invite.id, true)} disabled={socialBusy}>ACEPTAR</button><button onClick={() => void answerPartyInvite(invite.id, false)} disabled={socialBusy}>RECHAZAR</button></div>)}
            {socialMessage && <p className="account-feedback" role="status">{socialMessage}</p>}
          </section>
        ) : screen === "modes" ? (
          <section className="menu-subpanel modes-panel">
            <button className="menu-back-link" onClick={() => goTo("menu")}>‹ VOLVER AL MENÚ</button>
            <span className="menu-section-kicker">ELIGE CÓMO JUGAR</span><h1>MODOS DE JUEGO</h1>
            <p className="entry-fee-note">Entrada a cada partida: <strong>{MATCH_ENTRY_FEE} monedas</strong> · Monedero de cuenta: {wallet.coins} 🪙</p>
            <div className="mode-choice-list">
            <button className="mode-choice classic-mode" disabled={!accountWallet || wallet.coins < MATCH_ENTRY_FEE} onClick={() => startMatch("classic")}><span className="mode-choice-icon">⚔️</span><span><b>CLÁSICO 4P</b><small>10 rondas · 4 jugadores · premio de victoria: 50 monedas</small></span><i>›</i></button>
              <button className="mode-choice teams-mode" disabled={!accountWallet || wallet.coins < MATCH_ENTRY_FEE} onClick={() => startMatch("teams")}><span className="mode-choice-icon">🤝</span><span><b>EQUIPOS 2v2</b><small>8 rondas · suma las pujas del equipo · premio de victoria: 40 monedas</small></span><i>›</i></button>
              <button className="mode-choice duel-mode" disabled={!accountWallet || wallet.coins < MATCH_ENTRY_FEE} onClick={() => startMatch("duel")}><span className="mode-choice-icon">🔥</span><span><b>DUELO 1v1</b><small>5 rondas rápidas · premio de victoria: 25 monedas</small></span><i>›</i></button>
            </div>
          </section>
        ) : (
          <section className={`menu-subpanel ${screen === "roulette" ? "roulette-panel" : ""}`}>
            <button className="menu-back-link" onClick={() => goTo(screen === "settings" ? settingsReturn : "menu")}>{screen === "settings" && settingsReturn === "game" ? "‹ VOLVER A LA PARTIDA" : "‹ VOLVER AL MENÚ"}</button>
            {screen === "settings" && <>
              <span className="menu-section-kicker">PREFERENCIAS DE JUEGO</span><h1>AJUSTES</h1>
              <label className="setting-row"><span><b>Música</b><small>Banda sonora de la subasta</small></span><input type="checkbox" checked={audioSettings.music} onChange={(event) => { playSfx("click"); setAudioSettings((settings) => ({ ...settings, music: event.target.checked })); }} /></label>
              <label className="setting-volume">Volumen música <input type="range" min="0" max="1" step="0.01" value={audioSettings.musicVolume} onChange={(event) => setAudioSettings((settings) => ({ ...settings, musicVolume: Number(event.target.value) }))} /></label>
              <label className="setting-row"><span><b>Efectos de sonido</b><small>Cartas, botones y resolución</small></span><input type="checkbox" checked={audioSettings.sfx} onChange={(event) => { playSfx("click"); setAudioSettings((settings) => ({ ...settings, sfx: event.target.checked })); }} /></label>
              <label className="setting-volume">Volumen de efectos <input type="range" min="0" max="1" step="0.01" value={audioSettings.sfxVolume} onChange={(event) => setAudioSettings((settings) => ({ ...settings, sfxVolume: Number(event.target.value) }))} /></label>
            </>}
            {screen === "ranking" && <>
              <span className="menu-section-kicker">VICTORIAS POR PERIODO</span><h1>RANKING VICTORIAS</h1>
              <div className="ranking-period-tabs">{(["weekly", "monthly", "total"] as RankingPeriod[]).map((period) => <button key={period} className={rankingPeriod === period ? "active" : ""} onClick={() => { setRankingPeriod(period); playSfx("click"); }}>{period === "weekly" ? "SEMANAL" : period === "monthly" ? "MENSUAL" : "TOTAL"}</button>)}</div>
              <div className="ranking-tabs">{(["classic", "teams", "duel"] as GameMode[]).map((mode) => <button className={rankingMode === mode ? "active" : ""} key={mode} onClick={() => { playSfx("click"); setRankingMode(mode); }}>{modeTitles[mode]}</button>)}</div>
              <div className="ranking-list">{rankingRows.length ? rankingRows.map((player, index) => <div className={`ranking-row rank-${index + 1}`} key={player.id}><b className="ranking-place">{String(index + 1).padStart(2, "0")}</b><span className={`ranking-avatar ${player.id === "player" ? "player-ranking-avatar" : ""}`} style={player.id === "player" ? { "--avatar-fill": profile.equippedAvatarColor } as React.CSSProperties : { background: player.color }}>{player.id === "player" ? <AvatarFace avatar={profile.avatar} /> : "✦"}</span><strong>{player.name}</strong><em>{player.wins} {player.wins === 1 ? "victoria" : "victorias"}</em></div>) : <p className="ranking-empty">Aún no hay victorias en este modo. ¡Juega para entrar en el Top 50!</p>}</div>
              <p className="menu-footnote">{rankingPeriod === "weekly" ? "Semanal" : rankingPeriod === "monthly" ? "Mensual" : "Histórico total"} · {modeTitles[rankingMode]} · Top 50 · solo jugadores con victorias · {rankingPeriodStatus}</p>
            </>}
            {screen === "season-ranking" && <>
              <span className="menu-section-kicker">TEMPORADA {new Date(serviceNow).toLocaleDateString("es-ES", { month: "long", year: "numeric" }).toUpperCase()} · CIERRE EN {formatPeriodRemaining(profile.winsPeriodResetAt.monthly - serviceNow)}</span><h1>RANKING DE RANGOS</h1>
              <p className="season-ranking-intro">Tres progresiones independientes. Tus victorias de este mes suben el rango de cada modalidad; al cierre de temporada se entregan las recompensas y el progreso mensual se reinicia.</p>
              <div className="ranking-tabs">{(["classic", "teams", "duel"] as GameMode[]).map((mode) => <button className={rankingMode === mode ? "active" : ""} key={mode} onClick={() => { playSfx("click"); setRankingMode(mode); }}>{modeTitles[mode]}</button>)}</div>
              {(() => {
                const monthlyRows = Object.entries(profile.winsByPeriod.monthly[rankingMode]).map(([id, wins]) => ({ id, name: id === "player" ? profile.name : id, wins, color: id === "player" ? "#42bfd0" : opponents.find((opponent) => opponent.name === id)?.color ?? "#7454c7" })).filter((row) => row.wins > 0).sort((a, b) => b.wins - a.wins || a.name.localeCompare(b.name)).slice(0, 50);
                return <div className="season-rank-list">{monthlyRows.length ? monthlyRows.map((row, index) => { const rank = rankForWins(row.wins); return <div className={`season-rank-row ${row.id === "player" ? "is-player" : ""}`} key={row.id}><b className="ranking-place">{String(index + 1).padStart(2, "0")}</b><span className={`ranking-avatar ${row.id === "player" ? "player-ranking-avatar" : ""}`} style={row.id === "player" ? { "--avatar-fill": profile.equippedAvatarColor } as React.CSSProperties : { background: row.color }}>{row.id === "player" ? <AvatarFace avatar={profile.avatar} /> : "✦"}</span><img className="season-rank-badge" src={rankBadgeUrl(rank.asset)} alt="" /><strong>{row.name}<small>{rank.name} · fin de mes: +{rank.coins} 🪙 / +{rank.gems} 💎</small></strong><em>{row.wins} {row.wins === 1 ? "victoria" : "victorias"}</em></div>; }) : <p className="ranking-empty">Aún no hay victorias esta temporada en {modeTitles[rankingMode]}.</p>}</div>;
              })()}
              <p className="menu-footnote">Rangos mensuales separados por modalidad · Las recompensas se calculan al cerrar el mes.</p>
            </>}
            {screen === "profile" && <>
              <span className="menu-section-kicker">TU HISTORIA EN LA MESA</span><h1>MI PERFIL</h1>
              <div className="profile-hero"><div className={`menu-avatar-frame large ${avatarFrameClass(profile.equippedFrame)}`} style={{ "--avatar-fill": profile.equippedAvatarColor } as React.CSSProperties}><AvatarFace avatar={profile.avatar} /></div><div><small>CAPITÁN</small><strong>{profile.name}</strong><span>Perfil y victorias</span></div></div>
              <section className="account-panel" aria-labelledby="account-panel-title">
                <div className="account-panel-heading"><span><small>CUENTA ONLINE</small><strong id="account-panel-title">Cuenta vinculada</strong></span><button type="button" onClick={() => void signOutAccount()} disabled={authBusy}>{authBusy ? "CERRANDO…" : "CERRAR SESIÓN"}</button></div>
                <p className="account-status">Conectado como <strong>{authSession?.user.email ?? "cuenta Google"}</strong>. El perfil público se sincroniza con esta cuenta.</p>
                {authMessage && <p className="account-feedback" role="status">{authMessage}</p>}
              </section>
              {authSession && <section className="account-wallet-card" aria-label="Monedero seguro de la cuenta">
                <div className="account-wallet-heading"><span><small>SALDO EN SUPABASE</small><strong>MONEDERO SEGURO DE CUENTA</strong></span><button type="button" onClick={() => void accountWalletRefreshRef.current()} disabled={accountWalletLoading}>{accountWalletLoading ? "ACTUALIZANDO…" : "ACTUALIZAR"}</button></div>
                <div className="account-wallet-balances"><span><img src={publicAsset("sigma/ui/coin.png")} alt="" />{accountWallet?.coins.toLocaleString("es-ES") ?? (accountWalletLoading ? "…" : "—")} <small>MONEDAS</small></span><span><img src={publicAsset("sigma/ui/diamond.png")} alt="" />{accountWallet?.gems.toLocaleString("es-ES") ?? (accountWalletLoading ? "…" : "—")} <small>GEMAS</small></span></div>
                {accountWalletMessage && <p className="account-wallet-message" role="status">{accountWalletMessage}</p>}
                <p className="account-wallet-note">Este saldo se comparte entre partidas contra IA y partidas online. Las monedas y gemas se guardan en la cuenta, no en este navegador.</p>
              </section>}
              <div className="profile-season-ranks"><span className="menu-section-kicker">TUS RANGOS · TEMPORADA ACTUAL</span>{(["classic", "teams", "duel"] as GameMode[]).map((mode) => { const wins = profile.winsByPeriod.monthly[mode].player ?? 0; const rank = rankForWins(wins); return <div className="profile-season-rank" key={mode}><img src={rankBadgeUrl(rank.asset)} alt="" /><span><small>{modeTitles[mode]}</small><strong>{rank.name}</strong><em>{wins} victorias este mes</em><em>{rank.next === Infinity ? "Rango máximo" : `Faltan ${Math.max(0, rank.next - wins)} para ${rank.nextName}`}</em><em>+{rank.coins} 🪙 · +{rank.gems} 💎 al cierre</em></span></div>; })}</div>
              <div className="profile-name-edit"><label htmlFor="captain-name">NOMBRE DE USUARIO</label><div><input id="captain-name" maxLength={16} value={profileNameDraft} onChange={(event) => setProfileNameDraft(event.target.value.replace(/[^A-Za-z0-9]/g, ""))} /><button disabled={!canChangeName || socialBusy} onClick={async () => {
                const nextName = profileNameDraft.trim();
                if (nameCooldownLeft > 0) { setProfileMessage(`Podrás cambiarlo de nuevo en ${Math.ceil(nameCooldownLeft / (24 * 60 * 60 * 1000))} días.`); return; }
                if (!/^[A-Za-z0-9]{5,16}$/.test(nextName) || nextName === profile.name || renameGems < NAME_CHANGE_GEMS || !supabase || !authSession) return;
                setSocialBusy(true);
                const { data, error } = await supabase.rpc("claim_username", { requested_username: nextName });
                if (error || data !== "ok") {
                  const message = data === "taken" ? "Este nick ya existe. Prueba con otro."
                    : data === "cooldown" ? "El cambio de nick tiene un enfriamiento de 30 días."
                    : data === "insufficient_gems" ? "Necesitas 250 gemas en el monedero de cuenta."
                    : error?.message ?? "No se pudo actualizar el nick.";
                  setProfileMessage(message); setSocialBusy(false); return;
                }
                commitProfile({ ...profile, name: nextName, lastNameChange: Date.now() });
                void accountWalletRefreshRef.current();
                setProfileMessage(`Nombre actualizado. Coste: ${NAME_CHANGE_GEMS} gemas del monedero de cuenta.`); setSocialBusy(false); playSfx("handWin");
              }}>CAMBIAR · {NAME_CHANGE_GEMS} 💎</button></div><small>{nameCooldownLeft > 0 ? `Cambio disponible en ${Math.ceil(nameCooldownLeft / (24 * 60 * 60 * 1000))} días.` : "5–16 letras o números. El cambio se puede hacer una vez cada 30 días."}</small>{profileMessage && <small className="profile-feedback">{profileMessage}</small>}</div>
              <div className="profile-stats"><div><b>{profile.winsByMode.classic.player}</b><span>VICTORIAS 4P</span></div><div><b>{profile.winsByMode.teams.player}</b><span>VICTORIAS 2v2</span></div><div><b>{profile.winsByMode.duel.player}</b><span>VICTORIAS 1v1</span></div></div>
              <button className="profile-collection-link" onClick={() => { playSfx("click"); setPage("inventory"); }}>VER MI INVENTARIO <span>›</span></button>
            </>}
            {screen === "missions" && <>
              <span className="menu-section-kicker">DESAFÍOS DE CAPITÁN</span><h1>MISIONES</h1>
              <nav className="mission-tabs" aria-label="Periodo de misiones">{(["diaria", "semanal", "mensual"] as const).map((period) => <button key={period} className={missionTab === period ? "active" : ""} onClick={() => { setMissionTab(period); playSfx("click"); }}>{period === "diaria" ? "DIARIAS" : period === "semanal" ? "SEMANALES" : "MENSUALES"}<small>{profile.missions.filter((mission) => mission.period === period).length} misiones</small></button>)}</nav>
              <div className="mission-list"><section className="mission-group"><h3>MISIONES {missionTab === "diaria" ? "DIARIAS" : missionTab === "semanal" ? "SEMANALES" : "MENSUALES"}</h3>{profile.missions.filter((mission) => mission.period === missionTab).map((mission) => {
                const progress = Math.min(100, (mission.progress / mission.target) * 100);
                const canClaim = mission.progress >= mission.target && !mission.claimed;
                return <article className="mission-card" key={mission.id}><div className="mission-copy"><strong>{mission.desc}</strong><span className={`mission-difficulty ${mission.difficulty.toLowerCase()}`}>{mission.difficulty}</span><span>{mission.progress}/{mission.target}</span></div><div className="mission-track"><i style={{ width: `${progress}%` }} /></div><div className="mission-reward"><small>PREMIO · {mission.rewardAmt} {mission.rewardType === "gems" ? "GEMAS" : "MONEDAS"}</small><button disabled={!canClaim} onClick={() => claimMission(mission.id)}>{mission.claimed ? "COBRADA" : canClaim ? "RECLAMAR" : "EN CURSO"}</button></div></article>;
              })}</section></div>
            </>}
            {screen === "roulette" && <>
              <span className="menu-section-kicker">PREMIOS DE LA MESA</span><h1>RULETA DIARIA</h1>
              <p className="roulette-caption">Un giro gratis cada 24 h. Las gemas son premios raros: 3 💎 (1,2%), 6 💎 (0,3%), 15 💎 (0,1%) y 30 💎 (0,02%). Los giros extra cuestan desde 5 💎 y suben 5 💎 cada vez, hasta un máximo de 25 💎.</p>
              <div className="roulette-wheel-wrap"><span className="roulette-pointer" aria-hidden="true">▼</span><div className={`roulette-wheel ${rouletteSpinning ? "spinning" : ""}`} style={{ transform: `rotate(${rouletteRotation}deg)` }} aria-label="Ruleta con premios de monedas y gemas">
                {roulettePrizes.map((prize, index) => {
                  const angle = index * 30 + 15;
                  const wheelRadius = Math.min(145, Math.max(48, Math.min(window.innerWidth * 0.11, window.innerHeight * 0.18)));
                  return <span key={prize.label} title={`${(prize.weight / roulettePrizes.reduce((sum, item) => sum + item.weight, 0) * 100).toFixed(2)}% de probabilidad`} style={{ transform: `translate(-50%,-50%) rotate(${angle}deg) translateY(-${wheelRadius}px) rotate(${-angle}deg)` }}>{prize.label}</span>;
                })}<i>✦</i>
              </div></div>
              <p className="roulette-status">{rouletteResult || (rouletteReady ? "¡GIRO GRATIS DISPONIBLE!" : `Próximo giro gratis en ${rouletteTimeLabel}`)}</p>
              <p className="roulette-paid-note">Giros extra hoy: {paidSpinsToday} · Próximo coste: {paidSpinCost} 💎 · +5 por giro (máx. 25)</p>
              <button className="play-now-button roulette-spin-button" disabled={rouletteSpinning || (!rouletteReady && wallet.gems < paidSpinCost)} onClick={() => spinRoulette(!rouletteReady)}>{rouletteSpinning ? "GIRANDO…" : rouletteReady ? "TIRAR GRATIS" : `TIRAR · ${paidSpinCost} 💎`}</button>
            </>}
          </section>
        )}
            <div className="menu-footer"><span>✦</span> ARRIESGA APOSTANDO, REVELA Y QUÉDATE CON EL BOTÍN <span>✦</span></div>
      </main>
    );
  }

  if (page !== "game") {
    return (
      <main className="game-shell inventory-shell">
        {fullscreenButton()}
        <div className="ambient ambient-one" />
        <div className="ambient ambient-two" />
        <InventoryPage
          equippedCollections={profile.equippedCards}
          onEquip={equipDeck}
          onPurchase={purchaseDeck}
          ownedCards={profile.ownedCards}
          coins={wallet.coins}
          gems={wallet.gems}
          accountWallet={accountWallet}
          ownedAvatars={profile.ownedAvatars}
          ownedFrames={profile.ownedFrames}
          ownedChatEmotes={profile.ownedChatEmotes}
          onPurchaseChatEmote={purchaseChatEmote}
          equippedFrame={profile.equippedFrame}
          currentAvatar={profile.avatar}
          equippedAvatarColor={profile.equippedAvatarColor}
          onPurchaseCosmetic={purchaseCosmetic}
          onChooseAvatar={chooseAvatar}
          onEquipFrame={equipAvatarFrame}
          mode={page}
          onChangeMode={(mode) => {
            window.location.hash = mode === "shop" ? "tienda" : "inventario";
            setPage(mode);
          }}
          onBack={() => {
            window.location.hash = "";
            setPage("game");
            setScreen("menu");
          }}
        />
      </main>
    );
  }

  return (
    <main className="game-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <header className="top-hud">
        <section className="player-hud" aria-label="Tu puntuación">
          <div className="player-crown">
            <div className={`menu-avatar-frame game-player-avatar ${avatarFrameClass(profile.equippedFrame)}`} style={{ "--avatar-fill": profile.equippedAvatarColor } as React.CSSProperties}><AvatarFace avatar={profile.avatar} /></div>
          </div>
          <div className="player-score">
            <span>TÚ</span>
            <strong>
              {Math.floor(playerScore)} <small>PTS</small>
            </strong>
          </div>
          <div className="gem-count">
            <GameIcon name="gem" size={31} />
            <div>
              <strong>{wallet.gems}</strong>
              <span>GEMAS</span>
            </div>
          </div>
        </section>

        <div className="round-pill">
          <div className="round-count"><span>{gameMode === "duel" ? "DUELO 1v1" : gameMode === "teams" ? "EQUIPOS 2v2" : "CLÁSICO 4P"}</span><strong>RONDA {round} <i>/</i> {maxRounds}</strong></div>
          <div className={`turn-clock ${turnSeconds <= 8 ? "urgent" : ""}`} aria-label={`Quedan ${turnSeconds} segundos para pujar`}>
            <span>⏱</span><strong>{String(turnSeconds).padStart(2, "0")}</strong><small>SEG</small>
            <i><b style={{ width: `${(turnSeconds / 30) * 100}%` }} /></i>
          </div>
        </div>

        <section className="opponents" aria-label="Otros jugadores">
          {matchPlayers.filter((player) => !player.isUser).map((player) => (
            <div className={`opponent-pill ${gameMode === "teams" ? (player.team === 1 ? "ally-pill" : "rival-pill") : ""}`} key={player.id}>
              <div className="avatar opponent-emoji" style={{ background: gameMode === "teams" ? (player.team === 1 ? "#2865a9" : "#a2364d") : "#3d3449" }}>{player.avatar}</div>
              <div>
                <span>{player.name}{gameMode === "teams" ? player.team === 1 ? " · ALIADO" : " · RIVAL" : ""}</span>
                <strong>{Math.floor(player.score)} pts</strong>
              </div>
            </div>
          ))}
        </section>

        <nav className="game-controls" aria-label="Controles del juego">
          {fullscreenButton("fullscreen-control")}
          <button className="abandon-match-button" onClick={() => { resolutionRunRef.current += 1; setResolutionStage("idle"); setResolutionMessage(""); setPanel(null); setMatchResult(null); setOnlineMatch(null); setOnlineSubmittedBids({}); setPage("game"); setScreen("menu"); setTurnSeconds(30); playSfx("click"); }} aria-label="Abandonar partida">
            <span className="abandon-full-label">ABANDONAR PARTIDA</span><span className="abandon-short-label">ABANDONAR</span>
          </button>
          <button
            onClick={() => { playSfx("click"); setPanel(panel === "settings" ? null : "settings"); }}
            aria-label="Ajustes"
          >
            <GameIcon name="settings" size={24} />
          </button>
        </nav>
      </header>

      {panel === "settings" && (
        <div className="mini-panel">
          <strong>AJUSTES</strong>
          <span>Control rápido de audio.</span>
          <>
            <button className="panel-action" onClick={() => setAudioSettings((settings) => ({ ...settings, music: !settings.music }))}>MÚSICA: {audioSettings.music ? "ACTIVA" : "SILENCIADA"}</button>
            <button className="panel-action" onClick={() => setAudioSettings((settings) => ({ ...settings, sfx: !settings.sfx }))}>EFECTOS: {audioSettings.sfx ? "ACTIVOS" : "SILENCIADOS"}</button>
            <button className="panel-action" onClick={() => { setPanel(null); setSettingsReturn("game"); setScreen("settings"); }}>AJUSTES COMPLETOS</button>
          </>
          <button onClick={() => setPanel(null)}>CERRAR</button>
        </div>
      )}

        <section className="table-wrap" aria-label="Mesa de juego">
        <div className="table-rim">
          <div className="gold-inlay" />
          <div className="table-surface">
            <div className="wood-grain grain-one" />
            <div className="wood-grain grain-two" />

            <section className="loot-panel">
              <div className="loot-heading">
                <span className="heading-wing" />
                <div>
                  <span className="phase-kicker">PREMIOS DE ESTA RONDA</span>
                  <h1>FASE DE BOTÍN</h1>
                </div>
                <span className="heading-wing" />
              </div>

              <div className="pot-badge">
                <GameIcon name="spark" size={17} />
                <span>POZO ACTUAL</span>
                <strong>+{lootValues.reduce((sum, value) => sum + value, 0) + carriedPot}</strong>
                <em>PTS</em>
              </div>

            <div className={`round-rule-banner ${resolutionStage}`} aria-live="polite">
              {resolutionStage === "idle" ? <>
                <span>REGLA DE ESTA RONDA</span><strong>{activeRoundRule.label}</strong><small>{activeRoundRule.description}</small>
              </> : resolutionStage === "bids" ? <>
                <span>PUJAS REVELADAS</span><strong>¡TODAS LAS CARTAS SOBRE LA MESA!</strong><small>Comparando las pujas según la regla de esta ronda.</small>
              </> : resolutionStage === "loot" ? <>
                <span>LA SORPRESA SE HA REVELADO</span><strong>{lootEffect.label.toUpperCase()}</strong><small>{lootEffect.description ?? `${lootEffect.value > 0 ? "+" : ""}${lootEffect.value} pts`}</small>
              </> : <>
                <span>RESULTADO · RONDA {round}</span>
                <strong>{(() => {
                  const winners = matchPlayers.filter((player) => resolutionWinnerIds.includes(player.id));
                  const winningTeams = new Set(winners.map((player) => player.team));
                  if (gameMode === "teams" && winningTeams.size === 1) return `¡GANA EL EQUIPO ${winners[0]?.team === 1 ? "AZUL" : "ROJO"}!`;
                  return winners.length === 1 ? `¡${winners[0].name.toUpperCase()} GANA!` : `¡EMPATE ENTRE ${winners.length}!`;
                })()}</strong>
                <div className="round-score-chips">
                  {roundScoreChanges.filter((change) => change.delta !== 0).map((change) => {
                    const player = matchPlayers.find((entry) => entry.id === change.id);
                    if (!player) return null;
                    const signed = change.delta > 0 ? `+${change.delta}` : `−${Math.abs(change.delta)}`;
                    return <span className={resolutionWinnerIds.includes(player.id) ? "winner" : ""} key={change.id}><i className={player.isUser ? "round-result-avatar" : ""} style={player.isUser ? { "--avatar-fill": profile.equippedAvatarColor } as React.CSSProperties : undefined}>{player.isUser ? <AvatarFace avatar={profile.avatar} /> : player.avatar}</i>{player.isUser ? "TÚ" : player.name}<b>{signed} pts</b></span>;
                  })}
                </div>
                <small>{resolutionMessage}</small>
              </>}
            </div>

              <div className="prize-row">
                <PrizeCard type="gem" title="GEMA" points={`+${lootValues[0]} pts`} />
                <PrizeCard type="coin" title="TESORO" points={`+${lootValues[1]} pts`} />
                <PrizeCard type="chest" title="COFRE" points={`+${lootValues[2]} pts`} />
                <PrizeCard type="lock" title={revealedLoot ? lootEffect.label.toUpperCase() : "SECRETO"} points={revealedLoot ? lootEffect.description ?? `${lootEffect.value > 0 ? "+" : ""}${lootEffect.value} pts` : "¿...?"} secret={!revealedLoot} effect={revealedLoot ? lootEffect : undefined} />
              </div>
            </section>

            <section className="revealed-zone" aria-label="Cartas de puja reveladas">
              <div className="zone-label">
                <span>PUJAS REVELADAS</span>
              </div>
              <div className="bid-slots">
                {matchPlayers.map((player, index) => (
                  <div className={`bid-slot ${player.isUser ? "your-slot" : ""}`} key={player.id}>
                    <span className={`bid-player-avatar ${player.isUser ? "you-dot user-bid-avatar" : ""}`} style={player.isUser ? { "--avatar-fill": profile.equippedAvatarColor } as React.CSSProperties : { background: gameMode === "teams" ? player.team === 1 ? "#2865a9" : "#a2364d" : "#43364e" }}>{player.isUser ? <AvatarFace avatar={profile.avatar} /> : player.avatar}</span>
                    <div key={`${animationKey}-${index}`} className={`tiny-card bid-${index + 1} ${revealedBids ? "is-revealed" : ""}`}>
                      {revealedBids ? <GeminiCardFace deckId={revealedBids[index]?.deckId ?? "basica"} value={revealedBids[index]?.value ?? 1} /> : <div className="tiny-card-back">?</div>}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </section>

      {matchResult && <div className="match-end-overlay"><section className="match-end-panel"><span className="menu-section-kicker">{gameMode === "teams" ? "EQUIPOS 2v2" : gameMode === "duel" ? "DUELO 1v1" : "CLÁSICO 4P"} · PARTIDA COMPLETADA</span><h2>{matchResult.title}</h2><p>{matchResult.winner}</p><div className="match-end-rows">{matchResult.rows.map((row, index) => <div key={`${row.name}-${index}`}><span>{index + 1}. {row.name}</span><strong>{Math.floor(row.score)} pts</strong></div>)}</div><div className="match-reward-line">RECOMPENSAS: +{matchResult.coinReward} 🪙 {matchResult.gemReward > 0 ? `· +${matchResult.gemReward} 💎` : ""}</div>{matchResult.eventBonus && <div className="match-event-reward">EVENTO APLICADO · {matchResult.eventBonus}</div>}<div className="match-chest-reward">{matchResult.chestAdded ? "🎁 ¡Has conseguido un cofre!" : matchResult.matchWon ? "🎁 Ya tienes 3 cofres guardados: abre uno para conseguir el siguiente." : "🎁 El cofre de partida es para quien gana."}</div><button className="play-now-button" onClick={() => { const online = Boolean(onlineMatch); setMatchResult(null); setOnlineMatch(null); setOnlineSubmittedBids({}); setPage("game"); setScreen(online ? "online-modes" : "modes"); }}>JUGAR OTRA PARTIDA <b>›</b></button><button className="menu-back-link" onClick={() => { setMatchResult(null); setOnlineMatch(null); setOnlineSubmittedBids({}); setPage("game"); setScreen("menu"); }}>VOLVER AL MENÚ</button></section></div>}

      <section className="hand-zone" aria-label="Tu mano">
        <div className="hand">
          {handValues.map((card, index) => {
            const center = (handValues.length - 1) / 2;
            const rotation = (index - center) * 3.5;
            const offset = Math.abs(index - center) * 5;
            const isSelected = selected === index;
            const value = card.value;
            return (
              <button
                key={`${card.deckId}-${value}-${index}`}
                className={`hand-card gemini-hand-card ${isSelected ? "selected" : ""} ${removeMode ? "remove-target" : ""}`}
                style={
                  {
                    "--rotation": `${rotation}deg`,
                    "--offset": `${offset}px`,
                    "--card-index": index,
                  } as React.CSSProperties
                }
                onClick={() => {
                  if (removeMode) { removeHandCard(index); return; }
                  playSfx("cardSelect");
                  setSelected(isSelected ? null : index);
                  setBidPlaced(false);
                }}
                onMouseEnter={() => { if (!isSelected && !bidPlaced) playSfx("cardHover", 0.45); }}
                disabled={bidPlaced}
                aria-pressed={isSelected}
                aria-label={`${removeMode ? "Retirar" : "Carta"} ${value} · ${cardCollections.find((deck) => deck.id === card.deckId)?.name ?? "Baraja base"}${isSelected ? ", seleccionada" : ""}`}
              >
                <GeminiCardFace deckId={card.deckId} value={value} />
                {(isSelected || removeMode) && <span className="selected-chip">{removeMode ? `RETIRAR · ${removeGemCost} 💎` : "ELEGIDA"}</span>}
              </button>
            );
          })}
        </div>
      </section>

      <div className="game-action-stack">
        {selected !== null && !bidPlaced && !removeMode && handValues[selected] && <div className="selected-passive-preview" role="status"><span>EFECTO DE LA CARTA {handValues[selected].value}</span><strong>{cardEffects[`${handValues[selected].deckId}-${handValues[selected].value}`]?.name ?? "Sin pasiva"}</strong><small>{cardEffects[`${handValues[selected].deckId}-${handValues[selected].value}`]?.description ?? "Esta carta no tiene efecto individual."}</small></div>}
        <button className={`remove-cards-button ${removeMode ? "active" : ""}`} onClick={() => { setRemoveMode((active) => !active); setSelected(null); playSfx("click"); }} disabled={bidPlaced || (!removeMode && wallet.gems < removeGemCost)}>
          <strong>{removeMode ? "CANCELAR RETIRADA" : "REMOVER CARTAS"}</strong>
          <small>{removeMode ? "ELIGE UNA CARTA DE TU MANO" : `COSTE · ${removeGemCost} 💎`}</small>
        </button>
        <button className={`bid-button ${bidPlaced ? "placed" : ""}`} onClick={() => { setRemoveMode(false); placeBid(); }} disabled={selected === null || bidPlaced || removeMode}>
          <span className="bid-sheen" />
          <strong>{bidPlaced ? "¡PUJA LISTA!" : "¡PUJAR!"}</strong>
          <small>{bidPlaced ? `CARTA ${handValues[selected ?? 0]?.value ?? "?"} CONFIRMADA` : selected === null ? "ELIGE UNA CARTA" : `CONFIRMAR CARTA ${handValues[selected]?.value}`}</small>
        </button>
      </div>

      <button className={`live-chat-toggle ${chatOpen ? "active" : ""}`} onClick={() => { if (chatOpen) setChatEmotesOpen(false); setChatOpen((open) => !open); playSfx("click", 0.5); }} aria-expanded={chatOpen} aria-label={chatOpen ? "Cerrar chat" : "Abrir chat de partida"}><span>💬</span><strong>CHAT</strong>{chatConnection === "online" && <i />}</button>
      {chatOpen && <aside className="live-chat-panel" aria-label="Chat de partida">
        <header><div><strong>CHAT DE MESA</strong><span className={chatConnection === "online" ? "chat-status online" : "chat-status"}>{chatConnection === "online" ? "EN LÍNEA" : chatConnection === "connecting" ? "CONECTANDO…" : "MODO LOCAL"}</span></div><button onClick={() => { setChatEmotesOpen(false); setChatOpen(false); }} aria-label="Cerrar chat">×</button></header>
        <div className="live-chat-messages" aria-live="polite">{chatMessages.length === 0 ? <p className="chat-empty">Saluda a la mesa o envía una reacción.</p> : chatMessages.map((message) => { const emote = chatEmotes.find((item) => item.id === message.emoteId); return <article className={`chat-message ${message.isUser ? "mine" : ""}`} key={message.id}><AvatarFace avatar={message.avatar} /><div><strong>{message.isUser ? "Tú" : message.sender}</strong>{message.text && <p>{message.text}</p>}{emote && <ChatEmoteImage emote={emote} className="chat-emote-image" />}<small>{new Date(message.time).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })}</small></div></article>; })}</div>
        <div className="chat-emote-picker" id="chat-emote-picker" hidden={!chatEmotesOpen}><nav className="chat-emote-categories" aria-label="Categorías de emojis">{chatEmoteCategoryTabs.map((tab) => { const count = tab.id === "todos" ? chatEmotes.length : chatEmotes.filter((emote) => emote.category === tab.id).length; return <button key={tab.id} className={chatEmoteCategory === tab.id ? "active" : ""} onClick={() => setChatEmoteCategory(tab.id)}>{tab.label}<small>{count}</small></button>; })}</nav>
        <div className="chat-emote-row" aria-label="Emojis para enviar">{chatEmotes.filter((emote) => chatEmoteCategory === "todos" || emote.category === chatEmoteCategory).map((emote) => { const owned = profile.ownedChatEmotes.includes(emote.id); return <button key={emote.id} className={!owned ? "locked" : ""} disabled={!owned} onClick={() => sendLiveChat({ emoteId: emote.id })} aria-label={owned ? `Enviar emote ${emote.label}` : `${emote.label}, bloqueado; se compra en la tienda`} title={owned ? emote.label : `${emote.label} · BLOQUEADO`}><ChatEmoteImage emote={emote} />{!owned && <span className="chat-emote-lock" aria-hidden="true">🔒</span>}</button>; })}</div></div>
        <form className="chat-compose" onSubmit={(event) => { event.preventDefault(); sendLiveChat({ text: chatDraft }); setChatDraft(""); }}><button className={`chat-emoji-toggle ${chatEmotesOpen ? "active" : ""}`} type="button" onClick={() => setChatEmotesOpen((open) => !open)} aria-label={chatEmotesOpen ? "Ocultar emojis" : "Mostrar emojis"} aria-expanded={chatEmotesOpen} aria-controls="chat-emote-picker">☺</button><input maxLength={180} value={chatDraft} onChange={(event) => setChatDraft(event.target.value)} placeholder="Escribe a la mesa…" aria-label="Mensaje de chat" /><button className="chat-send-button" disabled={!chatDraft.trim()} type="submit">ENVIAR</button></form>
      </aside>}
    </main>
  );
}
