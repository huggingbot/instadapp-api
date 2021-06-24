/* Save */
// let nestedSpells = dsa.Spell()
// nestedSpells.add({
//   connector: Connector.AAVE_V2_A,
//   method: Method.ENABLE_COLLATERAL,
//   args: [[Token.WMATIC]],
// })
// nestedSpells.add({
//   connector: Connector.AAVE_V2_A,
//   method: Method.WITHDRAW,
//   args: [Token.MATIC, toWei('0.01', Unit.ETHER), 0, 0],
// })
// nestedSpells.add({
//   connector: Connector.AAVE_V2_A,
//   method: Method.PAYBACK,
//   args: [Token.MATIC, toWei('0.01', Unit.ETHER), 2, 0, 0],
// })
// nestedSpells.add({
//   connector: Connector.INSTAPOOL_A,
//   method: Method.FLASH_PAYBACK,
//   args: [
//     Token.amWMATIC,
//     toWei(`${0.01 * FLASH_LOAN_FACTOR}`, Unit.ETHER),
//     0,
//     0,
//   ],
// })
// const encodedSpells = dsa.encodeSpells(nestedSpells)
// const encodedParams = web3.eth.abi.encodeParameters(
//   ['string[]', 'bytes[]'],
//   [encodedSpells?.targets, encodedSpells?.spells]
// )
// spells.add({
//   connector: Connector.INSTAPOOL_A,
//   method: Method.FLASH_BORROW_AND_CAST,
//   args: [
//     Token.amWMATIC,
//     Web3.utils.toWei(`${0.01 * FLASH_LOAN_FACTOR}`, Unit.ETHER),
//     0,
//     encodedParams,
//   ],
// })
