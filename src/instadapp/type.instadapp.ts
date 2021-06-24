import { dsa } from '~/utils/web3.util'
import { PROTOCOL, RATE_MODE, TOKEN } from './config.instadapp'

type TProtocol = typeof PROTOCOL
export type TProtocolName = keyof TProtocol
export type TProtocolBody = TProtocol[TProtocolName]

export type ISpell = ReturnType<typeof dsa.Spell>
export type IToken = typeof TOKEN[keyof typeof TOKEN]

// Strategy types
export enum EStrategyName {
  Save = 'save',
  Leverage = 'leverage',
  DepositAndBorrow = 'depositAndBorrow',
  PaybackAndWithdraw = 'paybackAndWithdraw',
  CollateralSwap = 'collateralSwap',
  DebtSwap = 'debtSwap',
}
export enum EStrategyReqBodyName {
  StrategyName = 'strategyName',
  StrategyArg = 'strategyArg',
}
export interface IStrategyReqBody {
  [EStrategyReqBodyName.StrategyName]: EStrategyName
  [EStrategyReqBodyName.StrategyArg]: IStrategyProps
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

// Method types
export enum EMethodName {
  Deposit = 'deposit',
  Withdraw = 'withdraw',
  Borrow = 'borrow',
  Payback = 'payback',
  FlashBorrowAndCast = 'flashBorrowAndCast',
  EnableCollateral = 'enableCollateral',
  FlashPayback = 'flashPayback',
  Swap = 'swap',
}
export enum EMethodReqBodyName {
  MethodName = 'methodName',
  MethodArg = 'methodArg',
}
export interface IMethodReqBody {
  [EMethodReqBodyName.MethodName]: EMethodName
  [EMethodReqBodyName.MethodArg]: IMethodProps
}

// Method props
interface IBaseSavingProps {
  spells: ISpell
  token: IToken
  amount: number | string
  getId?: number
  setId?: number
}
interface IBaseLendingProps extends IBaseSavingProps {
  rateMode?: typeof RATE_MODE[keyof typeof RATE_MODE]
}
export interface IDepositProps extends IBaseSavingProps {}
export interface IWithdrawProps extends IBaseSavingProps {}
export interface IBorrowProps extends IBaseLendingProps {}
export interface IPaybackProps extends IBaseLendingProps {}
export interface IEnableCollateralProps extends Pick<IBaseSavingProps, 'spells'> {
  tokens: IToken[]
}
export interface ISwapProps extends Pick<IBaseSavingProps, 'spells' | 'setId'> {
  buyToken: IToken
  sellToken: IToken
  sellAmount: number | string
  unitAmount: number | string
  callData: string
}
export interface IFlashPaybackProps extends IBaseSavingProps {}
export interface IFlashBorrowAndCastProps extends Omit<IBaseSavingProps, 'getId' | 'setId'> {
  route?: number
  castData: ISpell
}
export type IMethodProps =
  | IDepositProps
  | IWithdrawProps
  | IBorrowProps
  | IPaybackProps
  | IEnableCollateralProps
  | ISwapProps
  | IFlashPaybackProps
  | IFlashBorrowAndCastProps
