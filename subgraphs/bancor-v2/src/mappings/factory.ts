import { NewConverter } from "../../generated/ConverterFactory1/ConverterFactory";
import { NewConverter as NewConverter2 } from "../../generated/ConverterFactory2/ConverterFactory2";

export function handleNewConverter(event: NewConverter): void {
  const converter = event.params._converter;
  const owner = event.params._owner;
}

export function handleNewConverter2(event: NewConverter2): void {
  const type = event.params._type;
  const converter = event.params._converter;
  const owner = event.params._owner;
}
