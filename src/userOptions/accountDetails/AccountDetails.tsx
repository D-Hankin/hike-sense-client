import { useEffect, useState } from "react";
import Modal from 'react-modal'; 
import "./accountDetails.css"
import { Elements } from "@stripe/react-stripe-js";
import PaymentForm from "../../signUp/paymentForm/PaymentForm";
import { loadStripe } from "@stripe/stripe-js";
import modeUrl from "../../ModeUrl";
import { User } from "../../User";

interface AccountDetailsProps {
    user: User;
    handleUpdateState: () => void;
    handleIsModalOpen: (value: boolean) => void;
}

Modal.setAppElement('#root');

function AccountDetails(props: AccountDetailsProps) {
    const [isEditingUser, setIsEditingUser] = useState<boolean>(false);
    const [firstName, setFirstName] = useState<string>('');
    const [lastName, setLastName] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');

    const [isCancelModalOpen, setIsCancelModalOpen] = useState<boolean>(false); 
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState<boolean>(false); 

    const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

    const handleEditAccountClick = () => {
        setIsEditingUser(true);
    }

    const handleCancelSubscriptionClick = () => {
        setIsCancelModalOpen(true);
    }

    const handleUpdateSubscriptionClick = () => {
        setIsUpdateModalOpen(true);
    }

    const closeModal = () => {
        setIsCancelModalOpen(false);
        setIsUpdateModalOpen(false);
    }

    const handleConfirmSubscriptionUpdate = async () => {
        closeModal();
        const fetchHttp = modeUrl + "/stripe/cancel";
        const token = "Bearer " + localStorage.getItem("token");
        const response = await fetch(fetchHttp, {
            method: "POST",
            headers: {
                "Authorization": token,
                "Content-Type": "application/json",
                "subscriptionId": props.user.subscriptionStatus.substring(7)
            },
        });
        if (!response.ok) {
            console.error('Failed to cancel subscription');
            alert("Failed to cancel subscription. Please try again.");
            return;
        }
        
        const message = await response.json();
        alert(message.status);
        props.handleUpdateState()
    }

    useEffect(() => {
        props.handleIsModalOpen(isUpdateModalOpen);
    }, [isUpdateModalOpen]);

    useEffect(() => {
        props.handleIsModalOpen(isCancelModalOpen);
    }, [isCancelModalOpen]);

    return (
        <div>
            {!isEditingUser ? (
                <div className="accountDetailsDiv">
                    <h3>Account Details</h3>
                    <p className="detailsP">First Name: {props.user.firstName}</p>
                    <p className="detailsP">Last Name: {props.user.lastName}</p>
                    <p className="detailsP">Email: {props.user.username}</p>
                    <p className="detailsP">Subscription Status: {props.user.subscriptionStatus.substring(0, 7)}</p>
                    {props.user.subscriptionStatus.includes("premium") ? (
                        <p className="detailsP">Subscription Number: {props.user.subscriptionStatus.substring(7)}</p>
                    ) : null}
                    <button className="detailsButton" onClick={handleEditAccountClick}>Edit Account</button>
                    <button className="detailsButton" onClick={props.user.subscriptionStatus.includes("premium") ? 
                                                                handleCancelSubscriptionClick : handleUpdateSubscriptionClick}>Update Subscription</button>
                </div>
            ) : (
                <div className="accountDetailsDiv">
                    <h3>Edit Account</h3>
                    <input
                        type="text"
                        placeholder="First Name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Last Name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button className="detailsButton" onClick={handleEditAccountClick}>
                        Save Changes
                    </button>
                    <button className="detailsButton" onClick={() => setIsEditingUser(false)}>
                        Cancel
                    </button>
                </div>
            )}

            <Modal
                isOpen={isCancelModalOpen}
                onRequestClose={closeModal}
                contentLabel="Confirm Cancel Subscription"
                style={{
                    content: {
                        backgroundColor: 'darkgreen',
                        border: '3px solid black',
                        borderRadius: '10px',
                        top: '50%',
                        left: '50%',
                        right: 'auto',
                        bottom: 'auto',
                        transform: 'translate(-50%, -50%)',
                        width: '400px',
                        height: '200px',
                        padding: '20px',
                    },
                }}
            >
                <h2>Are you sure you want to cancel your subscription?</h2>
                <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '20px', gap: "5px" }}>
                    <button className="detailsButton" onClick={closeModal}>
                        No, Keep Subscription
                    </button>
                    <button className="detailsButton" onClick={handleConfirmSubscriptionUpdate}>
                        Yes, Cancel Subscription
                    </button>
                </div>
            </Modal>
            <Modal
            isOpen={isUpdateModalOpen}
            shouldCloseOnOverlayClick={false}
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
                    <PaymentForm updateUserState={props.handleUpdateState} username={props.user.username} closeModal={closeModal}/>
                </Elements>
                <button style={{marginTop: "10px"}} onClick={closeModal}>Cancel</button>
            </Modal>
        </div>
    );
}

export default AccountDetails;
