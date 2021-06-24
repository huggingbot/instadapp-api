import { AbiItem } from 'web3-utils';

export const compoundImport_v2: AbiItem[] = [{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"user","type":"address"},{"indexed":false,"internalType":"address[]","name":"cTokens","type":"address[]"},{"indexed":false,"internalType":"uint256[]","name":"cTknBals","type":"uint256[]"},{"indexed":false,"internalType":"uint256[]","name":"borrowBals","type":"uint256[]"}],"name":"LogCompoundImport","type":"event"},{"inputs":[],"name":"connectorID","outputs":[{"internalType":"uint256","name":"model","type":"uint256"},{"internalType":"uint256","name":"id","type":"uint256"}],"stateMutability":"pure","type":"function"},{"inputs":[{"internalType":"address","name":"userAccount","type":"address"},{"internalType":"string[]","name":"tokenIds","type":"string[]"}],"name":"importCompound","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"name","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"}]