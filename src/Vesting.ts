import {
  ECreateVest,
  EUpdateVest,
  EWithdraw,
  Transfer
} from "../generated/Vesting/Vesting02";
import { ZERO_DEC, normalize, DELIMITER, ZERO_ADDR, getPool } from "./utils";
import { DPool, Vest } from "../generated/schema";
import { Vesting02 as VestContract } from "../generated/Vesting/Vesting02";
import { Address } from "@graphprotocol/graph-ts";
import { ERC20 } from "../generated/cDAIPool/ERC20";

export function handleCreateVest(event: ECreateVest): void {
  let pool = getPool(event.params.pool.toHex());
  let stablecoinContract = ERC20.bind(Address.fromString(pool.stablecoin));
  let stablecoinDecimals: number = stablecoinContract.decimals();

  let depositEntityID = event.params.pool.toHex() + DELIMITER + event.params.depositID.toString();
  let vest = new Vest(event.params.vestID.toString());
  vest.pool = event.params.pool.toHex();
  vest.deposit = depositEntityID;
  vest.owner = event.params.to.toHex();
  vest.lastUpdateTimestamp = event.block.timestamp;
  vest.accumulatedAmount = ZERO_DEC;
  vest.withdrawnAmount = ZERO_DEC;
  vest.vestAmountPerStablecoinPerSecond = normalize(event.params.vestAmountPerStablecoinPerSecond, 36 - stablecoinDecimals);
  vest.save()
}

export function handleUpdateVest(event: EUpdateVest): void {
  let vest = Vest.load(event.params.vestID.toString());
  if (vest != null) {
    let vestContract = VestContract.bind(event.address);
    let vestStruct = vestContract.getVest(event.params.vestID);
    let pool = getPool(vestStruct.pool.toHex());
    let stablecoinContract = ERC20.bind(Address.fromString(pool.stablecoin));
    let stablecoinDecimals: number = stablecoinContract.decimals();

    vest.lastUpdateTimestamp = event.block.timestamp;
    vest.accumulatedAmount = normalize(vestStruct.accumulatedAmount);
    vest.vestAmountPerStablecoinPerSecond = normalize(vestStruct.vestAmountPerStablecoinPerSecond, 36 - stablecoinDecimals);
    vest.save()
  }
}

export function handleWithdraw(event: EWithdraw): void {
  let vest = Vest.load(event.params.vestID.toString());
  if (vest != null) {
    vest.withdrawnAmount = vest.withdrawnAmount.plus(normalize(event.params.withdrawnAmount));
    vest.save();
  }
}

export function handleTransfer(event: Transfer): void {
  if (
    event.params.from.equals(ZERO_ADDR) ||
    event.params.to.equals(ZERO_ADDR)
  ) {
    // mint or burn, ignore
    return;
  }
  let vest = Vest.load(event.params.tokenId.toString());
  if (vest != null) {
    vest.owner = event.params.to.toHex();
    vest.save();
  }
}
