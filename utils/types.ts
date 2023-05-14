export type TAd = {
  adCreative: string;
  name: string;
  owner: `0x${string}`;
  paused: boolean;
  metadata: {
    description: string;
    image: string;
    name: string;
  };
};
