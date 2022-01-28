/** Wrapper to limit keyof type options to fields of specified type
 *  E.g. KeysOfType<T, boolean> will return only boolean fields of T
 */
export type KeysOfType<T, U> = { [k in keyof T]: T[k] extends U ? k : never }[keyof T];

export class PasswordGenerationOptions {
  passwordLength: number = 20;

  customChars: string = '';

  isUpperInclude: boolean = true;

  isLowerInclude: boolean = true;

  isDigitsInclude: boolean = true;

  isSpecialInclude: boolean = true;

  isBracketInclude: boolean = false;

  isQuoteInclude: boolean = false;
}
