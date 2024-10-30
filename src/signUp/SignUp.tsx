import { useState } from "react";
import Modal from "react-modal";
import { Elements } from '@stripe/react-stripe-js';
import PaymentForm from "./paymentForm/PaymentForm";
import {loadStripe} from '@stripe/stripe-js';
import './SignUp.css';

interface Props {
    updateUserState: () => void;
    username: string;
}

Modal.setAppElement('#root');

function SignUp(props: Props) {

    const [modalIsOpen, setModalIsOpen] = useState(false);
    const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

    const openModal = () => {
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
    };

  return (
    <div>
        <h2 className="signUpHeader">Unlock Your Adventure!</h2> 
        <div className="upgradeDiv">
            <p>Upgrade to Premium for only £10/month and gain access to our AI Assistant, your personal hiking companion. Get tailored tips on established trails, nearby restaurants, tourist attractions, and everything you need to enhance your hiking experience. Discover hidden gems and make the most of your outdoor adventures with expert recommendations at your fingertips. Sign up today and elevate your hikes!</p>
            <button className="upgradeBtn" onClick={openModal}>Upgrade Now!</button>
        </div>
        <Modal
            isOpen={modalIsOpen}
            onRequestClose={closeModal}
            contentLabel="Upgrade Subscription"
            style={{
                content: {
                    backgroundColor: "darkgreen",
                    borderRadius: '10px',
                    top: '50%',
                    left: '50%',
                    right: 'auto',
                    bottom: 'auto',
                    transform: 'translate(-50%, -50%)',
                    width: '400px', 
                    height: '600px', 
                },
            }}
        >
            <h2>Upgrade Your Subscription</h2>
            <Elements stripe={stripePromise}>
                <PaymentForm updateUserState={props.updateUserState} username={props.username} closeModal={closeModal}/>
            </Elements>
            <button style={{marginTop: "10px"}} onClick={closeModal}>Cancel</button>
        </Modal>
    </div>
  )
}

export default SignUp