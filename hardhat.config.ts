require("dotenv").config()

import "@nomiclabs/hardhat-etherscan"
import "@nomiclabs/hardhat-waffle"
import "@nomiclabs/hardhat-web3"
import "@typechain/hardhat"
import "hardhat-deploy"

import { HardhatUserConfig } from "hardhat/types"

const INFURA_KEY = process.env.INFURA_KEY || ""
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || ""
const POLYGONSCAN_API_KEY = process.env.POLYGONSCAN_API_KEY || ""
const PRIVATE_KEY = process.env.PRIVATE_KEY || ""
const accounts = [PRIVATE_KEY]

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  solidity: {
    version: "0.7.6",
    settings: {
      optimizer: {
        enabled: true,
        runs: 800,
      },
      metadata: {
        // do not include the metadata hash, since this is machine dependent
        // and we want all generated code to be deterministic
        // https://docs.soliditylang.org/en/v0.7.6/metadata.html
        bytecodeHash: "none",
      },
    },
  },
  paths: {
    artifacts: "./src/artifacts",
    cache: "cache",
    deployments: "deployments",
    imports: "imports",
    sources: "contracts",
    tests: "test",
  },
  typechain: {
    outDir: "./src/typechain",
  },
  networks: {
    hardhat: {},
    localhost: {},
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${INFURA_KEY}`,
      accounts,
      chainId: 4,
    },
    matic: {
      url: `https://polygon-mainnet.g.alchemy.com/v2/${POLYGONSCAN_API_KEY}`,
      accounts,
      chainId: 137,
      live: true,
      tags: ["production"],
      saveDeployments: true,
    },
    mumbai: {
      url: `https://polygon-mumbai.g.alchemy.com/v2/${POLYGONSCAN_API_KEY}`,
      accounts,
      chainId: 80001,
      live: true,
      saveDeployments: true,
      tags: ["staging"],
      gasMultiplier: 2,
    },
    coverage: {
      url: "http://127.0.0.1:8555", // Coverage launches its own ganache-cli client
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
}

//https://polygon-mainnet.g.alchemy.com/v2/5cbSNIOfi-VpAC7P4VUUj2hsYj58_sOM

export default config
