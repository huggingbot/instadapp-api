import { RATE_MODE } from './config.aave'
import { EMethodReqBodyName, ISpell, IToken } from '../type.instadapp'

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
export interface IAaveMethodReqBody {
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
