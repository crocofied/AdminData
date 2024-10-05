// =========================== IMPORTS ===========================
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useNavigate } from "react-router-dom";
import SiteLoading from '../components/SiteLoading';
import { makePostRequest } from '../utils/api';

const Logout = () => {
    const navigate = useNavigate();

    useEffect(() => {
        makePostRequest("/logout")
        .then(response => {
            Cookies.remove("session_id");
            navigate("/");
        })
        .catch(error => {
            navigate("/");
        });
    }, []);

    return (
        <SiteLoading />
    )
}

export default Logout;