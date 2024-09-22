// =========================== IMPORTS ===========================
import axios from 'axios';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useNavigate } from "react-router-dom";

const Home = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const userLoggedin = () => {
        if(!Cookies.get("session_id")) {
            return false;
        }
        axios.post(`http://${import.meta.env.VITE_HOST_IP}:5000/check_session`, {
            session_id: Cookies.get("session_id")
        }, {
            headers: {
                "Authorization": `Bearer ${import.meta.env.VITE_API_KEY}`,
                "Content-Type": "application/json"
            }
        })
        .then(response => {
            return true;
        })
        .catch(error => {
            return false;
        }, {})
    }

    // Initialize the database on first load
    useEffect(() => {
        axios.post(`http://${import.meta.env.VITE_HOST_IP}:5000/database_init`, {}, {
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

    // Check if the user is already logged in
    useEffect(() => {
        if(userLoggedin()) {
            navigate("/dashboard");
        }
    }, []);

    // Login function
    const login = () => {
        axios.post(`http://${import.meta.env.VITE_HOST_IP}:5000/login`, {
            username: username,
            password: password
        }, {
            headers: {
                "Authorization": `Bearer ${import.meta.env.VITE_API_KEY}`,
                "Content-Type": "application/json"
            }
        })
        .then(response => {
            Cookies.set("session_id", response.data.session_id, {expires: 7});
            navigate("/dashboard");
        })
        .catch(error => {
            navigate("/");
        }
        )
    };

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="card bg-base-200 w-1/3 shadow-xl">
            <div className="card-body">
                <h2 className="card-title">AdminData</h2>
                <input type="text" placeholder="Username" onChange={(e) => setUsername(e.target.value)} className="input input-bordered w-full max-w-full" />
                <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} className="input input-bordered w-full max-w-full" />
    
                <div className="card-actions justify-end">
                <button onClick={login} className="btn btn-primary">Login</button>
                </div>
                <div className="text-center text-gray-600 text-xs">AdminData - A secure and modern self hosted Database Client</div>
            </div>
            </div>
        </div>
    );
};

export default Home;