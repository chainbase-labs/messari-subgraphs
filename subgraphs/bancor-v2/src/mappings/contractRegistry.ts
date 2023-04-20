import {
  AddressUpdate,
  ContractRegistryContract,
  OwnerUpdate as ContractRegistryOwnerUpdate,
} from "../../generated/ContractRegistryContract/ContractRegistryContract";
import { _ContractRegistry } from "../../generated/schema";
import { Address } from "@graphprotocol/graph-ts";

// Contract Registry events
export function handleAddressUpdate(event: AddressUpdate): void {
  const contractAddress = event.params._contractAddress;
  const contractNameHex = event.params._contractName;
  let contractRegistry = _ContractRegistry.load(event.address.toHexString());
  const contractRegistryContract = ContractRegistryContract.bind(event.address);
  let names: Array<string>, addresses: Array<string>;
  if (!contractRegistry) {
    contractRegistry = new _ContractRegistry(event.address.toHexString());
    const res = contractRegistryContract.try_owner();
    if (!res.reverted) {
      contractRegistry.owner = res.value.toHexString();
    } else {
      contractRegistry.owner = Address.zero().toHexString();
    }
    names = [];
    addresses = [];
  } else {
    names = contractRegistry.contractNames;
    addresses = contractRegistry.contractAddresses;
  }

  //update ContractRegistry
  const idx = names.indexOf(contractNameHex.toString());
  if (idx == -1) {
    names.push(contractNameHex.toString());
    addresses.push(contractAddress.toHexString());
  } else {
    addresses[idx] = contractAddress.toHexString();
  }
  contractRegistry.contractNames = names;
  contractRegistry.contractAddresses = addresses;
  contractRegistry.save();

  //update ConverterFactoy Entity
}

export function handleContractRegistryOwnerUpdate(
  event: ContractRegistryOwnerUpdate
): void {
  let contractRegistryEntity = _ContractRegistry.load(
    event.address.toHexString()
  );
  if (!contractRegistryEntity) {
    contractRegistryEntity = new _ContractRegistry(event.address.toHex());
  }
  contractRegistryEntity.owner = event.params._newOwner.toHex();
  contractRegistryEntity.save();
}
