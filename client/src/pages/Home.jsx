import axios from 'axios';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useNavigate } from "react-router-dom";

const Home = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        axios.post(`http://${import.meta.env.VITE_API_URL}/database_init`, {}, {
        headers: {
            "Authorization": `Bearer ${import.meta.env.VITE_API_KEY}`,
            "Content-Type": "application/json"
        }
        })
        .then(response => {
        console.log("Response:", response);
        })
        .catch(error => {
        console.error("Error:", error);
        });
    }, []);

    const login = () => {
        axios.post(`http://${import.meta.env.REACT_APP_API_URL}/login`, {
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
            console.error("Error:", error);
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