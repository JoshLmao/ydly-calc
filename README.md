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


[![](./public/images/yldy-estimator-preview-img.png)](https://yldy-estimator.joshlmao.com)

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

Created using React and Vercel for hosting. Two environment variables ([.env](./.env)) are required, as well adjusting the [`config.json`](./src/config.json) file. 

### Vercel

The repository is setup to be hosted using Vercel, used to hosted using github-pages. The `develop` and `main` branch are used as deployments. The `develop` branch test site can be found at [yldy-calc-develop.vercel.app/](https://yldy-calc-develop.vercel.app/)

### Database

The site has a small backend database that contains the global state of the Yieldly contracts, NLL ([233725844](https://algoexplorer.io/application/233725844)) and YLDY Staking ([233725850](https://algoexplorer.io/application/233725850)). The script runs to gather the values using the AlgoExplorer.io API and sleeps for `X` amount of hours to repeat. The script can be found in  [`./utils/yldy-state-fetcher`](./utils/yldy-state-fetcher)

The backend database is hosted using [Firebase](https://firebase.google.com) and also utilizes their API's to store and fetch the data from it.


