// =========================== IMPORTS ===========================
import axios from 'axios';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useNavigate } from "react-router-dom";
import SessionChecker from '../common/components/SessionChecker';
import SiteLoading from '../common/components/SiteLoading';

const Logout = () => {
    const navigate = useNavigate();

    useEffect(() => {
        if(SessionChecker()) {
            axios.post(`${import.meta.env.VITE_API_URL}/logout`, {
                session_id: Cookies.get("session_id")
            })
            .then(response => {
                Cookies.remove("session_id");
                navigate("/");
            })
            .catch(error => {
                navigate("/");
            });
        }
        else {
            navigate("/");
        }
    }, []);

    return (
        <SiteLoading />
    )
}

export default Logout;