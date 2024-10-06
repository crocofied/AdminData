import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import Navbar from '../components/Navbar';
import { makePostRequest } from '../utils/api';
import { FaKey, FaLock, FaUser } from "react-icons/fa";
import { useTranslation } from 'react-i18next';

const Settings = () => {
    const { t, i18n: {changeLanguage, language}} = useTranslation();
    useEffect(() => {
        makePostRequest("/get_language")
        .then(response => {
            changeLanguage(response.data.language);
        })
        .catch(error => {
            console.error(error);
        });
    }, []);

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [repeatNewPassword, setRepeatNewPassword] = useState("");
    const [error, setError] = useState("");
    const [errorVisible, setErrorVisible] = useState(false);
    const [success, setSuccess] = useState(false);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");


    useEffect(() => {
        makePostRequest("/check_session")
        .then(response => {
            if(response.data.message !== "Session is valid"){
                navigate("/");
            }
        })
        .catch(error => {
            navigate("/");
        });
    }, []);

    const showError = (message) => {
        setError(message);
        setErrorVisible(true);
        setTimeout(() => {
            setErrorVisible(false);
            setError("");
        }, 5000);
    };

    const changePassword = () => {
        document.getElementById('change_password_button').disabled = true;
        if (newPassword !== repeatNewPassword) {
            showError(t("settings.password_not_matching"));
            document.getElementById('change_password_button').disabled = false;
            return;
        }
        if (currentPassword === "") {
            showError(t("settings.current_password_empty"));
            document.getElementById('change_password_button').disabled = false;
            return;
        }
        if (newPassword === "") {
            showError(t("settings.new_password_empty"));
            document.getElementById('change_password_button').disabled = false;
            return;
        }
        if (repeatNewPassword === "") {
            showError(t("settings.repeat_new_password_empty"));
            document.getElementById('change_password_button').disabled = false;
            return;
        }
        if (currentPassword === newPassword) {
            showError(t("settings.current_password_new_password_same"));
            document.getElementById('change_password_button').disabled = false;
            return;
        }
        makePostRequest("/change_password", {
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
                showError(t("settings.error_changing_password"));
            }
        })
        .catch(error => {
            showError(t("settings.error_changing_password"));
        });
        document.getElementById('change_password_button').disabled = false;
    };

    const changeUsername = () => {
        if (username === "") {
            showError(t("settings.username_empty"));
            document.getElementById('change_username_button').disabled = false;
            return;
        }
        if (password === "") {
            showError(t("settings.password_empty"));
            document.getElementById('change_username_button').disabled = false;
            return;
        }
        document.getElementById('change_username_button').disabled = true;
        makePostRequest("/change_username", {
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
                showError(t("settings.error_changing_username_message") + response.data.message);
            }
        })
        .catch(error => {
            showError(t("settings.error_changing_username"));
        });
        document.getElementById('change_username_button').disabled = false;
    };

    const setLanguage = (language) => {
        makePostRequest("/change_language", {
            new_language: language
        })
        .then(response => {
            changeLanguage(language);
            Cookies.set("language", language);
        })
        .catch(error => {
        });
    };

    return (
        <div className="flex min-h-screen bg-base-200">
            <Navbar />
            <div className="flex-1 p-10">
                <h1 className="text-4xl font-bold mb-8">{t("settings.title")}</h1>
                
                <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-base-100 rounded-lg shadow-md p-6 mb-8">
                        <h2 className="text-2xl font-semibold mb-4">{t("settings.change_password")}</h2>
                        <p className="mb-4">
                            {t("settings.change_password_description")}
                        </p>
                        <button 
                            className="btn btn-primary w-full"
                            onClick={() => document.getElementById('my_modal_3').showModal()}
                        >
                            {t("settings.change_password")}
                        </button>
                    </div>

                    <div className="bg-base-100 rounded-lg shadow-md p-6 mb-8">
                        <h2 className="text-2xl font-semibold mb-4">{t("settings.change_username")}</h2>
                        <p className="mb-4">
                            {t("settings.change_username_description")}
                        </p>
                        <button 
                            className="btn btn-primary w-full"
                            onClick={() => document.getElementById('my_modal_4').showModal()}
                        >
                            {t("settings.change_username")}
                        </button>
                    </div>
                </div>

                <div className="bg-base-100 rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-2xl font-semibold mb-4">{t("settings.change_language")}</h2>
                    <p className="mb-4">
                        {t("settings.change_language_description")}
                    </p>
                    <select className="select select-bordered w-full max-w-xs" value={language} onChange={(e) => setLanguage(e.target.value)}>
                        <option value="en">{t("settings.english")}</option>
                        <option value="de">{t("settings.german")}</option>
                    </select>
                </div>

                {/* Password Change Modal */}
                <dialog id="my_modal_3" className="modal">
                    <div className="modal-box">
                        <form method="dialog">
                            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={() => setSuccess(false)}>✕</button>
                        </form>
                        <h3 className="font-bold text-lg mb-4">{t("settings.change_password_modal_title")}</h3>
                        
                        {errorVisible && (
                            <div className="alert alert-error mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{error}</span>
                            </div>
                        )}
                        
                        {success && (
                            <div className="alert alert-success mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{t("settings.password_changed_successfully")}</span>
                            </div>
                        )}
                        
                        <div className='pb-3'>
                            <label className="input input-bordered flex items-center gap-2">
                                <FaKey className="h-4 w-4 opacity-70" />
                                <input type="password" className="grow" placeholder={t("settings.old_password")} onChange={(e) => setCurrentPassword(e.target.value)} value={currentPassword} />
                            </label>
                        </div>
                        <div className='pb-3'>
                            <label className="input input-bordered flex items-center gap-2">
                                <FaLock className="h-4 w-4 opacity-70" />
                                <input type="password" className="grow" placeholder={t("settings.new_password")} onChange={(e) => setNewPassword(e.target.value)} value={newPassword} />
                            </label>
                        </div>
                        <div className='pb-3'>
                            <label className="input input-bordered flex items-center gap-2">
                                <FaLock className="h-4 w-4 opacity-70" />
                                <input type="password" className="grow" placeholder={t("settings.confirm_password")} onChange={(e) => setRepeatNewPassword(e.target.value)} value={repeatNewPassword} />
                            </label>
                        </div>
                        
                        <button id="change_password_button" className="btn btn-primary w-full" onClick={changePassword}>{t("settings.change_password")}</button>
                    </div>
                </dialog>

                {/* Username Change Modal */}
                <dialog id="my_modal_4" className="modal">
                    <div className="modal-box">
                        <form method="dialog">
                            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={() => setSuccess(false)}>✕</button>
                        </form>
                        <h3 className="font-bold text-lg mb-4">{t("settings.change_username_modal_title")}</h3>
                        
                        {errorVisible && (
                            <div className="alert alert-error mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{error}</span>
                            </div>
                        )}
                        
                        {success && (
                            <div className="alert alert-success mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{t("settings.username_changed_successfully")}</span>
                            </div>
                        )}
                        
                        <div className='pb-3'>
                            <label className="input input-bordered flex items-center gap-2">
                                <FaUser className="h-4 w-4 opacity-70" />
                                <input type="text" className="grow" placeholder={t("settings.new_username")} onChange={(e) => setUsername(e.target.value)} value={username} />
                            </label>
                        </div>
                        <div className='pb-3'>
                            <label className="input input-bordered flex items-center gap-2">
                                <FaLock className="h-4 w-4 opacity-70" />
                                <input type="password" className="grow" placeholder={t("settings.password")} onChange={(e) => setPassword(e.target.value)} value={password} />
                            </label>
                        </div>
                        
                        <button id="change_username_button" className="btn btn-primary w-full" onClick={changeUsername}>{t("settings.change_username")}</button>
                    </div>
                </dialog>
            </div>
        </div>
    );
}

export default Settings;