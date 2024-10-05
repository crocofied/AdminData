// =========================== IMPORTS ===========================
import axios from 'axios';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useNavigate } from "react-router-dom";
import SessionChecker from '../components/SessionChecker';
import SiteLoading from '../components/SiteLoading';
import { makePostRequest } from '../utils/api';

const Logout = () => {
    const navigate = useNavigate();

    useEffect(() => {
        if(SessionChecker()) {
            makePostRequest("/logout", {
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