import { PasswordGenerationOptions } from './PasswordGenerationOptions';
import { PasswordSymbolSet } from './PasswordSymbolSet';

/** Wrapper to limit keyof type options to fields of specified type
 *  E.g. KeysOfType<T, boolean> will return only boolean fields of T
 */
export type KeysOfType<T, U> = { [k in keyof T]: T[k] extends U ? k : never }[keyof T];

/** Class for holding generation password methods
 */
export class PasswordGenerator {
  static passwordSource = [
    new PasswordSymbolSet({
      optionId: 'isUpperInclude',
      label: 'Upper-case (A, B, C, ...)',
      data: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    }),
    new PasswordSymbolSet({
      optionId: 'isSpecialInclude',
      label: 'Special symbols (!, @, #, $, %, ...)',
      data: '!@#$%^&*_+-=,./?;:~\\',
    }),
    new PasswordSymbolSet({
      optionId: 'isLowerInclude',
      label: 'Lower-case (a, b, c, ...)',
      data: 'abcdefghijklmnopqrstuvwxyz',
    }),
    new PasswordSymbolSet({
      optionId: 'isBracketInclude',
      label: 'Brackets ([, ], {, }, (, ), <, >)',
      data: '(){}[]<>',
    }),
    new PasswordSymbolSet({ optionId: 'isDigitsInclude', label: 'Digits (0, 1, 2, ...)', data: '0123456789' }),
    new PasswordSymbolSet({ optionId: 'isQuoteInclude', label: 'Quotation (`, \', ", )', data: '\'`"' }),
  ];

  /** Generate new password based on provided options
   *  @see PasswordGenerationOptions
   */
  static generatePassword(options: PasswordGenerationOptions): string {
    const source = this.passwordSource
      .map((i) => (options[i.optionId] ? i.data : ''))
      .concat(options.customChars)
      .join('');

    if (!source) return '';

    const randomNumbers = window.crypto.getRandomValues(new Uint8Array(options.passwordLength));
    let generated = '';
    randomNumbers.forEach((number) => {
      const index = Math.floor((number / (0xff + 1)) * source.length);
      generated = generated.concat(source[index]);
    });
    return generated;
  }
}
