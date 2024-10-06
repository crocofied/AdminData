import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { useNavigate } from "react-router-dom";
import Navbar from '../components/Navbar';
import { FaDatabase, FaServer, FaNetworkWired, FaUser, FaEdit, FaPlug } from 'react-icons/fa';
import { makePostRequest } from '../utils/api';
import { useTranslation } from 'react-i18next';

const Home = () => {
    const { t, i18n: {changeLanguage, language}} = useTranslation();
    useEffect(() => {
        changeLanguage(Cookies.get("language"));
    }, []);

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
    const [isLoading, setIsLoading] = useState(true);

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

    const addConnection = () => {
        setIsLoading(true);
        document.getElementById('save_button').disabled = true;
        if (name === "" || type === "" || host === "" || port === 0 || username === "" || password === "") {
            showError(t("dashboard.fill_all_fields"));
            return;
        }
        makePostRequest("/add_connection", {
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
                if (response.data.message === "Connection failed") {
                    showError(t("dashboard.connection_failed"));
                } else {
                    showError(t("dashboard.error_adding_connection"));
                }
            }
            document.getElementById('save_button').disabled = false;
            setIsLoading(false);
        })
        .catch(error => {
            showError(t("dashboard.error_adding_connection"));
            document.getElementById('save_button').disabled = false;
            setIsLoading(false);
        });
    };


    const editConnection = () => {
        setIsLoading(true);
        document.getElementById('save_button').disabled = true;
        document.getElementById('delete_button').disabled = true;
        if (name === "" || type === "" || host === "" || port === 0 || username === "") {
            showError(t("dashboard.fill_all_fields"));
            return;
        }
        makePostRequest("/edit_connection", {
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
                setIsLoading(false);
            } else {
                if (response.data.message === "Connection failed") {
                    showError(t("dashboard.connection_failed"));
                    setIsLoading(false);
                } else {
                    showError(t("dashboard.error_editing_connection"));
                    setIsLoading(false);
                }
            }
            document.getElementById('save_button').disabled = false;
            document.getElementById('delete_button').disabled = false;
        })
        .catch(error => {
            showError(t("dashboard.error_editing_connection"));
            document.getElementById('save_button').disabled = false;
            document.getElementById('delete_button').disabled = false;
        });
    };
    // Update Connections List
    useEffect(() => {
        updateConnections();
    }, []);

    const updateConnections = () => {
        setIsLoading(true);
        makePostRequest("/get_connections")
        .then(response => {
            setConnections(response.data.connections);
            setIsLoading(false);
        })
        .catch(error => {
            setIsLoading(false);
        });
    };

    const deleteConnection = () => {
        setIsLoading(true);
        makePostRequest("/delete_connection", {
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
                showError(t("dashboard.error_deleting_connection"));
            }
        })
        .catch(error => {
            showError(t("dashboard.error_deleting_connection"));
        });
        setIsLoading(false);
    };


    return (
        <>
            <div className="flex min-h-screen bg-base-200">
                <Navbar />
                <div className='flex-1 p-8'>
                    <h1 className="text-4xl font-bold mb-6">{t("dashboard.database_connections")}</h1>
                    <div className="bg-base-100 rounded-box p-6 shadow-lg">
                        <div className='flex justify-between items-center mb-6'>
                            <h2 className="text-2xl font-semibold">{t("dashboard.your_connections")}</h2>
                            <button className="btn btn-primary" onClick={() => document.getElementById('my_modal_3').showModal()}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="w-5 h-5 mr-2">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
                                {t("dashboard.add_connection")}
                            </button>
                        </div>
                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                            {isLoading && (
                                <div className="col-span-full flex justify-center pt-20">
                                    <span className="loading loading-infinity loading-lg"></span>
                                </div>
                            ) || (
                                connections.length > 0 ? (
                                    connections.map((connection, index) => (
                                        <div key={index} className="card bg-base-300 shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-105">
                                            <div className="card-body">
                                                <h2 className="card-title flex items-center text-primary">
                                                    <FaDatabase className="mr-2" /> {connection[2]}
                                                </h2>
                                                <div className='space-y-2 mt-4'>
                                                    <p className="flex justify-between items-center">
                                                        <span className="font-medium flex items-center">
                                                            <FaServer className="mr-2" /> {t("dashboard.type")}:
                                                        </span> 
                                                        <span className="badge badge-outline">{connection[3] === 1 ? "MariaDB" : "MySQL"}</span>
                                                    </p>
                                                    <p className="flex justify-between items-center">
                                                        <span className="font-medium flex items-center">
                                                            <FaNetworkWired className="mr-2" /> {t("dashboard.host")}:
                                                        </span> 
                                                        <span className="text-sm">{connection[4]}</span>
                                                    </p>
                                                    <p className="flex justify-between items-center">
                                                        <span className="font-medium flex items-center">
                                                            <FaNetworkWired className="mr-2" /> {t("dashboard.port")}:
                                                        </span> 
                                                        <span className="text-sm">{connection[5]}</span>
                                                    </p>
                                                    <p className="flex justify-between items-center">
                                                        <span className="font-medium flex items-center">
                                                            <FaUser className="mr-2" /> {t("dashboard.username")}:
                                                        </span> 
                                                        <span className="text-sm">{connection[6]}</span>
                                                    </p>
                                                </div>
                                                <div className="card-actions justify-end mt-4">
                                                    <button className="btn btn-sm btn-outline" onClick={() => {
                                                        setCurrentConnectionId(connection[0]);
                                                        setName(connection[2]);
                                                        setType(connection[3]);
                                                        setHost(connection[4]);
                                                        setPort(connection[5]);
                                                        setUsername(connection[6]);
                                                        setPassword("");
                                                        document.getElementById('my_modal_4').showModal();
                                                    }}>
                                                        <FaEdit className="mr-2" /> {t("dashboard.edit")}
                                                    </button>
                                                    <button className="btn btn-sm btn-primary" onClick={() => {
                                                        setCurrentConnectionId(connection[0]);
                                                        navigate("/databases", { state: { connection_id: connection[0], connection_name: connection[2] }});
                                                    }}>
                                                        <FaPlug className="mr-2" /> {t("dashboard.connect")}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className='col-span-full'>
                                        <div className="alert flex flex-col items-center p-6">
                                            <img
                                                src="/no_server.png"
                                                alt="AdminData No server"
                                                className="w-96 mb-4" />
                                            <span className="text-center text-xl font-bold">{t("dashboard.no_connections")}</span>
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                </div>
                
                <dialog id="my_modal_4" className="modal">
                    <div className="modal-box">
                        <form method="dialog">
                            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                        </form>
                        <h3 className="font-bold text-lg">{t("dashboard.edit_database_connection")}</h3>
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
                                <option disabled>{t("dashboard.select_database_type")}</option>
                                <option value="1">MariaDB</option>
                                <option value="2">MySQL</option>
                                <option disabled>PostgreSQL - [SOON]</option>
                                <option disabled>SQLite - [SOON]</option>
                            </select>
                            <label className="input input-bordered flex items-center gap-2 text-gray-500">
                                {t("dashboard.host")}
                                <input type="text" className="grow" value={host} onChange={(e) => setHost(e.target.value)} required/>
                            </label>
                            <label className="input input-bordered flex items-center gap-2 text-gray-500">
                                {t("dashboard.port")}
                                <input type="number" className="grow" value={port} onChange={(e) => setPort(e.target.value)} required/>
                            </label>
                            <label className="input input-bordered flex items-center gap-2 text-gray-500">
                                {t("dashboard.username")}
                                <input type="text" className="grow" value={username} onChange={(e) => setUsername(e.target.value)} required/>
                            </label>
                            <label className="input input-bordered flex items-center gap-2 text-gray-500">
                                {t("dashboard.password")}
                                <input type="password" className="grow" placeholder="Leave empty to use old password" onChange={(e) => setPassword(e.target.value)} required/>
                            </label>
                        </div>
                        <div className='pt-4 flex flex-col gap-2'>
                            <button id="save_button" className="btn w-full" onClick={editConnection}>{t("dashboard.save")}</button>
                            <button id="delete_button" className="btn btn-error w-full" onClick={deleteConnection}>{t("dashboard.delete")}</button>
                        </div>
                    </div>
                </dialog>
                <dialog id="my_modal_3" className="modal">
                    <div className="modal-box">
                        <form method="dialog">
                            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                        </form>
                        <h3 className="font-bold text-lg">{t("dashboard.add_database_connection")}</h3>
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
                                {t("dashboard.name")}
                                <input type="text" className="grow" placeholder="e.g. TodoDB" onChange={(e) => setName(e.target.value)} required/>
                            </label>
                            <select className="select select-bordered w-full" onChange={(e) => setType(e.target.value)} required>
                                <option disabled selected>{t("dashboard.select_database_type")}</option>
                                <option value="1">MariaDB</option>
                                <option value="2">MySQL</option>
                                <option disabled>PostgreSQL - [SOON]</option>
                                <option disabled>SQLite - [SOON]</option>
                            </select>
                            <label className="input input-bordered flex items-center gap-2 text-gray-500">
                                {t("dashboard.host")}
                                <input type="text" className="grow" placeholder="e.g. 2.56.244.115" onChange={(e) => setHost(e.target.value)} required/>
                            </label>
                            <label className="input input-bordered flex items-center gap-2 text-gray-500">
                                {t("dashboard.port")}
                                <input type="number" className="grow" placeholder="e.g. 3306" onChange={(e) => setPort(e.target.value)} required/>
                            </label>
                            <label className="input input-bordered flex items-center gap-2 text-gray-500">
                                {t("dashboard.username")}
                                <input type="text" className="grow" placeholder="e.g. root" onChange={(e) => setUsername(e.target.value)} required/>
                            </label>
                            <label className="input input-bordered flex items-center gap-2 text-gray-500">
                                {t("dashboard.password")}
                                <input type="password" className="grow" placeholder="e.g. password" onChange={(e) => setPassword(e.target.value)} required/>
                            </label>
                        </div>
                        <div className='pt-4'>
                            <button id="save_button" className="btn w-full" onClick={addConnection}>{t("dashboard.save")}</button>
                        </div>
                    </div>
                </dialog>
            </div>
        </>
    )
}

export default Home;