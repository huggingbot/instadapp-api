/* MATIC to DAI */
// let spells = dsa.Spell()
// const slippage = 2
//   const quoteApiUrl = `https://api.instadapp.io/defi/polygon/paraswap/quote?buyToken=${
//     Token.DAI
//   }&sellToken=${Token.MATIC}&sellAmount=${toWei(
//     '0.01',
//     Unit.ETHER
//   )}&maxSlippage=${slippage}&fee=0`
//   const quote = await axios.get(quoteApiUrl)
//   console.log('quote', quote)
//   const priceApiUrl = 'https://api.instadapp.io/defi/polygon/prices'
//   const prices = (await axios.get(priceApiUrl)) as any
//   const wmaticPrice = Number(prices.data[Token.WMATIC])
//   console.log('wmaticPrice', wmaticPrice)

//   const priceRoute = await paraswap.getRate(
//     Token.MATIC,
//     Token.DAI,
//     toWei('0.01', Unit.ETHER)
//   )
//   console.log('priceRoute', priceRoute)
//   const txParams = await paraswap.buildTx(
//     Token.MATIC,
//     Token.DAI,
//     toWei('0.01', Unit.ETHER),
//     (priceRoute as any).destAmount,
//     priceRoute as any,
//     accounts[0].address,
//     'instadapp.io'
//   )
//   console.log('txParams', txParams)

//   /* Collateral Swap */
//   let nestedSpells = dsa.Spell()
//   nestedSpells.add({
//     connector: Connector.AAVE_V2_A,
//     method: Method.ENABLE_COLLATERAL,
//     args: [[Token.WMATIC]],
//   })
//   nestedSpells.add({
//     connector: Connector.AAVE_V2_A,
//     method: Method.WITHDRAW,
//     args: [Token.MATIC, toWei('0.01', Unit.ETHER), 0, 0],
//   })

//   const id = Date.now()
//   nestedSpells.add({
//     connector: Connector.PARASWAP_A,
//     method: Method.SWAP,
//     args: [
//       Token.DAI,
//       Token.MATIC,
//       toWei('0.01', Unit.ETHER),
//       `${
//         ((priceRoute as any).destAmount / (priceRoute as any).srcAmount) *
//         1e18 *
//         0.98
//       }`,
//       // quote.data.unitAmt,
//       (txParams as any).data,
//       id,
//     ],
//   })
//   nestedSpells.add({
//     connector: Connector.AAVE_V2_A,
//     method: Method.DEPOSIT,
//     args: [Token.DAI, 0, id, 0],
//   })
//   nestedSpells.add({
//     connector: Connector.INSTAPOOL_A,
//     method: Method.FLASH_PAYBACK,
//     args: [
//       Token.amWMATIC,
//       toWei(
//         `${
//           ((priceRoute as any).fromUSD / wmaticPrice) *
//           FLASH_LOAN_FACTOR_WITH_SWAP
//         }`,
//         Unit.ETHER
//       ),
//       0,
//       0,
//     ],
//   })
//   const encodedSpells = dsa.encodeSpells(nestedSpells)
//   const encodedParams = web3.eth.abi.encodeParameters(
//     ['string[]', 'bytes[]'],
//     [encodedSpells?.targets, encodedSpells?.spells]
//   )
//   spells.add({
//     connector: Connector.INSTAPOOL_A,
//     method: Method.FLASH_BORROW_AND_CAST,
//     args: [
//       Token.amWMATIC,
//       Web3.utils.toWei(
//         `${
//           ((priceRoute as any).fromUSD / wmaticPrice) *
//           FLASH_LOAN_FACTOR_WITH_SWAP
//         }`,
//         Unit.ETHER
//       ),
//       0,
//       encodedParams,
//     ],
//   })
