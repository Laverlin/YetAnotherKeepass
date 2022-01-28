import { PasswordGenerationOptions } from './PasswordGenerationOptions';
import { KeysOfType } from './PasswordGenerator';

/** Class to describe set of source symbols
 *  for password generation
 */
export class PasswordSymbolSet {
  public constructor(init?: Partial<PasswordSymbolSet>) {
    Object.assign(this, init);
  }

  optionId: KeysOfType<PasswordGenerationOptions, boolean> = 'isUpperInclude';

  label: string = '';

  data: string = '';
}
