import { ESetParamUint } from "../generated/MPHMinter/MPHMinter";
import { ERC20 } from "../generated/MPHMinter/ERC20";
import { DPool } from "../generated/schema";
import { getTokenDecimals, keccak256, normalize } from "./utils";
import { Address } from "@graphprotocol/graph-ts";

export function handleESetParamUint(event: ESetParamUint): void {
  let pool = DPool.load(event.params.pool.toHex());
  if (pool == null) {
    return;
  }
  let stablecoinDecimals: number = getTokenDecimals(
    Address.fromString(pool.stablecoin)
  );
  let paramName = event.params.paramName;
  if (paramName == keccak256("poolDepositorRewardMintMultiplier")) {
    pool.poolDepositorRewardMintMultiplier = normalize(
      event.params.newValue,
      36 - stablecoinDecimals
    );
  } else if (paramName == keccak256("poolFunderRewardMultiplier")) {
    pool.poolFunderRewardMultiplier = normalize(
      event.params.newValue,
      36 - stablecoinDecimals
    );
  }
  pool.save();
}
