import React, { useReducer, useContext } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import Swal from 'sweetalert2';

import CartReducer from './CartReducer';
import CartContext from './CartContext';
import ProductContext from '../product/ProductContext';
import { 
    ADD_TO_CART_SUCCESS,
    ADD_TO_CART_FAILURE,
    REMOVE_FROM_CART_SUCCESS,
    REMOVE_FROM_CART_FAILURE,
    GET_CART_PRODUCTS_SUCCESS,
    GET_CART_PRODUCTS_FAILURE
} from '../../Types';

const CartState = (props) => {
    const initialState = {
        cart: {}
    };

    const [state, dispatch] = useReducer(CartReducer, initialState);

    const { showProductPopup, hideProduct } = useContext(ProductContext);

    const [ cookies, setCookie, removeCookie ] = useCookies(['cart_id']);

    const addToCart = async product => {
        let randomString = '';

        if (cookies.cart_id === undefined) {
            const charString = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

            for (var i = 32; i > 0; --i) {
                randomString += charString[Math.floor(Math.random() * charString.length)]
            };
            
            await setCookie('cart_id', randomString, { maxAge: 3600 });
        }

        try {
            const response = await axios.post('/cart/add', {
                cart_id: cookies.cart_id !== undefined ? cookies.cart_id : randomString,
                product_id: product._id,
                size: product.size,
                quantity: product.quantity
            }, {
                'Content-Type': 'application/json'
            });

            dispatch({
                type: ADD_TO_CART_SUCCESS,
                payload: response.data
            });

            if (showProductPopup) {
                hideProduct();
            }

            Swal.fire({
                title: 'Success!',
                icon: 'success',
                text: 'Product added to cart'
            });
        } catch (error) {
            dispatch({
                type: ADD_TO_CART_FAILURE
            })
        }
    }

    const removeFromCart = () => {
        dispatch({
            type: REMOVE_FROM_CART_SUCCESS
        })
    }

    const getCartProducts = async () => {
        if (cookies.cart_id !== undefined) {
            try {
                const response = await axios.get('/cart/list/' + cookies.cart_id, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
    
                dispatch({
                    type: GET_CART_PRODUCTS_SUCCESS,
                    payload: response.data
                })
            } catch (error) {
                dispatch({
                    type: GET_CART_PRODUCTS_FAILURE
                });
            }
        }
    }

    return (
        <>
            <CartContext.Provider value={{
                cart: state.cart,
                addToCart,
                removeFromCart,
                getCartProducts
            }}>
                {props.children}
            </CartContext.Provider>
        </>
    )
}

export default CartState;