import {
  AddressUpdate,
  OwnerUpdate as ContractRegistryOwnerUpdate,
} from "../../generated/ContractRegistryContract/ContractRegistryContract";
import { _ContractRegistry, DexAmmProtocol } from "../../generated/schema";
import { getOrCreateProtocol } from "./helper";

// Contract Registry events
export function handleAddressUpdate(event: AddressUpdate): void {
  const contractRegistryEntity = new _ContractRegistry(event.address.toHex());
  const protocolName = event.params._contractName.toString();
  const protocolAddress = event.params._contractAddress.toHex();

  if (protocolName == "BancorConverterRegistry") {
    const protocols =
      (contractRegistryEntity.converterRegistries as Array<string>) ||
      ([] as Array<string>);
    getOrCreateProtocol(protocolAddress, protocolName, "") as DexAmmProtocol;

    protocols.push(event.params._contractAddress.toHexString());
    contractRegistryEntity.converterRegistries = protocols;
  }
  contractRegistryEntity.save();
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
