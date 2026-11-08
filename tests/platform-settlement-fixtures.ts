export const percentFee = { label: 'Admin asumsi', type: 'percent', rate: '5', basis: 'net', minimumMode: 'none', capMode: 'none' }
export const fixedFee = { label: 'Tetap asumsi', type: 'fixed', amount: '2000', scope: 'order', minimumMode: 'none', capMode: 'none' }
export const platformFixture = { price: '100000', quantity: '2', discount: '10000', cost: '60000', buyerShipping: '0', shippingFlow: 'excluded', shipping: '3000', reimbursement: '0', receipts: '0', other: '0', coverage: 'ordinary', confirmation: 'complete', fees: [percentFee, fixedFee] }
