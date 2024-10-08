// =========================== IMPORTS ===========================
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useNavigate } from "react-router-dom";
import { makePostRequest } from '../utils/api';
import { useTranslation } from 'react-i18next';

const Home = () => {
    const { t, i18n: {changeLanguage, language}} = useTranslation();
    useEffect(() => {
        changeLanguage(Cookies.get("language"));
    }, []);

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(false);
    const [inputDisabled, setInputDisabled] = useState(false);
    const navigate = useNavigate();

    // Initialize the database on first load
    useEffect(() => {
        makePostRequest("/database_init", {}, {
        headers: {
            "Authorization": `Bearer ${import.meta.env.VITE_API_KEY}`,
            "Content-Type": "application/json"
        }
        })
        .then(response => {
        })
        .catch(error => {
            navigate("/");
        });
    }, []);

    useEffect(() => {
        makePostRequest("/check_session")
        .then(response => {
            if(response.data.message === "Session is valid"){
                navigate("/dashboard");
            }
        })
    }, []);

    const showError = () => {
        setError(true);
        setTimeout(() => {
            setError(false);
        }, 5000);
    }

    // Login function
    const login = () => {
        setInputDisabled(true);
        makePostRequest("/login", {
            username: username,
            password: password
        })
        .then(response => {
            navigate("/dashboard");
        })
        .catch(error => {
            showError();
            setInputDisabled(false);
        }
        )
    };

    return (
        <>
            <div className="flex items-center justify-center min-h-screen">
                <div className="card bg-base-200 lg:w-1/3 border border-gray-800 shadow-2xl">
                <figure>
                    <a href="https://github.com/crocofied/AdminData" target="_blank" rel="noopener noreferrer">
                        <img
                        src="/Cover.png"
                        alt="AdminData Logo"
                        className="cursor-pointer" />
                    </a>
                </figure>
                <div className="card-body">
                    {error &&
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
                            <span>{t("home.login_wrong")}</span>
                        </div>
                    }
                    <label className="input input-bordered flex items-center gap-2">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 16 16"
                            fill="currentColor"
                            className="h-4 w-4 opacity-70">
                            <path
                            d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z" />
                        </svg>
                        <input type="text" className="grow" placeholder={t("home.username_placeholder")} disabled={inputDisabled} onChange={(e) => setUsername(e.target.value)}/>
                    </label>
                    <label className="input input-bordered flex items-center gap-2">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 16 16"
                            fill="currentColor"
                            className="h-4 w-4 opacity-70">
                            <path
                            fillRule="evenodd"
                            d="M14 6a4 4 0 0 1-4.899 3.899l-1.955 1.955a.5.5 0 0 1-.353.146H5v1.5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-2.293a.5.5 0 0 1 .146-.353l3.955-3.955A4 4 0 1 1 14 6Zm-4-2a.75.75 0 0 0 0 1.5.5.5 0 0 1 .5.5.75.75 0 0 0 1.5 0 2 2 0 0 0-2-2Z"
                            clipRule="evenodd" />
                        </svg>
                        <input type="password" className="grow" placeholder={t("home.password_placeholder")} disabled={inputDisabled} onChange={(e) => setPassword(e.target.value)}/>
                    </label>
                    <div className="card-actions justify-end">
                    <button onClick={login} disabled={inputDisabled} className="btn btn-primary w-full">{t("home.login_button")}</button>
                    </div>
                    <a href="https://admindata.xyz" className="text-center text-gray-600 text-xs underline">{t("home.footer")}</a>
                </div>
                </div>
            </div>
        </>
    );
};

export default Home;