import { dsa } from '~/utils/web3.util'
import { PROTOCOL, TOKEN } from './config.instadapp'

type TProtocol = typeof PROTOCOL
export type TProtocolName = keyof TProtocol
export type TProtocolBody = TProtocol[TProtocolName]

export type ISpell = ReturnType<typeof dsa.Spell>
export type IToken = typeof TOKEN[keyof typeof TOKEN]

// Strategy names
export enum EStrategyName {
  Save = 'save',
  Leverage = 'leverage',
  DepositAndBorrow = 'depositAndBorrow',
  PaybackAndWithdraw = 'paybackAndWithdraw',
  CollateralSwap = 'collateralSwap',
  DebtSwap = 'debtSwap',
}

// Strategy props
interface IGasProps {
  gasPrice: string
}
export interface IDepositAndBorrowProps {
  depositToken: IToken
  depositAmount: number | string
  borrowToken: IToken
  borrowAmount: number | string
}
export interface IPaybackAndWithdrawProps {
  paybackToken: IToken
  paybackAmount: number | string
  withdrawToken: IToken
  withdrawAmount: number | string
}
export interface ILeverageProps extends IGasProps {
  depositToken: IToken
  borrowToken: IToken
  borrowAmount: number | string
}
export interface ISaveProps extends IGasProps {
  withdrawToken: IToken
  paybackToken: IToken
  withdrawAmount: number | string
}
export interface ICollateralSwapProps extends IGasProps {
  fromToken: IToken
  toToken: IToken
  fromAmount: number | string
}
export interface IDebtSwapProps extends IGasProps {
  fromToken: IToken
  toToken: IToken
  toAmount: number | string
}
export type IStrategyProps =
  | IDepositAndBorrowProps
  | IPaybackAndWithdrawProps
  | ILeverageProps
  | ISaveProps
  | ICollateralSwapProps
  | IDebtSwapProps

// Strategy types
export enum EStrategyReqBodyName {
  StrategyName = 'strategyName',
  StrategyArg = 'strategyArg',
}
export interface IStrategyReqBody {
  [EStrategyReqBodyName.StrategyName]: EStrategyName
  [EStrategyReqBodyName.StrategyArg]: IStrategyProps
}

// Method types
export enum EMethodReqBodyName {
  MethodName = 'methodName',
  MethodArg = 'methodArg',
}
export interface IMethodReqBody {
  [EMethodReqBodyName.MethodName]: unknown
  [EMethodReqBodyName.MethodArg]: unknown
}

// User position
export interface IPosition {
  totalSupplyInEth: string // number
  totalBorrowInEth: string // number
  totalBorrowStableInEth: string // number
  totalBorrowVariableInEth: string // number
  maxBorrowLimitInEth: string // number
  maxBorrowLiquidityLimitInEth: string // number
  status: string // number
  liquidation: string // number
  maxLiquidation: string // number
  ethPriceInUsd: string //number
  pendingRewards: string //number
  data: {
    key: 'eth' | 'dai' | 'usdc' | 'usdt' | 'wbtc' | 'aave' | 'matic'
    aTokenAddr:
      | typeof TOKEN.amWeth.address
      | typeof TOKEN.amDai.address
      | typeof TOKEN.amUsdc.address
      | typeof TOKEN.amUsdt.address
      | typeof TOKEN.amWbtc.address
      | typeof TOKEN.amAave.address
      | typeof TOKEN.amWmatic.address
    aTokenBal: string // number
    aTokenKey: 'aeth' | 'adai' | 'ausdc' | 'ausdt' | 'awbtc' | 'aaave' | 'awmatic'
    aDecimals: string // number
    priceInEth: string // number
    priceInUsd: string // number
    supply: string // number
    borrowStable: string // number
    borrow: string // number
    supplyRate: string // number
    supplyYield: string // number
    borrowStableRate: string // number
    userBorrowStableRate: string // number
    borrowStableYield: string // number
    borrowRate: string // number
    borrowYield: string // number
    factor: string // number
    liquidation: string // number
    isEnabledAsCollateral: boolean
    borrowEnabled: boolean
    stableBorrowEnabled: boolean
    availableLiquidity: string // number
    supplyRewardRate: string // number
    borrowRewardRate: string // number
  }[]
}

// Prices
export interface IPrice {
  [TOKEN.weth.address]: string // number
  [TOKEN.matic.address]: string // number
  [TOKEN.wmatic.address]: string // number
  [TOKEN.dai.address]: string // number
  [TOKEN.usdt.address]: string // number
  [TOKEN.usdc.address]: string // number
  [TOKEN.inst.address]: string // number
  [TOKEN.wbtc.address]: string // number
}
