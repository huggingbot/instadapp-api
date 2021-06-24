// const web3 = new Web3(PROVIDER)
//     const dsa = new DSA(
//       {
//         web3,
//         mode: 'node',
//         privateKey: PRIVATE_KEY,
//       },
//       MATIC_CHAIN_ID
//     )
//     const paraswap = new ParaSwap(137).setWeb3Provider(web3)
// const accounts = await dsa.getAccounts('')
//       console.log('accounts', accounts)
//       await dsa.setInstance(accounts[0].id)

//       let spells = dsa.Spell()

//       const priceApiUrl = 'https://api.instadapp.io/defi/polygon/prices'
//       const prices = (await axios.get(priceApiUrl)) as any
//       const priceData = Object.entries(prices.data).reduce(
//         (obj, [address, price]) => {
//           return { ...obj, [address.toLowerCase()]: price }
//         },
//         {} as any
//       )
//       const fromToken = Token.USDT
//       const toToken = Token.DAI
//       const wmaticPrice = Number(priceData[Token.WMATIC])
//       const fromTokenPrice = Number(priceData[fromToken])
//       const toTokenPrice = Number(priceData[toToken])
//       console.log('wmaticPrice', wmaticPrice, fromTokenPrice, toTokenPrice)

//       const toTokenToBorrow = Math.trunc(
//         ((0.001 * fromTokenPrice) / toTokenPrice) * 1e18
//       ).toString()
//       // const toTokenToBorrow = toWei('0.001', Unit.ETHER)
//       console.log('toTokenToBorrow', toTokenToBorrow)
//       const wmaticToFlashLoan = ((0.001 * fromTokenPrice) / wmaticPrice) * 1e18

//       const slippage = 2
//       const quoteApiUrl = `https://api.instadapp.io/defi/polygon/paraswap/quote?buyToken=${fromToken}&sellToken=${toToken}&sellAmount=${toTokenToBorrow}&maxSlippage=${slippage}&fee=0`
//       const quote = await axios.get(quoteApiUrl)
//       console.log('quote', quote.data)

//       const priceRoute = await paraswap.getRate(
//         toToken,
//         fromToken,
//         // toWei('0.001', Unit.ETHER)
//         toTokenToBorrow,
//         undefined,
//         undefined
//       )
//       console.log('priceRoute', priceRoute)

//       const txParams = await paraswap.buildTx(
//         toToken,
//         fromToken,
//         // toWei('0.001', Unit.ETHER),
//         toTokenToBorrow,
//         (priceRoute as any).destAmount,
//         priceRoute as any,
//         accounts[0].address,
//         'instadapp.io',
//         undefined,
//         { ignoreChecks: true, gasPrice: toWei('2', Unit.GWEI) }
//       )
//       console.log('txParams', (txParams as any).data)

//       // const srcToken = new ParaswapToken(toToken, 18, 'USDT')
//       // const destToken = new ParaswapToken(fromToken, 18, 'DAI')
//       // const txParams = await paraswap.buildTxLocally(
//       //   srcToken,
//       //   destToken,
//       //   // toWei('0.01', Unit.ETHER),
//       //   wethToBorrow,
//       //   (priceRoute as any).destAmount,
//       //   priceRoute as any,
//       //   accounts[0].address,
//       //   'instadapp.io',
//       //   undefined as any,
//       //   toWei('1', Unit.GWEI),
//       //   undefined,
//       //   { ignoreChecks: true }
//       // )
//       // console.log('localTxParams', txParams)

//       /* Debt Swap */
//       let nestedSpells = dsa.Spell()
//       nestedSpells.add({
//         connector: Connector.AAVE_V2_A,
//         method: Method.ENABLE_COLLATERAL,
//         args: [[Token.WMATIC]],
//       })
//       nestedSpells.add({
//         connector: Connector.AAVE_V2_A,
//         method: Method.BORROW,
//         args: [toToken, toTokenToBorrow, 2, 0, 0],
//       })

//       // const id = Date.now()
//       const id = 34239847836
//       nestedSpells.add({
//         connector: Connector.PARASWAP_A,
//         method: Method.SWAP,
//         args: [
//           fromToken,
//           toToken,
//           // toWei('0.001', Unit.ETHER),
//           toTokenToBorrow,
//           // `${Math.trunc(
//           //   ((priceRoute as any).destAmount / (priceRoute as any).srcAmount) *
//           //     1e18 *
//           //     0.98
//           // )}`,
//           quote.data.unitAmt,
//           (txParams as any).data,
//           id,
//         ],
//       })
//       nestedSpells.add({
//         connector: Connector.AAVE_V2_A,
//         method: Method.PAYBACK,
//         args: [fromToken, MAX_UINT256, 2, id, 0],
//       })
//       nestedSpells.add({
//         connector: Connector.INSTAPOOL_A,
//         method: Method.FLASH_PAYBACK,
//         args: [
//           Token.amWMATIC,
//           `${Math.trunc(wmaticToFlashLoan * FLASH_LOAN_FACTOR_WITH_SWAP)}`,
//           0,
//           0,
//         ],
//       })
//       const encodedSpells = dsa.encodeSpells(nestedSpells)
//       const encodedParams = web3.eth.abi.encodeParameters(
//         ['string[]', 'bytes[]'],
//         [encodedSpells?.targets, encodedSpells?.spells]
//       )
//       spells.add({
//         connector: Connector.INSTAPOOL_A,
//         method: Method.FLASH_BORROW_AND_CAST,
//         args: [
//           Token.amWMATIC,
//           `${Math.trunc(wmaticToFlashLoan * FLASH_LOAN_FACTOR_WITH_SWAP)}`,
//           0,
//           encodedParams,
//         ],
//       })

//       const txHash = await spells.cast({
//         gasPrice: toWei('2', Unit.GWEI),
//       })
//       console.log('txHash', txHash)
//       if (typeof txHash === 'string') {
//         let txReceipt:
//           | Await<ReturnType<typeof web3.eth.getTransactionReceipt>>
//           | undefined

//         while (!txReceipt) {
//           txReceipt = await web3.eth.getTransactionReceipt(txHash)
//           await new Promise((res) => setTimeout(res, BLOCK_TIME))
//         }
//         console.log('txReceipt', txReceipt)
//       } else {
//         throw new Error('txHash is undefined')
//       }
