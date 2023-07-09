import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
import { Notes } from "../target/types/notes"
import { PublicKey } from '@solana/web3.js';

describe("notes", () => {
    const provider = anchor.AnchorProvider.env()
    anchor.setProvider(provider)

    const program = anchor.workspace.Notes as Program<Notes>

    it('can send a new note', async () => {
        const noteAccount = new web3.Keypair();

        const topic = "New topic";

      await program.methods
          .sendNote('Test Note 1')
          .accounts({
              note: noteAccount,
              author: provider.wallet.publicKey,
          })
          .rpc()

      const noteAccount = await program.account.note.fetch(notePda)

      console.log(noteAccount);

      assert.equal(noteAccount.author.toBase58(), provider.wallet.publicKey.toBase58());
      assert.equal(noteAccount.topic, 'Test Note 1');
      assert.ok(noteAccount.timestamp);

    });

});