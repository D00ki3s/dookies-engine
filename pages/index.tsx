import Head from "next/head";
import styles from "../styles/Home.module.css";
import { useState, useEffect } from "react";
import { TAd } from "../utils/types";
import { abi } from "../contracts/dookiesAbi.json";
import {
  Contract,
  InfuraProvider,
  JsonRpcProvider,
  getDefaultProvider,
} from "ethers";

const AD_ROTATION_TIME = 10000; // 10 seconds

export default function Home() {
  const [adIndex, setAdIndex] = useState<number>(0);
  const [ads, setAds] = useState<TAd[]>([
    {
      name: "Dookies",
      owner: "0x",
      paused: false,
      adCreative:
        "https://ipfs.io/ipfs/bafyreidserj6273qknetwkanbtolhbqf4j2xa37wnwb4epp2nlztmxgh6i/metadata.json",
      metadata: {
        description: "Dookies is a native Web3 native ad engine",
        image:
          "https://ipfs.io/ipfs/bafybeia2wj3kmqrppfzvjdhpe6kfwgkje5cnnzshncz3ycsidmkomjd6qy/_077fa265-d3f6-489e-b2db-8ecc1948a9a3.jpeg",
        name: "Welcome to Dookies!",
      },
    },
    {
      name: "Aave GHO stablecoin",
      owner: "0x",
      paused: false,
      adCreative:
        "https://ipfs.io/ipfs/bafyreibrb7kmpcfdoav5zmvxw7o6u6fqctbfajyfhq2zo7uecpoamw6imm/metadata.json",
      metadata: {
        description: "The next gen stablecoin!",
        image:
          "https://ipfs.io/ipfs/bafybeigbax4xv3nq5xozuw5nxy65qb436kv27s277xe3b2kszwhx4bnw7m/FomgBC_aYAEaSrS.jpg",
        name: "Aave GHO stablecoin",
      },
    },
  ]);

  useEffect(() => {
    async function getAds() {
      const provider = new JsonRpcProvider("https://rpc.sepolia.org/");
      const dookiesContract = new Contract(
        "0x0b6698f5833D8E262E604afC8aDf6CaB2cED365b",
        abi,
        provider
      );
      const contractAds = await dookiesContract.getAllAdCampaigns();
      console.log({ contractAds });
    }
    getAds();
  }, []);

  useEffect(() => {
    // Set up the timer to rotate the ad
    const interval = setInterval(() => {
      setAdIndex((prevIndex) => (prevIndex + 1) % ads.length);
    }, AD_ROTATION_TIME);

    // Clean up the timer when the component unmounts or the ad array changes
    return () => clearInterval(interval);
  }, [ads]);

  const ad = ads[adIndex];

  return (
    <div className={styles.container}>
      <Head>
        <title>Dookies</title>
        <meta name="description" content="Web3 native ad engine" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <a href={ad.adCreative} className={styles.ad}>
          <div
            className={styles.image}
            style={{ backgroundImage: `url(${ad.metadata.image})` }}
          >
            <div className={styles.overlay}>
              <h3 className={styles.title}>{ad.name}</h3>
              <p className={styles.description}>{ad.metadata.description}</p>
              <div className={styles.byDookies}>
                Powered by <span className={styles.logo}>Dookies</span>
              </div>
            </div>
          </div>
        </a>
      </main>
    </div>
  );
}
