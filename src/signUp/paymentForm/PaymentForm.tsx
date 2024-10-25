import { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import modeUrl from '../../ModeUrl';

interface Props {
    updateUserState: () => void;
    username: string;
    closeModal: () => void;
}

interface CustomerAddress {
    city: string;
    address1: string;
    address2?: string;
    postnumber: string;
}

function PaymentForm(props: Props) {
    const stripe = useStripe();
    const elements = useElements();

    const [address, setAddress] = useState<CustomerAddress>({} as CustomerAddress);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setAddress({ ...address, [name]: value });
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        const token = localStorage.getItem('token');

        if (!stripe || !elements) {
            return; // Stripe.js has not yet loaded.
        }

        const fetchHttp = modeUrl + "/stripe/upgrade";

        // Call your server to create the subscription and get clientSecret
        const productId = 'prod_R5BGz44j6oBGBQ'; // Replace with the actual product ID
        const response = await fetch(fetchHttp, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'productId': productId,
            },
            body: JSON.stringify(address),
        });

        if (!response.ok) {
            console.error('Failed to upgrade subscription');
            return;
        }

        const { clientSecret } = await response.json();

        // Confirm the payment
        const cardElement = elements.getElement(CardElement);
        const { error } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: cardElement!,
                billing_details: {
                    name: `${address.address1} ${address.address2}`,
                    email: props.username, 
                },
            },
        });

        if (error) {
            console.error('Payment confirmation error:', error);
        } else {
            alert('Payment successful!');
            props.updateUserState();
            props.closeModal()
        }
    };

    return (
        <form onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()}>
            <label>
                Address Line 1
                <input
                    type="text"
                    name="address1"
                    value={address.address1}
                    onChange={handleInputChange}
                    required
                />
            </label>
            <label>
                Address Line 2
                <input
                    type="text"
                    name="address2"
                    value={address.address2}
                    onChange={handleInputChange}
                />
            </label>
            <label>
                City
                <input
                    type="text"
                    name="city"
                    value={address.city}
                    onChange={handleInputChange}
                    required
                />
            </label>
            <label>
                Postal Code
                <input
                    type="text"
                    name="postnumber"
                    value={address.postnumber}
                    onChange={handleInputChange}
                    required
                />
            </label>
            <CardElement />
            <button type="submit" disabled={!stripe}>Pay</button>
        </form>
    );
}

export default PaymentForm