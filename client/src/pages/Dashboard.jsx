import axios from 'axios';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useNavigate } from "react-router-dom";


const Home = () => {
    const navigate = useNavigate();
    
    useEffect(() => {
        if(!Cookies.get("session_id")) {
            navigate("/");
        }
    }, []);

    return (
        <>
        Soon
        </>
    )
}

export default Home;

