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
const defaultPrefs = [
  "0x311ece950f9ec55757eb95f3182ae5e2",
  "0x1cde61966decb8600dfd0749bd371f12",
  "0x7fa46f9ad7e19af6e039aa72077064a1",
  "0x94bf7aea2a6a362e07e787a663271348",
  "0x3a03c9231f9b3811f71fd268a7c8b906",
  "0xff7653240feecd7448150005a95ac86b",
];

export default function Home() {
  const [adIndex, setAdIndex] = useState<number>(0);
  const [userPreferences, setUserPreferences] = useState<string[]>([]);

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
    async function getPreferences() {
      const prefsRes = await fetch("http://localhost:4500/me", {
        credentials: "include",
      });
      try {
        const prefs = await prefsRes.json();
        setUserPreferences(prefs.groups);
      } catch (error) {
        setUserPreferences(defaultPrefs);
      }
    }
    getPreferences();
  }, []);

  useEffect(() => {
    async function getAds() {
      const provider = new JsonRpcProvider("https://rpc.sepolia.org/");
      const dookiesContract = new Contract(
        "0x0b6698f5833D8E262E604afC8aDf6CaB2cED365b",
        abi,
        provider
      );
      const contractAds = await dookiesContract.getAllAdCampaigns();
      const allAds = contractAds.map(([name, _, ipfsUrl]: string[]) => ({
        name,
        ipfsUrl,
      }));

      const adsWithMetadata = await Promise.all(
        allAds?.map(async (ad: any) => {
          const ipfsPath = ad.ipfsUrl.split("ipfs://")[1];
          const metadataRes = await fetch("https://ipfs.io/ipfs/" + ipfsPath);
          const metadata = await metadataRes.json();
          return {
            ...ad,
            metadata: {
              ...metadata,
              image:
                "https://ipfs.io/ipfs/" + metadata.image.split("ipfs://")[1],
            },
          };
        }) ?? []
      );

      const filteredAds = adsWithMetadata?.filter((ad) =>
        ad.metadata.properties.targetedGroups?.find((group: string) =>
          userPreferences.includes(group)
        )
      );

      console.log("filteredAds", filteredAds);

      setAds(filteredAds);
    }
    getAds();
  }, [userPreferences]);

  useEffect(() => {
    // Set up the timer to rotate the ad
    const interval = setInterval(() => {
      setAdIndex((prevIndex) => (prevIndex + 1) % ads.length);
    }, AD_ROTATION_TIME);

    // Clean up the timer when the component unmounts or the ad array changes
    return () => clearInterval(interval);
  }, [ads]);

  const ad = ads[adIndex] as any;
  return (
    <div className={styles.container}>
      <Head>
        <title>Dookies</title>
        <meta name="description" content="Web3 native ad engine" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <a
          href={ad.metadata?.properties?.adUrl}
          className={styles.ad}
          target="_blank"
        >
          <div
            className={styles.image}
            style={{ backgroundImage: `url(${ad.metadata.image})` }}
          >
            <div className={styles.overlay}>
              <h3 className={styles.title}>{ad.name}</h3>
              <p className={styles.description}>{ad.metadata.description}</p>
            </div>
          </div>
        </a>
      </main>
    </div>
  );
}
