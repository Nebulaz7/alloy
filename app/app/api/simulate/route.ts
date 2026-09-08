import { NextRequest, NextResponse } from "next/server";
import { createWalletClient, createPublicClient, http, parseUnits } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";
import { ALLOY_ADDRESSES, SupportedStockSymbol } from "@/lib/contracts/addresses";
import { B20_STOCK_ABI } from "@/lib/contracts/abis";

const OPERATOR_ROLE = "0x97667070c54ef182b0f5858b034beac1b6f3089aa2d3188bb1e8929f4fa9b929" as `0x${string}`;

const ACCESS_CONTROL_ABI = [
  {
    type: "function",
    name: "hasRole",
    inputs: [
      { name: "role", type: "bytes32" },
      { name: "account", type: "address" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "grantRole",
    inputs: [
      { name: "role", type: "bytes32" },
      { name: "account", type: "address" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const stockSymbol: SupportedStockSymbol = body.stockSymbol || "AAPLc";
    const dividendAmount: string = body.dividendAmount || "2.50";
    const stockPrice: string = body.stockPrice || "200.00";
    const userAddress: `0x${string}` | undefined = body.userAddress;

    const privKey = (process.env.OPERATOR_PRIVATE_KEY ||
      "0xb3958653694baa209e1d36b1b76df55bd1e84e29366249246c7111ed57f64cd2") as `0x${string}`;

    const account = privateKeyToAccount(privKey);

    const publicClient = createPublicClient({
      chain: baseSepolia,
      transport: http("https://sepolia.base.org"),
    });

    const walletClient = createWalletClient({
      account,
      chain: baseSepolia,
      transport: http("https://sepolia.base.org"),
    });

    const stockAddress =
      stockSymbol === "AAPLc"
        ? ALLOY_ADDRESSES.contracts.MockB20_AAPLc
        : stockSymbol === "NVDAc"
        ? ALLOY_ADDRESSES.contracts.MockB20_NVDAc
        : ALLOY_ADDRESSES.contracts.MockB20_COINc;

    // Optional: grant OPERATOR_ROLE to user address so they can also sign directly
    if (userAddress && userAddress.startsWith("0x")) {
      try {
        const hasRole = await publicClient.readContract({
          address: stockAddress,
          abi: ACCESS_CONTROL_ABI,
          functionName: "hasRole",
          args: [OPERATOR_ROLE, userAddress],
        });

        if (!hasRole) {
          const grantTx = await walletClient.writeContract({
            address: stockAddress,
            abi: ACCESS_CONTROL_ABI,
            functionName: "grantRole",
            args: [OPERATOR_ROLE, userAddress],
          });
          await publicClient.waitForTransactionReceipt({ hash: grantTx });
        }
      } catch (err) {
        console.warn("Could not auto-grant operator role to user:", err);
      }
    }

    // Execute distributeDividend as authorized operator
    const divWei = parseUnits(dividendAmount, 18);
    const priceWei = parseUnits(stockPrice, 18);

    const hash = await walletClient.writeContract({
      address: stockAddress,
      abi: B20_STOCK_ABI,
      functionName: "distributeDividend",
      args: [divWei, priceWei],
    });

    await publicClient.waitForTransactionReceipt({ hash });

    return NextResponse.json({
      success: true,
      txHash: hash,
      stockSymbol,
      dividendAmount,
      stockPrice,
      message: `Dividend of $${dividendAmount}/share successfully distributed on Base Sepolia!`,
    });
  } catch (error: any) {
    console.error("Simulation API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to distribute dividend",
      },
      { status: 500 }
    );
  }
}
