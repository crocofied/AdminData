import axios from 'axios';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useNavigate } from "react-router-dom";
import SessionChecker from '../components/SessionChecker';
import Navbar from '../components/Navbar';

const Home = () => {
    const navigate = useNavigate();

    useEffect(() => {
        if(!SessionChecker()) {
            navigate("/");
        }
    }, []);

    return (
        <>
        <div className="flex space-x-12">
                <Navbar />
                <div className='pt-10 pr-10 w-full'>
                    
                </div>
            </div>
        </>
    )
}

export default Home;

