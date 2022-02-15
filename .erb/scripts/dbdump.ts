import { Credentials, CryptoEngine, Kdbx, ProtectedValue } from 'kdbxweb';
import fs from 'fs';
import {argon2Hash} from './../../src/main/argon';

const args = process.argv.slice(2);

if (args.length !== 2) {
  console.log("Usage: npm run dump <.kdbx file> <password>");
  process.exit(1);
}

(async () => {
  CryptoEngine.setArgon2Impl((...args) => argon2Hash(...args));
  const data = await fs.promises.readFile(args[0]);
  const credentials = new Credentials(ProtectedValue.fromString(args[1]), null);
  const database = await Kdbx.load(new Uint8Array(data).buffer, credentials, { preserveXml: true });
  const xml = await database.saveXml(true);
  const dumpFile = `${args[0]}.xml`;
  fs.writeFileSync(dumpFile, xml);
  console.log(`${dumpFile} has been written`);
})();
