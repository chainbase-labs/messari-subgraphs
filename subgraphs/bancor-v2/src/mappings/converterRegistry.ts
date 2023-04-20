import { getOrCreateSmartToken } from "./helper";
import { ConverterAnchorAdded } from "../../generated/ConverterRegistry1/ConverterRegistry1";

// Converter Registry events

export function handleConverterAnchorAdded(event: ConverterAnchorAdded): void {
  const protocolAddress = event.address.toHexString();
  const anchorAddress = event.params._anchor;
  getOrCreateSmartToken(
    protocolAddress,
    anchorAddress,
    event.block.timestamp,
    event.block.number
  );
}
