export function checkoutProductData(cart,orderType) {
    const delivery_charge = 5;
    if(Array.isArray(cart) === false) return;
    const modified_cart =  cart.map((item,index) => {
        return {
            price_data: {
                currency: 'gbp',
                product_data: {
                    name :item.name,
                },
                unit_amount: Math.round(item.price * 100)
            },
            quantity:item.quantity,
        }
    });
    if (orderType === 'collection') return modified_cart;
    return [
        ...modified_cart,
        {
            price_data: {
                currency : 'gbp',
                product_data : {name:'delivery charge'},
                unit_amount: Math.round(delivery_charge * 100)
            },
            quantity:1,
        }
    ]

}