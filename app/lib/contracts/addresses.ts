export const ALLOY_ADDRESSES = {
  chainId: 84532,
  network: "Base Sepolia",
  rpcUrl: "https://sepolia.base.org",
  blockExplorer: "https://sepolia.basescan.org",
  contracts: {
    MockB20_AAPLc: "0x5B57069627a99E79d852C3A156886E0Db9e703a8" as `0x${string}`,
    MockB20_NVDAc: "0x6c42b4049dA39216d49Da72AA6B199D7aF877fF6" as `0x${string}`,
    MockB20_COINc: "0xC766102E8140E46dfB12b01Ab79667df1D38C724" as `0x${string}`,
    Mock_USDC: "0xb15cbEc963EC9791dF96ca60e5b73E7202511747" as `0x${string}`,
    Mock_cNGN: "0xe1D6e244632Cbb1d89cE2Da1e21Ec83FCCb63656" as `0x${string}`,
    Mock_CLANKER: "0xf73716899193ce90377631Aa00DCD9C6eDB19aF8" as `0x${string}`,
    Mock_HIGHER: "0x7E394E4C40D029ec15dE7Db1224a0858dAFA76dB" as `0x${string}`,
    Mock_DEGEN: "0xE588DAa5b526694B149eBCAf0042d1009CA7e7FE" as `0x${string}`,
    Mock_DEX: "0x15bCFD66af185c97CB99dfe0a2d2d3c027Da6DF1" as `0x${string}`,
    ERC5564_Announcer: "0xBd809F5Fef1dB656cc3b38386C31aA64D1a967F5" as `0x${string}`,
    ERC6538_Registry: "0xf54e5c0A08CEf9263dd3c24dd1cbdFaaEe353F6B" as `0x${string}`,
    Mock_L2Resolver: "0x1ab326aF806bE8Fb95F051A7347184242E3D1328" as `0x${string}`,
    Alloy_BasenameResolver: "0xD5687794c8E1b69F477911Df56170679CB6414eC" as `0x${string}`,
    Alloy_StealthRelayer: "0xc9d7d371bEc6aafeC73C202821A75b230Ad00D24" as `0x${string}`,
    Alloy_HarvestRouter: "0x22fd6f7283aF20815980228F563a17F21B25C359" as `0x${string}`,
  },
  demoAccounts: {
    bob: {
      basename: "bob.base.eth",
      address: "0x00000000000000000000000000000000000B0b01" as `0x${string}`,
      stealthMetaAddress:
        "st:eth:0x0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f8179802c6047f9441ed7d6d3045406e95c07cd85c778e4b8cef3ca7abac09b95c709ee5",
    },
  },
} as const;

export type SupportedStockSymbol = "AAPLc" | "NVDAc" | "COINc";
export type SupportedStableSymbol = "USDC" | "cNGN";
export type SupportedMemeSymbol = "CLANKER" | "HIGHER" | "DEGEN";
export type SupportedCurrency = "USD" | "EUR" | "NGN" | "GBP";
