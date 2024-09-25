import axios from 'axios';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useNavigate } from "react-router-dom";
import SessionChecker from '../components/SessionChecker';
import Navbar from '../components/Navbar';
import { FaDatabase, FaServer, FaNetworkWired, FaUser, FaEdit, FaPlug } from 'react-icons/fa';

const Home = () => {
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [errorVisible, setErrorVisible] = useState(false);
    const [name, setName] = useState("");
    const [type, setType] = useState("");
    const [host, setHost] = useState("");
    const [port, setPort] = useState(0);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [connections, setConnections] = useState([]);
    const [currentConnectionId, setCurrentConnectionId] = useState(0);

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
        }, 5000);
    };

    const addConnection = () => {
        if (name === "" || type === "" || host === "" || port === 0 || username === "" || password === "") {
            showError("Please fill out all fields.");
            return;
        }
        axios.post(`http://${import.meta.env.VITE_HOST_IP}:5000/add_connection`, {
            session_id: Cookies.get("session_id"),
            name: name,
            type: type,
            host: host,
            port: port,
            user: username,
            password: password
        })
        .then(response => {
            if (response.data.message === "Connection added") {
                setErrorVisible(false);
                setName("");
                setType("");
                setHost("");
                setPort(0);
                setUsername("");
                setPassword("");
                document.getElementById('my_modal_3').close();
                updateConnections();
            } else {
                showError("Error adding connection.");
                
            }
        })
        .catch(error => {
            showError("Error adding connection.");
        });
    };


    const editConnection = () => {
        if (name === "" || type === "" || host === "" || port === 0 || username === "") {
            showError("Please fill out all fields.");
            return;
        }
        axios.post(`http://${import.meta.env.VITE_HOST_IP}:5000/edit_connection`, {
            session_id: Cookies.get("session_id"),
            id: currentConnectionId,
            name: name,
            type: type,
            host: host,
            port: port,
            user: username,
            password: password
        })
        .then(response => {
            if (response.data.message === "Connection updated") {
                setErrorVisible(false);
                setName("");
                setType("");
                setHost("");
                setPort(0);
                setUsername("");
                setPassword("");
                document.getElementById('my_modal_4').close();
                updateConnections();
            } else {
                showError("Error editing connection.");
            }
        })
        .catch(error => {
            showError("Error editing connection.");
        });
    };
    // Update Connections List
    useEffect(() => {
        updateConnections();
    }, []);

    const updateConnections = () => {
        axios.post(`http://${import.meta.env.VITE_HOST_IP}:5000/get_connections`, {
            session_id: Cookies.get("session_id")
        })
        .then(response => {
            setConnections(response.data.connections);
        })
        .catch(error => {
        });
    };

    const deleteConnection = () => {
        axios.post(`http://${import.meta.env.VITE_HOST_IP}:5000/delete_connection`, {
            session_id: Cookies.get("session_id"),
            id: currentConnectionId
        })
        .then(response => {
            if (response.data.message === "Connection deleted") {
                setErrorVisible(false);
                setName("");
                setType("");
                setHost("");
                setPort(0);
                setUsername("");
                setPassword("");
                document.getElementById('my_modal_4').close();
                updateConnections();
            } else {
                showError("Error deleting connection.");
            }
        })
        .catch(error => {
            showError("Error deleting connection.");
        });
    };


    return (
        <>
        <div className="flex space-x-12">
            <Navbar />
            <div className='pt-10 pr-10 w-full'>
                <h1 className="text-5xl font-bold">Database Connections</h1>
                <div className="divider"></div>
                <div className="w-3/4">
                    <div className='flex flex-wrap justify-between'>
                        <h2 className="text-3xl font-medium">Your Connections</h2>
                        <div className='text-right'>
                            <button className="btn" onClick={() => document.getElementById('my_modal_3').showModal()}>
                                Add Connection
                            </button>
                        </div>
                    </div>
                    <div className='flex flex-wrap space-x-4 space-y-4 items-center'>
                    {connections.length > 0 && connections.map((connection, index) => (
                        <>
                            <div key={index} className="card card-compact bg-base-300 w-96 shadow-2xl">
                        <div className="card-body">
                            <h2 className="card-title flex items-center">
                                <FaDatabase className="mr-2" /> {connection[2]}
                            </h2>
                            <p className='text-base'>
                                <div className="flex justify-between">
                                    <span className="font-bold flex items-center">
                                        <FaServer className="mr-2" /> Type:
                                    </span> 
                                    <span>{connection[3] === 1 ? "MariaDB" : "MySQL"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-bold flex items-center">
                                        <FaNetworkWired className="mr-2" /> Host:
                                    </span> 
                                    <span>{connection[4]}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-bold flex items-center">
                                        <FaNetworkWired className="mr-2" /> Port:
                                    </span> 
                                    <span>{connection[5]}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-bold flex items-center">
                                        <FaUser className="mr-2" /> Username:
                                    </span> 
                                    <span>{connection[6]}</span>
                                </div>
                            </p>
                            <div className="card-actions justify-end">
                                <button className="btn btn-neutral flex items-center" onClick={() => {
                                    setCurrentConnectionId(connection[0]);
                                    setName(connection[2]);
                                    setType(connection[3]);
                                    setHost(connection[4]);
                                    setPort(connection[5]);
                                    setUsername(connection[6]);
                                    setPassword("");
                                    document.getElementById('my_modal_4').showModal();
                                }}>
                                    <FaEdit className="mr-2" /> Edit
                                </button>
                                <button className="btn btn-primary flex items-center" onClick={() => {
                                    setCurrentConnectionId(connection[0]);
                                    navigate("/databases", { state: { connection_id: connection[0], connection_name: connection[2] }});
                                }}>
                                    <FaPlug className="mr-2" /> Connect
                                </button>
                            </div>
                        </div>
                    </div>
                            <dialog id="my_modal_4" className="modal">
                                <div className="modal-box">
                                    <form method="dialog">
                                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                                    </form>
                                    <h3 className="font-bold text-lg">Edit Database Connection</h3>
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
                                    <div className='flex flex-col gap-4'>
                                        <label className="input input-bordered flex items-center gap-2 text-gray-500">
                                            Name
                                            <input type="text" className="grow" value={name} onChange={(e) => setName(e.target.value)} required />
                                        </label>
                                        <select className="select select-bordered w-full" onChange={(e) => setType(e.target.value)} value={type}>
                                            <option disabled>Select Database Type</option>
                                            <option value="1">MariaDB</option>
                                            <option value="2">MySQL</option>
                                            <option disabled>PostgreSQL - [SOON]</option>
                                            <option disabled>SQLite - [SOON]</option>
                                        </select>
                                        <label className="input input-bordered flex items-center gap-2 text-gray-500">
                                            Host
                                            <input type="text" className="grow" value={host} onChange={(e) => setHost(e.target.value)} required/>
                                        </label>
                                        <label className="input input-bordered flex items-center gap-2 text-gray-500">
                                            Port
                                            <input type="number" className="grow" value={port} onChange={(e) => setPort(e.target.value)} required/>
                                        </label>
                                        <label className="input input-bordered flex items-center gap-2 text-gray-500">
                                            Username
                                            <input type="text" className="grow" value={username} onChange={(e) => setUsername(e.target.value)} required/>
                                        </label>
                                        <label className="input input-bordered flex items-center gap-2 text-gray-500">
                                            Password
                                            <input type="password" className="grow" placeholder="Leave empty to use old password" onChange={(e) => setPassword(e.target.value)} required/>
                                        </label>
                                    </div>
                                    <div className='pt-4 flex flex-col gap-2'>
                                        <button className="btn w-full" onClick={editConnection}>Save</button>
                                        <button className="btn btn-error w-full" onClick={deleteConnection}>Delete</button>
                                    </div>
                                </div>
                            </dialog>
                        </>
                    ))}
                    </div>
                </div>
                <dialog id="my_modal_3" className="modal">
                    <div className="modal-box">
                        <form method="dialog">
                            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                        </form>
                        <h3 className="font-bold text-lg">Add Database Connection</h3>
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
                        <div className='flex flex-col gap-4'>
                            <label className="input input-bordered flex items-center gap-2 text-gray-500">
                                Name
                                <input type="text" className="grow" placeholder="e.g. TodoDB" onChange={(e) => setName(e.target.value)} required/>
                            </label>
                            <select className="select select-bordered w-full" onChange={(e) => setType(e.target.value)} required>
                                <option disabled selected>Select Database Type</option>
                                <option value="1">MariaDB</option>
                                <option value="2">MySQL</option>
                                <option disabled>PostgreSQL - [SOON]</option>
                                <option disabled>SQLite - [SOON]</option>
                            </select>
                            <label className="input input-bordered flex items-center gap-2 text-gray-500">
                                Host
                                <input type="text" className="grow" placeholder="e.g. 2.56.244.115" onChange={(e) => setHost(e.target.value)} required/>
                            </label>
                            <label className="input input-bordered flex items-center gap-2 text-gray-500">
                                Port
                                <input type="number" className="grow" placeholder="e.g. 3306" onChange={(e) => setPort(e.target.value)} required/>
                            </label>
                            <label className="input input-bordered flex items-center gap-2 text-gray-500">
                                Username
                                <input type="text" className="grow" placeholder="e.g. root" onChange={(e) => setUsername(e.target.value)} required/>
                            </label>
                            <label className="input input-bordered flex items-center gap-2 text-gray-500">
                                Password
                                <input type="password" className="grow" placeholder="e.g. password" onChange={(e) => setPassword(e.target.value)} required/>
                            </label>
                        </div>
                        <div className='pt-4'>
                            <button className="btn w-full" onClick={addConnection}>Save</button>
                        </div>
                    </div>
                </dialog>
            </div>
            </div>
        </>
    )
}

export default Home;

