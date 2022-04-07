import { BigDecimal, Address, ethereum, log } from "@graphprotocol/graph-ts";

import {
  Transfer
} from "../generated/MPHToken/MPHToken";

import {
  MPHTransfer 
} from "../generated/schema";

export function handleTransfer(event: Transfer): void {
	let newtransfer = new MPHTransfer(event.transaction.hash.toHex() + '-' + event.logIndex.toString())
	newtransfer.from = event.params.from
	newtransfer.to = event.params.to
	newtransfer.amount = event.params.value
	newtransfer.txhash = event.transaction.hash.toHexString()
	newtransfer.save()

}