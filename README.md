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

Any ALGO Donations are appreciated 😊 IM6CZ4KUPWT23PKA23MW5S4ZQVF4376GWELLAL5QA5NCMB635JTRUGIDPY

## Claimable Rewards Formula

Big thank you to @Tommaso on Telegram for discovering the formula for determining a user's portion of the rewards pool, which is implemented in the app and can be seen below with the related variables required. 

Any global are stored in the application (contract) while any user ones are stored alongside the Algorand wallet (algoexplorer.io/addresses/{your_algo_address} -> Apps -> Connected -> Hover over 'Eye' icon) 

```
GT: Global Time
GSS: Global Staking Shares

USS: User Staking Shares
UA: User Amount
UT: User Time

Claimable YLDY Rewards = ((USS + ((GT - UT) / 86400) * UA) / GSS) * TYUL / 1000000
```

The js code can also be found in the [`YLDYCalculations.js`](/src/js/YLDYCalculation.js) file in the `calculateYLDYRewardsFromDayPeriod()` method

## Development

Created using React.

### Deploy/Update GitHub Pages Site

To deploy or update the GH pages website, use the command `npm run deploy` which uses the `gh-pages` package to automatically update the `gh-pages` branch to the latest changes.
