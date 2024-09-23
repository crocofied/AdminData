import axios from 'axios';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import SessionChecker from '../components/SessionChecker';
import Navbar from '../components/Navbar';

const Databases = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [connectionID, setConnectionID] = useState();
    const [connectionName, setConnectionName] = useState("");
    const [databases, setDatabases] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [maxPage, setMaxPage] = useState(1);
    const [selectedDatabaseName, setSelectedDatabaseName] = useState("");
    const [selectedNewDatabaseName, setSelectedNewDatabaseName] = useState("");
    const [error, setError] = useState("");
    const [errorVisible, setErrorVisible] = useState(false);
    const [createDatabaseName, setCreateDatabaseName] = useState("");

    useEffect(() => {
        setConnectionID(location.state.connection_id);
        setConnectionName(location.state.connection_name);
    }, [location.state.connection_id]);

    useEffect(() => {
        if (!SessionChecker()) {
            navigate("/");
        }
    }, [navigate]);

    useEffect(() => {
        refreshDatabases();
    }, [connectionID, currentPage]);

    const refreshDatabases = () => {
        axios.post(`http://${import.meta.env.VITE_HOST_IP}:5000/get_databases?page=${currentPage}&size=7`, {
            session_id: Cookies.get("session_id"),
            connection_id: connectionID
        }, {
            headers: {
                "Authorization": `Bearer ${import.meta.env.VITE_API_KEY}`,
                "Content-Type": "application/json"
            }
        })
        .then(response => {
            if (response.data.items.length === 0) {
                setCurrentPage(currentPage-1);
                return;
            }
            setMaxPage(response.data.pages);
            console.log(response.data.items);
            setDatabases(response.data.items);
        })
        .catch(error => {
        });
    }

    const showError = (message) => {
        setErrorVisible(true);
        setError(message);
        setTimeout(() => {
            setErrorVisible(false);
            setError("");
        }, 5000);
    }

    const saveEditDatabase = () => {
        axios.post(`http://${import.meta.env.VITE_HOST_IP}:5000/edit_database`, {
            connection_id: connectionID,
            old_database_name: selectedDatabaseName,
            new_database_name: selectedNewDatabaseName
        }, {
            headers: {
                "Authorization": `Bearer ${import.meta.env.VITE_API_KEY}`,
                "Content-Type": "application/json"
            }
        })
        .then(response => {
            if (response.data.message === "Database edited") {
                document.getElementById('my_modal_3').close();
                refreshDatabases();
            } else {
                showError(response.data.message);
            }
        })
        .catch(error => {
            showError("Unknown error editing database.");
        });
    }
    const deleteDatabase = () => {
        axios.post(`http://${import.meta.env.VITE_HOST_IP}:5000/delete_database`, {
            connection_id: connectionID,
            database_name: selectedDatabaseName
        }, {
            headers: {
                "Authorization": `Bearer ${import.meta.env.VITE_API_KEY}`,
                "Content-Type": "application/json"
            }
        })
        .then(response => {
            if (response.data.message === "Database deleted") {
                document.getElementById('my_modal_4').close();
                refreshDatabases();
            }
        })
        .catch(error => {
        }
        );
    }

    const createDatabase = () => {
        axios.post(`http://${import.meta.env.VITE_HOST_IP}:5000/create_database`, {
            connection_id: connectionID,
            database_name: createDatabaseName
        }, {
            headers: {
                "Authorization": `Bearer ${import.meta.env.VITE_API_KEY}`,
                "Content-Type": "application/json"
            }
        })
        .then(response => {
            if (response.data.message === "Database created") {
                setCreateDatabaseName("");
                document.getElementById('my_modal_5').close();
                refreshDatabases();
            } else {
                showError(response.data.message);
            }
        })
        .catch(error => {
            showError("Unknown error creating database.");
        }
        );
    }

    return (
        <>
         <div className="flex space-x-12">
            <Navbar />
            <div className='pt-10 pr-10 w-full'>
                <h1 className="text-5xl font-bold">{connectionName} Databases</h1>
                <div className="divider"></div>
                <div className="w-3/4">
                    <div className="overflow-x-auto">
                        <table className="table w-full">
                            <thead>
                                <tr>
                                    <th className="text-xl w-1/12">ID</th>
                                    <th className="text-xl">Database Name</th>
                                    <th className="text-xl w-3/12">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {databases.map((database, index) => (
                                    <tr key={index}>
                                        <td className='text-base w-1/12'>{index}</td>
                                        <td className='text-base'>
                                            <button className="btn btn-ghost w-full justify-start text-left">{database.name}</button>  
                                        </td>
                                        <td className='text-base w-3/12'>
                                            <div className="flex space-x-2">
                                                <button className="btn btn-neutral" onClick={()=> {
                                                    setSelectedDatabaseName(database.name);
                                                    setSelectedNewDatabaseName(database.name);
                                                    document.getElementById('my_modal_3').showModal();
                                                }}>Edit</button>
                                                <button className="btn btn-neutral" onClick={() => {
                                                    setSelectedDatabaseName(database.name);
                                                    document.getElementById('my_modal_4').showModal();
                                                }}>Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <button className="btn btn-neutral w-full" onClick={() => document.getElementById('my_modal_5').showModal()}>Create new Database</button>
                    </div>
                    <div className="flex justify-center items-center join pt-5">
                        {currentPage === 1 ? (
                            <button className="join-item btn" disabled>«</button>
                        ) : (
                            <button className="join-item btn" onClick={() => setCurrentPage(currentPage-1)}>«</button>
                        )}
                        <button className="join-item btn">Page {currentPage}</button>
                        {currentPage < maxPage ? (
                            <button className="join-item btn" onClick={() => setCurrentPage(currentPage + 1)}>»</button>
                        ) : (
                            <button className="join-item btn" disabled>»</button>
                        )}
                    </div>
                </div>
                <dialog id="my_modal_3" className="modal">
                    <div className="modal-box">
                        <form method="dialog">
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                        </form>
                        <h3 className="font-bold text-lg">Edit {selectedDatabaseName}</h3>
                        <div className="py-4">
                            <div className='space-y-2'>
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
                                <label className="input input-bordered flex items-center gap-2">
                                    Database Name
                                    <input type="text" className="grow" value={selectedNewDatabaseName} onChange={(e) => setSelectedNewDatabaseName(e.target.value)} required />
                                </label>
                                <button className="btn btn-neutral w-full" onClick={saveEditDatabase}>Save</button>
                            </div>
                        </div>
                    </div>
                </dialog>

                <dialog id="my_modal_4" className="modal">
                    <div className="modal-box">
                        <form method="dialog">
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                        </form>
                        <h3 className="font-bold text-lg">Delete {selectedDatabaseName}</h3>
                        <div className="py-4">
                            <div className='space-y-2'>
                                <label className="input flex items-center gap-2">
                                    Are you sure you want to delete {selectedDatabaseName}? This action cannot be undone.
                                </label>
                                <button className="btn btn-neutral w-full" onClick={deleteDatabase}>Delete</button>
                            </div>
                        </div>
                    </div>
                </dialog>

                <dialog id="my_modal_5" className="modal">
                    <div className="modal-box">
                        <form method="dialog">
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                        </form>
                        <h3 className="font-bold text-lg">Create Database</h3>
                        <div className="py-4">
                            <div className='space-y-2'>
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
                                <label className="input input-bordered flex items-center gap-2">
                                    Database Name
                                    <input type="text" className="grow" onChange={(e) => setCreateDatabaseName(e.target.value)} required />
                                </label>
                                <button className="btn btn-neutral w-full" onClick={createDatabase}>Create</button>
                            </div>
                        </div>
                    </div>
                </dialog>
            </div>
        </div>
        </>
    );
}

export default Databases;