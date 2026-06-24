import Navbar from "@/components/home/Navbar";
import FeaturedGame from "@/components/home/FeaturedGame";
import GameSection from "@/components/home/GameSection";
import JackpotBanner from "@/components/home/JackpotBanner";
import BottomNav from "@/components/home/BottomNav";
import PageWrapper from "@/components/PageWrapper";

// ── Data ──────────────────────────────────────────────────────────────────────

const EVOPLAY_GAMES = [
  { id: "egypt-gods", title: "Egypt Gods", provider: "Evoplay", rtp: 96, bannerUrl: "/games-banner/aviator.jpg", gameLink: "/aviator" },
  { id: "penalty", title: "Penalty Shoot-out: Street", provider: "Evoplay", rtp: 97, bannerUrl: "/games-banner/color-cover.jpg", gameLink: "color-game" },
  { id: "magic-wheel", title: "Magic Wheel", provider: "Evoplay", rtp: 95, bannerUrl: "/games-banner/HeadsTails_270x270.jpg", gameLink: "/heads-tails" },
  // { id: "scratch", title: "Scratch Match", provider: "Evoplay", rtp: 96 },
  // { id: "bingo-task", title: "Bingo Task", provider: "Evoplay", rtp: 95 },
];

const POPULAR_GAMES = [
  { id: "aviator", bannerUrl: "/games-banner/rummy.jpeg", title: "Rummy", provider: "Spribe", rtp: 97, badge: "hot" },
  { id: "jetx", bannerUrl: "/games-banner/teen-pati.jpeg", title: "Teen Pati", provider: "SmartSoft", rtp: 97, badge: "hot" },
  { id: "chicken", bannerUrl: "/games-banner/casino.jpeg", title: "Casino", provider: "InOut", rtp: 96, badge: "hot" },
  // { id: "plinko", title: "Plinko", provider: "Spribe", rtp: 97, badge: "hot" },
  // { id: "mines", title: "Mines", provider: "Spribe", rtp: 97, badge: "hot" },
];

const NEW_GAMES = [
  { id: "starburst", bannerUrl: "/games-banner/lottery.jpeg", title: "Lottery", provider: "NetEnt", rtp: 96.3 },
  { id: "gates", bannerUrl: "/games-banner/football.jpeg", title: "Football", provider: "Pragmatic", rtp: 96.5 },
  // { id: "sweet", title: "Sweet Bonanza", provider: "Pragmatic", rtp: 96.5 },
  // { id: "wolf", title: "Wolf Gold", provider: "Pragmatic", rtp: 96 },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CasinoHomePage() {
  return (
    <div className="min-h-screen bg-[#0f1117] text-white">
      {/* Top navigation bar */}
      <Navbar />

      {/* Scrollable content — pb ensures content isn't hidden behind bottom nav */}
      {/* <PageWrapper> */}
      {/* Featured / hero game */}
      <FeaturedGame
        title="Heads & Tails"
        provider="Evoplay"
        rtp={96}
        imageUrl=""
        category="Casino"
      />

      {/* More from Evoplay */}
      <GameSection
        title="More from Evoplay"
        games={EVOPLAY_GAMES}
        cardSize="sm"
      />

      {/* Popular Games */}
      <GameSection
        title="Casinos"
        games={POPULAR_GAMES}
        cardSize="sm"
      />



      {/* Live Casino section */}
      <GameSection
        title="Live Casino"
        games={[
          { id: "baccarat", bannerUrl: "/games-banner/royal-game.jpeg", title: "Royal Game", provider: "Evolution", rtp: 98.9 },
          { id: "roulette", bannerUrl: "/games-banner/superAce.jpeg", title: "Super Ace", provider: "Evolution", rtp: 97.3 },
          { id: "blackjack", bannerUrl: "/games-banner/yn77.jpeg", title: "YN 77", provider: "Evolution", rtp: 99.5 },
        ]}
        cardSize="sm"
      />

      {/* New Games */}
      <GameSection
        title="Sports"
        games={NEW_GAMES}
      
        cardSize="sm"
      />
      {/* Jackpot counter */}
      <JackpotBanner />
      {/* </PageWrapper> */}

      {/* Fixed bottom tab bar */}
      <BottomNav />
    </div>
  );
}
