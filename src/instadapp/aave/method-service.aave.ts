import Big from 'big.js'
import { toWei } from 'web3-utils'
import { ILogContext } from '~/types/api.type'
import { dsa, web3 } from '~/utils/web3.util'
import { BaseMethodService } from '../base/method-service.base'
import { EXTRA_GAS_PRICE_IN_GWEI, PROTOCOL, RATE_MODE } from '../config.instadapp'
import {
  EMethodName,
  IBorrowProps,
  IDepositProps,
  IEnableCollateralProps,
  IFlashBorrowAndCastProps,
  IFlashPaybackProps,
  IMethodProps,
  IMethodReqBody,
  IPaybackProps,
  ISwapProps,
  IWithdrawProps,
  ISpell,
} from '../type.instadapp'

const {
  aave: { connector, method },
} = PROTOCOL

export class AaveMethodService extends BaseMethodService {
  private methodMap = {
    [EMethodName.Deposit]: this.deposit.bind(this),
    [EMethodName.Withdraw]: this.withdraw.bind(this),
    [EMethodName.Borrow]: this.borrow.bind(this),
    [EMethodName.Payback]: this.payback.bind(this),
    [EMethodName.FlashBorrowAndCast]: this.flashBorrowAndCast.bind(this),
    [EMethodName.EnableCollateral]: this.enableCollateral.bind(this),
    [EMethodName.FlashPayback]: this.flashPayback.bind(this),
    [EMethodName.Swap]: this.swap.bind(this),
  } as Record<EMethodName, (arg: IMethodProps) => ISpell>

  public constructor(logContext: ILogContext) {
    super(logContext)
  }

  // Instantiate 'spells' property if it's undefined
  static spells(_target: AaveMethodService, _propertyKey: string, descriptor: PropertyDescriptor) {
    const originalFunction: Function = descriptor.value
    descriptor.value = function () {
      let { spells } = arguments[0] as Record<string, unknown>
      if (typeof spells === 'undefined') {
        spells = dsa.Spell()
      }
      return originalFunction.apply(this, [{ ...arguments[0], spells }])
    }
    return descriptor
  }

  async callMethod({ methodName, methodArg }: IMethodReqBody): Promise<string | undefined> {
    const method = this.methodMap[methodName]
    try {
      const spells = method(methodArg)
      const gasPrice = (await web3.eth.getGasPrice()) + toWei(String(EXTRA_GAS_PRICE_IN_GWEI), 'gwei')
      const txHash = await spells.cast({ gasPrice })
      return txHash
    } catch (err) {
      throw this.handleError(err)
    }
  }

  @AaveMethodService.objectifyToken
  @AaveMethodService.spells
  deposit({ spells, token, amount, getId, setId }: IDepositProps): ISpell {
    const depositAmount = Big(10).pow(token.decimals).mul(amount).toString()
    spells.add({
      connector: connector.base,
      method: method.Deposit,
      args: [token.address, depositAmount, getId ?? 0, setId ?? 0],
    })
    return spells
  }

  @AaveMethodService.objectifyToken
  @AaveMethodService.spells
  withdraw({ spells, token, amount, getId, setId }: IWithdrawProps): ISpell {
    const withdrawAmount = Big(10).pow(token.decimals).mul(amount).toString()
    spells.add({
      connector: connector.base,
      method: method.Withdraw,
      args: [token.address, withdrawAmount, getId ?? 0, setId ?? 0],
    })
    return spells
  }

  @AaveMethodService.objectifyToken
  @AaveMethodService.spells
  borrow({ spells, token, amount, rateMode, getId, setId }: IBorrowProps): ISpell {
    const borrowAmount = Big(10).pow(token.decimals).mul(amount).toString()
    spells.add({
      connector: connector.base,
      method: method.Borrow,
      args: [token.address, borrowAmount, rateMode ?? RATE_MODE.variable, getId ?? 0, setId ?? 0],
    })
    return spells
  }

  @AaveMethodService.objectifyToken
  @AaveMethodService.spells
  payback({ spells, token, amount, rateMode, getId, setId }: IPaybackProps): ISpell {
    const paybackAmount = Big(10).pow(token.decimals).mul(amount).toString()
    spells.add({
      connector: connector.base,
      method: method.Payback,
      args: [token.address, paybackAmount, rateMode ?? RATE_MODE.variable, getId ?? 0, setId ?? 0],
    })
    return spells
  }

  @AaveMethodService.objectifyToken
  @AaveMethodService.spells
  enableCollateral({ spells, tokens }: IEnableCollateralProps): ISpell {
    spells.add({
      connector: connector.base,
      method: method.EnableCollateral,
      args: [tokens.map(token => token.address)],
    })
    return spells
  }

  @AaveMethodService.objectifyToken
  @AaveMethodService.spells
  swap({ spells, buyToken, sellToken, sellAmount, unitAmount, callData, setId }: ISwapProps): ISpell {
    const swapAmount = Big(10).pow(sellToken.decimals).mul(sellAmount).toString()
    spells.add({
      connector: connector.paraswapA,
      method: method.Swap,
      args: [buyToken.address, sellToken.address, swapAmount, unitAmount, callData, setId],
    })
    return spells
  }

  @AaveMethodService.objectifyToken
  @AaveMethodService.spells
  flashPayback({ spells, token, amount, getId, setId }: IFlashPaybackProps): ISpell {
    const paybackAmount = Big(10).pow(token.decimals).mul(amount).toString()
    spells.add({
      connector: connector.instapoolA,
      method: method.FlashPayback,
      args: [token.address, paybackAmount, getId ?? 0, setId ?? 0],
    })
    return spells
  }

  @AaveMethodService.objectifyToken
  @AaveMethodService.spells
  flashBorrowAndCast({ spells, token, amount, route, castData }: IFlashBorrowAndCastProps): ISpell {
    const borrowAmount = Big(10).pow(token.decimals).mul(amount).toString()
    const encodedSpells = dsa.encodeSpells(castData)
    const encodedParams = web3.eth.abi.encodeParameters(
      ['string[]', 'bytes[]'],
      [encodedSpells.targets, encodedSpells.spells]
    )
    spells.add({
      connector: connector.instapoolA,
      method: method.FlashBorrowAndCast,
      args: [token.address, borrowAmount, route ?? 0, encodedParams],
    })
    return spells
  }
}
