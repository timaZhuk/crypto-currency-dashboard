import CoinOverview from "@/components/home/CoinOverview";
import {
  CoinOverviewFallback,
  TrendingCoinsFallback,
} from "@/components/home/fallbacks";
import TrendingCoins from "@/components/home/TrendingCoins";
import { Suspense } from "react";

const Page = async () => {
  //----symbol of coin

  //trading coins list

  return (
    <main className="main-conatainer">
      <section className="home-grid">
        {/* Coin Overview */}
        <Suspense
          fallback={
            <div>
              <CoinOverviewFallback />
            </div>
          }
        >
          <CoinOverview />
        </Suspense>
        {/* Trending Table of Crypto Coins */}
        <Suspense
          fallback={
            <div>
              <TrendingCoinsFallback />
            </div>
          }
        >
          <TrendingCoins />
        </Suspense>
      </section>
      {/* List of Categories */}
      <section className="w-full mt-7 space-y-4">
        <p>Categories</p>
      </section>
    </main>
  );
};

export default Page;
