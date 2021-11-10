require("dotenv").config()

import "@nomiclabs/hardhat-etherscan"
import "@nomiclabs/hardhat-waffle"
import "@nomiclabs/hardhat-web3"
import "@openzeppelin/hardhat-upgrades"
import "@typechain/hardhat"
import "hardhat-deploy"

import { HardhatUserConfig } from "hardhat/types"

const INFURA_KEY = process.env.INFURA_KEY ?? ""
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY ?? ""

const accounts = {
  mnemonic: process.env.MNEMONIC ?? "test test test test test test test test test test test junk",
}

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
    ropsten: {
      url: `https://ropsten.infura.io/v3/${INFURA_KEY}`,
      accounts,
      chainId: 3,
      gasPrice: 5000000000,
      gasMultiplier: 2,
    },
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${INFURA_KEY}`,
      accounts,
      chainId: 4,
    },
    kovan: {
      url: `https://kovan.infura.io/v3/${INFURA_KEY}`,
      accounts,
      chainId: 42,
    },
    coverage: {
      url: "http://127.0.0.1:8555", // Coverage launches its own ganache-cli client
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
}

export default config
