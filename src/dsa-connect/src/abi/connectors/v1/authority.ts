import { AbiItem } from 'web3-utils'

export const authority: AbiItem[] = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: '_msgSender',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: '_authority',
        type: 'address',
      },
    ],
    name: 'LogAddAuth',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: '_msgSender',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: '_authority',
        type: 'address',
      },
    ],
    name: 'LogRemoveAuth',
    type: 'event',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'authority',
        type: 'address',
      },
    ],
    name: 'add',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [],
    name: 'connectorID',
    outputs: [
      {
        internalType: 'uint256',
        name: '_type',
        type: 'uint256',
      },
      {
        internalType: 'uint256',
        name: '_id',
        type: 'uint256',
      },
    ],
    stateMutability: 'pure',
    type: 'function',
  },
  {
    inputs: [],
    name: 'name',
    outputs: [
      {
        internalType: 'string',
        name: '',
        type: 'string',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      {
        internalType: 'address',
        name: 'authority',
        type: 'address',
      },
    ],
    name: 'remove',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
]
