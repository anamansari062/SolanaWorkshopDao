import * as web3 from "@solana/web3.js"
import * as fs from "fs"
import Dotenv from "dotenv"
Dotenv.config()

export async function initializeKeypair(
    connection: web3.Connection
): Promise<web3.Keypair> {
    /// Generates Keypair if not initialized yet. 
    if (!process.env.PRIVATE_KEY) {
        console.log("Creating .env file")

        const signer = web3.Keypair.generate()

        /// Stores the private key in .env file
        fs.writeFileSync(".env", `PRIVATE_KEY=[${signer.secretKey.toString()}]`)
        return signer
    }

    /// Fetches already initialized private key
    const secret = JSON.parse(process.env.PRIVATE_KEY ?? "") as number[]
    const secretKey = Uint8Array.from(secret)

    /// Generates Keypair from private key
    const keypairFromSecretKey = web3.Keypair.fromSecretKey(secretKey)
    return keypairFromSecretKey
}

async function airdropSolIfNeeded(
    signer: web3.Keypair,
    connection: web3.Connection
) {
    /// Fetch balance of the payer
    const balance = await connection.getBalance(signer.publicKey)
    console.log("Current balance is", balance / web3.LAMPORTS_PER_SOL)

    /// Airdrop Sol if balance is less than 1 Sol
    if (balance < web3.LAMPORTS_PER_SOL) {
        console.log("Airdropping 1 SOL...")
        const signature = await connection.requestAirdrop(
            signer.publicKey,
            web3.LAMPORTS_PER_SOL * 2
        )
        await connection.confirmTransaction(signature)
    }
}

async function transferSol (
    sender: web3.Keypair,
    receiver: web3.PublicKey,
    connection: web3.Connection
): Promise<String> {
    /// Transfer instruction
    const instruction = web3.SystemProgram.transfer({
        fromPubkey: sender.publicKey,
        toPubkey: receiver,
        lamports: web3.LAMPORTS_PER_SOL * 1
    })

    /// Transaction to send the instruction
    const transaction = new web3.Transaction()
    transaction.add(instruction)

    /// Send the transaction
    const signature = web3.sendAndConfirmTransaction(
        connection,
        transaction,
        [sender]
    )

    return signature
}

async function main() {
    let connection = new web3.Connection("http://localhost:8899")

    let payer = await initializeKeypair(connection)

    await airdropSolIfNeeded(payer, connection)

    let receiver = new web3.PublicKey("")
    let signature = transferSol(payer, receiver, connection)

    console.log(`Transfer signature: ${signature}`)
}

main()
    .then(() => {
        console.log("Finished successfully")
    })
    .catch((error) => {
        console.error(error)
    })