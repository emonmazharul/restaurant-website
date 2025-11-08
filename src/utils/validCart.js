
export const cartChecker = (cart => {
    if (!Array.isArray(cart) || cart.length === 0) return false;
    
    
    const carItemTypes =  {
      id:'number', category:'string', name:'string', price: 'number', quantity:'number'
    }

    let isValid = true;

    for (let i=0; i<cart.length; i++) {
      const item = cart[i];
      if(isValid == false) break;

      for (let x in carItemTypes) {
        console.log(typeof item[x], carItemTypes[x] )
        if (carItemTypes[x] == typeof item[x]) {
          isValid = true;
        } else {
          isValid = false;
          break;
        }
      }
    };
    return isValid;
});
