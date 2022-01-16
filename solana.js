const {
  Connection,
  Keypair,
  Transaction,
  SystemProgram,
  sendAndConfirmRawTransaction,
  clusterApiUrl,
  PublicKey,
  LAMPORTS_PER_SOL,
  sendAndConfirmTransaction,
} = require("@solana/web3.js");
// import {
//   Connection,
//   Keypair,
//   Transaction,
//   SystemProgram,
//   sendAndConfirmRawTransaction,
//   clusterApiUrl,
//   PublicKey,
//   LAMPORTS_PER_SOL,
// } from "@solana/web3.js";

async function transferSOL(from, to, amount) {
  try {
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
    const walletKeyPairFrom = await Keypair.fromSecretKey(
      Uint8Array.from(from)
    );
    const walletKeyPairTo = await Keypair.fromSecretKey(Uint8Array.from(to));
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: new PublicKey(walletKeyPairFrom.publicKey),
        toPubkey: new PublicKey(walletKeyPairTo.publicKey),
        lamports: amount * LAMPORTS_PER_SOL,
      })
    );

    const signature = await sendAndConfirmTransaction(connection, transaction, [
      walletKeyPairFrom,
    ]);
    console.log(signature);
    return signature;
  } catch (err) {
    console.log(err);
  }
}

async function getWalletBalance(wallet) {
  const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  const walletKeyPair = await Keypair.fromSecretKey(Uint8Array.from(wallet));
  try {
    const balance = await connection.getBalance(walletKeyPair.publicKey);
    return balance / LAMPORTS_PER_SOL;
  } catch (err) {
    console.log(err);
  }
}

async function airDropSol(wallet, amount) {
  try {
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
    const walletKeyPair = await Keypair.fromSecretKey(Uint8Array.from(wallet));
    console.log(`-- Airdropping SOL --`);
    const formAirdropSign = await connection.requestAirdrop(
      new PublicKey(walletKeyPair.publicKey),
      amount * LAMPORTS_PER_SOL
    );
    await connection.confirmTransaction(formAirdropSign);
  } catch (err) {
    console.log(err);
  }
}

module.exports = {transferSOL, getWalletBalance, airDropSol};
