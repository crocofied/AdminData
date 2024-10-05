import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import SessionChecker from '../components/SessionChecker';
import Navbar from '../components/Navbar';
import { makePostRequest } from '../utils/api';
import { FaKey, FaLock, FaUser } from "react-icons/fa";

const Settings = () => {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [repeatNewPassword, setRepeatNewPassword] = useState("");
    const [error, setError] = useState("");
    const [errorVisible, setErrorVisible] = useState(false);
    const [success, setSuccess] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    useEffect(() => {
        if(!SessionChecker()) {
            navigate("/");
        }
    }, []);

    const showError = (message) => {
        setError(message);
        setErrorVisible(true);
        setTimeout(() => {
            setErrorVisible(false);
            setError("");
        }, 5000); // Error wird nach 5 Sekunden ausgeblendet
    };

    const changePassword = () => {
        if (newPassword !== repeatNewPassword) {
            showError("Passwords do not match.");
            return;
        }
        makePostRequest("/change_password", {
            session_id: Cookies.get("session_id"),
            current_password: currentPassword,
            new_password: newPassword
        })
        .then(response => {
            if (response.data.message === "Password changed successfully") {
                setSuccess(true);
                setErrorVisible(false);
                setCurrentPassword("");
                setNewPassword("");
                setRepeatNewPassword("");
                setTimeout(() => {
                    document.getElementById('my_modal_3').close();
                    setSuccess(false);
                }, 5000);
            } else {
                showError("Error changing password.");
            }
        })
        .catch(error => {
            showError("Error changing password.");
        });
    };

    const changeUsername = () => {
        makePostRequest("/change_username", {
            session_id: Cookies.get("session_id"),
            new_username: username,
            password: password
        })
        .then(response => {
            if (response.data.message === "Username changed successfully") {
                setSuccess(true);
                setErrorVisible(false);
                setUsername("");
                setPassword("");
                setTimeout(() => {
                    document.getElementById('my_modal_4').close();
                    setSuccess(false);
                }, 5000);
            } else {
                showError("Error changing username: " + response.data.message);
            }
        })
        .catch(error => {
            showError("Error changing username.");
        });
    };

    return (
        <>
            <div className="flex space-x-12">
                <Navbar />
                <div className='pt-10 pr-10 w-full'>
                    <h1 className="text-5xl font-bold">Account Settings</h1>
                    <div className="divider"></div>
                    <div className="w-3/4">
                        <h2 className="text-3xl font-medium">Change Password</h2>
                        <div className='flex flex-wrap justify-between items-center'>
                            <div className='text-lg pt-5'>
                                If you would like to change your password, you can do so here.
                            </div>
                            <div className='text-right'>
                                <button className="btn" onClick={() => document.getElementById('my_modal_3').showModal()}>
                                    Change Password
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="divider"></div>
                    <div className="w-3/4">
                        <h2 className="text-3xl font-medium">Change Username</h2>
                        <div className='flex flex-wrap justify-between items-center'>
                            <div className='text-lg pt-5'>
                                If you would like to change your username, you can do so here.
                            </div>
                            <div className='text-right'>
                                <button className="btn" onClick={() => document.getElementById('my_modal_4').showModal()}>
                                    Change Username
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <dialog id="my_modal_3" className="modal">
                    <div className="modal-box">
                        <form method="dialog">
                            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                        </form>
                        <h3 className="font-bold text-lg">Change your Password!</h3>
                        <div className="divider"></div>
                        {errorVisible &&
                            <div className='pb-5'>
                                <div role="alert" className="alert alert-error">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-6 w-6 shrink-0 stroke-current"
                                        fill="none"
                                        viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>{error}</span>
                                </div>  
                            </div>
                        }
                        {success &&
                            <div className='pb-5'>
                                <div role="alert" className="alert alert-success">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-6 w-6 shrink-0 stroke-current"
                                        fill="none"
                                        viewBox="0 0 24 24">
                                        <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>Password changed!</span>
                                </div>
                            </div>
                        }
                        <div className='pb-3'>
                            <label className="input input-bordered flex items-center gap-2">
                                <FaKey className="h-4 w-4 opacity-70" />
                                <input type="password" className="grow" placeholder='Old Password' onChange={(e) => setCurrentPassword(e.target.value)} value={currentPassword} />
                            </label>
                        </div>
                        <div className='pb-3'>
                            <label className="input input-bordered flex items-center gap-2">
                                <FaLock className="h-4 w-4 opacity-70" />
                                <input type="password" className="grow" placeholder='New Password' onChange={(e) => setNewPassword(e.target.value)} value={newPassword} />
                            </label>
                        </div>
                        <div className='pb-3'>
                            <label className="input input-bordered flex items-center gap-2">
                                <FaLock className="h-4 w-4 opacity-70" />
                                <input type="password" className="grow" placeholder='Repeat New Password' onChange={(e) => setRepeatNewPassword(e.target.value)} value={repeatNewPassword} />
                            </label>
                        </div>
                        <button className="btn w-full" onClick={changePassword}>Change Password</button>
                    </div>
                </dialog>

                <dialog id="my_modal_4" className="modal">
                    <div className="modal-box">
                        <form method="dialog">
                            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                        </form>
                        <h3 className="font-bold text-lg">Change your Username!</h3>
                        <div className="divider"></div>
                        {errorVisible &&
                            <div className='pb-5'>
                                <div role="alert" className="alert alert-error">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-6 w-6 shrink-0 stroke-current"
                                        fill="none"
                                        viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>{error}</span>
                                </div>  
                            </div>
                        }
                        {success &&
                            <div className='pb-5'>
                                <div role="alert" className="alert alert-success">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-6 w-6 shrink-0 stroke-current"
                                        fill="none"
                                        viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>Username changed!</span>
                                </div>
                            </div>
                        }
                        <div className='pb-3'>
                            <label className="input input-bordered flex items-center gap-2">
                                <FaUser className="h-4 w-4 opacity-70" />
                                <input type="text" className="grow" placeholder='New Username' onChange={(e) => setUsername(e.target.value)} value={username} />
                            </label>
                        </div>
                        <div className='pb-3'>
                            <label className="input input-bordered flex items-center gap-2">
                                <FaLock className="h-4 w-4 opacity-70" />
                                <input type="password" className="grow" placeholder='Password' onChange={(e) => setPassword(e.target.value)} value={password} />
                            </label>
                        </div>
                        <button className="btn w-full" onClick={changeUsername}>Change Username</button>
                    </div>
                </dialog>
            </div>
        </>
    );
}

export default Settings;
