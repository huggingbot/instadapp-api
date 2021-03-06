import axios from 'axios'
import Big from 'big.js'
import { Request } from 'express'
import { ParaSwap } from 'paraswap'
import { toWei } from 'web3-utils'
import { ILogContext } from '~/types/api.type'
import { dsa, web3 } from '~/utils/web3.util'
import { BaseStrategyService } from '../base/strategy-service.base'
import { getInstadappQuoteUrl, MAX_UINT256 } from '../config.instadapp'
import { EInstadappErrorType, InstadappError } from '../error.instadapp'
import {
  EStrategyName,
  ICollateralSwapProps,
  IDebtSwapProps,
  IDepositAndBorrowProps,
  ILeverageProps,
  IPaybackAndWithdrawProps,
  ISaveProps,
  ISpell,
  IStrategyProps,
  IStrategyReqBody,
  IToken,
} from '../type.instadapp'
import {
  ENABLE_COLLATERAL_TOKEN,
  EXTRA_GAS_PRICE_IN_GWEI,
  FLASH_BORROW_TOKEN,
  FLASH_LOAN_FACTOR_WITH_SWAP,
} from './config.aave'
import { AaveMethodService } from './method-service.aave'

export class AaveStrategyService extends BaseStrategyService {
  private method: AaveMethodService
  private req: Request
  private paraswap = new ParaSwap(137).setWeb3Provider(web3)

  private strategyMap = {
    [EStrategyName.Save]: this.save.bind(this),
    [EStrategyName.Leverage]: this.leverage.bind(this),
    [EStrategyName.DepositAndBorrow]: this.depositAndBorrow.bind(this),
    [EStrategyName.PaybackAndWithdraw]: this.paybackAndWithdraw.bind(this),
    [EStrategyName.CollateralSwap]: this.collateralSwap.bind(this),
    [EStrategyName.DebtSwap]: this.debtSwap.bind(this),
  } as Record<EStrategyName, (arg: IStrategyProps) => ISpell>

  public constructor(logContext: ILogContext, req: Request) {
    super(logContext)
    this.method = new AaveMethodService(logContext)
    this.req = req
  }

  async callStrategy({ strategyName, strategyArg }: IStrategyReqBody): Promise<string | undefined> {
    const strategy = this.strategyMap[strategyName]
    try {
      const estimatedGasPrice = Number(await web3.eth.getGasPrice())
      const extraGasPrice = Number(toWei(String(EXTRA_GAS_PRICE_IN_GWEI), 'gwei'))
      const gasPrice = `${estimatedGasPrice + extraGasPrice}`
      const spells = await strategy({ ...strategyArg, gasPrice })
      const txHash = await spells.cast({ gasPrice })
      return txHash
    } catch (err) {
      throw this.handleError(err)
    }
  }

  @AaveStrategyService.objectifyToken
  protected depositAndBorrow({
    depositToken,
    depositAmount,
    borrowToken,
    borrowAmount,
  }: IDepositAndBorrowProps): ISpell {
    const spells = dsa.Spell()
    this.method.deposit({ spells, token: depositToken, amount: depositAmount })
    this.method.borrow({ spells, token: borrowToken, amount: borrowAmount })
    return spells
  }

  @AaveStrategyService.objectifyToken
  protected paybackAndWithdraw({
    paybackToken,
    paybackAmount,
    withdrawToken,
    withdrawAmount,
  }: IPaybackAndWithdrawProps): ISpell {
    const spells = dsa.Spell()
    this.method.payback({ spells, token: paybackToken, amount: paybackAmount })
    this.method.withdraw({ spells, token: withdrawToken, amount: withdrawAmount })
    return spells
  }

  @AaveStrategyService.objectifyToken
  protected async leverage({ depositToken, borrowToken, borrowAmount, gasPrice }: ILeverageProps): Promise<ISpell> {
    const id = Date.now()
    const quote = await this.getQuote(depositToken, borrowToken, borrowAmount)
    const txParams = await this.buildParaswapTxParams(depositToken, borrowToken, borrowAmount, gasPrice)

    const nestedSpells = dsa.Spell()
    this.method.enableCollateral({ spells: nestedSpells, tokens: [ENABLE_COLLATERAL_TOKEN] })
    this.method.borrow({
      spells: nestedSpells,
      token: borrowToken,
      amount: borrowAmount,
    })
    // Only swap if depositToken and borrowToken are different
    if (depositToken.address !== borrowToken.address) {
      this.method.swap({
        spells: nestedSpells,
        buyToken: depositToken,
        sellToken: borrowToken,
        sellAmount: borrowAmount,
        unitAmount: quote.data.unitAmt,
        callData: txParams.data,
        setId: id,
      })
      this.method.deposit({ spells: nestedSpells, token: depositToken, amount: 0, getId: id })
    } else {
      // depositToken and borrowToken are the same
      this.method.deposit({ spells: nestedSpells, token: depositToken, amount: borrowAmount })
    }
    this.method.flashPayback({
      spells: nestedSpells,
      token: FLASH_BORROW_TOKEN,
      amount: Big(borrowAmount).mul(FLASH_LOAN_FACTOR_WITH_SWAP).toString(),
    })

    const spells = dsa.Spell()
    this.method.flashBorrowAndCast({
      spells,
      token: FLASH_BORROW_TOKEN,
      amount: Big(borrowAmount).mul(FLASH_LOAN_FACTOR_WITH_SWAP).toString(),
      castData: nestedSpells,
    })
    return spells
  }

  @AaveStrategyService.objectifyToken
  protected async save({ withdrawToken, paybackToken, withdrawAmount, gasPrice }: ISaveProps): Promise<ISpell> {
    const id = Date.now()
    const quote = await this.getQuote(paybackToken, withdrawToken, withdrawAmount)
    const txParams = await this.buildParaswapTxParams(paybackToken, withdrawToken, withdrawAmount, gasPrice)

    const nestedSpells = dsa.Spell()
    this.method.enableCollateral({ spells: nestedSpells, tokens: [ENABLE_COLLATERAL_TOKEN] })
    this.method.withdraw({
      spells: nestedSpells,
      token: withdrawToken,
      amount: withdrawAmount,
    })
    // Only swap if withdrawToken and paybackToken are different
    if (withdrawToken.address !== paybackToken.address) {
      this.method.swap({
        spells: nestedSpells,
        buyToken: paybackToken,
        sellToken: withdrawToken,
        sellAmount: withdrawAmount,
        unitAmount: quote.data.unitAmt,
        callData: txParams.data,
        setId: id,
      })
      this.method.payback({
        spells: nestedSpells,
        token: paybackToken,
        amount: MAX_UINT256,
        getId: id,
      })
    } else {
      // withdrawToken and paybackToken are the same
      this.method.payback({
        spells: nestedSpells,
        token: paybackToken,
        amount: withdrawAmount,
      })
    }
    this.method.flashPayback({
      spells: nestedSpells,
      token: FLASH_BORROW_TOKEN,
      amount: Big(withdrawAmount).mul(FLASH_LOAN_FACTOR_WITH_SWAP).toString(),
    })

    const spells = dsa.Spell()
    this.method.flashBorrowAndCast({
      spells,
      token: FLASH_BORROW_TOKEN,
      amount: Big(withdrawAmount).mul(FLASH_LOAN_FACTOR_WITH_SWAP).toString(),
      castData: nestedSpells,
    })
    return spells
  }

  @AaveStrategyService.objectifyToken
  protected async collateralSwap({ fromToken, toToken, fromAmount, gasPrice }: ICollateralSwapProps): Promise<ISpell> {
    const id = Date.now()
    const quote = await this.getQuote(toToken, fromToken, fromAmount)
    const txParams = await this.buildParaswapTxParams(toToken, fromToken, fromAmount, gasPrice)

    const nestedSpells = dsa.Spell()
    this.method.enableCollateral({ spells: nestedSpells, tokens: [ENABLE_COLLATERAL_TOKEN] })
    this.method.withdraw({ spells: nestedSpells, token: fromToken, amount: fromAmount })
    // Only swap if fromToken and toToken are different
    if (fromToken.address !== toToken.address) {
      this.method.swap({
        spells: nestedSpells,
        buyToken: toToken,
        sellToken: fromToken,
        sellAmount: fromAmount,
        unitAmount: quote.data.unitAmt,
        callData: txParams.data,
        setId: id,
      })
      this.method.deposit({
        spells: nestedSpells,
        token: toToken,
        amount: 0,
        getId: id,
      })
    } else {
      // fromToken and toToken are the same
      this.method.deposit({
        spells: nestedSpells,
        token: toToken,
        amount: fromAmount,
      })
    }
    this.method.flashPayback({
      spells: nestedSpells,
      token: FLASH_BORROW_TOKEN,
      amount: Big(fromAmount).mul(FLASH_LOAN_FACTOR_WITH_SWAP).toString(),
    })

    const spells = dsa.Spell()
    this.method.flashBorrowAndCast({
      spells,
      token: FLASH_BORROW_TOKEN,
      amount: Big(fromAmount).mul(FLASH_LOAN_FACTOR_WITH_SWAP).toString(),
      castData: nestedSpells,
    })
    return spells
  }

  @AaveStrategyService.objectifyToken
  protected async debtSwap({ fromToken, toToken, toAmount, gasPrice }: IDebtSwapProps): Promise<ISpell> {
    /* Useful to calculate toAmount if args: { fromToken, toToken, fromAmount } */
    // const prices = await this.getPrices()
    // const fromTokenPrice = Number(prices[fromToken])
    // const toTokenPrice = Number(prices[toToken])
    // if (isNaN(fromTokenPrice) || isNaN(toTokenPrice)) {
    //   throw new InstadappError(EInstadappErrorType.StrategyInvalidError, 'Token price not found on Instadapp')
    // }
    // const toAmount = Big(fromAmount).mul(fromTokenPrice).div(toTokenPrice).toString()

    const id = Date.now()
    const quote = await this.getQuote(fromToken, toToken, toAmount)
    const txParams = await this.buildParaswapTxParams(fromToken, toToken, toAmount, gasPrice)

    const nestedSpells = dsa.Spell()
    this.method.enableCollateral({ spells: nestedSpells, tokens: [ENABLE_COLLATERAL_TOKEN] })
    this.method.borrow({ spells: nestedSpells, token: toToken, amount: toAmount })
    // Only swap if fromToken and toToken are different
    if (fromToken.address !== toToken.address) {
      this.method.swap({
        spells: nestedSpells,
        buyToken: fromToken,
        sellToken: toToken,
        sellAmount: toAmount,
        unitAmount: quote.data.unitAmt,
        callData: txParams.data,
        setId: id,
      })
      this.method.payback({
        spells: nestedSpells,
        token: fromToken,
        amount: MAX_UINT256,
        getId: id,
      })
    } else {
      // fromToken and toToken are the same
      this.method.payback({
        spells: nestedSpells,
        token: fromToken,
        amount: toAmount,
      })
    }
    this.method.flashPayback({
      spells: nestedSpells,
      token: FLASH_BORROW_TOKEN,
      amount: Big(toAmount).mul(FLASH_LOAN_FACTOR_WITH_SWAP).toString(),
    })

    const spells = dsa.Spell()
    this.method.flashBorrowAndCast({
      spells,
      token: FLASH_BORROW_TOKEN,
      amount: Big(toAmount).mul(FLASH_LOAN_FACTOR_WITH_SWAP).toString(),
      castData: nestedSpells,
    })
    return spells
  }

  // private async getPrices() {
  //   const prices = await axios.get<Record<string, string>>(INSTADAPP_PRICE_URL)
  //   const parsedPrices = Object.entries(prices.data).reduce(
  //     (obj, [address, price]) => ({ ...obj, [address.toLowerCase()]: price }),
  //     {} as Record<string, string>
  //   )
  //   return parsedPrices
  // }

  private async getQuote(buyToken: IToken, sellToken: IToken, sellAmount: number | string) {
    const baseSellAmount = Big(10).pow(sellToken.decimals).mul(sellAmount).toString()
    const quoteUrl = getInstadappQuoteUrl(buyToken.address, sellToken.address, baseSellAmount.toString())
    const quote = await axios.get<{ unitAmt: string }>(quoteUrl)
    return quote
  }

  private async getPriceRoute(buyToken: IToken, sellToken: IToken, sellAmount: number | string) {
    const baseSellAmount = Big(10).pow(sellToken.decimals).mul(sellAmount).toString()
    const priceRoute = await this.paraswap.getRate(sellToken.address, buyToken.address, baseSellAmount.toString())
    return priceRoute
  }

  private async buildParaswapTxParams(
    buyToken: IToken,
    sellToken: IToken,
    sellAmount: number | string,
    gasPrice: string
  ) {
    const baseSellAmount = Big(10).pow(sellToken.decimals).mul(sellAmount).toString()
    const priceRoute = await this.getPriceRoute(buyToken, sellToken, sellAmount)

    if ('message' in priceRoute) {
      throw new InstadappError(EInstadappErrorType.StrategyError, 'Paraswap getRate APIError')
    }
    const txParams = await this.paraswap.buildTx(
      sellToken.address,
      buyToken.address,
      baseSellAmount.toString(),
      priceRoute.destAmount,
      priceRoute,
      this.req.account.address,
      'instadapp.io',
      undefined,
      { ignoreChecks: true, gasPrice }
    )
    if ('message' in txParams) {
      throw new InstadappError(EInstadappErrorType.StrategyError, 'Paraswap buildTx APIError')
    }
    return txParams
  }
}
