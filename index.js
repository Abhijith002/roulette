const inquirer = require("inquirer");
// import inquirer from "inquirer";
const chalk = require("chalk");
// import chalk from "chalk";
const figlet = require("figlet");
// import figlet from "figlet";
const secrets = require("./secret.json");
// import * as secrets from "./secret.json";
const {totalAmtToBePaid, randomNumber, getReturnAmount} = require("./helper");
// import {totalAmtToBePaid, randomNumber, getReturnAmount} from "./helper.js";
const {airDropSol, transferSOL, getWalletBalance} = require("./solana");
// import {transferSOL, getWalletBalance, airDropSol} from "./solana.js";
// const publicKey = [
//   150, 235, 87, 251, 160, 49, 183, 173, 167, 169, 115, 201, 15, 75, 119, 39,
//   160, 2, 20, 194, 166, 62, 81, 106, 8, 37, 66, 128, 184, 219, 72, 253,
// ];

const userWalletKey = secrets.userSecret;

const treasuryWalletKey = secrets.treasurySecret;

// const secretKey = [
//   58, 100, 116, 94, 209, 108, 241, 236, 36, 137, 51, 147, 238, 213, 73, 163,
//   102, 22, 34, 164, 107, 222, 25, 98, 69, 103, 149, 67, 78, 49, 74, 175, 150,
//   235, 87, 251, 160, 49, 183, 173, 167, 169, 115, 201, 15, 75, 119, 39, 160, 2,
//   20, 194, 166, 62, 81, 106, 8, 37, 66, 128, 184, 219, 72, 253,
// ];

const init = () => {
  console.log(
    chalk.green(
      figlet.textSync("Welcome to roulette", {
        font: "Ghost",
        horizontalLayout: "default",
        verticalLayout: "default",
      })
    )
  );
  console.log(chalk.yellow("The maximum bidding amount is 2 SOL"));
};

const askQuestions = () => {
  const questions = [
    {
      name: "SOL",
      type: "number",
      message: "What is the amount of SOL you want to stake?",
    },
    {
      type: "rawlist",
      name: "RATIO",
      message: "What is the ratio of your staking?",
      choices: ["1:1.25", "1:1.5", "1:1.75", "1:2"],
      filter: function (val) {
        const stakeFactor = val.split(":")[1];
        return stakeFactor;
      },
    },
    {
      type: "number",
      name: "RANDOM",
      message: "Guess a random number from 1 to 5 (both 1, 5 included)",
      when: async (val) => {
        if (parseFloat(totalAmtToBePaid(val.SOL)) > 5) {
          console.log(
            chalk.red`You have violated the max stake limit. Stake with smaller amount.`
          );
          return false;
        } else {
          // console.log("In when")
          console.log(
            `You need to pay ${chalk.green`${totalAmtToBePaid(
              val.SOL
            )}`} to move forward`
          );
          const userBalance = await getWalletBalance(userWalletKey);
          if (userBalance < totalAmtToBePaid(val.SOL)) {
            console.log(
              chalk.red`You don't have enough balance in your wallet`
            );
            return false;
          } else {
            console.log(
              chalk.green`You will get ${getReturnAmount(
                val.SOL,
                parseFloat(val.RATIO)
              )} if guessing the number correctly`
            );
            return true;
          }
        }
      },
    },
  ];
  return inquirer.prompt(questions);
};

function buf2hex(buffer) {
  // buffer is an ArrayBuffer
  return [...new Uint8Array(buffer)]
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");
}

const gameExecution = async () => {
  init();
  // var string = new TextDecoder().decode(Uint8Array.from(userWalletKey));
  var string = buf2hex(Uint8Array.from(treasuryWalletKey));
  console.log(string);
  const generateRandomNumber = randomNumber(1, 5);
  const answers = await askQuestions();
  if (answers.RANDOM) {
    const paymentSignature = await transferSOL(
      userWalletKey,
      treasuryWalletKey,
      totalAmtToBePaid(answers.SOL)
    );
    console.log(
      `Signature of payment for playing the game`,
      chalk.green`${paymentSignature}`
    );
    if (answers.RANDOM === generateRandomNumber) {
      //AirDrop Winning Amount
      await airDropSol(
        treasuryWalletKey,
        getReturnAmount(answers.SOL, parseFloat(answers.RATIO))
      );
      //guess is successfull
      const prizeSignature = await transferSOL(
        treasuryWalletKey,
        userWalletKey,
        getReturnAmount(answers.SOL, parseFloat(answers.RATIO))
      );
      console.log(chalk.green`Your guess is absolutely correct`);
      console.log(
        `Here is the price signature `,
        chalk.green`${prizeSignature}`
      );
    } else {
      //better luck next time
      console.log(chalk.yellowBright`Better luck next time`);
    }
  }
};

gameExecution();
