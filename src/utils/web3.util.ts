import dotenv from 'dotenv'
import Web3 from 'web3'
import DSA from '~/dsa-connect/src'
dotenv.config()

const MATIC_CHAIN_ID = 137
const PRIVATE_KEY = process.env.PRIVATE_KEY || ''

// const MATIC_MAINNET_RPC_URL = 'wss://rpc-mainnet.maticvigil.com/ws/v1/'
const MATIC_MAINNET_RPC_URL = 'https://rpc-mainnet.maticvigil.com/v1/'
const API_KEY = process.env.MATIC_RPC_API_KEY || ''
const PROVIDER = `${MATIC_MAINNET_RPC_URL}${API_KEY}`

export const web3 = new Web3(PROVIDER)
export const dsa = new DSA(
  {
    web3,
    mode: 'node',
    privateKey: PRIVATE_KEY,
  },
  MATIC_CHAIN_ID
)
export const getAccount = async () => {
  const accounts = await dsa.getAccounts('')
  await dsa.setInstance(accounts[0].id)
  return accounts[0]
}
