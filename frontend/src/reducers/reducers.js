export const MyUserReducer = (current, action) => {
    switch (action.type) {
        case "LOGIN":
            return action.payload;
        case "LOGOUT":
            return null;
    }

    return current;
}

export const MyCartReducer = (state, action) => {
    switch (action.type) {
        case "ADD_ITEM": {
            const { food, quantity } = action.payload;
            const existing = state.find(item => item.food.id === food.id);
 
            if (existing) {
                return state.map(item =>
                    item.food.id === food.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
 
            return [...state, { food, quantity }];
        }
 
        case "UPDATE_QUANTITY": {
            const { foodId, quantity } = action.payload;
            if (quantity <= 0) {
                return state.filter(item => item.food.id !== foodId);
            }
            return state.map(item =>
                item.food.id === foodId ? { ...item, quantity } : item
            );
        }
 
        case "REMOVE_ITEM":
            return state.filter(item => item.food.id !== action.payload);
 
        case "CLEAR_CART":
            return [];
 
        default:
            return state;
    }
}