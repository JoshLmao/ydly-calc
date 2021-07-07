# Yieldly Estimator/Calculator

<p align="left">
  <a href="https://twitter.com/JoshLmao">
    <img src="https://img.shields.io/badge/twitter-JoshLmao-blue.svg?style=flat-square" alt="twitter"/>
  </a>
   <a href="https://yldy-estimator.joshlmao.com">
    <img src="https://img.shields.io/badge/website-live-green.svg?style=flat-square" alt="releases"/>
  </a>
  <a href="https://algoexplorer.io/address/IM6CZ4KUPWT23PKA23MW5S4ZQVF4376GWELLAL5QA5NCMB635JTRUGIDPY">
    <img src="https://img.shields.io/badge/Donate-ALGO-lightblue.svg?style=flat-square" alt="releases"/>
  </a>
</p>

A small web application for estimating [Yieldly](https://yieldly.finance) rewards. Includes estimating for the No Loss Lottery (NLL) and YLDY Staking pages. 

The app shows your share of the current rewards pool. The rewards pool increases every 30 minutes ([as per Yieldly's 1st July change](https://yieldly.finance/updated-rewards/)) and can go down when someone else claims from that pool. 

Thank you to @Tommaso on Telegram for discovering the formula (below) for determining a user's portion of the rewards pool, which is implemented in the app.

The values for the formula are either found in the relevant application contract (if prefix started with G, global) or in the user's Algorand address (if prefix starts with U, user)

```
GT: Global Time
GSS: Global Staking Shares

USS: User Staking Shares
UA: User Amount
UT: User Time

Claimable YLDY Rewards = ((USS + ((GT - UT) / 86400) * UA) / GSS) * TYUL / 1000000
```

ALGO Donations: IM6CZ4KUPWT23PKA23MW5S4ZQVF4376GWELLAL5QA5NCMB635JTRUGIDPY

### Deploy/Update GitHub Pages Site

To deploy or update the GH pages website, use the command `npm run deploy` which uses the `gh-pages` package to automatically update the `gh-pages` branch to the latest changes.