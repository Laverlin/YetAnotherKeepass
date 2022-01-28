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
